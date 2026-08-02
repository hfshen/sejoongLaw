# Supabase · ImprovMX · Gmail 인증메일 및 도메인 메일 설정

## 1. 권장 구조

StayCare 운영 메일은 목적에 따라 분리한다.

```text
[업무 메일 수신]
staycare@도메인
  → ImprovMX MX
  → 개인 또는 운영 Gmail 받은편지함

[업무 메일 회신]
Gmail의 "다른 주소에서 메일 보내기"
  → ImprovMX SMTP
  → staycare@도메인으로 발신

[Supabase 인증메일 / 시스템 알림]
Supabase Auth 또는 StayCare 백엔드
  → 전용 Transactional SMTP 권장
  → 사용자 이메일
```

ImprovMX는 받은 메일을 Gmail 등 기존 Inbox로 전달하는 서비스이며 자체 IMAP/POP Inbox를 제공하지 않는다. ImprovMX SMTP는 유료 플랜에서 사용할 수 있고 일반 업무·개인 발송을 위한 기능이지 대량 발송 전용 서비스가 아니다.

2,000명 규모에서 OTP 재전송·알림을 고려하면 다음 구성이 가장 안전하다.

- 업무 수신·사람이 직접 답장: ImprovMX + Gmail
- Supabase 인증메일: Resend, Amazon SES, Postmark 등 Transactional SMTP
- StayCare 자동 알림: 동일한 Transactional Provider 또는 충분한 한도를 검증한 SMTP

ImprovMX SMTP를 인증메일에도 사용할 수는 있지만 현재 플랜의 월간 발송량, 시간당 제한, 자동메일 허용정책을 먼저 확인한다.

## 2. ImprovMX 수신 설정

### 2.1 도메인 등록

1. ImprovMX Dashboard에 로그인한다.
2. StayCare에서 사용할 도메인을 추가한다.
3. Alias를 만든다.

권장 Alias:

```text
staycare@your-domain.com → 실제 Gmail
support@your-domain.com  → 실제 Gmail
privacy@your-domain.com  → 개인정보 담당 Gmail
noreply@your-domain.com  → 자동발송 전용, 회신 수신 여부 별도 결정
```

### 2.2 MX 레코드

DNS 공급자에서 기존 충돌 MX를 제거하고 ImprovMX Dashboard의 DNS Settings에 표시되는 값을 그대로 복사한다. 일반적인 값은 다음과 같다.

| Type | Host | Value | Priority |
|---|---|---|---:|
| MX | `@` | `mx1.improvmx.com` | 10 |
| MX | `@` | `mx2.improvmx.com` | 20 |

한 도메인에서 다른 MX 서비스와 ImprovMX를 혼합하지 않는다. 우선순위를 달리해도 메일이 예측과 다르게 전달되거나 유실될 수 있다.

### 2.3 SPF

ImprovMX Dashboard가 제시하는 Recommended Value를 사용한다. 기본 예시는 다음과 같다.

```dns
TXT @ "v=spf1 include:spf.improvmx.com ~all"
```

중요:

- SPF TXT는 도메인당 하나만 둔다.
- 이미 Resend, Google, SES 등의 SPF가 있다면 TXT를 여러 개 만들지 말고 하나로 병합한다.
- 예시는 공급자별 실제 include 값을 모두 확인한 뒤 작성한다.

예시:

```dns
TXT @ "v=spf1 include:spf.improvmx.com include:_spf.google.com include:amazonses.com ~all"
```

위 예시는 구조 설명용이다. 사용하지 않는 include는 넣지 않는다.

### 2.4 확인

1. ImprovMX Dashboard에서 `Check Again`을 누른다.
2. `Email forwarding active` 상태인지 확인한다.
3. 외부 Gmail·Naver·Daum·Outlook에서 Alias로 각각 메일을 보낸다.
4. Gmail 받은편지함과 스팸함을 확인한다.
5. ImprovMX Logs에서 전달 성공·Bounce 여부를 확인한다.

DNS 전파는 보통 빠르지만 최대 24~48시간이 걸릴 수 있다.

## 3. ImprovMX SMTP 발신 설정

### 3.1 유료 플랜 확인

ImprovMX SMTP는 유료 플랜 기능이다. Dashboard에서 현재 플랜의 다음 항목을 확인한다.

- 일일·월간 전송 한도
- SMTP Credential 수
- Domain 수
- API/Log 보존
- 대량·자동발송 정책

### 3.2 SMTP Credential 생성

1. ImprovMX Dashboard에 로그인한다.
2. 도메인 오른쪽 톱니바퀴 → `SMTP Credentials`로 이동한다.
3. Username은 실제 Alias 전체 주소로 만든다.
4. 강한 전용 비밀번호를 생성한다.
5. 비밀번호는 Password Manager 또는 Vercel Secret에만 보관한다.

예:

```text
Username: staycare@your-domain.com
Password: 임의의 강한 전용 비밀번호
```

### 3.3 DKIM

SMTP Credential을 만든 뒤 Domain Settings → DNS Settings에 표시되는 DKIM CNAME 두 개를 DNS에 추가한다.

일반적인 예시는 다음과 같지만 반드시 Dashboard 값을 우선한다.

| Type | Name | Target |
|---|---|---|
| CNAME | `dkimprovmx1._domainkey` | `dkimprovmx1.improvmx.com` |
| CNAME | `dkimprovmx2._domainkey` | `dkimprovmx2.improvmx.com` |

Cloudflare를 사용하는 경우 이메일 인증용 CNAME은 Dashboard 지침을 따르고 일반적으로 Proxy가 아닌 DNS Only로 둔다.

### 3.4 DMARC

초기에는 보고 모드로 시작한다.

```dns
TXT _dmarc "v=DMARC1; p=none; rua=mailto:dmarc@your-domain.com; adkim=s; aspf=s; pct=100"
```

보고서를 확인해 정상 발신원이 모두 정렬된 뒤 단계적으로 강화한다.

```text
p=none → p=quarantine → p=reject
```

DMARC 주소 `dmarc@your-domain.com`도 실제 수신 가능하게 만든다. 조직 정책과 발신 Provider 구성에 맞춰 전문 검토 후 강화한다.

## 4. Gmail에서 도메인 주소로 보내기

1. Gmail → 설정 톱니바퀴 → 모든 설정 보기
2. `계정 및 가져오기`
3. `다른 주소에서 메일 보내기` → `다른 이메일 주소 추가`
4. 표시 이름과 `staycare@your-domain.com` 입력
5. `별칭으로 처리`는 ImprovMX 공식 가이드에 따라 해제
6. SMTP 정보 입력

```text
SMTP server: smtp.improvmx.com
Port: 587
Username: staycare@your-domain.com
Password: ImprovMX SMTP Credential 비밀번호
Security: TLS
```

7. Gmail이 보내는 확인메일은 ImprovMX를 거쳐 같은 Gmail Inbox로 들어온다.
8. 확인 링크를 누르거나 코드를 입력한다.
9. Gmail의 기본 From 주소 또는 Reply-from 정책을 설정한다.
10. 자기 자신이 아닌 별도의 외부 메일 주소로 테스트한다.

테스트 결과에서 다음을 확인한다.

- From이 도메인 주소인지
- `via gmail.com`이 붙지 않는지
- SPF=PASS
- DKIM=PASS
- DMARC=PASS
- Reply가 올바른 Gmail Inbox로 돌아오는지

## 5. Supabase Migration 적용

### 5.1 적용 대상

이번 릴리스의 신규 Migration:

```text
supabase/migrations/019_staycare_four_language_completion.sql
```

이 Migration은 Tamil(`ta`)을 다음 언어 제약조건에 추가한다.

- tenant 기본언어·지원언어
- worker 선호언어
- 동의서 언어
- 서비스 신청 언어
- Push Device 언어
- AI Session 원본·목표 언어
- Notification 언어

### 5.2 권장 CLI 절차

Supabase 공식 Migration 이력을 유지하기 위해 가능하면 SQL Editor에서 파일 내용을 임의 실행하기보다 CLI의 `db push`를 사용한다.

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
supabase db push
supabase migration list
```

Staging 프로젝트에 먼저 적용하고 검증한 뒤 Production에 같은 절차로 적용한다.

### 5.3 SQL Editor를 사용해야 하는 경우

1. Supabase Dashboard → SQL Editor
2. 새 Query 생성
3. `019_staycare_four_language_completion.sql` 전체를 붙여넣기
4. 실행 전 Staging DB인지 다시 확인
5. 실행
6. 오류가 없고 Transaction이 완료됐는지 확인
7. Migration History를 별도로 관리 중이라면 적용 기록을 맞춘다.

SQL Editor 직접 실행은 CLI Migration 이력과 불일치를 만들 수 있으므로 예외적으로만 사용한다.

### 5.4 적용 확인 SQL

```sql
select conrelid::regclass as table_name,
       conname,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where conname like '%language%'
   or conname like '%locale%'
order by 1, 2;
```

다음 쓰기 테스트를 Staging에서 실행하거나 앱을 통해 검증한다.

```sql
-- 실제 tenant/worker ID를 사용하고 테스트 후 원복한다.
update staycare_workers
set preferred_language = 'ta'
where id = 'YOUR_TEST_WORKER_UUID';
```

## 6. Supabase Auth URL 설정

Dashboard → Authentication → URL Configuration에서 다음을 설정한다.

### Site URL

```text
https://www.sejoonglaw.kr
```

### Redirect URLs

운영·Preview URL을 실제 구성에 맞게 등록한다.

```text
https://www.sejoonglaw.kr/auth/callback
https://www.sejoonglaw.kr/ko/staycare/**
https://www.sejoonglaw.kr/en/staycare/**
https://www.sejoonglaw.kr/si/staycare/**
https://www.sejoonglaw.kr/ta/staycare/**
https://*-YOUR-VERCEL-SCOPE.vercel.app/auth/callback
```

Supabase PKCE callback의 최종 교환 경로는 locale이 붙지 않은 `/auth/callback`을 사용한다. 운영에서 지나치게 넓은 wildcard를 사용하지 않는다.

## 7. Supabase Custom SMTP

Supabase의 기본 SMTP는 개발·테스트용이다. Production 인증메일은 Custom SMTP를 연결한다.

Dashboard → Project Settings 또는 Authentication → SMTP Settings에서 현재 UI의 Custom SMTP 항목을 연다.

### ImprovMX SMTP를 직접 연결하는 경우

```text
Host: smtp.improvmx.com
Port: 587
Username: staycare@your-domain.com
Password: ImprovMX SMTP Credential
Sender email: staycare@your-domain.com 또는 noreply@your-domain.com
Sender name: Sejoong StayCare
TLS: enabled
```

연결 후 다음을 확인한다.

- SMTP Provider의 자동메일 허용 여부
- 일일·월간 한도
- OTP 재전송을 포함한 예상량
- DKIM·DMARC 정렬
- Bounce·Complaint 처리

### 권장: Transactional SMTP

2,000명 규모에는 Resend·Amazon SES·Postmark 등 Transactional SMTP를 권장한다. 업무용 ImprovMX/Gmail과 인증메일 평판·한도를 분리할 수 있다.

예상 발송량은 최소 다음처럼 계산한다.

```text
초기 인증 2,000통
평균 재전송 0.5회 = 1,000통
초기 온보딩·알림 2~4통/인 = 4,000~8,000통
첫 달 최소 예상 = 약 7,000~11,000통 + 운영 알림
```

ImprovMX SMTP를 선택할 경우 현재 플랜이 이 물량을 허용하는지 반드시 확인한다.

## 8. Supabase Email Template

Authentication → Email Templates에서 다음 템플릿을 네 언어로 구성한다.

- Confirm signup
- Magic Link
- Change Email Address
- Reset Password
- Reauthentication

Supabase 기본 템플릿이 사용자별 locale을 자동 선택하지 않는 경우 다음 중 하나를 선택한다.

1. 영어+Sinhala+Tamil을 한 템플릿에 짧게 병기
2. Edge Function/Hook을 통해 locale별 Transactional Email 발송
3. 이메일은 영어 공통, 앱 진입 후 선호언어로 상세 안내

법률·개인정보 문구는 메일에 과도하게 넣지 말고 앱의 해당 locale 페이지로 연결한다.

## 9. Google 로그인

1. Google Cloud Console에서 OAuth Client를 만든다.
2. Authorized JavaScript Origins에 운영 도메인을 추가한다.
3. Authorized Redirect URI에 Supabase Dashboard가 제시하는 Callback URL을 추가한다.
4. Supabase Dashboard → Authentication → Providers → Google에서 Client ID·Secret 입력
5. Vercel에서 다음을 `true`로 변경한다.

```env
NEXT_PUBLIC_STAYCARE_GOOGLE_LOGIN_ENABLED=true
```

Google 로그인은 인증수단일 뿐이다. 공식 명부에 없는 사용자는 Claim을 통과할 수 없어야 한다.

## 10. Facebook 로그인

1. Meta for Developers에서 App을 만든다.
2. Facebook Login을 추가한다.
3. Valid OAuth Redirect URI에 다음 형식을 등록한다.

```text
https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
```

4. Supabase Provider 설정에 App ID·Secret 입력
5. App을 Live 모드로 전환하기 전 개인정보처리방침·데이터 삭제 URL을 등록한다.
6. Vercel에서 다음을 `true`로 변경한다.

```env
NEXT_PUBLIC_STAYCARE_FACEBOOK_LOGIN_ENABLED=true
```

## 11. 전화 OTP

1. Supabase Dashboard → Authentication → Providers → Phone 활성화
2. 지원되는 SMS Provider 자격증명 입력
3. `+94` 스리랑카 번호 발송 지원 여부와 국가별 단가 확인
4. CAPTCHA와 Rate Limit 활성화
5. OTP 만료시간·재전송 간격 설정
6. 실제 Dialog, Mobitel, Hutch, Airtel 등 대상 통신망에서 테스트
7. 한국 입국 후 `+82` 변경·검증 시나리오 테스트

CoolSMS 운영문자와 Supabase Phone Auth는 별도 시스템일 수 있다. 동일 Provider를 사용하더라도 인증 OTP와 일반 알림의 Sender·정책·비용을 분리해 기록한다.

## 12. StayCare 자체 알림 SMTP 환경변수

StayCare 알림 Worker는 Resend 또는 SMTP를 선택할 수 있다.

### Resend

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxx
RESEND_FROM_EMAIL=Sejoong StayCare <staycare@your-domain.com>
```

### SMTP

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.improvmx.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=staycare@your-domain.com
SMTP_PASSWORD=YOUR_SMTP_PASSWORD
SMTP_FROM_EMAIL=Sejoong StayCare <staycare@your-domain.com>
```

Port 465를 쓰는 Provider만 `SMTP_SECURE=true`로 설정한다. ImprovMX 공식 Gmail 안내는 Port 587 + TLS를 사용한다.

### 비활성화

```env
EMAIL_PROVIDER=disabled
```

Production에서는 업무상 의도된 경우가 아니면 disabled를 사용하지 않는다.

## 13. 최종 메일 테스트 표

| 테스트 | 발신 | 수신 | 확인 |
|---|---|---|---|
| 인바운드 | 외부 Gmail | staycare Alias | Gmail Inbox 도착 |
| 인바운드 | Naver/Daum | staycare Alias | 한글 메일 정상 |
| 업무 답장 | Gmail Send-as | 외부 Gmail | SPF/DKIM/DMARC PASS |
| 업무 답장 | Gmail Send-as | Outlook | 스팸 여부 |
| Supabase OTP | Supabase | Gmail | 코드·링크·Redirect 정상 |
| Supabase OTP | Supabase | Naver/Daum | 도착시간·스팸 여부 |
| 앱 알림 | StayCare Worker | 테스트 메일 | Provider Reference 저장 |
| Bounce | 잘못된 주소 | Provider | 실패 로그·재시도·중단 |

## 14. 장애 점검

### 메일 수신이 안 됨

- MX가 ImprovMX 값인지
- 다른 MX가 섞여 있지 않은지
- Alias 목적지가 정확한 Gmail인지
- ImprovMX Logs에 수신·전달 기록이 있는지
- Gmail 필터·스팸·차단 여부

### Gmail에서 도메인 주소로 발신 안 됨

- ImprovMX 유료 SMTP 플랜인지
- SMTP Credential Username이 전체 Alias 주소인지
- Port 587 + TLS인지
- DKIM 두 개가 검증됐는지
- Gmail 별칭 확인이 완료됐는지

### SPF 오류

- SPF TXT가 두 개 이상인지
- `include:spf.improvmx.com`이 하나의 SPF에 포함됐는지
- DNS Host가 `@` 또는 빈 Root 값인지

### 인증메일이 거의 안 나감

- Supabase Custom SMTP가 연결됐는지
- 기본 SMTP의 낮은 제한에 걸렸는지
- Auth Rate Limit과 60초 재전송 제한 확인
- Provider Dashboard의 Reject/Bounce/Complaint 확인

## 15. 보안 원칙

- `SUPABASE_SERVICE_ROLE_KEY`, SMTP Password, OAuth Secret은 브라우저에 노출하지 않는다.
- Gmail 계정에는 2단계 인증과 복구수단을 설정한다.
- 운영 Alias와 개인 Gmail 주소는 화면에 불필요하게 노출하지 않는다.
- SMTP Credential은 사람별·서비스별로 분리하고 퇴사·권한변경 시 폐기한다.
- DMARC 보고서를 확인한 뒤 `p=reject`로 강화한다.
- 관리자 계정에는 MFA를 적용한다.
- 인증메일 링크·OTP를 로그에 원문으로 남기지 않는다.
