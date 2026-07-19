# StayCare 관리자 환경설정 상태판

## 목적

`/{locale}/staycare/admin`에서 현재 Vercel 런타임에 필요한 환경변수가 입력되어 있는지 확인한다.

## 보안원칙

- Secret 원문은 화면에 표시하지 않는다.
- 공개 가능한 URL은 hostname만 표시한다.
- 지원 이메일, tenant slug, Storage bucket, provider mode만 제한적으로 표시한다.
- 환경변수 변경은 관리자 화면에서 직접 수행하지 않는다.
- 실제 값의 생성·변경·회전은 Vercel, Supabase, 각 공급자 콘솔에서 수행한다.

## 표시 그룹

### 핵심 인프라

- 사이트 URL
- 세중 지원 이메일
- Supabase URL·공개키·서버키
- Private Storage bucket
- Field encryption key
- Webhook secret
- Cron secret

핵심 인프라가 부족하면 `출시 차단` 상태다.

### 상용 운영 필수

- OpenAI
- Upstash Redis
- Resend
- Cloudflare Turnstile
- Sentry

핵심 인프라는 준비됐지만 이 그룹이 부족하면 `내부 파일럿 가능` 상태다.

### 외부 공급자

- 통신·eSIM
- 은행·급여계좌
- 스리랑카 송금
- 공항·숙소 배송

`manual` 모드는 API 키 없이도 관리자가 공급자 포털에서 수동 처리할 수 있음을 의미한다. `sandbox` 또는 `api` 모드에서는 Base URL, API Key, Webhook Secret이 모두 필요하다.

### 선택 기능

- CoolSMS
- Kakao Maps
- Firebase Push
- Toss Payments

선택 기능의 미설정은 기본 서비스 출시를 차단하지 않는다.

## 운영절차

1. Vercel Settings → Environment Variables에서 값을 입력한다.
2. Production, Preview, Development 값을 분리한다.
3. 새 배포를 실행한다.
4. StayCare 관리자 화면에서 상태를 확인한다.
5. `/api/health/staycare`로 DB·서비스 readiness를 확인한다.
6. Secret 값 자체가 필요하면 해당 공급자 콘솔 또는 Vercel 권한자만 확인한다.

## 상태 의미

- `설정됨`: 필요한 값이 모두 존재한다.
- `미설정`: 필요한 값이 없다.
- `일부설정`: API 모드에 필요한 값 중 일부만 있다.
- `수동운영`: 외부 API 없이 관리자 수동처리로 운영한다.
