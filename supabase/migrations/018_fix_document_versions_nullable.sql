-- Fix document_versions.created_by to allow NULL
-- This allows version creation when user is not authenticated

ALTER TABLE document_versions
  ALTER COLUMN created_by DROP NOT NULL;

-- Update RLS policy to allow creation with NULL created_by
DROP POLICY IF EXISTS "Korea agents and admins can create document versions" ON document_versions;
CREATE POLICY "Korea agents and admins can create document versions"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      get_user_role(auth.uid()) IN ('korea_agent', 'admin', 'family_viewer')
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) -- Allow if profile doesn't exist
    )
    AND (
      created_by = auth.uid()
      OR created_by IS NULL -- Allow if created_by is not set
    )
  );
