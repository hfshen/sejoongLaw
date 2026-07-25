-- Replace the permissive workflow policies from 015_fix_rls_permissive.sql.
-- Restricted workflow users can read only documents explicitly assigned to them.

CREATE TABLE IF NOT EXISTS document_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['view']::TEXT[],
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  CONSTRAINT document_assignments_permissions_not_empty
    CHECK (cardinality(permissions) > 0),
  CONSTRAINT document_assignments_permissions_allowed
    CHECK (permissions <@ ARRAY['view', 'translate', 'approve', 'export']::TEXT[])
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_document_assignments_active_unique
  ON document_assignments(document_id, user_id)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_assignments_user_active
  ON document_assignments(user_id, document_id)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_document_assignments_document_active
  ON document_assignments(document_id, user_id)
  WHERE revoked_at IS NULL;

ALTER TABLE document_assignments ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT p.role
  FROM profiles p
  WHERE p.id = user_id
    AND p.status = 'active'
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION get_user_role(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION has_document_permission(
  target_document_id UUID,
  required_permission TEXT DEFAULT 'view'
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM documents d
    WHERE d.id = target_document_id
      AND (
        get_user_role(auth.uid()) IN ('admin', 'korea_agent')
        OR d.created_by = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM document_assignments da
          WHERE da.document_id = d.id
            AND da.user_id = auth.uid()
            AND da.revoked_at IS NULL
            AND (
              required_permission = 'view'
              OR da.permissions @> ARRAY[required_permission]::TEXT[]
            )
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION has_document_permission(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION has_document_permission(UUID, TEXT)
  TO authenticated, service_role;

-- Assignment visibility and management.
DROP POLICY IF EXISTS "Users can view their document assignments" ON document_assignments;
CREATE POLICY "Users can view their document assignments"
  ON document_assignments FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR get_user_role(auth.uid()) IN ('admin', 'korea_agent')
  );

DROP POLICY IF EXISTS "Case operators can create document assignments" ON document_assignments;
CREATE POLICY "Case operators can create document assignments"
  ON document_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND assigned_by = auth.uid()
  );

DROP POLICY IF EXISTS "Case operators can update document assignments" ON document_assignments;
CREATE POLICY "Case operators can update document assignments"
  ON document_assignments FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'korea_agent'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'korea_agent'));

DROP POLICY IF EXISTS "Case operators can delete document assignments" ON document_assignments;
CREATE POLICY "Case operators can delete document assignments"
  ON document_assignments FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'korea_agent'));

-- Cases: only case operators or the original creator can read. Mutations require
-- an active case operator; deletion is restricted to platform administrators.
DROP POLICY IF EXISTS "Users can view cases they have access to" ON cases;
CREATE POLICY "Users can view cases they have access to"
  ON cases FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Korea agents and admins can create cases" ON cases;
CREATE POLICY "Korea agents and admins can create cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Case creators and admins can update cases" ON cases;
CREATE POLICY "Case operators can update cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'korea_agent'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'korea_agent'));

DROP POLICY IF EXISTS "Admins can delete cases" ON cases;
CREATE POLICY "Admins can delete cases"
  ON cases FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Documents.
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
CREATE POLICY "Users can view documents they have access to"
  ON documents FOR SELECT
  TO authenticated
  USING (has_document_permission(id, 'view'));

DROP POLICY IF EXISTS "Korea agents and admins can create documents" ON documents;
CREATE POLICY "Korea agents and admins can create documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Document creators and admins can update documents" ON documents;
CREATE POLICY "Case operators can update documents"
  ON documents FOR UPDATE
  TO authenticated
  USING (get_user_role(auth.uid()) IN ('admin', 'korea_agent'))
  WITH CHECK (get_user_role(auth.uid()) IN ('admin', 'korea_agent'));

DROP POLICY IF EXISTS "Admins can delete documents" ON documents;
CREATE POLICY "Admins can delete documents"
  ON documents FOR DELETE
  TO authenticated
  USING (get_user_role(auth.uid()) = 'admin');

-- Versions.
DROP POLICY IF EXISTS "Users can view document versions for accessible documents" ON document_versions;
CREATE POLICY "Users can view document versions for accessible documents"
  ON document_versions FOR SELECT
  TO authenticated
  USING (has_document_permission(document_id, 'view'));

DROP POLICY IF EXISTS "Korea agents and admins can create document versions" ON document_versions;
CREATE POLICY "Korea agents and admins can create document versions"
  ON document_versions FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND created_by = auth.uid()
    AND has_document_permission(document_id, 'view')
  );

DROP POLICY IF EXISTS "Admins can update document versions" ON document_versions;
CREATE POLICY "Case operators can update document versions"
  ON document_versions FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND has_document_permission(document_id, 'view')
  )
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND has_document_permission(document_id, 'view')
  );

-- Segments.
DROP POLICY IF EXISTS "Users can view segments for accessible versions" ON version_segments;
CREATE POLICY "Users can view segments for accessible versions"
  ON version_segments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = version_segments.version_id
        AND has_document_permission(dv.document_id, 'view')
    )
  );

DROP POLICY IF EXISTS "System and admins can create segments" ON version_segments;
CREATE POLICY "Case operators can create segments"
  ON version_segments FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = version_segments.version_id
        AND has_document_permission(dv.document_id, 'view')
    )
  );

-- Translations.
DROP POLICY IF EXISTS "Users can view translations for accessible segments" ON segment_translations;
CREATE POLICY "Users can view translations for accessible segments"
  ON segment_translations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM version_segments vs
      JOIN document_versions dv ON dv.id = vs.version_id
      WHERE vs.id = segment_translations.segment_id
        AND has_document_permission(dv.document_id, 'view')
    )
  );

DROP POLICY IF EXISTS "Translators and admins can create translations" ON segment_translations;
CREATE POLICY "Assigned translators can create translations"
  ON segment_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_role(auth.uid()) IN ('translator', 'admin', 'korea_agent')
    AND (created_by = auth.uid() OR created_by IS NULL)
    AND EXISTS (
      SELECT 1
      FROM version_segments vs
      JOIN document_versions dv ON dv.id = vs.version_id
      WHERE vs.id = segment_translations.segment_id
        AND has_document_permission(dv.document_id, 'translate')
    )
  );

DROP POLICY IF EXISTS "Translators and admins can update translations" ON segment_translations;
CREATE POLICY "Assigned translators can update translations"
  ON segment_translations FOR UPDATE
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('translator', 'admin', 'korea_agent')
    AND EXISTS (
      SELECT 1
      FROM version_segments vs
      JOIN document_versions dv ON dv.id = vs.version_id
      WHERE vs.id = segment_translations.segment_id
        AND has_document_permission(dv.document_id, 'translate')
    )
  )
  WITH CHECK (
    get_user_role(auth.uid()) IN ('translator', 'admin', 'korea_agent')
    AND EXISTS (
      SELECT 1
      FROM version_segments vs
      JOIN document_versions dv ON dv.id = vs.version_id
      WHERE vs.id = segment_translations.segment_id
        AND has_document_permission(dv.document_id, 'translate')
    )
  );

-- Approvals.
DROP POLICY IF EXISTS "Users can view approvals for accessible versions" ON approvals;
CREATE POLICY "Users can view approvals for accessible versions"
  ON approvals FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = approvals.version_id
        AND has_document_permission(dv.document_id, 'view')
    )
  );

DROP POLICY IF EXISTS "Authorized users can create approvals" ON approvals;
CREATE POLICY "Assigned reviewers can create approvals"
  ON approvals FOR INSERT
  TO authenticated
  WITH CHECK (
    approved_by = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = approvals.version_id
        AND has_document_permission(dv.document_id, 'approve')
    )
    AND (
      (get_user_role(auth.uid()) = 'korea_agent' AND target_lang = 'source')
      OR (get_user_role(auth.uid()) = 'translator' AND target_lang = 'en')
      OR (get_user_role(auth.uid()) = 'foreign_lawyer' AND target_lang IN ('si', 'ta'))
      OR get_user_role(auth.uid()) = 'admin'
    )
  );

-- Audit events remain visible to active case operators and the actor only.
DROP POLICY IF EXISTS "Users can view audit events for accessible cases" ON audit_events;
CREATE POLICY "Users can view audit events for accessible cases"
  ON audit_events FOR SELECT
  TO authenticated
  USING (
    get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    OR actor = auth.uid()
  );

DROP POLICY IF EXISTS "System and admins can create audit events" ON audit_events;
CREATE POLICY "Authenticated actors can create audit events"
  ON audit_events FOR INSERT
  TO authenticated
  WITH CHECK (
    actor = auth.uid()
    OR get_user_role(auth.uid()) = 'admin'
  );

-- Export packages.
DROP POLICY IF EXISTS "Users can view export packages for accessible versions" ON export_packages;
CREATE POLICY "Users can view export packages for accessible versions"
  ON export_packages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = export_packages.version_id
        AND has_document_permission(dv.document_id, 'view')
    )
  );

DROP POLICY IF EXISTS "Admins and authorized users can create export packages" ON export_packages;
CREATE POLICY "Case operators can create export packages"
  ON export_packages FOR INSERT
  TO authenticated
  WITH CHECK (
    exported_by = auth.uid()
    AND get_user_role(auth.uid()) IN ('admin', 'korea_agent')
    AND EXISTS (
      SELECT 1
      FROM document_versions dv
      WHERE dv.id = export_packages.version_id
        AND has_document_permission(dv.document_id, 'export')
    )
  );

COMMENT ON TABLE document_assignments IS
  'Explicit per-user access grants for workflow documents. Restricted roles must be assigned before viewing, translating, approving, or exporting.';
