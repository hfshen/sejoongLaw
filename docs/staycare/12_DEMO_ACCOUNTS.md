# Sejoong StayCare 역할별 데모 계정

## 목적

`/ko/staycare/login`에서 근로자·세중·운영사·고용주·스리랑카 현지기관·제휴사·감사자 화면을 바로 확인하기 위한 공개 데모 계정입니다.

모든 계정은 운영 tenant `sejoong-staycare`가 아닌 별도 tenant `sejoong-staycare-demo`에만 연결됩니다. 스크립트가 만드는 이름·전화번호·비자·신청·티켓은 모두 합성데이터입니다.

## 로그인 주소

```text
https://www.sejoonglaw.kr/ko/staycare/login
```

로그인 화면 하단에서 역할 카드를 선택하면 이메일과 비밀번호가 자동으로 사용됩니다.

## 공통 비밀번호

```text
StayCareDemo!2026
```

## 계정

| 역할 | 로그인 ID | 이동 화면 |
|---|---|---|
| 일반 근로자 | `demo.worker@sejoonglaw.kr` | 근로자 앱 |
| 세중 총괄 관리자 | `demo.admin@sejoonglaw.kr` | 통합 운영센터 |
| 세중 변호사 | `demo.lawyer@sejoonglaw.kr` | 통합 운영센터 |
| 출입국 업무 관리자 | `demo.immigration@sejoonglaw.kr` | 통합 운영센터 |
| 운영사 매니저 | `demo.operator.manager@sejoonglaw.kr` | 통합 운영센터 |
| 운영사 담당자 | `demo.operator.agent@sejoonglaw.kr` | 통합 운영센터 |
| 고용주 담당자 | `demo.employer@sejoonglaw.kr` | 협력기관 포털 |
| 스리랑카 현지기관 | `demo.institution@sejoonglaw.kr` | 협력기관 포털 |
| 제휴 서비스사 | `demo.provider@sejoonglaw.kr` | 협력기관 포털 |
| 감사·품질관리 | `demo.auditor@sejoonglaw.kr` | 통합 운영센터 |

## 최초 생성 또는 초기화

### 전제

다음 마이그레이션이 Supabase에 적용되어 있어야 합니다.

```text
supabase/migrations/012_staycare_platform_v1.sql
supabase/migrations/013_staycare_production_hardening.sql
```

로컬 환경 또는 안전한 운영 터미널에 다음 값이 필요합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<server-only-secret-key>
```

### 실행

```bash
npm install --legacy-peer-deps
npm run seed:staycare-demo
```

스크립트는 다음을 수행합니다.

1. 기존 `sejoong-staycare-demo` tenant와 그 하위 합성데이터를 삭제합니다.
2. 별도 demo tenant와 세중·운영사·고용주·현지기관·제휴사 조직을 다시 만듭니다.
3. Supabase Auth에 10개 이메일·비밀번호 계정을 생성하거나 비밀번호를 초기화합니다.
4. 역할별 membership을 demo tenant에만 연결합니다.
5. 합성 근로자 3명, 생애주기, 서비스, 신청, 통신주문, 출입국사건, 티켓과 귀국계획을 생성합니다.

운영 tenant와 실제 회원정보는 삭제하거나 변경하지 않습니다. 다만 service-role key를 사용하는 관리자 스크립트이므로 실행 전 `STAYCARE_TENANT_SLUG`와 실제 Supabase 프로젝트를 다시 확인해야 합니다.

## Supabase Auth 설정

Supabase Dashboard에서 이메일·비밀번호 로그인이 활성화되어 있어야 합니다.

```text
Authentication
→ Sign In / Providers
→ Email
→ Enable Email provider
```

데모 사용자는 `email_confirm: true`로 생성되므로 인증메일은 필요하지 않습니다.

Cloudflare Turnstile을 사용하는 경우 로그인 화면의 demo panel에도 별도 Turnstile widget이 표시됩니다. 다음 두 설정이 서로 대응해야 합니다.

```text
Vercel: NEXT_PUBLIC_TURNSTILE_SITE_KEY
Supabase Authentication: Turnstile Secret Key
```

## Vercel 설정

데모 패널 표시:

```env
NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED=true
```

숨기기:

```env
NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED=false
```

`NEXT_PUBLIC_` 환경변수는 build-time에 포함되므로 값을 바꾼 뒤 Production Redeploy가 필요합니다.

## 접근 경계

- 근로자 계정은 자기 합성 근로자 행만 조회합니다.
- 세중·운영사 계정은 demo tenant의 내부 운영화면을 사용합니다.
- 고용주 계정은 지정 고용주에 연결된 근로자만 조회합니다.
- 현지기관 계정은 지정 교육기관에 연결된 후보자만 조회합니다.
- 제휴사 계정은 자기 조직에 배정된 신청만 조회합니다.
- 감사자 계정은 demo tenant의 감사·운영 확인 용도입니다.
- 실제 tenant와 demo tenant는 UUID와 membership이 분리되어 RLS에서 교차 조회되지 않습니다.

## 운영 주의

데모 계정과 비밀번호는 로그인 화면에 공개됩니다. 따라서 다음 정보를 입력하면 안 됩니다.

- 실제 성명·여권번호·외국인등록번호
- 실제 은행·계좌·카드정보
- 실제 송금 수취인 정보
- 실제 법률·의료·인권 상담내용
- 실제 근로계약서나 비자 문서

데모 데이터는 정기적으로 `npm run seed:staycare-demo`를 다시 실행해 초기화합니다.
