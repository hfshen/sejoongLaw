# Supabase Email Auth 운영 설정

대상 프로젝트: `bpqqrqdzqnlxapsexthe` (`sejoonglaw`)

## 1. Authentication > URL Configuration

### Site URL

```text
https://www.sejoonglaw.kr
```

언어 접두사(`/ko`, `/en`)나 `/auth/callback`을 Site URL에 넣지 않는다.

### Redirect URLs

운영:

```text
https://www.sejoonglaw.kr/auth/callback
```

루트 도메인을 실제로 서비스하는 경우에만 추가:

```text
https://sejoonglaw.kr/auth/callback
```

로컬 개발이 필요한 경우에만 추가:

```text
http://localhost:3000/auth/callback
```

다음 주소는 등록하지 않는다.

```text
https://www.sejoonglaw.kr/ko/auth/callback
https://www.sejoonglaw.kr/en/auth/callback
```

언어별 이동은 콜백의 `next` 쿼리로 처리한다.

## 2. Authentication > Sign In / Providers

### User Signups

- Allow new users to sign up: ON
- Confirm email: ON
- Allow anonymous sign-ins: OFF
- Allow manual linking: 특별한 계정 연결 기능이 없으면 OFF

### Email

- Enable email provider: ON
- Secure email change: ON
- Secure password change: ON 권장
- Require current password when updating: 현재 비밀번호 변경 UI를 사용하는 경우 ON
- Minimum password length: 8 이상 권장
- Email OTP expiration: 3600 seconds
- Email OTP length: 6 digits

`Email OTP expiration`은 이메일 링크와 OTP 코드 모두에 적용된다.

## 3. Authentication > Emails > Magic link or OTP

Supabase 기본 SMTP 상태에서는 템플릿의 Subject/Source 편집이 잠길 수 있다. 이 상태의 기본 템플릿은 로그인 링크만 보여주므로 StayCare의 6자리 이메일 코드 입력을 운영하려면 Custom SMTP가 필요하다.

Custom SMTP 설정 후 권장 템플릿:

```html
<h2>세중 StayCare 로그인 인증</h2>
<p>아래 6자리 인증번호를 StayCare 로그인 화면에 입력해 주세요.</p>
<p style="font-size:30px;font-weight:700;letter-spacing:8px;">{{ .Token }}</p>
<p>인증번호는 1시간 동안 유효하며 한 번만 사용할 수 있습니다.</p>
<p>본인이 요청하지 않았다면 이 메일을 무시해 주세요.</p>
```

이메일 링크 사전 조회로 토큰이 소비되는 문제를 피하려면 `{{ .ConfirmationURL }}` 버튼을 넣지 않고 `{{ .Token }}`만 사용하는 방식이 가장 안정적이다.

## 4. Custom SMTP

Authentication > Emails 화면의 `Set up SMTP`에서 설정한다.

필수 값:

- Sender email
- Sender name
- SMTP host
- SMTP port
- SMTP username
- SMTP password

운영 권장:

- 인증 전용 발신주소 사용
- SPF, DKIM, DMARC 설정
- SMTP 서비스의 Click tracking / Link tracking 비활성화
- 인증 메일과 마케팅 메일 분리

Supabase 기본 SMTP는 운영용이 아니며 프로젝트 팀 이메일 외 발송 제한과 낮은 시간당 발송 제한이 있다.

## 5. Vercel 환경변수

필수:

```text
NEXT_PUBLIC_SITE_URL=https://www.sejoonglaw.kr
NEXT_PUBLIC_SUPABASE_URL=https://bpqqrqdzqnlxapsexthe.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

기존 프로젝트가 anon key를 사용하는 경우:

```text
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 6. 정상 로그인 흐름

```text
메일 로그인 요청
→ Supabase /auth/v1/verify
→ https://www.sejoonglaw.kr/auth/callback?code=...&next=/ko/staycare/app
→ exchangeCodeForSession(code)
→ /ko/staycare/app
```

`/auth/callback`에는 next-intl 언어 접두사를 붙이지 않는다. 미들웨어는 과거의 `/ko/auth/callback` 주소도 `/auth/callback`으로 복구한다.

## 7. 변경 후 테스트

기존 메일은 재사용하지 않는다. 반드시 새 로그인 요청으로 새 메일을 발송한다.

1. 로그아웃 또는 시크릿 창 사용
2. 새 로그인 메일 발송
3. 가장 최근 메일만 사용
4. 링크는 한 번만 클릭
5. 최종 URL이 `/ko/staycare/app`인지 확인
6. 만료 링크는 StayCare 로그인 화면에서 재발송 안내가 나오는지 확인
