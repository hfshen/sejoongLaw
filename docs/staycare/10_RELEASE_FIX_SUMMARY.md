# StayCare Release Hardening Summary

이번 릴리스 수정은 다음을 포함한다.

- Next.js build를 중단한 Set spread TypeScript 오류 수정
- TypeScript target을 ES2017로 명시
- 관리자 화면에 환경변수·공급자 모드·DB 연결상태 표시
- Secret 원문 비노출 원칙 적용
- Staff 전용 환경 readiness API 추가
- Sentry client 설정을 instrumentation-client.ts로 이전
- App Router global error boundary와 Sentry capture 추가
- 환경상태 단위테스트 추가
- 운영 환경 상태판 문서 추가

최종 기능 브랜치에는 검증 완료 후 한 번만 반영한다.
