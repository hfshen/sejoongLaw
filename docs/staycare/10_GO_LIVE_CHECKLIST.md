# StayCare 상용 출시 체크리스트

## 1. 계약·정책

- [ ] 세중 서비스 주체와 운영사 위탁범위 확정
- [ ] 개인정보 처리위탁·제3자 제공범위 확정
- [ ] 한국어·영어·싱할라어·타밀어 이용약관 승인
- [ ] 개인정보·민감정보·AI 이용동의 승인
- [ ] 통신·은행·송금·배송 수행주체와 책임문구 승인
- [ ] 정부승인·비자·취업·법률결과 보장표현 제거

## 2. 인프라

- [ ] Production과 Staging Supabase 분리
- [ ] Migration 012·013·014 순서대로 적용
- [ ] `staycare-private` bucket이 비공개인지 확인
- [ ] Vercel Production 환경변수 입력
- [ ] Upstash·Resend·Turnstile·OpenAI 연결
- [ ] Sentry 연결
- [ ] `/api/health/staycare`가 `ready` 반환

## 3. 인증·권한

- [ ] 이메일 OTP와 callback 검증
- [ ] 비로그인 app 접근 차단
- [ ] 비직원 admin 접근 차단
- [ ] 세중 관리자 부트스트랩
- [ ] 세중·운영자·고용주·현지기관·공급자 역할 분리
- [ ] 타 조직·타 근로자 데이터 접근 차단
- [ ] 관리자 계정회수 절차

## 4. 근로자 서비스

- [ ] 한국어·영어·싱할라어·타밀어 핵심화면 검수
- [ ] 회원 온보딩과 8단계 여정 생성
- [ ] 정부·세중·공급자 책임표시
- [ ] 문서 업로드·검수·다운로드
- [ ] 통신·체류·은행·송금·귀국 서비스 신청
- [ ] 신청상태와 알림
- [ ] 긴급전화와 사람 검토 연결
- [ ] 모바일 화면 검수

## 5. 보안·개인정보

- [ ] Service-role key 서버 전용
- [ ] 문서 공개 URL 없음
- [ ] Signed URL 만료 확인
- [ ] 민감번호 마스킹
- [ ] 조회·다운로드·상태변경 감사기록
- [ ] AI 민감번호 차단과 `store:false`
- [ ] 보존·파기 절차
- [ ] 백업·복구 절차

## 6. 공급자 운영

### API 계약 전

- [ ] 모든 `*_PROVIDER_MODE=manual`
- [ ] 세중 운영자 수동처리 절차
- [ ] 외부 참조번호와 결과입력
- [ ] 지연·실패 회원안내

### Sandbox·API 계약 후

- [ ] 공급자 인가·계약 확인
- [ ] Sandbox와 운영키 분리
- [ ] Webhook 서명·중복방지 검증
- [ ] Timeout·재시도·idempotency 검증
- [ ] 장애 시 manual 전환 검증

## 7. 자동검증

```bash
npm run check:staycare-env:strict
npm run typecheck
npx jest __tests__/staycare --runInBand
npm run build
```

- [ ] GitHub Actions 성공
- [ ] Staging에서 migration 처음부터 성공
- [ ] 로그인·온보딩·문서·신청·관리자·AI·알림 Smoke Test

## 8. 출시단계

### Closed Beta

- [ ] 실제 사용자 10~20명
- [ ] 공급자는 manual mode
- [ ] 이메일 OTP 기본
- [ ] 싱할라어 현지검수
- [ ] 일일 운영회의

### General Production

- [ ] Closed Beta 중대사고 없음
- [ ] 권한침해 없음
- [ ] 핵심기한 누락 없음
- [ ] 공급자별 계약·SLA
- [ ] 백업·복구훈련
- [ ] 세중 최종 출시승인
