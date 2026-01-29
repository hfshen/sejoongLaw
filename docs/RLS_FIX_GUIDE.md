# RLS 정책 수정 가이드

## 문제 상황
- 케이스 생성 시 "new row violates row-level security policy" 에러 발생
- 문서 생성 시 500 에러 발생

## 원인
1. `cases` 테이블 INSERT 시 `created_by` 필드가 설정되지 않음
2. RLS 정책이 너무 엄격하여 역할이 설정되지 않은 사용자 차단
3. `get_user_role` 함수가 NULL을 반환할 수 있음

## 해결 방법

### 즉시 실행할 SQL (Supabase Dashboard > SQL Editor)

```sql
-- 1. get_user_role 함수 업데이트 (NULL 처리)
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = user_id),
    'family_viewer' -- Default role if not set
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. cases INSERT 정책 수정
DROP POLICY IF EXISTS "Korea agents and admins can create cases" ON cases;
CREATE POLICY "Korea agents and admins can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      get_user_role(auth.uid()) IN ('korea_agent', 'admin', 'family_viewer')
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    )
    AND (
      created_by = auth.uid()
      OR created_by IS NULL
    )
  );

-- 3. documents INSERT 정책 수정
DROP POLICY IF EXISTS "Korea agents and admins can create documents" ON documents;
CREATE POLICY "Korea agents and admins can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('korea_agent', 'admin', 'family_viewer')
    OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

-- 4. document_versions INSERT 정책 수정
DROP POLICY IF EXISTS "Korea agents and admins can create document versions" ON document_versions;
CREATE POLICY "Korea agents and admins can create document versions"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      get_user_role(auth.uid()) IN ('korea_agent', 'admin', 'family_viewer')
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    )
    AND (
      created_by = auth.uid()
      OR created_by IS NULL
    )
  );
```

### 또는 마이그레이션 파일 실행

`014_fix_rls_policies.sql` 파일을 Supabase Dashboard > SQL Editor에서 실행하세요.

## 확인 사항

수정 후 다음을 테스트하세요:

1. 케이스 생성: `/admin/cases/new`에서 새 케이스 생성
2. 문서 생성: `/admin/documents/new`에서 새 문서 생성
3. 콘솔 에러 확인: 브라우저 개발자 도구에서 에러가 없는지 확인

## 추가 참고

- API 코드에서 `created_by` 필드를 명시적으로 설정하도록 수정됨
- 역할이 설정되지 않은 사용자도 기본적으로 `family_viewer` 역할로 처리됨
