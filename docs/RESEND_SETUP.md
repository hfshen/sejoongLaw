# Resend 이메일 전송 설정 가이드

## 1. Resend 계정 생성 및 API 키 발급

### Step 1: Resend 가입
1. [Resend 공식 웹사이트](https://resend.com/)에 접속
2. "Sign Up" 버튼 클릭하여 계정 생성
3. 이메일 인증 완료

### Step 2: API 키 발급
1. Resend 대시보드에 로그인
2. 좌측 메뉴에서 **"API Keys"** 클릭
3. **"Create API Key"** 버튼 클릭
4. API 키 이름 입력 (예: "Sejoong Law Website")
5. 권한 선택 (일반적으로 "Sending access" 선택)
6. **"Add"** 버튼 클릭
7. 생성된 API 키를 복사 (한 번만 표시되므로 안전하게 보관)

### Step 3: 도메인 인증 (선택사항)
- Resend는 기본적으로 `onboarding@resend.dev` 도메인을 제공합니다
- 하지만 `noreply@sejoonglaw.com` 같은 커스텀 도메인을 사용하려면:
  1. 대시보드에서 **"Domains"** 메뉴 클릭
  2. **"Add Domain"** 버튼 클릭
  3. 도메인 이름 입력 (예: `sejoonglaw.com`)
  4. DNS 레코드 추가 (Resend가 제공하는 DNS 설정을 도메인에 추가)
  5. 인증 완료 대기 (보통 몇 분 소요)

## 2. 환경 변수 설정

### 로컬 개발 환경 (`.env.local`)
```env
# 이메일 전송 방식: resend 선택
EMAIL_PROVIDER=resend

# Resend API 키 (Step 2에서 발급받은 키)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx

# 발신자 이메일 주소
# 도메인 인증을 했다면: noreply@sejoonglaw.com
# 도메인 인증을 안 했다면: onboarding@resend.dev
RESEND_FROM_EMAIL=onboarding@resend.dev
```

### Vercel 배포 환경
1. Vercel 대시보드에 로그인
2. 프로젝트 선택
3. **Settings** → **Environment Variables** 메뉴 클릭
4. 다음 환경 변수 추가:
   - `EMAIL_PROVIDER` = `resend`
   - `RESEND_API_KEY` = (발급받은 API 키)
   - `RESEND_FROM_EMAIL` = `onboarding@resend.dev` (또는 인증한 도메인)

## 3. Resend 요금제

### 무료 플랜 (Free)
- **월 3,000건** 이메일 전송 무료
- **일 100건** 제한
- 기본 도메인 사용 가능 (`onboarding@resend.dev`)

### 유료 플랜 (Pro)
- 월 $20부터 시작
- 월 50,000건부터
- 커스텀 도메인 사용
- 더 높은 전송 한도

## 4. 코드 확인

이미 코드는 Resend를 지원하도록 구현되어 있습니다:

- `lib/email/email.ts`: Resend를 사용하는 이메일 전송 함수
- `app/api/consultation/route.ts`: 상담 요청 시 이메일 전송
- `app/api/booking/route.ts`: 예약 요청 시 이메일 전송

`EMAIL_PROVIDER=resend`로 설정하면 자동으로 Resend를 사용합니다.

## 5. 테스트

### 로컬에서 테스트
1. `.env.local` 파일에 Resend 설정 추가
2. 개발 서버 재시작: `npm run dev`
3. 웹사이트에서 상담 요청 또는 예약 요청 제출
4. `sejoonglaw@gmail.com`으로 이메일이 도착하는지 확인

### 문제 해결
- **이메일이 전송되지 않는 경우**:
  - 환경 변수가 올바르게 설정되었는지 확인
  - Resend 대시보드에서 API 키가 활성화되어 있는지 확인
  - Resend 대시보드의 "Logs" 메뉴에서 전송 실패 원인 확인

- **"Invalid API key" 에러**:
  - API 키가 올바르게 복사되었는지 확인
  - 환경 변수 이름이 `RESEND_API_KEY`인지 확인

- **"Domain not verified" 에러**:
  - `RESEND_FROM_EMAIL`이 인증된 도메인인지 확인
  - 또는 `onboarding@resend.dev` 사용

## 6. Resend 대시보드 모니터링

Resend 대시보드에서 다음을 확인할 수 있습니다:
- **Analytics**: 전송 통계, 열람률, 클릭률
- **Logs**: 모든 이메일 전송 기록
- **Domains**: 도메인 인증 상태
- **API Keys**: API 키 관리

## 참고 링크
- [Resend 공식 문서](https://resend.com/docs)
- [Resend API 레퍼런스](https://resend.com/docs/api-reference)
- [Resend 가격 정책](https://resend.com/pricing)

