-- Sejoong StayCare V1
-- Tenant-isolated foreign worker lifecycle, service desk, membership and audit foundation.
-- Apply to a development/preview Supabase project before production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_org_type') THEN
    CREATE TYPE staycare_org_type AS ENUM ('sejoong', 'operator', 'employer', 'specialist', 'sponsor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_role') THEN
    CREATE TYPE staycare_role AS ENUM (
      'sejoong_admin',
      'sejoong_lawyer',
      'operator_manager',
      'operator_agent',
      'employer_admin',
      'specialist',
      'worker',
      'auditor'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_program_status') THEN
    CREATE TYPE staycare_program_status AS ENUM ('draft', 'contracting', 'pre_arrival', 'active', 'paused', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_worker_status') THEN
    CREATE TYPE staycare_worker_status AS ENUM ('invited', 'onboarding', 'pre_arrival', 'arrived', 'active', 'paused', 'offboarding', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_task_status') THEN
    CREATE TYPE staycare_task_status AS ENUM ('queued', 'assigned', 'in_progress', 'waiting_member', 'waiting_internal', 'review_required', 'completed', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_priority') THEN
    CREATE TYPE staycare_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_ticket_status') THEN
    CREATE TYPE staycare_ticket_status AS ENUM ('open', 'triaged', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_payer_type') THEN
    CREATE TYPE staycare_payer_type AS ENUM ('employer', 'worker', 'sponsor');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_billing_cycle') THEN
    CREATE TYPE staycare_billing_cycle AS ENUM ('monthly', 'annual');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_subscription_status') THEN
    CREATE TYPE staycare_subscription_status AS ENUM ('trial', 'active', 'past_due', 'grace', 'suspended', 'cancelled', 'expired');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS staycare_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  service_owner_name TEXT NOT NULL DEFAULT '법무법인 세중',
  default_locale TEXT NOT NULL DEFAULT 'ko',
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  type staycare_org_type NOT NULL,
  name TEXT NOT NULL,
  business_number TEXT,
  country_code TEXT NOT NULL DEFAULT 'KR',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('onboarding', 'active', 'suspended', 'closed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, type, name)
);

CREATE TABLE IF NOT EXISTS staycare_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES staycare_organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role staycare_role NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, organization_id, user_id, role)
);

CREATE TABLE IF NOT EXISTS staycare_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  origin_country_code TEXT NOT NULL DEFAULT 'LK',
  target_member_count INTEGER NOT NULL DEFAULT 200 CHECK (target_member_count > 0),
  status staycare_program_status NOT NULL DEFAULT 'draft',
  annual_fee_per_member INTEGER NOT NULL DEFAULT 1000000 CHECK (annual_fee_per_member >= 0),
  direct_cost_rate NUMERIC(5,4) NOT NULL DEFAULT 0.25 CHECK (direct_cost_rate BETWEEN 0 AND 1),
  default_payer staycare_payer_type NOT NULL DEFAULT 'employer',
  meeting_date DATE,
  first_arrival_target DATE,
  service_region TEXT,
  employer_count INTEGER NOT NULL DEFAULT 0 CHECK (employer_count >= 0),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS staycare_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  program_id UUID NOT NULL REFERENCES staycare_programs(id) ON DELETE CASCADE,
  employer_organization_id UUID REFERENCES staycare_organizations(id),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  member_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  full_name_en TEXT,
  date_of_birth DATE,
  nationality_code TEXT NOT NULL DEFAULT 'LK',
  preferred_language TEXT NOT NULL DEFAULT 'si',
  visa_type TEXT,
  occupation TEXT,
  status staycare_worker_status NOT NULL DEFAULT 'invited',
  expected_arrival_date DATE,
  arrived_at TIMESTAMPTZ,
  visa_expires_at DATE,
  passport_expires_at DATE,
  passport_last4 TEXT CHECK (passport_last4 IS NULL OR length(passport_last4) BETWEEN 2 AND 8),
  foreigner_registration_status TEXT CHECK (foreigner_registration_status IN ('not_started', 'scheduled', 'submitted', 'issued', 'not_applicable')),
  accommodation_summary TEXT,
  emergency_contact_summary TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  onboarding_progress INTEGER NOT NULL DEFAULT 0 CHECK (onboarding_progress BETWEEN 0 AND 100),
  assigned_department TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  next_action TEXT,
  next_action_due_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, member_no)
);

CREATE TABLE IF NOT EXISTS staycare_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'sensitive', 'third_party', 'outsourcing', 'overseas_transfer', 'marketing')),
  document_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ,
  source TEXT NOT NULL DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'paper', 'admin_import')),
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'staycare-private',
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  byte_size BIGINT NOT NULL CHECK (byte_size >= 0),
  sha256 TEXT,
  issue_date DATE,
  expiry_date DATE,
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'scanning', 'review_required', 'approved', 'rejected', 'expired', 'deleted')),
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  retention_until DATE,
  deletion_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, storage_bucket, storage_path)
);

CREATE TABLE IF NOT EXISTS staycare_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT,
  visa_type TEXT,
  occupation_group TEXT,
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code, version)
);

CREATE TABLE IF NOT EXISTS staycare_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES staycare_programs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES staycare_workflow_templates(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  status staycare_task_status NOT NULL DEFAULT 'queued',
  assigned_organization_id UUID REFERENCES staycare_organizations(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  due_at TIMESTAMPTZ,
  sla_minutes INTEGER CHECK (sla_minutes IS NULL OR sla_minutes > 0),
  evidence_required BOOLEAN NOT NULL DEFAULT false,
  completion_evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  cancelled_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES staycare_programs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE SET NULL,
  ticket_no TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority staycare_priority NOT NULL DEFAULT 'P3',
  status staycare_ticket_status NOT NULL DEFAULT 'open',
  intake_channel TEXT NOT NULL DEFAULT 'web' CHECK (intake_channel IN ('web', 'mobile', 'phone', 'email', 'in_person', 'system')),
  description TEXT,
  assigned_department TEXT,
  assigned_organization_id UUID REFERENCES staycare_organizations(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  first_response_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolution_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  separate_quote_required BOOLEAN NOT NULL DEFAULT false,
  quote_status TEXT CHECK (quote_status IN ('not_required', 'draft', 'sent', 'approved', 'rejected', 'paid')),
  closed_reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, ticket_no)
);

CREATE TABLE IF NOT EXISTS staycare_ticket_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  ticket_id UUID NOT NULL REFERENCES staycare_tickets(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  body TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'retired')),
  annual_fee INTEGER NOT NULL DEFAULT 1000000 CHECK (annual_fee >= 0),
  monthly_fee INTEGER CHECK (monthly_fee IS NULL OR monthly_fee >= 0),
  currency TEXT NOT NULL DEFAULT 'KRW',
  included_limits JSONB NOT NULL DEFAULT '{"consultations":12,"specialist_reviews":4,"interpretation_minutes":180,"field_visits":2,"field_visit_minutes":120}'::jsonb,
  service_area JSONB NOT NULL DEFAULT '{}'::jsonb,
  terms_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS staycare_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES staycare_plans(id),
  payer_type staycare_payer_type NOT NULL,
  payer_organization_id UUID REFERENCES staycare_organizations(id),
  billing_cycle staycare_billing_cycle NOT NULL DEFAULT 'annual',
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KRW',
  status staycare_subscription_status NOT NULL DEFAULT 'active',
  starts_at DATE NOT NULL,
  renews_at DATE,
  ends_at DATE,
  provider TEXT,
  provider_customer_ref TEXT,
  provider_subscription_ref TEXT,
  usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES staycare_subscriptions(id) ON DELETE SET NULL,
  invoice_no TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'issued', 'paid', 'partially_refunded', 'refunded', 'void', 'overdue')),
  subtotal INTEGER NOT NULL DEFAULT 0,
  tax INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'KRW',
  due_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, invoice_no)
);

CREATE TABLE IF NOT EXISTS staycare_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES staycare_invoices(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  provider_payment_ref TEXT,
  idempotency_key TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'authorized', 'paid', 'failed', 'cancelled', 'partially_refunded', 'refunded')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KRW',
  paid_at TIMESTAMPTZ,
  refunded_amount INTEGER NOT NULL DEFAULT 0 CHECK (refunded_amount >= 0),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider, provider_payment_ref),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS staycare_cost_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  program_id UUID REFERENCES staycare_programs(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE SET NULL,
  ticket_id UUID REFERENCES staycare_tickets(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  currency TEXT NOT NULL DEFAULT 'KRW',
  occurred_on DATE NOT NULL DEFAULT current_date,
  billable_separately BOOLEAN NOT NULL DEFAULT false,
  approved_by UUID REFERENCES auth.users(id),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  reason TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staycare_memberships_user ON staycare_memberships(user_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_memberships_tenant_role ON staycare_memberships(tenant_id, role, status);
CREATE INDEX IF NOT EXISTS idx_staycare_orgs_tenant_type ON staycare_organizations(tenant_id, type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_programs_tenant_status ON staycare_programs(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_program_status ON staycare_workers(program_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_employer ON staycare_workers(employer_organization_id);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_auth_user ON staycare_workers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staycare_documents_worker_type ON staycare_documents(worker_id, document_type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_tasks_due ON staycare_tasks(tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_staycare_tickets_priority_status ON staycare_tickets(tenant_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_staycare_subscriptions_worker_status ON staycare_subscriptions(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_cost_program_date ON staycare_cost_entries(program_id, occurred_on);
CREATE INDEX IF NOT EXISTS idx_staycare_audit_tenant_time ON staycare_audit_events(tenant_id, occurred_at DESC);

CREATE OR REPLACE FUNCTION staycare_touch_updated_at()
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
    'staycare_tenants',
    'staycare_organizations',
    'staycare_memberships',
    'staycare_programs',
    'staycare_workers',
    'staycare_documents',
    'staycare_workflow_templates',
    'staycare_tasks',
    'staycare_tickets',
    'staycare_plans',
    'staycare_subscriptions',
    'staycare_invoices',
    'staycare_payments'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I_touch_updated_at ON %I', table_name, table_name);
    EXECUTE format(
      'CREATE TRIGGER %I_touch_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION staycare_touch_updated_at()',
      table_name,
      table_name
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION staycare_is_member(target_tenant UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM staycare_memberships m
    WHERE m.tenant_id = target_tenant
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION staycare_has_role(target_tenant UUID, allowed_roles staycare_role[])
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM staycare_memberships m
    WHERE m.tenant_id = target_tenant
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND m.role = ANY(allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION staycare_current_org_ids(target_tenant UUID)
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.organization_id
  FROM staycare_memberships m
  WHERE m.tenant_id = target_tenant
    AND m.user_id = auth.uid()
    AND m.status = 'active'
    AND m.organization_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION staycare_can_read_worker(target_worker UUID)
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
        OR staycare_has_role(w.tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent','auditor']::staycare_role[])
        OR (
          staycare_has_role(w.tenant_id, ARRAY['employer_admin']::staycare_role[])
          AND w.employer_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
        )
      )
  );
$$;

REVOKE ALL ON FUNCTION staycare_is_member(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_has_role(UUID, staycare_role[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_current_org_ids(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION staycare_can_read_worker(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION staycare_is_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION staycare_has_role(UUID, staycare_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION staycare_current_org_ids(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION staycare_can_read_worker(UUID) TO authenticated;

ALTER TABLE staycare_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_cost_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staycare_tenants_read ON staycare_tenants;
CREATE POLICY staycare_tenants_read ON staycare_tenants
FOR SELECT TO authenticated
USING (staycare_is_member(id));

DROP POLICY IF EXISTS staycare_orgs_read ON staycare_organizations;
CREATE POLICY staycare_orgs_read ON staycare_organizations
FOR SELECT TO authenticated
USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_orgs_manage ON staycare_organizations;
CREATE POLICY staycare_orgs_manage ON staycare_organizations
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_memberships_self_read ON staycare_memberships;
CREATE POLICY staycare_memberships_self_read ON staycare_memberships
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','auditor']::staycare_role[]));

DROP POLICY IF EXISTS staycare_memberships_admin_manage ON staycare_memberships;
CREATE POLICY staycare_memberships_admin_manage ON staycare_memberships
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]));

DROP POLICY IF EXISTS staycare_programs_read ON staycare_programs;
CREATE POLICY staycare_programs_read ON staycare_programs
FOR SELECT TO authenticated
USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_programs_manage ON staycare_programs;
CREATE POLICY staycare_programs_manage ON staycare_programs
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_workers_read ON staycare_workers;
CREATE POLICY staycare_workers_read ON staycare_workers
FOR SELECT TO authenticated
USING (staycare_can_read_worker(id));

DROP POLICY IF EXISTS staycare_workers_manage ON staycare_workers;
CREATE POLICY staycare_workers_manage ON staycare_workers
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_consents_read ON staycare_consents;
CREATE POLICY staycare_consents_read ON staycare_consents
FOR SELECT TO authenticated
USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_consents_worker_insert ON staycare_consents;
CREATE POLICY staycare_consents_worker_insert ON staycare_consents
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
  OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[])
);

DROP POLICY IF EXISTS staycare_documents_read ON staycare_documents;
CREATE POLICY staycare_documents_read ON staycare_documents
FOR SELECT TO authenticated
USING (
  staycare_can_read_worker(worker_id)
  AND NOT (
    staycare_has_role(tenant_id, ARRAY['employer_admin']::staycare_role[])
    AND document_type IN ('legal_consultation','medical','criminal','human_rights')
  )
);

DROP POLICY IF EXISTS staycare_documents_manage ON staycare_documents;
CREATE POLICY staycare_documents_manage ON staycare_documents
FOR ALL TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
)
WITH CHECK (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS staycare_templates_read ON staycare_workflow_templates;
CREATE POLICY staycare_templates_read ON staycare_workflow_templates
FOR SELECT TO authenticated
USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_templates_manage ON staycare_workflow_templates;
CREATE POLICY staycare_templates_manage ON staycare_workflow_templates
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_tasks_read ON staycare_tasks;
CREATE POLICY staycare_tasks_read ON staycare_tasks
FOR SELECT TO authenticated
USING (
  staycare_is_member(tenant_id)
  AND (worker_id IS NULL OR staycare_can_read_worker(worker_id))
);

DROP POLICY IF EXISTS staycare_tasks_manage ON staycare_tasks;
CREATE POLICY staycare_tasks_manage ON staycare_tasks
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent','specialist']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent','specialist']::staycare_role[]));

DROP POLICY IF EXISTS staycare_tickets_read ON staycare_tickets;
CREATE POLICY staycare_tickets_read ON staycare_tickets
FOR SELECT TO authenticated
USING (
  staycare_is_member(tenant_id)
  AND (worker_id IS NULL OR staycare_can_read_worker(worker_id))
);

DROP POLICY IF EXISTS staycare_tickets_create ON staycare_tickets;
CREATE POLICY staycare_tickets_create ON staycare_tickets
FOR INSERT TO authenticated
WITH CHECK (
  staycare_is_member(tenant_id)
  AND (worker_id IS NULL OR staycare_can_read_worker(worker_id))
);

DROP POLICY IF EXISTS staycare_tickets_update ON staycare_tickets;
CREATE POLICY staycare_tickets_update ON staycare_tickets
FOR UPDATE TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent','specialist']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','operator_manager','operator_agent','specialist']::staycare_role[]));

DROP POLICY IF EXISTS staycare_ticket_events_read ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_read ON staycare_ticket_events
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM staycare_tickets t WHERE t.id = ticket_id AND staycare_is_member(t.tenant_id)));

DROP POLICY IF EXISTS staycare_ticket_events_insert ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_insert ON staycare_ticket_events
FOR INSERT TO authenticated
WITH CHECK (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_plans_read ON staycare_plans;
CREATE POLICY staycare_plans_read ON staycare_plans
FOR SELECT TO authenticated
USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_plans_manage ON staycare_plans;
CREATE POLICY staycare_plans_manage ON staycare_plans
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]));

DROP POLICY IF EXISTS staycare_subscriptions_read ON staycare_subscriptions;
CREATE POLICY staycare_subscriptions_read ON staycare_subscriptions
FOR SELECT TO authenticated
USING (
  staycare_can_read_worker(worker_id)
  OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[])
);

DROP POLICY IF EXISTS staycare_subscriptions_manage ON staycare_subscriptions;
CREATE POLICY staycare_subscriptions_manage ON staycare_subscriptions
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]));

DROP POLICY IF EXISTS staycare_invoices_read ON staycare_invoices;
CREATE POLICY staycare_invoices_read ON staycare_invoices
FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[]));

DROP POLICY IF EXISTS staycare_invoices_manage ON staycare_invoices;
CREATE POLICY staycare_invoices_manage ON staycare_invoices
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]));

DROP POLICY IF EXISTS staycare_payments_read ON staycare_payments;
CREATE POLICY staycare_payments_read ON staycare_payments
FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','auditor']::staycare_role[]));

-- Payment writes and audit writes are intentionally service-role only.
-- No authenticated INSERT/UPDATE/DELETE policy is created for staycare_payments.

DROP POLICY IF EXISTS staycare_cost_entries_read ON staycare_cost_entries;
CREATE POLICY staycare_cost_entries_read ON staycare_cost_entries
FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[]));

DROP POLICY IF EXISTS staycare_cost_entries_manage ON staycare_cost_entries;
CREATE POLICY staycare_cost_entries_manage ON staycare_cost_entries
FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_audit_read ON staycare_audit_events;
CREATE POLICY staycare_audit_read ON staycare_audit_events
FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','auditor']::staycare_role[]));

-- No authenticated write policy for staycare_audit_events.
-- Append audit events through a trusted server action using the service role.

INSERT INTO staycare_tenants (slug, name, service_owner_name)
VALUES ('sejoong-staycare', 'Sejoong StayCare', '법무법인 세중')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO staycare_plans (
  tenant_id,
  code,
  name,
  annual_fee,
  monthly_fee,
  included_limits,
  service_area,
  terms_version
)
SELECT
  t.id,
  'annual-100',
  'StayCare 연간 통합관리 멤버십',
  1000000,
  83333,
  '{"consultations":12,"specialist_reviews":4,"interpretation_minutes":180,"field_visits":2,"field_visit_minutes":120}'::jsonb,
  '{"remote":"nationwide","included_worksites":1,"included_radius_km":30}'::jsonb,
  'v1-draft'
FROM staycare_tenants t
WHERE t.slug = 'sejoong-staycare'
ON CONFLICT (tenant_id, code) DO NOTHING;

COMMENT ON TABLE staycare_programs IS 'Cohort-level program such as the Sri Lanka 200-member initiative.';
COMMENT ON TABLE staycare_workers IS 'Worker lifecycle profile. Full passport/registration originals belong in private Storage, not plain columns.';
COMMENT ON TABLE staycare_documents IS 'Private document metadata. Never expose storage_path through a public URL.';
COMMENT ON TABLE staycare_payments IS 'Provider references only. Never store card number or CVC.';
COMMENT ON TABLE staycare_audit_events IS 'Append-only audit evidence written by trusted server/service-role code.';
