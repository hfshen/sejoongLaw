-- StayCare Sri Lanka workforce operations foundation
-- Apply after 012-017 in staging first. Designed for roster-controlled onboarding,
-- arrival-wave operations, placement continuity and incident escalation.

BEGIN;

CREATE TABLE IF NOT EXISTS staycare_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  origin_country_code TEXT NOT NULL DEFAULT 'LK',
  visa_path TEXT,
  industry TEXT NOT NULL DEFAULT 'shipbuilding',
  target_headcount INTEGER NOT NULL DEFAULT 0 CHECK (target_headcount >= 0),
  starts_on DATE,
  ends_on DATE,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning','recruiting','pre_departure','arriving','active','returning','closed','cancelled')),
  employer_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  sending_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  training_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS staycare_arrival_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES staycare_cohorts(id) ON DELETE CASCADE,
  batch_code TEXT NOT NULL,
  sequence_no INTEGER NOT NULL DEFAULT 1 CHECK (sequence_no > 0),
  departure_airport TEXT,
  arrival_airport TEXT,
  arrival_terminal TEXT,
  flight_number TEXT,
  scheduled_departure_at TIMESTAMPTZ,
  scheduled_arrival_at TIMESTAMPTZ,
  actual_arrival_at TIMESTAMPTZ,
  expected_headcount INTEGER NOT NULL DEFAULT 0 CHECK (expected_headcount >= 0),
  checked_in_headcount INTEGER NOT NULL DEFAULT 0 CHECK (checked_in_headcount >= 0),
  bus_reference TEXT,
  lead_name TEXT,
  lead_phone TEXT,
  status TEXT NOT NULL DEFAULT 'planning'
    CHECK (status IN ('planning','confirmed','check_in','in_transit','arrived','handed_over','completed','cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, batch_code)
);

CREATE TABLE IF NOT EXISTS staycare_worker_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES staycare_cohorts(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES staycare_arrival_batches(id) ON DELETE SET NULL,
  token_hash TEXT NOT NULL CHECK (token_hash ~ '^[a-f0-9]{64}$'),
  token_hint TEXT,
  channel TEXT NOT NULL DEFAULT 'qr'
    CHECK (channel IN ('qr','sms','email','paper','institution','admin')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','claimed','expired','revoked','locked')),
  expires_at TIMESTAMPTZ NOT NULL,
  claimed_at TIMESTAMPTZ,
  claimed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  failed_attempts INTEGER NOT NULL DEFAULT 0 CHECK (failed_attempts >= 0),
  last_failed_at TIMESTAMPTZ,
  issued_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, token_hash)
);

CREATE TABLE IF NOT EXISTS staycare_worker_identities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL CHECK (provider IN ('phone','email','google','facebook','institution','other')),
  identity_hash TEXT NOT NULL CHECK (identity_hash ~ '^[a-f0-9]{64}$'),
  display_hint TEXT,
  country_code TEXT,
  purpose TEXT NOT NULL DEFAULT 'login'
    CHECK (purpose IN ('login','recovery','predeparture','korea_active','emergency')),
  verified_at TIMESTAMPTZ,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','revoked','superseded')),
  linked_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider, identity_hash)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staycare_worker_primary_identity
  ON staycare_worker_identities (worker_id)
  WHERE is_primary = true AND status = 'active';

CREATE TABLE IF NOT EXISTS staycare_worker_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  contact_type TEXT NOT NULL CHECK (contact_type IN ('phone','email','emergency_phone','whatsapp')),
  purpose TEXT NOT NULL CHECK (purpose IN ('sri_lanka_predeparture','korea_temporary','korea_active','recovery','emergency')),
  value_hash TEXT NOT NULL CHECK (value_hash ~ '^[a-f0-9]{64}$'),
  value_hint TEXT,
  encrypted_value_ref TEXT,
  country_code TEXT,
  verified_at TIMESTAMPTZ,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_until TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','superseded','revoked')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, worker_id, contact_type, purpose, value_hash)
);

CREATE TABLE IF NOT EXISTS staycare_worker_roster_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES staycare_cohorts(id) ON DELETE SET NULL,
  source_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('slbfe','eps','sending_agency','training_institution','employer','manual_import')),
  official_reference_no TEXT,
  roster_version TEXT NOT NULL DEFAULT 'v1',
  source_row_hash TEXT CHECK (source_row_hash IS NULL OR source_row_hash ~ '^[a-f0-9]{64}$'),
  imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'imported' CHECK (status IN ('imported','verified','superseded','rejected')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (tenant_id, worker_id, source_type, roster_version)
);

CREATE TABLE IF NOT EXISTS staycare_placements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  cohort_id UUID REFERENCES staycare_cohorts(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES staycare_arrival_batches(id) ON DELETE SET NULL,
  employer_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  site_name TEXT,
  subcontractor_name TEXT,
  department TEXT,
  job_code TEXT,
  shift_code TEXT,
  team_code TEXT,
  dormitory_name TEXT,
  room_reference TEXT,
  supervisor_name TEXT,
  supervisor_phone TEXT,
  starts_on DATE,
  ends_on DATE,
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','confirmed','active','transferred','ended','cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staycare_one_active_placement
  ON staycare_placements (worker_id)
  WHERE status = 'active';

CREATE TABLE IF NOT EXISTS staycare_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE SET NULL,
  cohort_id UUID REFERENCES staycare_cohorts(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES staycare_arrival_batches(id) ON DELETE SET NULL,
  incident_no TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'safety','medical','industrial_accident','wage','housing','violence','harassment',
    'missing','unreachable','immigration','identity','privacy','transport','other'
  )),
  severity TEXT NOT NULL DEFAULT 'P2' CHECK (severity IN ('P0','P1','P2','P3')),
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ,
  location_summary TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','triaged','assigned','in_progress','waiting','resolved','closed')),
  assigned_department TEXT,
  assigned_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  first_response_due_at TIMESTAMPTZ,
  resolution_due_at TIMESTAMPTZ,
  legal_hold BOOLEAN NOT NULL DEFAULT false,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution_summary TEXT,
  resolved_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, incident_no)
);

CREATE TABLE IF NOT EXISTS staycare_worker_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  checkpoint TEXT NOT NULL CHECK (checkpoint IN ('arrival','day_7','day_30','day_60','day_90','monthly','return')),
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  channel TEXT CHECK (channel IS NULL OR channel IN ('app','phone','in_person','employer','institution')),
  wellbeing_score INTEGER CHECK (wellbeing_score IS NULL OR wellbeing_score BETWEEN 1 AND 5),
  work_score INTEGER CHECK (work_score IS NULL OR work_score BETWEEN 1 AND 5),
  housing_score INTEGER CHECK (housing_score IS NULL OR housing_score BETWEEN 1 AND 5),
  needs_followup BOOLEAN NOT NULL DEFAULT false,
  followup_ticket_id UUID REFERENCES staycare_tickets(id) ON DELETE SET NULL,
  notes TEXT,
  completed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_id, checkpoint, scheduled_at)
);

ALTER TABLE staycare_workers
  ADD COLUMN IF NOT EXISTS cohort_id UUID REFERENCES staycare_cohorts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS arrival_batch_id UUID REFERENCES staycare_arrival_batches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS identity_claimed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS korea_phone_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_staycare_workers_cohort ON staycare_workers (tenant_id, cohort_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_batch ON staycare_workers (tenant_id, arrival_batch_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_invites_worker_status ON staycare_worker_invites (worker_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_staycare_batches_arrival ON staycare_arrival_batches (tenant_id, scheduled_arrival_at, status);
CREATE INDEX IF NOT EXISTS idx_staycare_incidents_queue ON staycare_incidents (tenant_id, severity, status, created_at);
CREATE INDEX IF NOT EXISTS idx_staycare_checkins_queue ON staycare_worker_checkins (tenant_id, scheduled_at, completed_at);

-- Tamil is an official Sri Lankan language. Existing user-facing applications may
-- fall back to English until each content bundle has passed native review.
ALTER TABLE staycare_tenants DROP CONSTRAINT IF EXISTS staycare_tenants_default_language_check;
ALTER TABLE staycare_tenants ADD CONSTRAINT staycare_tenants_default_language_check
  CHECK (default_language IN ('ko','en','si','ta'));
ALTER TABLE staycare_workers DROP CONSTRAINT IF EXISTS staycare_workers_preferred_language_check;
ALTER TABLE staycare_workers ADD CONSTRAINT staycare_workers_preferred_language_check
  CHECK (preferred_language IN ('ko','en','si','ta'));
ALTER TABLE staycare_consents DROP CONSTRAINT IF EXISTS staycare_consents_language_check;
ALTER TABLE staycare_consents ADD CONSTRAINT staycare_consents_language_check
  CHECK (language IN ('ko','en','si','ta'));
ALTER TABLE staycare_service_applications DROP CONSTRAINT IF EXISTS staycare_service_applications_language_check;
ALTER TABLE staycare_service_applications ADD CONSTRAINT staycare_service_applications_language_check
  CHECK (language IN ('ko','en','si','ta'));
ALTER TABLE staycare_push_devices DROP CONSTRAINT IF EXISTS staycare_push_devices_locale_check;
ALTER TABLE staycare_push_devices ADD CONSTRAINT staycare_push_devices_locale_check
  CHECK (locale IN ('ko','en','si','ta'));

CREATE OR REPLACE FUNCTION staycare_touch_operations_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'staycare_cohorts','staycare_arrival_batches','staycare_worker_identities',
    'staycare_worker_contacts','staycare_placements','staycare_incidents','staycare_worker_checkins'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_touch_updated_at ON %I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER %I_touch_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION staycare_touch_operations_updated_at()',
      table_name, table_name
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION staycare_claim_worker_invite(
  invite_token_hash TEXT,
  claimant_name_en TEXT,
  claimant_date_of_birth DATE,
  claimant_language TEXT DEFAULT 'si'
)
RETURNS TABLE(worker_id UUID, tenant_id UUID, member_no TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_row staycare_worker_invites%ROWTYPE;
  worker_row staycare_workers%ROWTYPE;
  normalized_expected TEXT;
  normalized_claimant TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'insufficient_privilege';
  END IF;

  SELECT * INTO invite_row
  FROM staycare_worker_invites
  WHERE token_hash = lower(invite_token_hash)
  FOR UPDATE;

  IF invite_row.id IS NULL OR invite_row.status <> 'active' OR invite_row.expires_at <= now() THEN
    RAISE EXCEPTION 'Invite is invalid or expired' USING ERRCODE = 'invalid_authorization_specification';
  END IF;

  IF invite_row.failed_attempts >= 8 THEN
    UPDATE staycare_worker_invites SET status = 'locked' WHERE id = invite_row.id;
    RAISE EXCEPTION 'Invite is locked' USING ERRCODE = 'invalid_authorization_specification';
  END IF;

  SELECT * INTO worker_row
  FROM staycare_workers
  WHERE id = invite_row.worker_id
  FOR UPDATE;

  IF worker_row.id IS NULL THEN
    RAISE EXCEPTION 'Worker roster record not found' USING ERRCODE = 'no_data_found';
  END IF;

  normalized_expected := regexp_replace(upper(coalesce(worker_row.full_name_en, worker_row.full_name)), '[^A-Z0-9]', '', 'g');
  normalized_claimant := regexp_replace(upper(coalesce(claimant_name_en, '')), '[^A-Z0-9]', '', 'g');

  IF worker_row.date_of_birth IS DISTINCT FROM claimant_date_of_birth OR normalized_expected <> normalized_claimant THEN
    RAISE EXCEPTION 'Roster identity does not match' USING ERRCODE = 'invalid_authorization_specification';
  END IF;

  IF worker_row.auth_user_id IS NOT NULL AND worker_row.auth_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Worker record is already claimed' USING ERRCODE = 'unique_violation';
  END IF;

  UPDATE staycare_workers
  SET auth_user_id = auth.uid(),
      preferred_language = CASE WHEN claimant_language IN ('ko','en','si','ta') THEN claimant_language ELSE preferred_language END,
      identity_claimed_at = coalesce(identity_claimed_at, now()),
      status = CASE WHEN status = 'invited' THEN 'preparing'::staycare_worker_status ELSE status END,
      updated_at = now()
  WHERE id = worker_row.id;

  INSERT INTO staycare_memberships (
    tenant_id, organization_id, user_id, role, status, invited_at, activated_at
  ) VALUES (
    worker_row.tenant_id, NULL, auth.uid(), 'worker', 'active', invite_row.created_at, now()
  )
  ON CONFLICT DO NOTHING;

  UPDATE staycare_worker_invites
  SET status = 'claimed', claimed_at = now(), claimed_by = auth.uid()
  WHERE id = invite_row.id;

  INSERT INTO staycare_audit_events (
    tenant_id, actor_user_id, actor_role, action, entity_type, entity_id, metadata
  ) VALUES (
    worker_row.tenant_id, auth.uid(), 'worker', 'worker.invite_claimed',
    'staycare_workers', worker_row.id,
    jsonb_build_object('inviteId', invite_row.id, 'cohortId', invite_row.cohort_id, 'batchId', invite_row.batch_id)
  );

  RETURN QUERY SELECT worker_row.id, worker_row.tenant_id, worker_row.member_no;
END;
$$;

REVOKE ALL ON FUNCTION staycare_claim_worker_invite(TEXT,TEXT,DATE,TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION staycare_claim_worker_invite(TEXT,TEXT,DATE,TEXT) TO authenticated;

ALTER TABLE staycare_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_arrival_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_worker_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_worker_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_worker_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_worker_roster_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_worker_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY staycare_cohorts_staff_read ON staycare_cohorts FOR SELECT TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','auditor']::staycare_role[])
  OR employer_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
  OR sending_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
  OR training_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
);
CREATE POLICY staycare_cohorts_staff_write ON staycare_cohorts FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

CREATE POLICY staycare_batches_read ON staycare_arrival_batches FOR SELECT TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','auditor']::staycare_role[])
  OR EXISTS (
    SELECT 1 FROM staycare_cohorts c
    WHERE c.id = cohort_id
      AND (
        c.employer_organization_id IN (SELECT staycare_current_org_ids(c.tenant_id))
        OR c.sending_organization_id IN (SELECT staycare_current_org_ids(c.tenant_id))
        OR c.training_organization_id IN (SELECT staycare_current_org_ids(c.tenant_id))
      )
  )
);
CREATE POLICY staycare_batches_write ON staycare_arrival_batches FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]));

CREATE POLICY staycare_invites_staff_read ON staycare_worker_invites FOR SELECT TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','auditor']::staycare_role[])
  OR EXISTS (
    SELECT 1 FROM staycare_workers w
    WHERE w.id = worker_id
      AND (
        w.sending_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
        OR w.training_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
      )
  )
);
CREATE POLICY staycare_invites_staff_write ON staycare_worker_invites FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

CREATE POLICY staycare_identities_read ON staycare_worker_identities FOR SELECT TO authenticated
USING (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[]));
CREATE POLICY staycare_identities_write ON staycare_worker_identities FOR ALL TO authenticated
USING (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

CREATE POLICY staycare_contacts_read ON staycare_worker_contacts FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));
CREATE POLICY staycare_contacts_write ON staycare_worker_contacts FOR ALL TO authenticated
USING (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]));

CREATE POLICY staycare_roster_read ON staycare_worker_roster_sources FOR SELECT TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','auditor']::staycare_role[])
  OR source_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
);
CREATE POLICY staycare_roster_write ON staycare_worker_roster_sources FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

CREATE POLICY staycare_placements_read ON staycare_placements FOR SELECT TO authenticated
USING (
  staycare_is_worker_self(worker_id)
  OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','auditor']::staycare_role[])
  OR employer_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
  OR EXISTS (
    SELECT 1 FROM staycare_workers w
    WHERE w.id = worker_id
      AND (
        w.sending_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
        OR w.training_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
      )
  )
);
CREATE POLICY staycare_placements_write ON staycare_placements FOR ALL TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[])
  OR employer_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
)
WITH CHECK (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[])
  OR employer_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
);

CREATE POLICY staycare_incidents_read ON staycare_incidents FOR SELECT TO authenticated
USING ((worker_id IS NOT NULL AND staycare_can_read_private_worker(worker_id)) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent','auditor']::staycare_role[]));
CREATE POLICY staycare_incidents_write ON staycare_incidents FOR ALL TO authenticated
USING ((worker_id IS NOT NULL AND staycare_is_worker_self(worker_id)) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK ((worker_id IS NOT NULL AND staycare_is_worker_self(worker_id)) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

CREATE POLICY staycare_checkins_read ON staycare_worker_checkins FOR SELECT TO authenticated
USING (staycare_can_read_private_worker(worker_id));
CREATE POLICY staycare_checkins_write ON staycare_worker_checkins FOR ALL TO authenticated
USING (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_is_worker_self(worker_id) OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[]));

COMMIT;
