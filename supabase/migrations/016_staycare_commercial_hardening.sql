-- StayCare commercial hardening
-- Apply after 012-015 in staging, validate, then apply to production.

BEGIN;

-- Idempotency is a worker-owned retry boundary. A tenant-wide unique key could
-- let a colliding key block another worker and made safe lookup harder.
DROP INDEX IF EXISTS idx_staycare_application_idempotency;
CREATE UNIQUE INDEX idx_staycare_application_idempotency
  ON staycare_service_applications (tenant_id, worker_id, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- Service-specific records are derivative of a service application. They must
-- not survive a compensated or administrative application deletion as orphans.
ALTER TABLE staycare_delivery_orders
  DROP CONSTRAINT IF EXISTS staycare_delivery_orders_application_id_fkey;
ALTER TABLE staycare_delivery_orders
  ADD CONSTRAINT staycare_delivery_orders_application_id_fkey
  FOREIGN KEY (application_id)
  REFERENCES staycare_service_applications(id)
  ON DELETE CASCADE;

ALTER TABLE staycare_remittance_intents
  DROP CONSTRAINT IF EXISTS staycare_remittance_intents_application_id_fkey;
ALTER TABLE staycare_remittance_intents
  ADD CONSTRAINT staycare_remittance_intents_application_id_fkey
  FOREIGN KEY (application_id)
  REFERENCES staycare_service_applications(id)
  ON DELETE CASCADE;

ALTER TABLE staycare_immigration_cases
  DROP CONSTRAINT IF EXISTS staycare_immigration_cases_application_id_fkey;
ALTER TABLE staycare_immigration_cases
  ADD CONSTRAINT staycare_immigration_cases_application_id_fkey
  FOREIGN KEY (application_id)
  REFERENCES staycare_service_applications(id)
  ON DELETE CASCADE;

-- Explicit legal hold prevents scheduled retention cleanup. Only authorized
-- StayCare staff may modify the document row under the existing RLS policies.
ALTER TABLE staycare_documents
  ADD COLUMN IF NOT EXISTS legal_hold BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_staycare_documents_retention_cleanup
  ON staycare_documents (retention_until, status)
  WHERE legal_hold = false
    AND retention_until IS NOT NULL
    AND status NOT IN ('deletion_pending', 'deleted');

CREATE INDEX IF NOT EXISTS idx_staycare_documents_stale_upload
  ON staycare_documents (created_at)
  WHERE status = 'scanning';

-- Prevent accidentally recording a retention date before the object metadata
-- was created. NOT VALID keeps rollout safe for historical rows; new writes are
-- checked immediately, then existing data is validated after cleanup below.
ALTER TABLE staycare_documents
  DROP CONSTRAINT IF EXISTS staycare_documents_retention_after_creation;
ALTER TABLE staycare_documents
  ADD CONSTRAINT staycare_documents_retention_after_creation
  CHECK (retention_until IS NULL OR retention_until >= created_at::date)
  NOT VALID;

UPDATE staycare_documents
SET retention_until = NULL
WHERE retention_until IS NOT NULL
  AND retention_until < created_at::date;

ALTER TABLE staycare_documents
  VALIDATE CONSTRAINT staycare_documents_retention_after_creation;

COMMENT ON COLUMN staycare_documents.legal_hold IS
  'When true, automated retention cleanup must not delete the document object.';
COMMENT ON COLUMN staycare_documents.retention_until IS
  'Policy-derived deletion eligibility date. Deletion still requires legal_hold=false.';

COMMIT;
