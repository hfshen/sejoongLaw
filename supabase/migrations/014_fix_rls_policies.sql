-- Fix RLS policies to allow creation when role is not set
-- This migration makes policies more permissive for initial setup
-- Note: This should be run AFTER 011_workflow_rls.sql

-- Update get_user_role function to handle NULL better
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = user_id),
    'family_viewer' -- Default role if not set
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop all existing policies that will be recreated
DROP POLICY IF EXISTS "Users can view document versions for accessible documents" ON document_versions;
DROP POLICY IF EXISTS "Korea agents and admins can create document versions" ON document_versions;
DROP POLICY IF EXISTS "Admins can update document versions" ON document_versions;
DROP POLICY IF EXISTS "Korea agents and admins can create cases" ON cases;
DROP POLICY IF EXISTS "Users can view cases they have access to" ON cases;
DROP POLICY IF EXISTS "Case creators and admins can update cases" ON cases;
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Korea agents and admins can create documents" ON documents;
DROP POLICY IF EXISTS "Document creators and admins can update documents" ON documents;

-- Recreate document_versions policies
CREATE POLICY "Users can view document versions for accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cases c
          WHERE c.id = d.case_id
          AND (
            c.created_by = auth.uid()
            OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin')
          )
        )
      )
    )
  );

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

CREATE POLICY "Admins can update document versions"
  ON document_versions FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Recreate cases policies
CREATE POLICY "Users can view cases they have access to"
  ON cases FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
    OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'family_viewer')
  );

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

CREATE POLICY "Case creators and admins can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  );

-- Recreate documents policies
CREATE POLICY "Users can view documents they have access to"
  ON documents FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = documents.case_id
      AND (
        c.created_by = auth.uid()
        OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
      )
    )
  );

CREATE POLICY "Korea agents and admins can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('korea_agent', 'admin', 'family_viewer')
    OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    OR created_by = auth.uid()
    OR created_by IS NULL
  );

CREATE POLICY "Document creators and admins can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  )
  WITH CHECK (
    get_user_role(auth.uid()) = 'admin'
    OR created_by = auth.uid()
  );
