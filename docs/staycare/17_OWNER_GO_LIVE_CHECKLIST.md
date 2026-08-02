# StayCare 운영 책임자 실행 체크리스트

> 이 문서는 코드 병합 이후 운영 책임자가 직접 수행해야 하는 외부 작업을 순서대로 정리한다. 완료한 항목에는 날짜·담당자·증빙 링크를 기록한다.

## A. Supabase Database

- [ ] Staging 프로젝트와 Production 프로젝트를 구분했다.
- [ ] Production DB 백업 또는 PITR 정책을 확인했다.
- [ ] `supabase migration list`로 012~019 이력을 확인했다.
- [ ] Staging에 `019_staycare_four_language_completion.sql`을 적용했다.
- [ ] Staging에서 `preferred_language='ta'` 저장을 확인했다.
- [ ] Claim RPC와 RLS 테스트를 완료했다.
- [ ] Production에 Migration 019를 적용했다.
- [ ] 적용 명령·화면·시간·담당자를 기록했다.

증빙:

```text
담당자:
적용일:
Staging 로그:
Production 로그:
백업 ID:
```

## B. Vercel Environment Variables

- [ ] Supabase URL·Publishable Key·Service Role Key
- [ ] StayCare Tenant·지원 이메일·Storage Bucket
- [ ] Field Encryption·Webhook·Cron Secret
- [ ] Upstash Rate Limit
- [ ] Turnstile
- [ ] Sentry
- [ ] OpenAI
- [ ] Email Provider 및 자격증명
- [ ] Demo Login `false`
- [ ] Google/Facebook은 Provider 설정 완료 전 `false`
- [ ] Preview와 Production 값을 분리했다.
- [ ] Service Role Key가 `NEXT_PUBLIC_` 이름으로 존재하지 않는다.

## C. ImprovMX 수신

- [ ] 도메인을 ImprovMX에 등록했다.
- [ ] `staycare@`, `support@`, `privacy@`, `dmarc@` Alias를 만들었다.
- [ ] MX 2개를 적용했다.
- [ ] 다른 메일 서비스 MX를 제거했다.
- [ ] SPF TXT를 하나로 병합했다.
- [ ] ImprovMX가 `Email forwarding active`로 표시된다.
- [ ] Gmail·Naver·Daum·Outlook에서 수신 테스트했다.

## D. ImprovMX SMTP + Gmail

- [ ] 현재 ImprovMX 플랜의 발송 한도를 확인했다.
- [ ] SMTP Credential을 전용 Alias로 만들었다.
- [ ] DKIM CNAME 두 개를 적용했다.
- [ ] DMARC를 `p=none`으로 시작했다.
- [ ] Gmail `다른 주소에서 메일 보내기`를 설정했다.
- [ ] `smtp.improvmx.com:587`, TLS를 사용했다.
- [ ] Gmail 별칭 확인을 완료했다.
- [ ] 외부 주소로 보내 SPF/DKIM/DMARC PASS를 확인했다.

## E. Supabase Auth

- [ ] Site URL을 운영 도메인으로 설정했다.
- [ ] `/auth/callback` Redirect URL을 등록했다.
- [ ] ko/en/si/ta StayCare URL을 등록했다.
- [ ] Preview callback 허용범위를 최소화했다.
- [ ] Custom SMTP를 연결했다.
- [ ] 이메일 템플릿을 검토했다.
- [ ] Auth Rate Limit을 운영 규모에 맞게 설정했다.
- [ ] OTP 재전송·만료 정책을 확인했다.
- [ ] CAPTCHA를 적용했다.

## F. Google/Facebook 로그인

- [ ] Google OAuth Client와 Supabase Provider를 연결했다.
- [ ] Google Redirect URL을 등록했다.
- [ ] Facebook App·Callback·개인정보 URL을 설정했다.
- [ ] 공급자 설정 완료 후 Vercel Feature Flag를 `true`로 변경했다.
- [ ] 소셜 로그인 후에도 공식 명부 Claim이 필수인지 테스트했다.

## G. Phone OTP

- [ ] Supabase Phone Provider를 활성화했다.
- [ ] 스리랑카 `+94` 국제 발송 지원을 확인했다.
- [ ] 실제 대상 통신사별 수신 테스트했다.
- [ ] 비용·재전송·Rate Limit을 문서화했다.
- [ ] 한국 입국 후 `+82` 번호 변경을 테스트했다.
- [ ] SIM 분실·번호 변경·중복계정 복구 절차를 만들었다.

## H. 4개 언어 QA

- [ ] 공개 메인에서 네 언어 선택 가능
- [ ] 로그인·OTP·오류 문구 네 언어
- [ ] Claim·온보딩 네 언어
- [ ] 근로자 앱·계정 네 언어
- [ ] 관리자·Control Tower 네 언어
- [ ] 파트너 포털 네 언어
- [ ] 날짜·Placeholder·빈 상태·ARIA 네 언어
- [ ] 새로고침·로그인 후 언어 유지
- [ ] 모바일에서 Sinhala/Tamil 줄바꿈 정상

## I. 네이티브·법률 검수

- [ ] Sinhala 네이티브 검수자 지정
- [ ] Tamil 네이티브 검수자 지정
- [ ] 개인정보·민감정보·국외이전 검토
- [ ] 비자·노무·산재·긴급 문구 검토
- [ ] 검수 버전·날짜·승인자를 기록
- [ ] 번역 변경 승인 프로세스를 만들었다.

## J. Pilot

- [ ] 20~30명 실제 명부를 준비했다.
- [ ] 초대코드 발급·Claim을 테스트했다.
- [ ] `+94` OTP·이메일 OTP를 테스트했다.
- [ ] 입국·버스·기숙사·사업장 배치 데이터를 입력했다.
- [ ] P0/P1 사고 대응 연락망을 배포했다.
- [ ] Pilot 종료 후 오류·문의·이탈 사유를 정리했다.
- [ ] 200명 확대 승인 기준을 문서화했다.
- [ ] 2,000명 확대 전 발송량·DB·지원인력 부하를 검토했다.

## K. 최종 승인

- [ ] GitHub StayCare CI의 환경검사·4개 언어 검사·Lint·TypeScript·Jest·Production Build가 모두 통과했다.
- [ ] Vercel Preview가 Ready이고 주요 4개 언어 경로를 직접 확인했다.
- [ ] 임시 릴리스 파일·트리거·자체삭제 워크플로가 최종 변경 목록에 남지 않았다.
- [ ] `main` 반영 커밋과 롤백 기준 커밋을 기록했다.

```text
기술 승인자:
운영 승인자:
개인정보/법률 승인자:
Sinhala 검수자:
Tamil 검수자:
Pilot 시작일:
Production 전환일:
비상 롤백 담당자:
```
