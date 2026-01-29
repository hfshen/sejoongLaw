-- Fix migration errors: Drop existing policies and ensure created_by column exists

-- Drop existing policies that may conflict
DROP POLICY IF EXISTS "Admin users can manage documents" ON documents;
DROP POLICY IF EXISTS "Admin users can manage cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Authenticated users can view version segments" ON version_segments;
DROP POLICY IF EXISTS "Authenticated users can view segment translations" ON segment_translations;
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON approvals;
DROP POLICY IF EXISTS "Authenticated users can view audit events" ON audit_events;
DROP POLICY IF EXISTS "Authenticated users can view export packages" ON export_packages;

-- Ensure created_by column exists in documents table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE documents
    ADD COLUMN created_by UUID REFERENCES auth.users(id);
  END IF;
END $$;

-- Re-create basic policies (will be replaced by 011_workflow_rls.sql)
CREATE POLICY "Admin users can manage documents"
  ON documents FOR ALL
  USING (true)
  WITH CHECK (true);
