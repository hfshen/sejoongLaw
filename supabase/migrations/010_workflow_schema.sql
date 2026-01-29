-- Workflow schema for cross-border legal document processing
-- This migration adds versioning, translation, approval, and audit capabilities

-- Enable pgcrypto for hashing
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Extend profiles table with role and organization fields
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('korea_agent', 'translator', 'foreign_lawyer', 'family_viewer', 'admin', 'system')) DEFAULT 'family_viewer',
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'KR',
  ADD COLUMN IF NOT EXISTS organization TEXT;

-- Extend cases table with country and status
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('open', 'in_review', 'exported', 'closed')) DEFAULT 'open',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Extend documents table with source_lang, current_version_id, and created_by
ALTER TABLE documents
  ADD COLUMN IF NOT EXISTS source_lang TEXT DEFAULT 'ko' CHECK (source_lang IN ('ko', 'en', 'si', 'ta', 'zh-CN')),
  ADD COLUMN IF NOT EXISTS current_version_id UUID,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Document versions table (append-only versioning)
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL,
  storage_path TEXT NOT NULL, -- Supabase Storage file path
  sha256 TEXT NOT NULL, -- SHA256 hash of the file content
  status TEXT NOT NULL CHECK (status IN ('draft', 'pending_translation', 'pending_approval', 'approved', 'exported')) DEFAULT 'draft',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(document_id, version_no)
);

-- Version segments table (for segment-based translation)
CREATE TABLE IF NOT EXISTS version_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  seq INTEGER NOT NULL, -- Sequence number for ordering
  key TEXT NOT NULL, -- Stable identifier (e.g., "p1.l3" or hash-based)
  source_text TEXT NOT NULL,
  UNIQUE(version_id, seq),
  UNIQUE(version_id, key)
);

-- Segment translations table (multi-language translations)
CREATE TABLE IF NOT EXISTS segment_translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  segment_id UUID NOT NULL REFERENCES version_segments(id) ON DELETE CASCADE,
  target_lang TEXT NOT NULL CHECK (target_lang IN ('en', 'si', 'ta', 'zh-CN', 'ja', 'vi', 'th', 'id', 'tl', 'ru', 'mn', 'es', 'fr', 'de', 'ar')),
  translated_text TEXT NOT NULL,
  engine TEXT NOT NULL CHECK (engine IN ('ai', 'human', 'hybrid')) DEFAULT 'ai',
  status TEXT NOT NULL CHECK (status IN ('draft', 'reviewed', 'approved')) DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(segment_id, target_lang)
);

-- Approvals table (immutable approval events)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  target_lang TEXT NOT NULL DEFAULT 'source', -- 'source' or translation language code
  approved_by UUID NOT NULL REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('korea_agent', 'translator', 'foreign_lawyer', 'family_viewer', 'admin')),
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  comment TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Audit events table (comprehensive audit trail)
CREATE TABLE IF NOT EXISTS audit_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('document', 'version', 'translation', 'approval', 'export', 'case')),
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- e.g., 'created', 'updated', 'translated', 'approved', 'exported'
  meta JSONB NOT NULL DEFAULT '{}'::jsonb, -- Additional metadata (IP, user agent, etc.)
  actor UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Export packages table (PDF package metadata)
CREATE TABLE IF NOT EXISTS export_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_id UUID NOT NULL REFERENCES document_versions(id) ON DELETE CASCADE,
  package_hash TEXT NOT NULL, -- SHA256 hash of the PDF package
  qr_code_url TEXT NOT NULL, -- URL for QR verification
  storage_path TEXT NOT NULL, -- Supabase Storage path for the PDF
  exported_by UUID NOT NULL REFERENCES auth.users(id),
  exported_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(version_id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON profiles(country);
CREATE INDEX IF NOT EXISTS idx_cases_country ON cases(country);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_documents_current_version_id ON documents(current_version_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_document_id ON document_versions(document_id);
CREATE INDEX IF NOT EXISTS idx_document_versions_status ON document_versions(status);
CREATE INDEX IF NOT EXISTS idx_document_versions_sha256 ON document_versions(sha256);
CREATE INDEX IF NOT EXISTS idx_version_segments_version_id ON version_segments(version_id);
CREATE INDEX IF NOT EXISTS idx_version_segments_seq ON version_segments(version_id, seq);
CREATE INDEX IF NOT EXISTS idx_segment_translations_segment_id ON segment_translations(segment_id);
CREATE INDEX IF NOT EXISTS idx_segment_translations_target_lang ON segment_translations(target_lang);
CREATE INDEX IF NOT EXISTS idx_segment_translations_status ON segment_translations(status);
CREATE INDEX IF NOT EXISTS idx_approvals_version_id ON approvals(version_id);
CREATE INDEX IF NOT EXISTS idx_approvals_target_lang ON approvals(version_id, target_lang);
CREATE INDEX IF NOT EXISTS idx_approvals_approved_by ON approvals(approved_by);
CREATE INDEX IF NOT EXISTS idx_audit_events_case_id ON audit_events(case_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_entity ON audit_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_actor ON audit_events(actor);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_export_packages_version_id ON export_packages(version_id);
CREATE INDEX IF NOT EXISTS idx_export_packages_package_hash ON export_packages(package_hash);

-- Update timestamp trigger for segment_translations
CREATE OR REPLACE FUNCTION update_segment_translations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_segment_translations_updated_at ON segment_translations;
CREATE TRIGGER update_segment_translations_updated_at
  BEFORE UPDATE ON segment_translations
  FOR EACH ROW
  EXECUTE FUNCTION update_segment_translations_updated_at();

-- Enable Row Level Security
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE segment_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE export_packages ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (will be refined in next migration)
-- For now, allow authenticated users to read, but restrict writes based on roles
-- Note: These policies will be replaced by more specific policies in 011_workflow_rls.sql
DROP POLICY IF EXISTS "Authenticated users can view document versions" ON document_versions;
CREATE POLICY "Authenticated users can view document versions"
  ON document_versions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view version segments" ON version_segments;
CREATE POLICY "Authenticated users can view version segments"
  ON version_segments FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view segment translations" ON segment_translations;
CREATE POLICY "Authenticated users can view segment translations"
  ON segment_translations FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view approvals" ON approvals;
CREATE POLICY "Authenticated users can view approvals"
  ON approvals FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view audit events" ON audit_events;
CREATE POLICY "Authenticated users can view audit events"
  ON audit_events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view export packages" ON export_packages;
CREATE POLICY "Authenticated users can view export packages"
  ON export_packages FOR SELECT
  TO authenticated
  USING (true);
