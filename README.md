# 법무법인 세중 웹사이트

법무법인 세중의 본사, 의정부, 안산 지점을 위한 통합 웹사이트입니다.

## 기술 스택

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL, Auth)
- Vercel (배포)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Supabase 데이터베이스 설정

`supabase/migrations/001_initial_schema.sql` 파일의 마이그레이션을 Supabase에 실행하세요.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## 프로젝트 구조

- `app/` - Next.js App Router 페이지 및 라우트
- `components/` - 재사용 가능한 React 컴포넌트
- `lib/` - 유틸리티 함수 및 Supabase 클라이언트
- `types/` - TypeScript 타입 정의
- `supabase/` - Supabase 마이그레이션 파일

## 주요 기능

- 지점별 페이지 (본사, 의정부, 안산)
- 법인소개, 소송업무, 기업자문, 해외이주, 외국인센터, 상담게시판
- 인증 시스템 (카카오, 네이버 OAuth, SMS 인증)
- 게시판 시스템 (문의, 칼럼, 뉴스)
- 관리자 시스템 (콘텐츠 관리, 구성원 관리)

## 배포

Vercel에 배포할 수 있습니다:

```bash
vercel
```

환경 변수를 Vercel 대시보드에서 설정하세요.

