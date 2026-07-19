# 법무법인 세중 웹사이트

법무법인 세중의 본사, 의정부, 안산 지점과 Sejoong StayCare를 위한 통합 Next.js 애플리케이션입니다.

## 기술 스택

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth, Storage, RLS)
- Vercel (배포)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요.

#### 필수 환경 변수

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 사이트 URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### 선택 환경 변수

```env
# 카카오 맵
NEXT_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key

# SMS 인증
COOLSMS_API_KEY=your_coolsms_api_key
COOLSMS_API_SECRET=your_coolsms_api_secret
COOLSMS_SENDER_PHONE=01012345678

# 이메일
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# 검색엔진 인증
GOOGLE_VERIFICATION=your_google_verification_code
NAVER_VERIFICATION=your_naver_verification_code

# 분석·AI·오류수집
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
```

### 3. Supabase 데이터베이스

기존 사이트 마이그레이션을 순서대로 실행합니다.

StayCare의 신규 테넌트·회원·업무·티켓·구독·원가·감사 기반은 다음 파일입니다.

```text
supabase/migrations/012_staycare_platform_v1.sql
```

이 마이그레이션은 먼저 별도 개발 또는 Preview Supabase 프로젝트에서 검증해야 합니다. 운영 DB에 즉시 적용하지 마세요.

### 4. 개발 서버

```bash
npm run dev
```

기본 주소:

```text
http://localhost:3000
```

## Sejoong StayCare

법무법인 세중이 멤버십 계약·수납·상담·행정·현장지원의 단일 서비스 주체가 되고, 위탁 운영사가 세중 브랜드 아래 플랫폼과 일상 운영을 실행하는 외국인 근로자 통합관리 서비스입니다.

최초 기준 사업은 스리랑카 인력 약 200명이며, 기준 상품은 1인 연 1,000,000원입니다. 고용주·근로자·도입기관 중 계약별로 비용부담자를 선택할 수 있습니다.

### 라우트

```text
/{locale}/staycare           공개 서비스 소개
/{locale}/staycare/briefing  7월 27일 200명 도입 담당자 브리핑, noindex
/{locale}/staycare/demo      통합 운영 플랫폼 Reference Implementation, noindex
```

### 현재 구현

- 200명 도입 준비 대시보드
- 회원·근로자 사전명단
- 국가·비자·직무별 업무·기한
- P0~P3 세중 통합 상담·사건 큐
- 1인 연 100만 원 멤버십과 납부자 설정
- 상담·전문검토·통역·현장지원 포함량
- 200명 매출·직접비·운영재원 계산
- 세중·운영사·고용주 리포트 설계
- 테넌트·조직·역할·RLS 데이터베이스 기반
- 비공개 문서·결제 참조·감사로그 설계

### 중요한 경계

현재 브리핑과 운영 화면은 합성데이터 기반 Reference Implementation입니다.

다음 항목 완료 전에는 실명·여권·외국인등록·건강·임금정보를 입력하지 않습니다.

- 세중·위탁 운영사 계약
- 서비스 약관·개인정보·민감정보 동의
- 실제 인증·MFA·RLS
- Supabase private Storage·Signed URL
- 승인된 PG 테스트
- 한국어·영어·싱할라어 현지검수
- 보안·권한·환불·파기 테스트
- 세중 최종 상용 승인

상세 문서:

```text
docs/staycare/00_EXECUTIVE_COMPLETE_V1.md
docs/staycare/01_SERVICE_CATALOG_AND_SLA.md
docs/staycare/02_200_MEMBER_COMMERCIAL_MODEL.md
docs/staycare/03_PRODUCT_AND_SCREEN_SPEC.md
docs/staycare/04_27_JULY_BRIEFING_PLAYBOOK.md
docs/staycare/05_SECURITY_AND_RELEASE_GATE.md
```

## 프로젝트 구조

- `app/` — Next.js App Router 페이지·API
- `components/` — 재사용 UI와 서비스 화면
- `lib/` — 유틸리티·도메인 로직·Supabase 클라이언트
- `supabase/` — PostgreSQL 마이그레이션·RLS
- `docs/` — 제품·운영·보안·배포 문서
- `__tests__/` — Jest 테스트

## 기존 주요 기능

- 지점별 페이지: 본사·의정부·안산
- 법인소개·소송업무·기업자문·해외이주·외국인센터
- 인증 시스템: 카카오·네이버 OAuth·SMS
- 상담·게시판·칼럼·뉴스
- 관리자 콘텐츠·구성원 관리
- 문서 번역·승인·감사 워크플로

## 검증

```bash
npm run build
npm run test
npm run test:coverage
```

StayCare 상용 전에는 별도로 다음을 검증합니다.

- RLS 역할·테넌트·고용주 침투테스트
- private Storage 우회 접근
- PG 웹훅 서명·멱등·환불
- 민감정보 로그·Sentry 노출
- 대량내보내기 마스킹·수식주입
- 계정회수·백업·복구·파기

## 배포

Vercel 배포 기준:

```bash
vercel
```

Vercel에서 Supabase, 검색엔진 인증, 이메일·SMS·PG·Sentry 환경변수를 환경별로 설정한 뒤 Preview를 검수하고 Production으로 승격합니다.
