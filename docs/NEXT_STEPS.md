# 다음 단계 가이드

## ✅ 완료된 작업

1. ✅ 데이터베이스 스키마 확장 (010_workflow_schema.sql)
2. ✅ 버전 관리 시스템 구현
3. ✅ 세그먼트 기반 번역 엔진 구현 (템플릿 기반, 영어→스리랑카어는 placeholder)
4. ✅ 승인 워크플로우 구현
5. ✅ 감사 추적 시스템 구현
6. ✅ PDF 패키지 생성 시스템 구현
7. ✅ API 엔드포인트 구현
8. ✅ 프론트엔드 UI 컴포넌트 구현
9. ✅ RLS 정책 업데이트
10. ✅ 마이그레이션 스크립트 작성
11. ✅ Storage 버킷 생성 (`documents`, `exports`)

## 📋 다음 단계

### 1. Supabase 마이그레이션 실행

```bash
# Supabase CLI를 사용하여 마이그레이션 실행
supabase migration up

# 또는 Supabase Dashboard에서 직접 실행:
# 1. Dashboard > SQL Editor로 이동
# 2. 다음 순서로 실행:
#    - 010_workflow_schema.sql
#    - 011_workflow_rls.sql
#    - 012_migrate_existing_data.sql
```

### 2. 환경 변수 설정

`.env.local` 파일에 다음 변수 추가:

```env
# OpenAI API (영어→스리랑카어 번역용, 선택사항)
OPENAI_API_KEY=your_openai_api_key_here

# 앱 URL (QR 코드 검증용)
NEXT_PUBLIC_APP_URL=http://localhost:3000
# 또는 프로덕션: https://your-domain.com
```

### 3. Storage 버킷 정책 설정

Supabase Dashboard > Storage > Policies에서 다음 정책 추가:

**documents 버킷:**
- `Authenticated users can upload`: `auth.uid() IS NOT NULL`
- `Authenticated users can read`: `auth.uid() IS NOT NULL`

**exports 버킷:**
- `Authenticated users can upload`: `auth.uid() IS NOT NULL`
- `Authenticated users can read`: `auth.uid() IS NOT NULL`

### 4. 사용자 역할 할당

기존 사용자에게 역할을 할당하려면:

```sql
-- 예: 특정 사용자를 korea_agent로 설정
UPDATE profiles
SET role = 'korea_agent'
WHERE email = 'user@example.com';

-- 예: 특정 사용자를 translator로 설정
UPDATE profiles
SET role = 'translator'
WHERE email = 'translator@example.com';
```

### 5. 프론트엔드 UI 확인 위치

새로운 워크플로우 UI는 다음 위치에서 확인할 수 있습니다:

1. **문서 상세 페이지**: `/admin/documents/[id]`
   - "문서 편집" 탭: 기존 문서 편집 UI
   - **"워크플로우" 탭**: 새로운 워크플로우 UI (DocumentViewer, ApprovalPanel, AuditTrail, ExportButton)

2. **케이스 상세 페이지**: `/admin/cases/[id]`
   - 케이스와 연결된 문서들의 워크플로우 관리

### 6. 테스트 시나리오

#### 시나리오 1: 문서 생성 및 버전 관리
1. `/admin/documents/new`에서 새 문서 생성
2. 문서 저장 시 자동으로 버전 1 생성됨
3. `/admin/documents/[id]` → "워크플로우" 탭에서 버전 확인

#### 시나리오 2: 번역 워크플로우
1. 문서 상세 페이지에서 "워크플로우" 탭 선택
2. DocumentViewer에서 다국어 탭 확인 (한국어, 영어, 스리랑카어, 타밀어)
3. 번역 요청 (현재는 템플릿 기반, 영어→스리랑카어는 placeholder)

#### 시나리오 3: 승인 워크플로우
1. ApprovalPanel에서 승인 상태 확인
2. 역할에 따라 승인 버튼 활성화
3. 승인/거부 및 코멘트 입력

#### 시나리오 4: PDF 패키지 생성
1. 모든 승인이 완료되면 ExportButton 활성화
2. PDF 패키지 다운로드
3. QR 코드로 검증 페이지 접근 (`/verify/[versionId]`)

### 7. 추가 개선 사항 (선택사항)

#### QR 코드 라이브러리 설치
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

그리고 `lib/documents/package-generator.ts`의 `generateQRCodeDataURL` 함수를 실제 QR 코드 생성으로 교체:

```typescript
import QRCode from 'qrcode'

async function generateQRCodeDataURL(text: string): Promise<string> {
  return await QRCode.toDataURL(text, { width: 200 })
}
```

#### 이미지 기반 버전 생성 (향후 개선)

현재는 텍스트 기반 버전을 생성하지만, 실제 이미지 파일을 업로드하려면:

1. 클라이언트에서 `generateDocumentImage()`로 이미지 생성
2. FormData로 이미지 파일 업로드
3. 서버에서 버전 생성 시 이미지 파일 사용

### 8. 문제 해결

#### 마이그레이션 오류 발생 시
- 기존 데이터와 충돌하는 경우, 마이그레이션 스크립트를 단계별로 실행
- `012_migrate_existing_data.sql`은 선택사항 (기존 데이터가 없으면 생략 가능)

#### RLS 정책 오류 시
- `get_user_role` 함수가 제대로 생성되었는지 확인
- Supabase Dashboard > Database > Functions에서 확인

#### API 오류 시
- 브라우저 콘솔에서 에러 확인
- 서버 로그 확인 (`lib/logger` 사용)

## 🎯 핵심 포인트

1. **번역 엔진**: 한국어→영어는 템플릿 기반 (데이터 매핑), 영어→스리랑카어는 AI 번역 (현재 placeholder)
2. **이미지 생성**: `html2canvas`를 사용하여 DocumentPreview를 이미지로 변환
3. **버전 관리**: 문서 저장 시 자동으로 새 버전 생성 (append-only)
4. **공신력 확보**: SHA256 해시, 불변 승인 이벤트, 감사 추적, QR 검증

## 📞 지원

문제가 발생하면:
1. Supabase 로그 확인
2. 브라우저 콘솔 확인
3. 서버 로그 확인 (`lib/logger`)
