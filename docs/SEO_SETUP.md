# SEO 설정 가이드

## 네이버 웹마스터 도구 설정

### 1. 네이버 웹마스터 도구 등록
1. [네이버 서치어드바이저](https://searchadvisor.naver.com/) 접속
2. 사이트 등록
3. 인증 메타 태그 복사

### 2. 환경 변수 설정
`.env.local` 또는 배포 환경에 다음 변수 추가:
```env
NAVER_VERIFICATION=your_naver_verification_code
```

인증 메타 태그는 자동으로 `<head>`에 추가됩니다.

### 3. 사이트맵 제출
1. 네이버 서치어드바이저 대시보드 접속
2. "요청" → "사이트맵 제출" 메뉴 클릭
3. `https://sejoonglaw.com/sitemap.xml` 제출

## 구글 Search Console 설정

### 1. 구글 Search Console 등록
1. [Google Search Console](https://search.google.com/search-console) 접속
2. 속성 추가
3. HTML 태그 방식으로 인증

### 2. 환경 변수 설정
`.env.local` 또는 배포 환경에 다음 변수 추가:
```env
GOOGLE_VERIFICATION=your_google_verification_code
```

인증 메타 태그는 자동으로 `<head>`에 추가됩니다.

### 3. 사이트맵 제출
1. Google Search Console 대시보드 접속
2. "색인 생성" → "Sitemaps" 메뉴 클릭
3. `https://sejoonglaw.com/sitemap.xml` 제출

## SEO 최적화 항목

### ✅ 완료된 항목
- [x] 구조화된 데이터 (Schema.org) - Organization, LegalService, WebSite
- [x] 메타 태그 최적화 (title, description, keywords)
- [x] Open Graph 태그 (소셜 미디어 공유 최적화)
- [x] Twitter Card 태그
- [x] Canonical URL 설정
- [x] 다국어 지원 (hreflang)
- [x] robots.txt 설정 (Googlebot, Naver Yeti 지원)
- [x] sitemap.xml 자동 생성
- [x] 모바일 최적화 (viewport, responsive design)

### 📋 추가 권장 사항
1. **콘텐츠 최적화**
   - 각 페이지에 고유한 title과 description 작성
   - 키워드 밀도 최적화 (자연스럽게)
   - 내부 링크 구조 개선

2. **성능 최적화**
   - 이미지 최적화 (WebP, lazy loading)
   - Core Web Vitals 개선
   - 페이지 로딩 속도 최적화

3. **백링크 구축**
   - 법률 관련 디렉토리 등록
   - 블로그 포스팅
   - 소셜 미디어 마케팅

## WeChat 미니 프로그램 스타일

### 기능
- WeChat User-Agent 자동 감지
- WeChat 전용 메타 태그 자동 추가
- 미니 프로그램 스타일 적용
- 스크롤 최적화

### 설정
자동으로 적용되며 추가 설정이 필요 없습니다.

### 테스트
WeChat 앱에서 웹사이트를 열면 자동으로 미니 프로그램 스타일이 적용됩니다.
