# StayCare 언어·이메일 로그인 운영 설정

## 1. 적용된 언어 동작

StayCare 공개 소개, 로그인, 최초 온보딩과 근로자 앱은 다음 3개 언어를 사용한다.

- `ko` — 한국어
- `en` — English
- `si` — සිංහල

공개 화면에서 선택한 언어는 다음 위치에 저장된다.

```text
localStorage: staycare-language
Cookie: staycare_language
유효기간: 1년
```

쿠키는 서버가 근로자 앱을 렌더링할 때 읽기 때문에, `/ko/staycare`에서 සිංහල을 선택한 후 로그인해도 앱은 සිංහල로 시작한다. 최초 온보딩을 완료하면 같은 언어가 `staycare_workers.preferred_language`에도 저장된다.

## 2. 이메일 로그인이 작동하지 않는 가장 흔한 이유

Supabase의 기본 SMTP는 상용 메일 서버가 아니다. Custom SMTP를 연결하지 않으면 프로젝트 Team에 등록된 이메일 주소에만 인증메일을 보낼 수 있고, 그 외 주소는 `Email address not authorized` 오류가 발생할 수 있다.

Vercel에 `RESEND_API_KEY`를 입력하는 것만으로는 Supabase Auth 이메일이 발송되지 않는다. **Supabase Dashboard 안에서 Custom SMTP 또는 Resend Integration을 별도로 설정해야 한다.**

## 3. Vercel 환경변수

Vercel Dashboard에서 다음 위치로 이동한다.

```text
sejoong-law
→ Settings
→ Environment Variables
```

Production에 최소 다음 값을 입력한다.

```env
NEXT_PUBLIC_SITE_URL=https://www.sejoonglaw.kr
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_... 또는 legacy service_role key
STAYCARE_TENANT_SLUG=sejoong-staycare
STAYCARE_STORAGE_BUCKET=staycare-private
```

Supabase 키 위치:

```text
Supabase Dashboard
→ Project Settings
→ API Keys
```

- Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- Publishable key → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- Secret/service-role key → `SUPABASE_SERVICE_ROLE_KEY`

Secret/service-role key에는 절대로 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.

환경변수를 바꾼 뒤에는 Vercel에서 새 Production Deployment를 실행해야 한다.

## 4. Supabase Auth URL 설정

Supabase Dashboard에서 다음으로 이동한다.

```text
Authentication
→ URL Configuration
```

### Site URL

```text
https://www.sejoonglaw.kr
```

### Redirect URLs

Production:

```text
https://www.sejoonglaw.kr/auth/callback
https://sejoonglaw.kr/auth/callback
```

Local development:

```text
http://localhost:3000/auth/callback
http://localhost:3000/**
```

Vercel Preview를 사용할 경우:

```text
https://*-hfshens-projects.vercel.app/**
```

Production은 가능한 한 정확한 URL을 등록하고, `**` 와일드카드는 Preview와 local 용도로만 사용한다.

## 5. Supabase Email Provider 확인

```text
Supabase Dashboard
→ Authentication
→ Sign In / Providers
→ Email
```

다음을 확인한다.

- Email provider: Enabled
- Confirm email: 정책에 맞게 설정
- Email OTP expiration: 기본 1시간 또는 운영정책에 맞는 값
- Email request 최소 간격: 기본 60초 권장

현재 로그인 UI는 다음 두 방식을 모두 처리한다.

1. 이메일의 Magic Link 클릭
2. 이메일에 포함된 6자리 OTP 입력

## 6. Resend를 Supabase Auth SMTP로 연결

### 6.1 Resend 도메인 인증

```text
Resend Dashboard
→ Domains
→ Add Domain
```

권장 발송 전용 서브도메인:

```text
auth.sejoonglaw.kr
```

Resend가 제공하는 SPF·DKIM DNS 레코드를 Cloudflare DNS에 등록하고 `Verified` 상태를 확인한다.

권장 발신주소:

```text
no-reply@auth.sejoonglaw.kr
```

### 6.2 가장 쉬운 방법 — Resend Integration

```text
Resend Dashboard
→ Integrations
→ Supabase
→ Connect
→ 대상 Supabase Project 선택
→ 인증된 Domain 선택
→ Configure SMTP Integration
```

### 6.3 수동 SMTP 설정

Supabase Dashboard:

```text
Authentication
→ Email
→ SMTP Settings
```

입력값:

```text
Sender name: Sejoong StayCare
Sender email: no-reply@auth.sejoonglaw.kr
Host: smtp.resend.com
Port: 465
Username: resend
Password: Resend API Key (re_...)
```

STARTTLS를 사용할 경우 port `587`도 가능하다.

## 7. Magic Link·OTP 이메일 템플릿

```text
Supabase Dashboard
→ Authentication
→ Email Templates
→ Magic Link
```

링크와 6자리 코드를 모두 제공하는 권장 예시:

```html
<h2>Sejoong StayCare login</h2>
<p>Your verification code:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:6px;">
  {{ .Token }}
</p>
<p>Or use the secure sign-in link:</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to StayCare</a></p>
```

`{{ .Token }}`이 있어야 로그인 화면에서 6자리 코드 입력이 가능하다. `{{ .ConfirmationURL }}`은 Magic Link를 제공한다.

이메일 서비스의 click tracking은 인증 링크를 변형할 수 있으므로 Auth 메일에는 tracking을 끄는 것이 안전하다.

## 8. Cloudflare Turnstile 설정

### Cloudflare

```text
Cloudflare Dashboard
→ Turnstile
→ Add site
```

Production hostname:

```text
www.sejoonglaw.kr
```

발급받은 값을 Vercel에 입력한다.

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
```

### Supabase

```text
Supabase Dashboard
→ Authentication
→ Bot and Abuse Protection
→ Enable CAPTCHA protection
→ Provider: Cloudflare Turnstile
→ Secret key 입력
```

Vercel의 Site Key와 Supabase에 입력한 Secret이 같은 Turnstile Widget에서 발급된 값이어야 한다.

Turnstile을 아직 Supabase에 연결하지 않았다면 Vercel의 `NEXT_PUBLIC_TURNSTILE_SITE_KEY`도 임시로 제거하고 재배포한다. 브라우저만 Turnstile을 표시하고 Supabase 설정이 불일치하면 로그인 요청이 실패할 수 있다.

## 9. 작동 확인 순서

1. `/api/health/staycare`에서 `auth: true` 확인
2. Supabase Authentication → Users에서 테스트 이메일이 생성되는지 확인
3. Supabase Logs → Auth Logs에서 발송 오류 확인
4. Resend Dashboard → Emails에서 delivered/bounced 상태 확인
5. 스팸함 확인
6. 이메일의 6자리 OTP 입력
7. 또는 Magic Link 클릭 후 `/auth/callback`을 거쳐 `/ko/staycare/app`으로 이동하는지 확인

## 10. 오류별 원인

### `Email address not authorized`

Custom SMTP 미설정. Supabase 기본 SMTP가 프로젝트 Team 이메일만 허용하는 상태다.

### `rate limit exceeded`

기본 SMTP 또는 Auth email rate limit 초과. 최소 60초 후 재시도하고 Custom SMTP와 Auth Rate Limits를 확인한다.

### `captcha verification process failed`

Cloudflare Site Key와 Supabase Auth의 Turnstile Secret 불일치, 허용 hostname 오류 또는 만료된 토큰이다.

### 메일은 오지만 클릭 후 localhost로 이동

Supabase Site URL이 `http://localhost:3000`으로 남아 있거나 Production Redirect URL이 등록되지 않았다.

### 클릭 후 `auth_callback_failed`

- Redirect URL 미등록
- 링크가 보안 프로그램에 의해 미리 열림
- Magic Link 만료
- Email Template의 링크가 수정됨

6자리 OTP 방식을 사용하면 이메일 보안제품의 link prefetch 문제를 줄일 수 있다.

## 11. Production 최소 체크리스트

- [ ] Vercel `NEXT_PUBLIC_SITE_URL=https://www.sejoonglaw.kr`
- [ ] Supabase URL·Publishable Key·Secret Key 입력
- [ ] Supabase Site URL 변경
- [ ] Production callback Redirect URL 등록
- [ ] Supabase Email Provider 활성화
- [ ] Resend Domain Verified
- [ ] Resend Integration 또는 Custom SMTP 완료
- [ ] Magic Link Template에 `{{ .Token }}`과 `{{ .ConfirmationURL }}` 포함
- [ ] Turnstile hostname·Site Key·Secret 일치
- [ ] Supabase Auth Bot Protection 설정
- [ ] Vercel 재배포
- [ ] 일반 사용자 이메일로 실제 수신 테스트
