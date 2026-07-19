-- Durable notification delivery and in-app read state.

ALTER TABLE staycare_notifications
  ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS metadata JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_staycare_notifications_worker_read
  ON staycare_notifications (worker_id, read_at, created_at DESC)
  WHERE channel = 'in_app';

CREATE INDEX IF NOT EXISTS idx_staycare_notifications_dispatch
  ON staycare_notifications (status, scheduled_at, locked_at)
  WHERE status IN ('queued', 'failed');

COMMENT ON COLUMN staycare_notifications.locked_at IS
  'Short processing lease used by the notification worker to reduce duplicate sends.';
COMMENT ON COLUMN staycare_notifications.delivery_attempts IS
  'Total delivery attempts. Notification workers stop retrying after the configured limit.';
