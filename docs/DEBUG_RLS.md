# RLS 정책 디버깅 가이드

## 현재 문제
- 문서 생성 시 `42501` 에러 (RLS 정책 위반)
- 케이스 생성 시 `42501` 에러 (RLS 정책 위반)

## 확인 사항

### 1. 마이그레이션 실행 확인

다음 SQL을 Supabase Dashboard > SQL Editor에서 실행하여 정책이 제대로 생성되었는지 확인:

```sql
-- 현재 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('documents', 'cases', 'document_versions')
ORDER BY tablename, policyname;
```

### 2. 사용자 역할 확인

```sql
-- 현재 로그인한 사용자의 역할 확인
SELECT 
  id,
  email,
  role,
  country,
  organization
FROM profiles
WHERE id = auth.uid();
```

### 3. get_user_role 함수 테스트

```sql
-- 함수가 제대로 작동하는지 확인
SELECT get_user_role(auth.uid());
```

### 4. RLS 정책 수동 재생성

만약 정책이 제대로 생성되지 않았다면, 다음 SQL을 실행:

```sql
-- documents INSERT 정책 재생성
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

-- cases INSERT 정책 재생성
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
```

### 5. 임시로 RLS 비활성화 (테스트용)

**주의: 프로덕션에서는 사용하지 마세요!**

```sql
-- RLS 비활성화 (테스트용)
ALTER TABLE documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
```

테스트 후 다시 활성화:

```sql
-- RLS 다시 활성화
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
```

## 해결 방법

1. `014_fix_rls_policies.sql` 파일을 Supabase Dashboard에서 실행
2. 브라우저 콘솔에서 실제 에러 메시지 확인
3. 사용자 역할이 올바르게 설정되었는지 확인
4. 필요시 위의 SQL을 직접 실행하여 정책 재생성
