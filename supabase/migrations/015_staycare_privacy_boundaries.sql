-- Tighten private worker data boundaries.
-- Employers and sending institutions require dedicated summary views, not raw private tables.

CREATE OR REPLACE FUNCTION staycare_is_worker_self(target_worker UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_worker IS NOT NULL AND EXISTS (
    SELECT 1
    FROM staycare_workers w
    WHERE w.id = target_worker
      AND w.auth_user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION staycare_can_read_private_worker(target_worker UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_worker IS NOT NULL AND EXISTS (
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
            'operator_agent',
            'auditor'
          ]::staycare_role[]
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION staycare_provider_can_read_document(target_document UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT target_document IS NOT NULL AND EXISTS (
    SELECT 1
    FROM staycare_service_applications a
    WHERE target_document = ANY(a.shared_document_ids)
      AND a.assigned_organization_id IN (
        SELECT staycare_current_org_ids(a.tenant_id)
      )
      AND a.status NOT IN ('cancelled', 'rejected')
  );
$$;

REVOKE ALL ON FUNCTION staycare_is_worker_self(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_can_read_private_worker(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_provider_can_read_document(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION staycare_is_worker_self(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION staycare_can_read_private_worker(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION staycare_provider_can_read_document(UUID) TO authenticated;

DROP POLICY IF EXISTS staycare_documents_read ON staycare_documents;
CREATE POLICY staycare_documents_read ON staycare_documents
FOR SELECT TO authenticated
USING (
  staycare_can_read_private_worker(worker_id)
  OR staycare_provider_can_read_document(id)
);

DROP POLICY IF EXISTS staycare_applications_read ON staycare_service_applications;
CREATE POLICY staycare_applications_read ON staycare_service_applications
FOR SELECT TO authenticated
USING (
  staycare_can_read_private_worker(worker_id)
  OR assigned_organization_id IN (
    SELECT staycare_current_org_ids(tenant_id)
  )
);

DROP POLICY IF EXISTS staycare_application_events_read ON staycare_application_events;
CREATE POLICY staycare_application_events_read ON staycare_application_events
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM staycare_service_applications a
    WHERE a.id = application_id
      AND (
        staycare_can_read_private_worker(a.worker_id)
        OR a.assigned_organization_id IN (
          SELECT staycare_current_org_ids(a.tenant_id)
        )
      )
  )
);

DROP POLICY IF EXISTS staycare_application_events_insert ON staycare_application_events;
CREATE POLICY staycare_application_events_insert ON staycare_application_events
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM staycare_service_applications a
    WHERE a.id = application_id
      AND a.tenant_id = tenant_id
      AND (
        staycare_is_worker_self(a.worker_id)
        OR staycare_has_role(
          a.tenant_id,
          ARRAY[
            'sejoong_admin',
            'sejoong_lawyer',
            'immigration_manager',
            'operator_manager',
            'operator_agent',
            'provider_agent'
          ]::staycare_role[]
        )
        OR a.assigned_organization_id IN (
          SELECT staycare_current_org_ids(a.tenant_id)
        )
      )
  )
);

DROP POLICY IF EXISTS staycare_beneficiary_read ON staycare_remittance_beneficiaries;
CREATE POLICY staycare_beneficiary_read ON staycare_remittance_beneficiaries
FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));

DROP POLICY IF EXISTS staycare_remittance_read ON staycare_remittance_intents;
CREATE POLICY staycare_remittance_read ON staycare_remittance_intents
FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));

DROP POLICY IF EXISTS staycare_immigration_read ON staycare_immigration_cases;
CREATE POLICY staycare_immigration_read ON staycare_immigration_cases
FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));

DROP POLICY IF EXISTS staycare_ai_sessions_read ON staycare_ai_sessions;
CREATE POLICY staycare_ai_sessions_read ON staycare_ai_sessions
FOR SELECT TO authenticated
USING (worker_id IS NULL OR staycare_can_read_private_worker(worker_id));

DROP POLICY IF EXISTS staycare_ai_messages_read ON staycare_ai_messages;
CREATE POLICY staycare_ai_messages_read ON staycare_ai_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM staycare_ai_sessions s
    WHERE s.id = session_id
      AND (
        s.worker_id IS NULL
        OR staycare_can_read_private_worker(s.worker_id)
      )
  )
);

DROP POLICY IF EXISTS staycare_tickets_read ON staycare_tickets;
CREATE POLICY staycare_tickets_read ON staycare_tickets
FOR SELECT TO authenticated
USING (
  (worker_id IS NOT NULL AND staycare_can_read_private_worker(worker_id))
  OR staycare_has_role(
    tenant_id,
    ARRAY[
      'sejoong_admin',
      'sejoong_lawyer',
      'immigration_manager',
      'operator_manager',
      'operator_agent',
      'auditor'
    ]::staycare_role[]
  )
  OR assigned_organization_id IN (
    SELECT staycare_current_org_ids(tenant_id)
  )
);

DROP POLICY IF EXISTS staycare_ticket_events_read ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_read ON staycare_ticket_events
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM staycare_tickets t
    WHERE t.id = ticket_id
      AND (
        (t.worker_id IS NOT NULL AND staycare_can_read_private_worker(t.worker_id))
        OR staycare_has_role(
          t.tenant_id,
          ARRAY[
            'sejoong_admin',
            'sejoong_lawyer',
            'immigration_manager',
            'operator_manager',
            'operator_agent',
            'auditor'
          ]::staycare_role[]
        )
        OR t.assigned_organization_id IN (
          SELECT staycare_current_org_ids(t.tenant_id)
        )
      )
  )
);

DROP POLICY IF EXISTS staycare_ticket_events_insert ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_insert ON staycare_ticket_events
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM staycare_tickets t
    WHERE t.id = ticket_id
      AND t.tenant_id = tenant_id
      AND (
        (t.worker_id IS NOT NULL AND staycare_is_worker_self(t.worker_id))
        OR staycare_has_role(
          t.tenant_id,
          ARRAY[
            'sejoong_admin',
            'sejoong_lawyer',
            'immigration_manager',
            'operator_manager',
            'operator_agent',
            'provider_agent'
          ]::staycare_role[]
        )
        OR t.assigned_organization_id IN (
          SELECT staycare_current_org_ids(t.tenant_id)
        )
      )
  )
);

DROP POLICY IF EXISTS staycare_notifications_read ON staycare_notifications;
CREATE POLICY staycare_notifications_read ON staycare_notifications
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR (worker_id IS NOT NULL AND staycare_is_worker_self(worker_id))
  OR staycare_has_role(
    tenant_id,
    ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[]
  )
);

DROP POLICY IF EXISTS staycare_return_read ON staycare_return_plans;
CREATE POLICY staycare_return_read ON staycare_return_plans
FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));

DROP POLICY IF EXISTS staycare_storage_select ON storage.objects;
CREATE POLICY staycare_storage_select ON storage.objects
FOR SELECT TO authenticated
USING (
  bucket_id = 'staycare-private'
  AND array_length(storage.foldername(name), 1) >= 3
  AND (
    staycare_can_read_private_worker(
      staycare_try_uuid((storage.foldername(name))[2])
    )
    OR staycare_provider_can_read_document(
      staycare_try_uuid((storage.foldername(name))[3])
    )
  )
);

COMMENT ON FUNCTION staycare_can_read_private_worker(UUID) IS
  'Private-data access for the worker and authorized Sejoong/operations staff only.';
COMMENT ON FUNCTION staycare_provider_can_read_document(UUID) IS
  'Provider access only when a document was explicitly shared on an assigned application.';
