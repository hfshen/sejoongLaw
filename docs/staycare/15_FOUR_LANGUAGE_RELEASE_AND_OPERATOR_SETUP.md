# StayCare 4개 언어 릴리스 및 운영자 설정 가이드

> 대상 언어: 한국어(`ko`), 영어(`en`), 싱할라어(`si`), 타밀어(`ta`)
>
> 적용 범위: 공개 메인, 로그인, 인증 복구, 공식 명부 Claim, 온보딩, 근로자 앱, 계정·연락처, 관리자 운영센터, Control Tower, 명부 등록, 협력기관 포털, 페이지 안내, API, 알림, 생애주기·서비스 카탈로그, 데모 계정, 데이터베이스 제약조건

## 1. 이번 릴리스가 해결하는 문제

기존 StayCare는 화면마다 `ko/en/si` 번역 사전이 분산되어 있었고, 일부 화면·API·DB 제약조건에는 Tamil이 빠져 있었다. 이번 릴리스는 다음 원칙으로 통일한다.

1. 모든 StayCare 언어 계약은 `ko/en/si/ta` 네 값만 사용한다.
2. 사용자는 공개 메인부터 네 언어를 즉시 선택할 수 있다.
3. 선택 언어는 `localStorage`, 쿠키, 프로필 선호언어에 유지한다.
4. 로그인 전·후, Claim·온보딩·근로자 앱·관리자·파트너 화면에서 같은 언어를 유지한다.
5. 생애주기·서비스 카탈로그의 Tamil 번역은 중앙 사전에서 관리한다.
6. 새 문구가 네 언어 중 하나라도 빠지면 CI가 실패한다.
7. DB에 `ta`를 저장할 수 있도록 Migration 019를 적용한다.

## 2. 코드 구조

### 언어 계약

- `lib/staycare/language.ts`
- `lib/auth/redirects.ts`
- `lib/env/staycare.ts`
- `lib/staycare/providers/types.ts`

### 번역 데이터

- `lib/staycare/tamil-translations.ts`: 생애주기·서비스 문구 Tamil 번역
- `lib/staycare/interface-translations.ts`: 공통 인터페이스 문구 4개 언어 사전
- `components/staycare/StayCareRuntimeTranslator.tsx`: 기존 고정 문구의 안전한 화면 보정
- `components/staycare/StayCareText.tsx`: 서버·클라이언트 공용 4개 언어 문구
- `components/staycare/StayCareLocalizedDate.tsx`: `ko-KR`, `en-US`, `si-LK`, `ta-LK` 날짜 표시

### 회귀검사

- `scripts/check-staycare-i18n.mjs`
- `npm run check:staycare-i18n`
- `.github/workflows/staycare-ci.yml`

검사는 다음을 확인한다.

- 핵심 언어 타입에 네 언어가 모두 있는지
- API 검증 스키마가 `ta`를 허용하는지
- 생애주기 원문에 Tamil 대응 문구가 있는지
- 공통 인터페이스 사전에 네 언어 키가 모두 있는지
- 데모 계정이 네 언어를 모두 지원하는지
- Migration 019가 필요한 DB 제약조건을 갱신하는지

## 3. 운영 배포 순서

### 3.1 Staging

1. 현재 Production DB를 백업하거나 Staging 프로젝트를 별도로 준비한다.
2. `supabase/migrations/012_*.sql`부터 `019_staycare_four_language_completion.sql`까지 Migration 이력을 확인한다.
3. 누락된 Migration을 순서대로 적용한다.
4. Staging Vercel 환경변수를 설정한다.
5. 네 언어별로 다음 시나리오를 실행한다.
   - 공개 메인 언어 선택
   - 이메일 OTP 또는 Magic Link 로그인
   - 공식 명부 Claim
   - 온보딩 저장
   - 문서·서비스·알림 조회
   - 근로자 앱 새로고침 후 언어 유지
   - 관리자·파트너 화면 언어 전환
6. RLS 권한 테스트를 수행한다.
7. 실제 Sinhala/Tamil 검수자가 법률·개인정보·긴급 문구를 확인한다.

### 3.2 Production

Staging 검증이 끝난 뒤 다음 순서로 진행한다.

1. Production DB 백업
2. Migration 019 적용
3. Vercel Production 환경변수 반영
4. Supabase Auth Redirect URL·SMTP·Provider 설정 확인
5. Production 배포
6. 네 언어 Smoke Test
7. 실제 외부 Gmail·Naver·Daum·Outlook로 인증메일 수신 테스트
8. 실제 `+94` 전화번호와 한국 `+82` 번호로 OTP 테스트
9. 20~30명 폐쇄형 Pilot 시작
10. 이상 없으면 200명, 이후 2,000명 Wave로 확대

## 4. 필수 환경변수

```env
NEXT_PUBLIC_SITE_URL=https://www.sejoonglaw.kr
STAYCARE_TENANT_SLUG=sejoong-staycare
STAYCARE_DEFAULT_LOCALE=ko
STAYCARE_SUPPORT_EMAIL=staycare@sejoonglaw.kr
STAYCARE_SUPPORT_PHONE=
STAYCARE_STORAGE_BUCKET=staycare-private

NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED=false
STAYCARE_ALLOW_PRODUCTION_DEMO_LOGIN=false
NEXT_PUBLIC_STAYCARE_GOOGLE_LOGIN_ENABLED=false
NEXT_PUBLIC_STAYCARE_FACEBOOK_LOGIN_ENABLED=false

STAYCARE_RATE_LIMIT_FAIL_CLOSED=true
STAYCARE_DOCUMENT_RETENTION_DAYS=1095
STAYCARE_FIELD_ENCRYPTION_KEY=AT_LEAST_32_RANDOM_CHARACTERS
STAYCARE_WEBHOOK_SECRET=AT_LEAST_24_RANDOM_CHARACTERS
STAYCARE_CRON_SECRET=AT_LEAST_24_RANDOM_CHARACTERS

OPENAI_API_KEY=
OPENAI_TRANSLATION_MODEL=gpt-5

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

비밀키는 절대 GitHub에 커밋하지 않는다. Vercel의 Project Settings → Environment Variables에 입력하고 Preview/Production 범위를 분리한다.

## 5. 언어별 검수 기준

### 공통

- 언어 전환 즉시 URL 이동 없이 문구가 바뀌는지
- 새로고침 후 선택 언어가 유지되는지
- 다른 메뉴로 이동해도 유지되는지
- 로그인 완료 후에도 유지되는지
- 버튼·오류·빈 상태·Placeholder·ARIA Label이 번역되는지
- 날짜가 해당 지역 형식으로 표시되는지
- 작은 모바일 화면에서 Sinhala/Tamil 장문이 잘리지 않는지

### Sinhala/Tamil 네이티브 검수가 반드시 필요한 영역

- 개인정보 처리방침
- 민감정보·건강정보 동의
- 제3자 제공 및 국외 이전
- 산업재해·임금체불·폭력·실종·긴급사건
- 비자·체류·외국인등록 안내
- 고용계약·보험·퇴직금·귀국 안내
- 의료·법률 면책 및 긴급기관 안내

자동 번역은 초안으로만 사용한다. 법적 효력이 있는 문구는 네이티브 검수 기록과 승인자를 남긴다.

## 6. QA 시나리오

| ID | 시나리오 | 기대 결과 |
|---|---|---|
| L-01 | 메인에서 Tamil 선택 | 모든 공개 문구가 즉시 Tamil로 변경 |
| L-02 | Tamil 상태에서 로그인 이동 | 로그인·오류·OTP 문구가 Tamil |
| L-03 | Claim 완료 | Tamil 선호언어가 worker profile에 저장 |
| L-04 | 새로고침·재로그인 | Tamil 유지 |
| L-05 | Sinhala → English 전환 | 현재 화면에서 즉시 전환 |
| L-06 | 관리자 Control Tower | 공통 KPI·버튼·상태가 선택 언어로 표시 |
| L-07 | 파트너 포털 | 권한 범위 내 데이터만 표시되고 언어 유지 |
| L-08 | API에 `preferred_language=ta` | 400 오류 없이 저장 |
| L-09 | 알림 `language=ta` | Tamil 템플릿 또는 명시적 fallback 사용 |
| L-10 | 잘못된 `/xx/staycare` 경로 | 안전한 기본 locale 처리 |

## 7. 배포 전 명령

```bash
npm ci --legacy-peer-deps --no-audit --no-fund
npm run check:staycare-env:strict
npm run check:staycare-i18n
npm run lint
npm run typecheck
npx jest __tests__/staycare --runInBand
npm run build
```

모든 명령이 통과해야 배포한다.

## 8. 장애 대응

### Tamil 선택 후 일부 영어가 보이는 경우

1. 해당 화면·문구를 캡처한다.
2. `lib/staycare/interface-translations.ts`에 정확한 원문과 네 언어를 추가한다.
3. 동적 서비스 문구라면 `lib/staycare/tamil-translations.ts`에 추가한다.
4. `npm run check:staycare-i18n`을 실행한다.
5. 네 언어 회귀 테스트를 추가한다.

### 저장 시 언어 제약조건 오류가 발생하는 경우

- Migration 019 적용 여부를 확인한다.
- Supabase SQL Editor에서 제약조건 정의를 조회한다.
- Staging과 Production의 Migration 이력이 같은지 확인한다.

### 언어가 로그인 후 한국어로 되돌아가는 경우

- `staycare-language` 쿠키와 localStorage를 확인한다.
- worker의 `preferred_language` 값이 `ta` 또는 `si`로 저장됐는지 확인한다.
- Auth callback URL이 locale 경로로 잘못 변형되지 않았는지 확인한다.

## 9. 완료 증빙

운영자는 다음 증빙을 한 폴더에 보관한다.

- Migration 적용 화면 또는 CLI 로그
- Vercel 환경변수 설정 체크리스트
- Supabase Auth URL·Provider·SMTP 설정 캡처
- DNS MX/SPF/DKIM/DMARC 조회 결과
- 네 언어별 Smoke Test 캡처
- Sinhala/Tamil 네이티브 검수 승인본
- 실제 이메일·SMS 수신 결과
- RLS 권한 테스트 결과
- Pilot 대상자와 사고 대응 연락망
