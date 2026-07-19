-- StayCare production hardening
-- Apply after 012_staycare_platform_v1.sql in a non-production project first.

ALTER TABLE staycare_service_applications
  ADD COLUMN IF NOT EXISTS idempotency_key TEXT,
  ADD COLUMN IF NOT EXISTS rejected_reason TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staycare_application_idempotency
  ON staycare_service_applications (tenant_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staycare_application_queue
  ON staycare_service_applications (tenant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_staycare_documents_review_queue
  ON staycare_documents (tenant_id, status, created_at)
  WHERE status IN ('scanning', 'review_required');

CREATE TABLE IF NOT EXISTS staycare_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  provider_connection_id UUID REFERENCES staycare_provider_connections(id) ON DELETE SET NULL,
  provider_code TEXT NOT NULL,
  external_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  signature_verified BOOLEAN NOT NULL DEFAULT false,
  processing_status TEXT NOT NULL DEFAULT 'received'
    CHECK (processing_status IN ('received', 'processing', 'processed', 'failed', 'ignored')),
  payload_hash TEXT,
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, provider_code, external_event_id)
);

CREATE TABLE IF NOT EXISTS staycare_push_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('web', 'android', 'ios')),
  provider TEXT NOT NULL DEFAULT 'fcm' CHECK (provider IN ('fcm')),
  token_hash TEXT NOT NULL,
  encrypted_token_ref TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'si' CHECK (locale IN ('ko', 'en', 'si')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'invalid')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, token_hash)
);

DROP TRIGGER IF EXISTS staycare_push_devices_touch_updated_at ON staycare_push_devices;
CREATE TRIGGER staycare_push_devices_touch_updated_at
BEFORE UPDATE ON staycare_push_devices
FOR EACH ROW EXECUTE FUNCTION staycare_touch_updated_at();

CREATE OR REPLACE FUNCTION staycare_application_transition_allowed(
  previous staycare_application_status,
  requested staycare_application_status
)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT previous = requested OR CASE previous
    WHEN 'draft' THEN requested IN ('submitted', 'cancelled')
    WHEN 'submitted' THEN requested IN ('reviewing', 'waiting_worker', 'waiting_authority', 'waiting_provider', 'cancelled')
    WHEN 'reviewing' THEN requested IN ('waiting_worker', 'waiting_authority', 'waiting_provider', 'approved', 'rejected', 'cancelled')
    WHEN 'waiting_worker' THEN requested IN ('reviewing', 'waiting_authority', 'waiting_provider', 'approved', 'rejected', 'cancelled')
    WHEN 'waiting_authority' THEN requested IN ('reviewing', 'waiting_worker', 'approved', 'rejected', 'cancelled')
    WHEN 'waiting_provider' THEN requested IN ('reviewing', 'waiting_worker', 'approved', 'fulfilled', 'rejected', 'cancelled')
    WHEN 'approved' THEN requested IN ('waiting_provider', 'fulfilled', 'cancelled')
    WHEN 'fulfilled' THEN false
    WHEN 'rejected' THEN false
    WHEN 'cancelled' THEN false
    ELSE false
  END;
$$;

CREATE OR REPLACE FUNCTION staycare_enforce_application_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT staycare_application_transition_allowed(OLD.status, NEW.status) THEN
    RAISE EXCEPTION 'Invalid StayCare application transition: % -> %', OLD.status, NEW.status
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staycare_application_transition_guard ON staycare_service_applications;
CREATE TRIGGER staycare_application_transition_guard
BEFORE UPDATE OF status ON staycare_service_applications
FOR EACH ROW EXECUTE FUNCTION staycare_enforce_application_transition();

CREATE OR REPLACE FUNCTION staycare_prevent_audit_mutation()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'StayCare audit events are append-only'
    USING ERRCODE = 'insufficient_privilege';
END;
$$;

DROP TRIGGER IF EXISTS staycare_audit_events_immutable ON staycare_audit_events;
CREATE TRIGGER staycare_audit_events_immutable
BEFORE UPDATE OR DELETE ON staycare_audit_events
FOR EACH ROW EXECUTE FUNCTION staycare_prevent_audit_mutation();

CREATE OR REPLACE FUNCTION staycare_can_manage_storage_worker(target_worker UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM staycare_workers w
    WHERE w.id = target_worker
      AND (
        w.auth_user_id = auth.uid()
        OR staycare_has_role(
          w.tenant_id,
          ARRAY[
            'sejoong_admin',
            'sejoong_lawyer',
            'immigration_manager',
            'operator_manager',
            'operator_agent'
          ]::staycare_role[]
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION staycare_can_manage_storage_worker(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION staycare_can_manage_storage_worker(UUID) TO authenticated;

DROP POLICY IF EXISTS staycare_applications_update ON staycare_service_applications;
CREATE POLICY staycare_applications_update ON staycare_service_applications
FOR UPDATE TO authenticated
USING (
  staycare_has_role(
    tenant_id,
    ARRAY[
      'sejoong_admin',
      'sejoong_lawyer',
      'immigration_manager',
      'operator_manager',
      'operator_agent',
      'provider_agent'
    ]::staycare_role[]
  )
  OR (
    EXISTS (
      SELECT 1 FROM staycare_workers w
      WHERE w.id = worker_id AND w.auth_user_id = auth.uid()
    )
    AND status IN ('draft', 'waiting_worker')
  )
)
WITH CHECK (
  staycare_has_role(
    tenant_id,
    ARRAY[
      'sejoong_admin',
      'sejoong_lawyer',
      'immigration_manager',
      'operator_manager',
      'operator_agent',
      'provider_agent'
    ]::staycare_role[]
  )
  OR EXISTS (
    SELECT 1 FROM staycare_workers w
    WHERE w.id = worker_id AND w.auth_user_id = auth.uid()
  )
);

ALTER TABLE staycare_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_push_devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staycare_webhook_events_read ON staycare_webhook_events;
CREATE POLICY staycare_webhook_events_read ON staycare_webhook_events
FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin', 'operator_manager', 'auditor']::staycare_role[]));

-- Webhook inserts and updates are service-role only.

DROP POLICY IF EXISTS staycare_push_devices_read ON staycare_push_devices;
CREATE POLICY staycare_push_devices_read ON staycare_push_devices
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR staycare_has_role(tenant_id, ARRAY['sejoong_admin', 'auditor']::staycare_role[])
);

-- Device tokens are written through trusted server endpoints after encryption.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staycare-private',
  'staycare-private',
  false,
  15728640,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS staycare_storage_select ON storage.objects;
CREATE POLICY staycare_storage_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 2
  AND staycare_can_read_worker(((storage.foldername(name))[2])::UUID)
);

DROP POLICY IF EXISTS staycare_storage_insert ON storage.objects;
CREATE POLICY staycare_storage_insert ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 2
  AND staycare_can_manage_storage_worker(((storage.foldername(name))[2])::UUID)
);

DROP POLICY IF EXISTS staycare_storage_update ON storage.objects;
CREATE POLICY staycare_storage_update ON storage.objects
FOR UPDATE TO authenticated
USING (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 2
  AND staycare_can_manage_storage_worker(((storage.foldername(name))[2])::UUID)
)
WITH CHECK (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 2
  AND staycare_can_manage_storage_worker(((storage.foldername(name))[2])::UUID)
);

DROP POLICY IF EXISTS staycare_storage_delete ON storage.objects;
CREATE POLICY staycare_storage_delete ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 2
  AND staycare_has_role(
    ((storage.foldername(name))[1])::UUID,
    ARRAY['sejoong_admin', 'operator_manager']::staycare_role[]
  )
);

COMMENT ON COLUMN staycare_service_applications.idempotency_key IS
  'Client-generated key used to prevent duplicate service applications.';
COMMENT ON TABLE staycare_webhook_events IS
  'Deduplicated provider webhook envelope. Raw payload should be minimized or stored outside the database when sensitive.';
COMMENT ON TABLE staycare_push_devices IS
  'Encrypted push-token references. Never store a plaintext FCM token in this table.';
