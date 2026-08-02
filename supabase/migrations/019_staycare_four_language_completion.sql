-- StayCare four-language completion
-- Adds Tamil (ta) to every remaining language/locale constraint.
-- Apply after 018_staycare_sri_lanka_operations.sql.

BEGIN;

ALTER TABLE staycare_tenants
  DROP CONSTRAINT IF EXISTS staycare_tenants_default_language_check;
ALTER TABLE staycare_tenants
  ADD CONSTRAINT staycare_tenants_default_language_check
  CHECK (default_language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_workers
  DROP CONSTRAINT IF EXISTS staycare_workers_preferred_language_check;
ALTER TABLE staycare_workers
  ADD CONSTRAINT staycare_workers_preferred_language_check
  CHECK (preferred_language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_consents
  DROP CONSTRAINT IF EXISTS staycare_consents_language_check;
ALTER TABLE staycare_consents
  ADD CONSTRAINT staycare_consents_language_check
  CHECK (language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_service_applications
  DROP CONSTRAINT IF EXISTS staycare_service_applications_language_check;
ALTER TABLE staycare_service_applications
  ADD CONSTRAINT staycare_service_applications_language_check
  CHECK (language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_push_devices
  DROP CONSTRAINT IF EXISTS staycare_push_devices_locale_check;
ALTER TABLE staycare_push_devices
  ADD CONSTRAINT staycare_push_devices_locale_check
  CHECK (locale IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_ai_sessions
  DROP CONSTRAINT IF EXISTS staycare_ai_sessions_source_language_check;
ALTER TABLE staycare_ai_sessions
  ADD CONSTRAINT staycare_ai_sessions_source_language_check
  CHECK (source_language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_ai_sessions
  DROP CONSTRAINT IF EXISTS staycare_ai_sessions_target_language_check;
ALTER TABLE staycare_ai_sessions
  ADD CONSTRAINT staycare_ai_sessions_target_language_check
  CHECK (target_language IN ('ko', 'en', 'si', 'ta'));

ALTER TABLE staycare_notifications
  DROP CONSTRAINT IF EXISTS staycare_notifications_language_check;
ALTER TABLE staycare_notifications
  ADD CONSTRAINT staycare_notifications_language_check
  CHECK (language IN ('ko', 'en', 'si', 'ta'));

COMMENT ON COLUMN staycare_tenants.default_language IS
  'StayCare language code: ko, en, si or ta';
COMMENT ON COLUMN staycare_workers.preferred_language IS
  'Worker preferred language: Korean, English, Sinhala or Tamil';
COMMENT ON COLUMN staycare_ai_sessions.source_language IS
  'AI input language: ko, en, si or ta';
COMMENT ON COLUMN staycare_ai_sessions.target_language IS
  'AI output language: ko, en, si or ta';

COMMIT;
