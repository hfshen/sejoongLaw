# StayCare 상용 환경변수·외부 서비스 발급 가이드

이 문서는 `feat/staycare-complete-v1`을 실제 운영환경에 올릴 때 필요한 값, 발급처, 적용순서와 검증방법을 정리한다.

## 1. 반드시 먼저 준비할 값

### Application

| 환경변수 | Production 값 | 획득·결정 방법 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://sejoonglaw.kr` | 실제 운영 도메인 |
| `STAYCARE_TENANT_SLUG` | `sejoong-staycare` | DB migration seed와 동일하게 유지 |
| `STAYCARE_DEFAULT_LOCALE` | `ko` | 기본언어 결정 |
| `STAYCARE_SUPPORT_EMAIL` | 예: `staycare@sejoonglaw.kr` | 세중 운영메일 생성 |
| `STAYCARE_SUPPORT_PHONE` | 대표번호 | 세중 운영번호 결정 |

## 2. Supabase — 필수

발급 위치:

1. Supabase Dashboard에서 Production 전용 Project 생성
2. Project의 `Connect` 또는 `Settings → API Keys`
3. Project URL 복사
4. Publishable key 복사
5. Secret key 복사

환경변수:

```env
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...
STAYCARE_STORAGE_BUCKET=staycare-private
```

주의:

- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`만 브라우저에서 사용할 수 있다.
- `SUPABASE_SERVICE_ROLE_KEY`는 서버 전용이다.
- Secret/service-role key를 `NEXT_PUBLIC_` 변수에 넣지 않는다.
- Preview와 Production은 별도 Supabase Project 사용을 권장한다.

적용 순서:

1. `012_staycare_platform_v1.sql`
2. `013_staycare_production_hardening.sql`
3. Auth URL 설정
4. private bucket 확인
5. RLS 역할별 테스트

Supabase Auth URL:

```text
Site URL: https://sejoonglaw.kr
Redirect URL: https://sejoonglaw.kr/auth/callback
Preview Redirect URL: https://*.vercel.app/auth/callback
```

## 3. OpenAI — AI 번역·생활가이드 필수

발급 위치:

1. OpenAI API Platform 로그인
2. StayCare 전용 Project 생성
3. Project의 API Keys에서 새 Secret key 생성
4. 가능하면 개인 공유키보다 Project service account key 사용
5. Responses API 쓰기 권한만 허용하는 Restricted key 권장
6. Project usage limit와 예산 알림 설정

```env
OPENAI_API_KEY=sk-...
OPENAI_TRANSLATION_MODEL=gpt-5
```

주의:

- 키는 생성 시 한 번만 전체 표시된다.
- 브라우저·모바일 앱에 키를 넣지 않는다.
- StayCare의 `/api/staycare/ai` 서버 라우트만 OpenAI를 호출한다.
- 여권·외국인등록·카드번호는 요청 전 차단한다.

## 4. Upstash Redis — Production rate limit 필수

발급 위치:

1. Upstash Console 로그인
2. Redis database 생성
3. Region은 한국 사용자와 가까운 곳 선택
4. Database 상세의 REST API에서 URL과 Token 복사

```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

용도:

- AI API 호출 제한
- 로그인·온보딩·신청 API 남용 방지
- Serverless 인스턴스 간 공통 rate limit

## 5. Resend — 이메일 로그인·알림 필수

발급 위치:

1. Resend 가입
2. Domains에서 `sejoonglaw.kr` 또는 전용 서브도메인 등록
3. Resend가 제시하는 SPF·DKIM DNS 레코드를 Cloudflare에 추가
4. Domain이 Verified인지 확인
5. API Keys에서 `Sending access` key 생성
6. 전송 도메인을 해당 key로 제한

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Sejoong StayCare <staycare@sejoonglaw.kr>
```

권장 도메인:

```text
mail.sejoonglaw.kr
```

DNS 인증이 완료되기 전에는 임시 발신주소를 Production에 사용하지 않는다.

## 6. Cloudflare Turnstile — 로그인 보호 권장

발급 위치:

1. Cloudflare Dashboard
2. Turnstile
3. Add site
4. Production hostname에 `sejoonglaw.kr` 등록
5. Preview용 별도 Widget 생성 권장
6. Site key와 Secret key 복사

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x...
TURNSTILE_SECRET_KEY=0x...
```

Site key는 공개 가능하지만 Secret key는 서버 전용이다.

## 7. Sentry — 오류 모니터링 권장

발급 위치:

1. Sentry Organization 생성 또는 기존 조직 사용
2. Next.js Project 생성
3. Client key(DSN) 복사
4. Organization Settings에서 Auth Token 생성
5. Token은 source map 업로드에 필요한 최소 권한만 부여

```env
NEXT_PUBLIC_SENTRY_DSN=https://...@....ingest.sentry.io/...
SENTRY_AUTH_TOKEN=sntrys_...
SENTRY_ORG=organization-slug
SENTRY_PROJECT=project-slug
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.05
```

Sentry beforeSend에서 여권·등록·계좌·송금 원문을 제거해야 한다.

## 8. CoolSMS/Solapi — SMS·OTP 활성화 시 필요

발급 위치:

1. CoolSMS/Solapi 가입과 본인·사업자 인증
2. Developers 또는 API Key 메뉴에서 Key와 Secret 생성
3. 발신번호 사전등록
4. 해외번호 발송지원, 비용과 국가별 제한 확인

```env
COOLSMS_API_KEY=...
COOLSMS_API_SECRET=...
COOLSMS_SENDER_PHONE=등록된_발신번호
```

스리랑카 `+94` 번호 OTP는 국내 SMS와 별도로 실제 도달률·발신규제·비용을 테스트해야 한다. 초기 Production은 이메일 OTP를 기본으로 두고, SMS는 제한 베타 후 활성화한다.

## 9. Kakao Maps — 주변기관 기능 사용 시

발급 위치:

1. Kakao Developers에서 Application 생성
2. 플랫폼 Web에 운영 도메인 등록
3. App Keys에서 REST API key와 JavaScript key 복사

```env
KAKAO_REST_API_KEY=...
NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY=...
```

서버 지오코딩에는 REST key, 브라우저 지도에는 JavaScript key를 사용한다.

## 10. Firebase — Push 알림 활성화 시

발급 위치:

1. Firebase Console에서 Project 생성
2. Web App 등록
3. Web configuration 복사
4. Cloud Messaging에서 Web Push certificate/VAPID key 생성
5. Service Account JSON 발급 후 전체 JSON을 Base64로 인코딩

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=...
```

## 11. Toss Payments — 유료 결제 확정 후

StayCare가 앱에서 비용을 받기로 세중이 결정한 뒤에만 활성화한다.

발급 위치:

1. Toss Payments 개발자센터 회원가입
2. 테스트 상점키 발급
3. 결제·취소·웹훅 Sandbox 검증
4. 계약·심사 완료 후 라이브키 발급

```env
NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY=test_ck_... 또는 live_ck_...
TOSS_PAYMENTS_SECRET_KEY=test_sk_... 또는 live_sk_...
TOSS_PAYMENTS_WEBHOOK_SECRET=직접_생성한_웹훅_검증값
```

Client key만 브라우저에 노출한다. Secret key는 서버 전용이다.

## 12. 내부 보안키 — 직접 생성

환경별로 서로 다른 값을 생성한다.

```bash
openssl rand -base64 32
openssl rand -hex 32
openssl rand -hex 32
```

```env
STAYCARE_FIELD_ENCRYPTION_KEY=base64_32_byte_key
STAYCARE_WEBHOOK_SECRET=random_hex
STAYCARE_CRON_SECRET=random_hex
```

키를 GitHub, 메신저, 문서에 붙이지 않는다. Vercel Sensitive Environment Variable 또는 별도 Secrets Manager에 보관한다.

## 13. 통신·은행·송금·배송 Provider 값

이 값은 공개 개발자센터에서 임의로 발급받는 범용키가 아니다. 해당 사업자와 사업제휴·개인정보 처리·API 계약을 완료한 후 공급자가 제공한다.

### 제휴 전 즉시 운영

```env
TELECOM_PROVIDER_MODE=manual
BANK_PROVIDER_MODE=manual
REMITTANCE_PROVIDER_MODE=manual
DELIVERY_PROVIDER_MODE=manual
```

이 상태에서는 StayCare가 신청을 DB에 저장하고 세중 운영자가 제휴사의 관리자 포털에서 수동 처리한 뒤 상태를 업데이트한다. 이를 통해 API 계약 전에도 제한된 상용 운영을 시작할 수 있다.

### Sandbox 또는 API 계약 후

```env
TELECOM_PROVIDER_MODE=sandbox
TELECOM_PROVIDER_BASE_URL=https://sandbox.provider.example
TELECOM_PROVIDER_API_KEY=...
TELECOM_PROVIDER_WEBHOOK_SECRET=...
```

동일한 구조로 Bank, Remittance, Delivery 값을 설정한다. Production 전환 시 `MODE=api`로 변경한다.

## 14. Vercel 입력 위치

```text
Vercel Dashboard
→ sejoong-law Project
→ Settings
→ Environment Variables
```

환경을 분리한다.

- Development: 개발 Supabase와 테스트키
- Preview: Staging Supabase와 Sandbox키
- Production: 운영 Supabase와 Live키

환경변수를 바꾼 후에는 반드시 새 배포가 필요하다.

CLI 예시:

```bash
vercel env ls production
vercel env add OPENAI_API_KEY production --sensitive
vercel env add SUPABASE_SERVICE_ROLE_KEY production --sensitive
vercel env pull .env.local
```

## 15. 상용 가동 순서

1. Production Supabase 생성
2. migration 012·013 적용
3. Storage·RLS·Auth Redirect 검증
4. Vercel 필수 환경변수 입력
5. Resend 도메인 인증
6. OpenAI Project key·예산한도 설정
7. Upstash와 Turnstile 적용
8. `npm run build` 통과
9. `/api/health/staycare`가 HTTP 200과 `ready` 반환
10. 관리자 계정·근로자 초대계정 생성
11. 문서 업로드·다운로드·동의·신청·AI 테스트
12. 공급자는 우선 manual mode로 제한 베타
13. 10~20명 베타 후 공급자 API를 순차 연결

## 16. Production 전 필수값 요약

```env
NEXT_PUBLIC_SITE_URL=https://sejoonglaw.kr
STAYCARE_TENANT_SLUG=sejoong-staycare
STAYCARE_DEFAULT_LOCALE=ko
STAYCARE_SUPPORT_EMAIL=staycare@sejoonglaw.kr

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STAYCARE_STORAGE_BUCKET=staycare-private

OPENAI_API_KEY=
OPENAI_TRANSLATION_MODEL=gpt-5

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

EMAIL_PROVIDER=resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=Sejoong StayCare <staycare@sejoonglaw.kr>

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_SENTRY_DSN=

STAYCARE_FIELD_ENCRYPTION_KEY=
STAYCARE_WEBHOOK_SECRET=
STAYCARE_CRON_SECRET=

TELECOM_PROVIDER_MODE=manual
BANK_PROVIDER_MODE=manual
REMITTANCE_PROVIDER_MODE=manual
DELIVERY_PROVIDER_MODE=manual
```
