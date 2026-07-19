# 법무법인 세중 웹사이트

법무법인 세중의 본사·의정부·안산 웹사이트와 Sejoong StayCare를 위한 Next.js 애플리케이션입니다.

## 기술 스택

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL·Auth·Storage·RLS
- Vercel
- OpenAI Responses API

## 시작하기

```bash
npm install
npm run dev
```

`.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# StayCare AI
OPENAI_API_KEY=your_openai_api_key
OPENAI_TRANSLATION_MODEL=gpt-5

# Optional
COOLSMS_API_KEY=your_coolsms_api_key
COOLSMS_API_SECRET=your_coolsms_api_secret
COOLSMS_SENDER_PHONE=01012345678
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
GOOGLE_VERIFICATION=your_google_verification_code
NAVER_VERIFICATION=your_naver_verification_code
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

## Sejoong StayCare

스리랑카 근로자가 한국 취업을 준비하는 시점부터 한국에서 생활·체류하고 귀국할 때까지 필요한 정보를 확인하고 서비스를 신청·추적하는 한국어·영어·싱할라어 원스톱 플랫폼입니다.

정부·EPS의 공식 모집·고용·입국 절차는 대체하지 않습니다. 공식 상태·서류·기관을 연결하고, 비자 발급 이후의 통신·은행·송금·체류행정·보험·숙소·병원·AI 언어지원과 귀국준비를 세중 플랫폼에서 통합합니다.

### 라우트

```text
/{locale}/staycare       공개 서비스 소개
/{locale}/staycare/app   근로자 원스톱 앱, noindex
/{locale}/staycare/demo  /staycare/app으로 호환 리다이렉트
```

### 생애주기

1. 스리랑카 현지 공식 모집·교육 준비
2. 정부·EPS 시험·구직·근로계약·사증·입국 절차
3. 비자 발급 후 디지털 프로필·통신·이동 사전신청
4. 한국 도착·통신 활성화·교육·숙소 인계
5. 초기 90일 외국인등록·계좌·보험·통신·생활기반
6. 급여·본국송금·병원·숙소·노동·생활관리
7. 체류기간·주소·여권·계약·사업장 변경 관리
8. 보험금·퇴직금·최종송금·서비스 종료·귀국지원

### 원스톱 서비스

- 암호화 디지털 문서함
- 휴대폰 호환확인과 eSIM·SIM 사전신청
- 온라인 eSIM, 공항수령, 담당자 일괄수령, 숙소배송
- 외국인등록·체류지 변경·체류기간 연장·사업장 변경 검토
- 급여계좌·체크카드·자동이체 준비
- 인가된 은행·소액해외송금업자를 통한 스리랑카 송금 연결
- 보험·병원·약국·숙소·교통·근로생활 안내
- 한국어·영어·싱할라어 AI 번역·생활가이드
- D-180 귀국 체크리스트

### 규제 경계

- 통신개통: 통신사 또는 공식 판매점
- 은행계좌: 은행
- 해외송금: 외국환업무취급기관 또는 등록 소액해외송금업자
- 정부 승인·출입국 결정: 관계기관
- 세중: 안내·자료·예약·신청연결·상태·사건·품질 통합

StayCare는 자금을 직접 보유·환전·송금하지 않으며, 공식기관 승인이나 비자·취업 결과를 보장하지 않습니다.

## AI 언어지원

```text
POST /api/staycare/ai
```

지원:

- `ko` 한국어
- `en` 영어
- `si` 싱할라어
- 번역 또는 생활가이드 모드
- 공항·사업장·병원·은행·출입국·숙소·송금 컨텍스트
- 브라우저 음성입력·음성출력

보호장치:

- 여권·외국인등록·카드번호 형태 차단
- 서버 전용 API 키
- OpenAI 요청 `store:false`
- 법률·의료·출입국 중요결정은 담당자 검토

## Supabase

StayCare 마이그레이션:

```text
supabase/migrations/012_staycare_platform_v1.sql
```

주요 도메인:

- 테넌트·조직·역할
- 근로자와 생애주기 인스턴스·단계
- 동의·비공개 문서
- 서비스 카탈로그·공급자 연결
- 서비스 신청·이벤트
- 통신·배송 주문
- 송금 수취인·견적·상태
- 출입국 사건
- AI 세션의 redacted 기록
- 문의·알림·귀국계획·감사로그

운영 DB에 즉시 적용하지 말고 별도 개발 Supabase에서 RLS와 마이그레이션을 검증합니다.

## 문서

```text
docs/staycare/00_PRODUCT_VISION.md
docs/staycare/01_END_TO_END_LIFECYCLE.md
docs/staycare/02_GOVERNMENT_SEJOONG_BOUNDARY.md
docs/staycare/03_TELECOM_BANK_REMITTANCE_INTEGRATIONS.md
docs/staycare/04_AI_LANGUAGE_ARCHITECTURE.md
docs/staycare/05_SECURITY_AND_RELEASE_GATE.md
docs/staycare/06_RETURN_HOME_WORKFLOW.md
docs/staycare/07_IMPLEMENTATION_ROADMAP.md
```

## 상용 전 필수

- 세중·운영사 역할과 개인정보 위탁계약
- 한국어·영어·싱할라어 약관·동의
- Auth·MFA·RLS·private Storage
- 통신사·은행·송금·배송 제휴와 Sandbox
- AI 품질·민감정보 차단 검수
- SMS·이메일·Push 알림
- 보안·백업·복구·보존·파기 테스트
- 제한된 실제 사용자 베타

현재 화면의 근로자·문서·서비스 신청은 합성데이터 Reference Implementation입니다. 실제 개통·은행·송금·정부 신청은 공급자·기관 연동 전까지 실행되지 않습니다.

## 검증

```bash
npm run build
npm run test
npm run test:coverage
```
