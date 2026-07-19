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

CREATE OR REPLACE FUNCTION staycare_claim_notifications(batch_size INTEGER DEFAULT 50)
RETURNS SETOF staycare_notifications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH candidates AS (
    SELECT n.id
    FROM staycare_notifications n
    WHERE n.scheduled_at <= now()
      AND (
        n.status = 'queued'
        OR (n.status = 'failed' AND n.delivery_attempts < 5)
      )
      AND (
        n.locked_at IS NULL
        OR n.locked_at < now() - interval '10 minutes'
      )
    ORDER BY n.scheduled_at ASC, n.created_at ASC
    FOR UPDATE SKIP LOCKED
    LIMIT GREATEST(1, LEAST(batch_size, 100))
  ), claimed AS (
    UPDATE staycare_notifications n
    SET
      status = 'sending',
      locked_at = now(),
      last_attempt_at = now(),
      delivery_attempts = n.delivery_attempts + 1
    FROM candidates c
    WHERE n.id = c.id
    RETURNING n.*
  )
  SELECT * FROM claimed;
END;
$$;

REVOKE ALL ON FUNCTION staycare_claim_notifications(INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_claim_notifications(INTEGER) FROM authenticated;
GRANT EXECUTE ON FUNCTION staycare_claim_notifications(INTEGER) TO service_role;

COMMENT ON COLUMN staycare_notifications.locked_at IS
  'Short processing lease used by the notification worker to reduce duplicate sends.';
COMMENT ON COLUMN staycare_notifications.delivery_attempts IS
  'Total delivery attempts. Notification workers stop retrying after the configured limit.';
COMMENT ON FUNCTION staycare_claim_notifications(INTEGER) IS
  'Atomically claims due notification rows using FOR UPDATE SKIP LOCKED.';
