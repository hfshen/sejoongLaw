-- Migration script to convert existing documents to version 1
-- This script migrates existing documents to the new versioning system

-- Step 1: Create version 1 for all existing documents
-- Note: This assumes documents have their data in the 'data' JSONB field
-- and we'll create a text representation for segmentation

-- Only migrate if document_versions table exists and has no data yet
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
    INSERT INTO document_versions (
      document_id,
      version_no,
      storage_path,
      sha256,
      status,
      created_by,
      created_at
    )
    SELECT
      d.id,
      1,
      'migrated/' || d.id || '/v1.txt',
      encode(digest(COALESCE(d.data::text, '{}'), 'sha256'), 'hex') as sha256,
      CASE
        WHEN d.locale = 'ko' THEN 'pending_translation'
        ELSE 'draft'
      END,
      COALESCE(
        CASE 
          WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'documents' AND column_name = 'created_by'
          ) THEN d.created_by
          ELSE NULL
        END,
        (SELECT id FROM auth.users LIMIT 1),
        '00000000-0000-0000-0000-000000000000'::uuid
      ),
      d.created_at
    FROM documents d
    WHERE NOT EXISTS (
      SELECT 1 FROM document_versions dv WHERE dv.document_id = d.id
    );
  END IF;
END $$;

-- Step 2: Update documents table to set current_version_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_versions') THEN
    UPDATE documents d
    SET current_version_id = (
      SELECT id FROM document_versions dv
      WHERE dv.document_id = d.id
      ORDER BY dv.version_no DESC
      LIMIT 1
    )
    WHERE current_version_id IS NULL
    AND EXISTS (
      SELECT 1 FROM document_versions dv WHERE dv.document_id = d.id
    );
  END IF;
END $$;

-- Step 3: Create segments for migrated versions
-- This creates a single segment per document with the JSON data as text
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'version_segments') THEN
    INSERT INTO version_segments (
      version_id,
      seq,
      key,
      source_text
    )
    SELECT
      dv.id,
      1,
      'seg_1_' || encode(digest(COALESCE(d.data::text, '{}'), 'md5'), 'hex'),
      COALESCE(d.data::text, '{}')
    FROM document_versions dv
    JOIN documents d ON d.id = dv.document_id
    WHERE dv.version_no = 1
    AND NOT EXISTS (
      SELECT 1 FROM version_segments vs WHERE vs.version_id = dv.id
    );
  END IF;
END $$;

-- Step 4: Set default roles for existing users
-- Only update if role column exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    -- Assign 'korea_agent' role to users who created documents
    -- Only if created_by column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'documents' AND column_name = 'created_by'
    ) THEN
      UPDATE profiles
      SET role = 'korea_agent'
      WHERE role IS NULL
      AND id IN (
        SELECT DISTINCT created_by
        FROM documents
        WHERE created_by IS NOT NULL
      );
    END IF;

    -- Assign 'admin' role to existing admins
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
      UPDATE profiles
      SET role = 'admin'
      WHERE id IN (
        SELECT user_id FROM admins
      )
      AND (role IS NULL OR role = 'family_viewer');
    END IF;

    -- Set default role for remaining users
    UPDATE profiles
    SET role = 'family_viewer'
    WHERE role IS NULL;
  END IF;
END $$;

-- Step 5: Set default country for cases
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'cases' AND column_name = 'country'
  ) THEN
    UPDATE cases
    SET country = 'KR'
    WHERE country IS NULL;
  END IF;
END $$;

-- Step 6: Set default source_lang for documents
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'source_lang'
  ) THEN
    UPDATE documents
    SET source_lang = locale
    WHERE source_lang IS NULL;
  END IF;
END $$;

-- Step 7: Create audit events for migrated documents
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_events') THEN
    INSERT INTO audit_events (
      case_id,
      entity_type,
      entity_id,
      action,
      meta,
      actor,
      created_at
    )
    SELECT
      d.case_id,
      'document',
      d.id,
      'document_created',
      jsonb_build_object('migrated', true, 'original_locale', d.locale),
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'documents' AND column_name = 'created_by'
        ) THEN d.created_by
        ELSE NULL
      END,
      d.created_at
    FROM documents d
    WHERE d.created_at IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM audit_events ae
      WHERE ae.entity_type = 'document'
      AND ae.entity_id = d.id
      AND ae.action = 'document_created'
    );
  END IF;
END $$;

-- Step 8: Create audit events for migrated versions
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_events') THEN
    INSERT INTO audit_events (
      case_id,
      entity_type,
      entity_id,
      action,
      meta,
      actor,
      created_at
    )
    SELECT
      d.case_id,
      'version',
      dv.id,
      'version_created',
      jsonb_build_object('migrated', true, 'version_no', dv.version_no),
      dv.created_by,
      dv.created_at
    FROM document_versions dv
    JOIN documents d ON d.id = dv.document_id
    WHERE dv.version_no = 1
    AND NOT EXISTS (
      SELECT 1 FROM audit_events ae
      WHERE ae.entity_type = 'version'
      AND ae.entity_id = dv.id
      AND ae.action = 'version_created'
    );
  END IF;
END $$;
