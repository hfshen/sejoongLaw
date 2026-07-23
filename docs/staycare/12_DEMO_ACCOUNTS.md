# Sejoong StayCare 역할별 데모 계정

## 목적

`/ko/staycare/login`에서 근로자·세중·운영사·고용주·스리랑카 현지기관·제휴사·감사자 화면을 바로 확인하기 위한 공개 데모 계정입니다.

모든 계정은 운영 tenant `sejoong-staycare`가 아닌 별도 tenant `sejoong-staycare-demo`에만 연결됩니다. 생성되는 이름·전화번호·비자·신청·송금·티켓은 모두 합성데이터입니다.

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

## 권장 설정 방법: Supabase Dashboard + SQL Editor

데모 설정은 두 단계로 진행합니다.

1. `Authentication > Users`에서 로그인 가능한 Auth 사용자 10개 생성
2. `SQL Editor`에서 `supabase/sql/staycare_demo_seed.sql` 전체 실행

Auth 사용자를 `auth.users`와 `auth.identities`에 직접 SQL로 삽입하지 않습니다. Auth 스키마는 Supabase Auth가 관리하며 직접 삽입하면 비밀번호 로그인, identity 연결 또는 인증 서버 조회가 깨질 수 있습니다.

## 1단계: Auth 사용자 생성

Supabase Dashboard에서 다음으로 이동합니다.

```text
Authentication
→ Users
→ Add user
→ Create new user
```

각 계정을 다음과 같이 생성합니다.

```text
Email: 위 표의 로그인 ID
Password: StayCareDemo!2026
Auto Confirm User: 활성화
```

10개 계정을 모두 생성합니다. 이메일 발송은 필요하지 않습니다.

이메일·비밀번호 Provider도 활성화되어 있어야 합니다.

```text
Authentication
→ Sign In / Providers
→ Email
→ Enable Email provider
```

## 2단계: SQL Editor 실행

먼저 다음 migration이 적용되어 있어야 합니다.

```text
supabase/migrations/012_staycare_platform_v1.sql
supabase/migrations/013_staycare_production_hardening.sql
supabase/migrations/014_staycare_notification_delivery.sql
```

그다음 다음 파일을 엽니다.

```text
supabase/sql/staycare_demo_seed.sql
```

파일 전체를 복사하여 Supabase에서 실행합니다.

```text
Supabase
→ SQL Editor
→ New query
→ 전체 SQL 붙여넣기
→ Run
```

SQL은 실행 전에 10개 Auth 계정이 모두 존재하는지 검사합니다. 누락된 계정이 있으면 데이터를 변경하지 않고 누락된 이메일을 오류로 표시합니다.

정상 실행 결과는 마지막 표에서 다음과 같이 표시됩니다.

```text
slug: sejoong-staycare-demo
memberships: 10
workers: 3
services: 5
applications: 4
tickets: 1
audit_events: 1
```

## SQL이 생성하는 데이터

- 별도 demo tenant
- 세중·운영사·고용주·스리랑카 현지기관·제휴사 조직
- 역할별 membership 10개
- 합성 근로자 3명
- 일반 근로자 계정에 연결된 개인 journey
- 정부 공식단계, eSIM, 공항 인계, 외국인등록, 계좌, 송금, 체류연장, 귀국단계
- 통신·금융·송금·체류행정·귀국 서비스 카탈로그
- eSIM 신청과 공항수령 주문
- 외국인등록 사건
- 급여계좌 신청
- 스리랑카 송금 견적과 마스킹된 합성 수취인
- 업무 티켓, 알림, 동의기록과 귀국계획

## 재실행과 초기화

SQL은 여러 번 실행할 수 있습니다.

- 기존 `sejoong-staycare-demo` tenant와 그 하위 합성데이터만 삭제합니다.
- Auth 사용자 10개는 삭제하지 않습니다.
- 운영 tenant `sejoong-staycare`는 삭제하거나 변경하지 않습니다.
- append-only 감사 트리거는 transaction 내부에서 demo tenant를 삭제하는 동안만 일시적으로 비활성화되고 즉시 복구됩니다.
- 중간 오류가 발생하면 transaction 전체가 롤백됩니다.

## 터미널 방식

Auth 사용자와 데모 데이터를 터미널에서 생성하는 기존 방식도 있습니다.

```bash
npm install --legacy-peer-deps

NEXT_PUBLIC_SUPABASE_URL="https://<PROJECT_REF>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<server-only-secret-key>" \
npm run seed:staycare-demo
```

SQL Editor 방식은 service-role key를 로컬 터미널에 넣지 않아도 되고, 실행되는 SQL을 직접 검토할 수 있다는 장점이 있습니다.

## Cloudflare Turnstile

Turnstile을 사용하는 경우 로그인 화면의 demo panel에도 별도 Turnstile widget이 표시됩니다. 다음 두 설정이 서로 대응해야 합니다.

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

데모 데이터는 필요할 때 `supabase/sql/staycare_demo_seed.sql`을 다시 실행해 초기화합니다.
