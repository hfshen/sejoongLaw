-- Row Level Security policies for workflow tables
-- Role-based access control

-- Drop existing basic policies (from 010_workflow_schema.sql and 006_documents_schema.sql)
DROP POLICY IF EXISTS "Admin users can manage documents" ON documents;
DROP POLICY IF EXISTS "Admin users can manage cases" ON cases;
DROP POLICY IF EXISTS "Authenticated users can view document versions" ON document_versions;
DROP POLICY IF EXISTS "Authenticated users can view version segments" ON version_segments;
DROP POLICY IF EXISTS "Authenticated users can view segment translations" ON segment_translations;
DROP POLICY IF EXISTS "Authenticated users can view approvals" ON approvals;
DROP POLICY IF EXISTS "Authenticated users can view audit events" ON audit_events;
DROP POLICY IF EXISTS "Authenticated users can view export packages" ON export_packages;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    (SELECT role FROM profiles WHERE id = user_id),
    'family_viewer' -- Default role if not set
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Document Versions Policies
CREATE POLICY "Users can view document versions for accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents d
      WHERE d.id = document_versions.document_id
      AND (
        -- Admin can see all
        get_user_role(auth.uid()) = 'admin'
        -- Or user created the document
        OR d.created_by = auth.uid()
        -- Or user has access to the case
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
    AND created_by = auth.uid()
  );

CREATE POLICY "Admins can update document versions"
  ON document_versions FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin')
  WITH CHECK (get_user_role(auth.uid()) = 'admin');

-- Version Segments Policies
CREATE POLICY "Users can view segments for accessible versions"
  ON version_segments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM document_versions dv
      JOIN documents d ON d.id = dv.document_id
      WHERE dv.id = version_segments.version_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cases c
          WHERE c.id = d.case_id
          AND (
            c.created_by = auth.uid()
            OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
          )
        )
      )
    )
  );

CREATE POLICY "System and admins can create segments"
  ON version_segments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'system')
  );

-- Segment Translations Policies
CREATE POLICY "Users can view translations for accessible segments"
  ON segment_translations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM version_segments vs
      JOIN document_versions dv ON dv.id = vs.version_id
      JOIN documents d ON d.id = dv.document_id
      WHERE vs.id = segment_translations.segment_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cases c
          WHERE c.id = d.case_id
          AND (
            c.created_by = auth.uid()
            OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
          )
        )
      )
    )
  );

CREATE POLICY "Translators and admins can create translations"
  ON segment_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('translator', 'admin', 'system')
    AND (created_by = auth.uid() OR created_by IS NULL)
  );

CREATE POLICY "Translators and admins can update translations"
  ON segment_translations FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('translator', 'admin')
    AND (
      created_by = auth.uid()
      OR get_user_role(auth.uid()) = 'admin'
    )
  )
  WITH CHECK (
    get_user_role(auth.uid()) IN ('translator', 'admin')
    AND (
      created_by = auth.uid()
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

-- Approvals Policies
CREATE POLICY "Users can view approvals for accessible versions"
  ON approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM document_versions dv
      JOIN documents d ON d.id = dv.document_id
      WHERE dv.id = approvals.version_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cases c
          WHERE c.id = d.case_id
          AND (
            c.created_by = auth.uid()
            OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
          )
        )
      )
    )
  );

CREATE POLICY "Authorized users can create approvals"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    approved_by = auth.uid()
    AND (
      -- Korea agent can approve source
      (get_user_role(auth.uid()) = 'korea_agent' AND target_lang = 'source')
      -- Translator can approve English translations
      OR (get_user_role(auth.uid()) = 'translator' AND target_lang = 'en')
      -- Foreign lawyer can approve local language translations
      OR (get_user_role(auth.uid()) = 'foreign_lawyer' AND target_lang IN ('si', 'ta'))
      -- Admin can approve anything
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

-- Audit Events Policies
CREATE POLICY "Users can view audit events for accessible cases"
  ON audit_events FOR SELECT
  TO authenticated
  USING (
    case_id IS NULL
    OR get_user_role(auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM cases c
      WHERE c.id = audit_events.case_id
      AND (
        c.created_by = auth.uid()
        OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
      )
    )
  );

CREATE POLICY "System and admins can create audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'system')
    OR actor = auth.uid()
  );

-- Export Packages Policies
CREATE POLICY "Users can view export packages for accessible versions"
  ON export_packages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM document_versions dv
      JOIN documents d ON d.id = dv.document_id
      WHERE dv.id = export_packages.version_id
      AND (
        get_user_role(auth.uid()) = 'admin'
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1 FROM cases c
          WHERE c.id = d.case_id
          AND (
            c.created_by = auth.uid()
            OR get_user_role(auth.uid()) IN ('korea_agent', 'translator', 'foreign_lawyer', 'admin', 'family_viewer')
          )
        )
      )
    )
  );

CREATE POLICY "Admins and authorized users can create export packages"
  ON export_packages FOR INSERT
  TO authenticated
  WITH CHECK (
    exported_by = auth.uid()
    AND get_user_role(auth.uid()) IN ('korea_agent', 'admin')
  );

-- Update cases policies to include role-based access
DROP POLICY IF EXISTS "Admin users can manage cases" ON cases;

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
      OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) -- Allow if profile doesn't exist
    )
    AND (
      created_by = auth.uid()
      OR created_by IS NULL -- Allow if created_by is not set (will be set by application)
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

-- Update documents policies
DROP POLICY IF EXISTS "Admin users can manage documents" ON documents;

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
    OR NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) -- Allow if profile doesn't exist
    OR created_by = auth.uid() -- Allow if user is creating their own document
    OR created_by IS NULL -- Allow if created_by is not set
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
