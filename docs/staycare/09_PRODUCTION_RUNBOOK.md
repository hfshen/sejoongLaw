# StayCare Production Runbook

## 1. 출시 형태

StayCare는 다음 세 층으로 운영한다.

```text
sejoonglaw.kr
├─ /{locale}/staycare          공개 서비스 안내
├─ /{locale}/staycare/login    이메일·휴대전화 OTP 로그인
├─ /{locale}/staycare/app      인증된 근로자 앱
├─ /{locale}/staycare/admin    세중 운영센터
└─ /api/...                    인증·문서·AI·서비스·공급자·알림 API
```

지원 언어:

- 한국어 `ko`
- 영어 `en`
- 싱할라어 `si`

## 2. 출시 전 인프라

### Production

- Vercel Production Project
- Production Supabase Project
- Production Upstash Redis
- Resend 인증 도메인
- Cloudflare Turnstile Production Widget
- OpenAI StayCare 전용 Project
- Sentry Production Project

### Staging

Production과 다음을 분리한다.

- Supabase Project
- OpenAI key
- Resend API key
- Turnstile Widget
- Upstash database
- 공급자 Sandbox key
- Sentry environment

## 3. 데이터베이스 배포

적용순서:

```text
012_staycare_platform_v1.sql
013_staycare_production_hardening.sql
014_staycare_notification_delivery.sql
```

검증항목:

- `staycare_tenants`에 `sejoong-staycare` 존재
- `staycare_service_catalog`에 7개 기본 서비스 존재
- `staycare-private` bucket이 public=false
- RLS가 모든 StayCare 업무테이블에 활성화
- audit event UPDATE·DELETE 차단
- application status transition trigger 활성화
- notification claim RPC 존재

## 4. Supabase Auth

### 필수 설정

```text
Site URL
https://sejoonglaw.kr

Redirect URL
https://sejoonglaw.kr/auth/callback
```

초기에는 이메일 OTP를 기본으로 한다.

휴대전화 OTP는 다음 조건을 충족한 뒤 활성화한다.

- Supabase Auth SMS Provider 연결
- `+94` 스리랑카 번호 실제 수신테스트
- 발송국가·비용·재시도·차단정책
- Turnstile 또는 CAPTCHA 검증
- 계정탈취·SIM 교체 대응정책

## 5. 첫 세중 관리자 생성

1. 관리자가 `/ko/staycare/login`에서 한 번 로그인한다.
2. 운영환경을 로컬 또는 승인된 관리 단말에 설정한다.
3. 다음을 실행한다.

```bash
npm run bootstrap:staycare-admin -- --email admin@sejoonglaw.kr
```

다른 역할:

```bash
npm run bootstrap:staycare-admin -- \
  --email lawyer@sejoonglaw.kr \
  --role sejoong_lawyer

npm run bootstrap:staycare-admin -- \
  --email operator@sejoonglaw.kr \
  --role operator_manager
```

허용 역할:

- sejoong_admin
- sejoong_lawyer
- immigration_manager
- operator_manager
- operator_agent
- auditor

service-role key가 있는 단말에서만 실행한다.

## 6. 배포 전 자동검증

```bash
npm ci --legacy-peer-deps
npm run check:staycare-env:strict
npm run typecheck
npx jest __tests__/staycare --runInBand
npm run build
```

GitHub Actions의 `StayCare CI`가 동일한 TypeScript·테스트·Build 검증을 수행한다.

## 7. Production 배포

1. Vercel Production 환경변수를 입력한다.
2. `main` 병합 전 Preview에서 인증·DB·Storage를 검수한다.
3. PR을 병합한다.
4. Production deployment를 확인한다.
5. 다음 Health endpoint를 확인한다.

```text
GET https://sejoonglaw.kr/api/health/staycare
```

정상:

```json
{
  "service": "sejoong-staycare",
  "status": "ready"
}
```

`degraded` 또는 `not_ready`이면 실제 회원을 초대하지 않는다.

## 8. 필수 Smoke Test

### 인증

- 이메일 OTP 발송
- Magic Link 또는 코드 로그인
- callback 후 `/staycare/app` 이동
- 비로그인 상태에서 app·admin 접근 차단
- 로그아웃과 세션만료

### 온보딩

- 한국어·영어·싱할라어·타밀어 전환
- 기본정보 등록
- worker·membership·journey·step 생성
- 중복가입 시 기존 계정 반환

### 문서

- PDF·JPEG·PNG·WebP 업로드
- 15MB 초과 차단
- signed upload
- SHA-256 기록
- review_required 전환
- 60초 signed download
- 다른 근로자 문서 직접 URL 차단

### 서비스 신청

- 같은 idempotency key 중복신청 방지
- 통신 신청과 telecom order 생성
- 체류행정 신청과 immigration case 생성
- manual provider mode에서 운영 큐 등록
- 관리자 상태변경
- 근로자 앱에서 결과 확인

### AI

- 한국어·영어·싱할라어·타밀어
- 60회/시간 rate limit
- 여권·등록·계좌·카드번호 차단
- 법률·의료·출입국 중요상황의 사람 검토 안내
- 원문 로그 미저장

### 알림

- in_app 알림
- Resend email
- CoolSMS를 활성화한 경우 SMS
- cron secret 없이 호출 차단
- 실패 재시도와 5회 후 중단

### 공급자 Webhook

- HMAC-SHA256 정상 서명
- 5분 초과 timestamp 거부
- 동일 eventId 중복처리 방지
- 신청상태 전이 검증
- 잘못된 상태전이 실패기록

## 9. 공급자 운영모드

### manual

```env
TELECOM_PROVIDER_MODE=manual
BANK_PROVIDER_MODE=manual
REMITTANCE_PROVIDER_MODE=manual
DELIVERY_PROVIDER_MODE=manual
```

동작:

1. 근로자 신청
2. DB 저장
3. 세중 운영 큐 `reviewing`
4. 운영자가 공급자 관리자페이지·전화·이메일로 처리
5. 외부 참조번호와 결과 입력
6. 근로자에게 앱·이메일 알림

API 계약 전에도 이 모드로 제한 상용운영이 가능하다.

### sandbox

- 테스트 endpoint와 key 입력
- 가상 본인·가상 주문만 사용
- 공급자 웹훅과 장애시나리오 검증
- 실제 자금·실제 개통 금지

### api

- 계약된 Live endpoint
- Live key
- 운영 Webhook secret
- 개인정보 위탁·보존 계약
- 공급자 장애 수동전환

## 10. 해외송금 운영원칙

StayCare가 수행하지 않는 일:

- 자금 수취
- 환전
- 송금 실행
- 수취은행 지급

인가된 은행 또는 등록 송금사업자가 수행한다.

StayCare가 수행하는 일:

- 수취인 준비
- 제휴사업자 연결
- 견적·수수료·예상수취액 표시
- 사업자 선택
- 외부 KYC 화면 연결
- 상태·영수증·실패·환불 추적

공급자 API 계약 전에는 실시간 환율을 임의 생성하지 않는다.

## 11. 운영자 일일업무

오전:

- P0·P1 티켓
- 체류·여권·계약 만료
- 반려·보완 문서
- provider dispatch 실패
- 미처리 신청

오후:

- 공급자 상태대사
- 외부 참조번호 누락
- 발송실패 알림
- 고용주·기관 제출자료
- 다음날 예약·공항·배송

종료 전:

- 긴급사건 인계
- 미처리 사유 기록
- audit·오류·Health 확인

## 12. 장애 대응

### 공급자 API 장애

1. 해당 `*_PROVIDER_MODE=manual` 전환
2. 재배포
3. 신규신청을 운영 큐로 수용
4. 기존 API 신청은 공급자 참조번호로 대사
5. 복구 후 재전송은 새 idempotency key를 발급하지 않고 기존 신청을 사용

### AI 장애

- 서비스 신청·문서·체류기능은 유지
- AI에 `503 AI_NOT_CONFIGURED` 또는 일시불가 표시
- 검수된 고정 콘텐츠와 세중 문의로 fallback

### Supabase 장애

- 신규입력 중단
- 기존 캐시나 화면에 민감정보를 남기지 않음
- Supabase status와 Sentry 확인
- 복구 후 webhook·notification·application 대사

### 개인정보 사고

1. 관련 키·세션·공급자 토큰 회수
2. 접근로그·감사로그 보존
3. 추가 다운로드와 공유 차단
4. 세중 개인정보 책임자·법률담당 보고
5. 법정 통지·신고 여부 판단
6. 재발방지와 사용자 통지

## 13. 백업·보존·파기

- Supabase PITR 또는 일일백업
- private Storage 백업정책
- 공급자 원문 최소보존
- 계약종료와 귀국 후 보존기간
- 파기대상 queue
- 파기 증빙 audit event
- 서비스 종료 시 계정·세션·push token 회수

## 14. 출시 단계

### Internal Alpha

- 세중·운영사 3~5명
- 합성데이터
- 전체 권한·RLS·업로드·알림 검증

### Closed Beta

- 실제 사용자 10~20명
- manual provider mode
- 이메일 로그인 기본
- 일일 운영회의
- 개인정보·싱할라어·사용성 검수

### Limited Production

- 제휴기관 단위 초대
- 공급자별 sandbox 또는 live 전환
- SLA·오류율·처리시간 측정
- 신규 국가 확장 금지

### General Production

- 운영인력·제휴·보안검증 완료
- 실제 사용자 지원체계
- 정기 백업·복구훈련
- 월간 권한·공급자·비용 감사
