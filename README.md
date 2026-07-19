# 법무법인 세중 웹사이트·Sejoong StayCare

법무법인 세중의 웹사이트와 스리랑카 근로자 한국생활 원스톱 플랫폼을 위한 Next.js 애플리케이션입니다.

## 기술 스택

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL·Auth·Storage·RLS
- Vercel
- OpenAI Responses API
- Upstash Redis rate limit
- Resend email
- Cloudflare Turnstile

## 로컬 시작

```bash
npm install --legacy-peer-deps
cp .env.example .env.local
npm run check:staycare-env
npm run dev
```

전체 환경값과 발급처:

```text
docs/staycare/08_ENVIRONMENT_AND_VENDOR_SETUP.md
```

## Sejoong StayCare

스리랑카 근로자가 현지에서 한국 취업을 준비하는 단계부터 한국 입국, 초기정착, 생활·근로, 체류연장, 본국송금과 귀국까지 필요한 정보를 확인하고 서비스를 신청·추적하는 한국어·영어·싱할라어 원스톱 플랫폼입니다.

정부·EPS의 공식 모집·고용·비자·입국 절차는 대체하지 않습니다. 공식기관의 상태·자료·마감일을 연결하고, 비자 이후의 통신·은행·송금·체류행정·보험·숙소·병원·AI 언어지원과 귀국준비를 세중 플랫폼에서 통합합니다.

### 사용자 라우트

```text
/{locale}/staycare        공개 서비스 소개
/{locale}/staycare/login  이메일·휴대전화 OTP 로그인
/{locale}/staycare/app    인증된 근로자 애플리케이션
/{locale}/staycare/admin  역할기반 세중 운영센터
/{locale}/staycare/demo   /staycare/app 호환 리다이렉트
```

### 운영 API

```text
POST       /api/staycare/onboarding
GET|POST   /api/staycare/applications
PATCH      /api/staycare/admin/applications/[id]
PATCH      /api/staycare/journey/steps/[id]
POST       /api/staycare/documents/upload-url
POST       /api/staycare/documents/complete
GET        /api/staycare/documents/[id]/download
GET|PATCH  /api/staycare/notifications
POST       /api/staycare/ai
POST       /api/staycare/providers/[provider]/webhook
GET|POST   /api/cron/staycare-notifications
GET        /api/health/staycare
```

## 전체 생애주기

1. 스리랑카 현지 공식 모집·교육 준비
2. 정부·EPS 시험·구직·근로계약·사증·입국 절차
3. 비자 발급 후 디지털 프로필·통신·이동 사전신청
4. 한국 도착·통신 활성화·교육·숙소 인계
5. 초기 90일 외국인등록·계좌·보험·통신·생활기반
6. 급여·본국송금·병원·숙소·노동·생활관리
7. 체류기간·주소·여권·계약·사업장 변경 관리
8. 보험금·퇴직금·최종송금·서비스 종료·귀국지원

## 구현된 상용 기반

### 계정·권한

- Supabase Auth 이메일·휴대전화 OTP
- PKCE callback과 cookie session refresh
- Cloudflare Turnstile 로그인 보호
- 근로자·세중·운영사·고용주·현지기관·공급자 역할
- 테넌트·조직·회원·배정업무 RLS
- 세중 운영자 부트스트랩 스크립트

### 실제 데이터

- 근로자 온보딩
- 개인별 8단계 journey 생성
- 단계·기한·책임주체
- 서비스 신청과 idempotency
- 통신 order와 체류행정 case
- 운영자 처리 큐와 상태전이
- 공급자 manual·sandbox·api 모드
- 서명검증·중복방지 provider webhook

### 문서

- Supabase private Storage
- signed upload URL
- SHA-256 기록
- 검수대기 상태
- 60초 signed download
- 파일종류·15MB 제한
- 조회·다운로드 감사기록

### AI

- 한국어·영어·싱할라어 번역·생활가이드
- 인증 사용자만 호출
- Upstash 분산 rate limit
- 여권·외국인등록·계좌·카드번호 형태 차단
- 서버 전용 API key
- `store:false`
- 법률·의료·출입국 중요결정의 사람 검토 안내

### 알림

- in-app 알림 데이터
- Resend email
- CoolSMS SMS 선택지원
- 원자적 queue claim
- 실패 재시도와 최대시도 제한
- Cron secret 보호

## 통신·은행·송금·배송

공급자 API 계약 전:

```env
TELECOM_PROVIDER_MODE=manual
BANK_PROVIDER_MODE=manual
REMITTANCE_PROVIDER_MODE=manual
DELIVERY_PROVIDER_MODE=manual
```

근로자 신청은 실제 DB와 세중 운영 큐에 저장되고 운영자가 공급자 포털·전화·이메일로 처리한 뒤 결과를 입력합니다.

계약 후:

```env
*_PROVIDER_MODE=sandbox
*_PROVIDER_BASE_URL=
*_PROVIDER_API_KEY=
*_PROVIDER_WEBHOOK_SECRET=
```

검증 완료 후 `MODE=api`로 전환합니다.

- 통신개통은 통신사 또는 공식 판매점
- 계좌개설은 은행
- 해외송금은 외국환업무취급기관 또는 등록 송금사업자
- 정부 승인·출입국 결정은 관계기관
- StayCare는 자금을 직접 보유·환전·송금하지 않음

## Supabase

Migration 적용순서:

```text
supabase/migrations/012_staycare_platform_v1.sql
supabase/migrations/013_staycare_production_hardening.sql
supabase/migrations/014_staycare_notification_delivery.sql
```

운영 DB에 즉시 적용하지 말고 새 Staging Supabase에서 전체 migration을 처음부터 검증합니다.

주요 데이터:

- tenant·organization·membership
- worker·journey·step
- consent·private document
- service catalog·application·event
- provider connection·webhook event
- telecom·delivery order
- remittance beneficiary·intent
- immigration case
- ticket·notification·return plan
- append-only audit event

## 첫 세중 관리자

관리자 이메일로 `/ko/staycare/login`에서 먼저 로그인한 뒤 실행합니다.

```bash
npm run bootstrap:staycare-admin -- --email admin@sejoonglaw.kr
```

역할 지정:

```bash
npm run bootstrap:staycare-admin -- \
  --email lawyer@sejoonglaw.kr \
  --role sejoong_lawyer
```

## 검증

```bash
npm run check:staycare-env
npm run check:staycare-env:strict
npm run typecheck
npx jest __tests__/staycare --runInBand
npm run build
```

Health:

```text
GET /api/health/staycare
```

실제 사용자 초대 전 `status: ready`를 확인합니다.

## 운영문서

```text
docs/staycare/00_PRODUCT_VISION.md
docs/staycare/01_END_TO_END_LIFECYCLE.md
docs/staycare/02_GOVERNMENT_SEJOONG_BOUNDARY.md
docs/staycare/03_TELECOM_BANK_REMITTANCE_INTEGRATIONS.md
docs/staycare/04_AI_LANGUAGE_ARCHITECTURE.md
docs/staycare/05_SECURITY_AND_RELEASE_GATE.md
docs/staycare/06_RETURN_HOME_WORKFLOW.md
docs/staycare/07_IMPLEMENTATION_ROADMAP.md
docs/staycare/08_ENVIRONMENT_AND_VENDOR_SETUP.md
docs/staycare/09_PRODUCTION_RUNBOOK.md
docs/staycare/10_GO_LIVE_CHECKLIST.md
```

## 현재 출시판정

코드는 합성 화면이 아니라 인증·DB·Storage·서비스 신청·운영센터·알림·공급자 연동경계를 갖춘 **Production Candidate**입니다.

실제 개통 전 외부 완료사항:

- Production Supabase와 Migration 적용
- Vercel Production 환경값 입력
- Resend 도메인 인증
- OpenAI·Upstash·Turnstile·Sentry 운영키
- 세중 관리자·운영자 계정
- 한국어·영어·싱할라어 약관과 현지검수
- 통신·은행·송금·배송 수동 SOP 또는 제휴계약
- 10~20명 Closed Beta
- 개인정보·보안·백업·복구 최종승인
