-- Sejoong StayCare tenant, organization, workflow and subscription foundation
-- Phase 1 target: 20-50 member pilot with strict tenant and role isolation.
-- This migration intentionally does not connect a real PG, government system or legal case automation.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Shared timestamp trigger
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.staycare_set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ---------------------------------------------------------------------------
-- Tenant and organization model
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staycare_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  principal_organization_name TEXT NOT NULL DEFAULT '법무법인 세중',
  operator_organization_name TEXT,
  status TEXT NOT NULL DEFAULT 'pilot'
    CHECK (status IN ('pilot', 'active', 'paused', 'closed')),
  default_locale TEXT NOT NULL DEFAULT 'ko',
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.staycare_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  organization_type TEXT NOT NULL
    CHECK (organization_type IN ('principal', 'operator', 'employer', 'partner', 'sponsor')),
  business_number TEXT,
  country_code TEXT NOT NULL DEFAULT 'KR',
  region TEXT,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('onboarding', 'active', 'paused', 'closed')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, name)
);

CREATE TABLE IF NOT EXISTS public.staycare_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.staycare_organizations(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'super_admin',
    'sejoong_admin',
    'sejoong_lawyer',
    'operator_manager',
    'operator_agent',
    'employer_admin',
    'partner_specialist',
    'worker',
    'auditor'
  )),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activated_at TIMESTAMPTZ,
  last_access_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, user_id, role, organization_id)
);

-- ---------------------------------------------------------------------------
-- Worker, consent and document domain
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staycare_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  profile_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employer_organization_id UUID REFERENCES public.staycare_organizations(id) ON DELETE SET NULL,
  external_ref TEXT NOT NULL,
  legal_name TEXT NOT NULL,
  english_name TEXT,
  nationality_code TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'undisclosed')),
  phone TEXT,
  email TEXT,
  visa_type TEXT CHECK (visa_type IN ('E-9', 'E-7', 'E-10', 'E-7-4', 'other')),
  visa_expires_at DATE,
  passport_expires_at DATE,
  passport_last4 TEXT,
  lifecycle_status TEXT NOT NULL DEFAULT 'invited'
    CHECK (lifecycle_status IN ('invited', 'onboarding', 'active', 'paused', 'offboarding', 'closed')),
  foreigner_registration_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (foreigner_registration_status IN ('not_started', 'scheduled', 'submitted', 'issued')),
  phone_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (phone_status IN ('not_started', 'temporary', 'active')),
  bank_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (bank_status IN ('not_started', 'prepared', 'active')),
  insurance_status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (insurance_status IN ('not_started', 'partial', 'complete')),
  arrival_date DATE,
  worksite TEXT,
  job_title TEXT,
  accommodation TEXT,
  coordinator_membership_id UUID REFERENCES public.staycare_memberships(id) ON DELETE SET NULL,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  risk_label TEXT NOT NULL DEFAULT 'low' CHECK (risk_label IN ('low', 'medium', 'high')),
  checklist_progress INTEGER NOT NULL DEFAULT 0 CHECK (checklist_progress BETWEEN 0 AND 100),
  tags TEXT[] NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, external_ref)
);

CREATE TABLE IF NOT EXISTS public.staycare_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.staycare_workers(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'terms',
    'privacy',
    'sensitive_information',
    'unique_identifier',
    'third_party_provision',
    'processing_outsourcing',
    'cross_border_transfer',
    'marketing',
    'location_emergency'
  )),
  document_version TEXT NOT NULL,
  locale TEXT NOT NULL,
  decision TEXT NOT NULL CHECK (decision IN ('accepted', 'rejected', 'withdrawn')),
  ip_address INET,
  user_agent TEXT,
  captured_by UUID REFERENCES auth.users(id),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.staycare_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.staycare_workers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'passport',
    'visa',
    'foreigner_registration',
    'employment_contract',
    'accommodation_proof',
    'insurance',
    'banking',
    'medical',
    'education',
    'police_clearance',
    'other'
  )),
  classification TEXT NOT NULL DEFAULT 'confidential'
    CHECK (classification IN ('internal', 'confidential', 'sensitive', 'restricted')),
  storage_path TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes >= 0),
  sha256 TEXT,
  status TEXT NOT NULL DEFAULT 'uploaded'
    CHECK (status IN ('uploaded', 'review_required', 'verified', 'rejected', 'expired', 'deleted')),
  issued_at DATE,
  expires_at DATE,
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Workflow, task and ticket domain
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staycare_workflow_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT,
  visa_type TEXT,
  industry TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  definition JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, code, version)
);

CREATE TABLE IF NOT EXISTS public.staycare_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.staycare_workers(id) ON DELETE CASCADE,
  workflow_template_id UUID REFERENCES public.staycare_workflow_templates(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES public.staycare_tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'arrival', 'immigration', 'telecom', 'banking', 'insurance',
    'accommodation', 'employment', 'legal', 'medical', 'education', 'other'
  )),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'assigned', 'in_progress', 'waiting_member', 'waiting_partner',
    'review_required', 'completed', 'cancelled'
  )),
  priority TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  due_at TIMESTAMPTZ,
  sla_hours INTEGER NOT NULL DEFAULT 24 CHECK (sla_hours > 0),
  assigned_membership_id UUID REFERENCES public.staycare_memberships(id) ON DELETE SET NULL,
  assigned_organization_id UUID REFERENCES public.staycare_organizations(id) ON DELETE SET NULL,
  evidence_required BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.staycare_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.staycare_workers(id) ON DELETE CASCADE,
  opened_by UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'legal', 'immigration', 'labor', 'medical', 'accommodation',
    'communication', 'living', 'safety', 'other'
  )),
  priority TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P0', 'P1', 'P2', 'P3')),
  status TEXT NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'triaged', 'in_progress', 'waiting', 'resolved', 'closed')),
  owner_membership_id UUID REFERENCES public.staycare_memberships(id) ON DELETE SET NULL,
  assigned_organization_id UUID REFERENCES public.staycare_organizations(id) ON DELETE SET NULL,
  escalation_target TEXT,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Subscription and partner service domain
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staycare_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES public.staycare_workers(id) ON DELETE CASCADE,
  payer_type TEXT NOT NULL CHECK (payer_type IN ('worker', 'employer', 'sponsor')),
  payer_organization_id UUID REFERENCES public.staycare_organizations(id) ON DELETE SET NULL,
  plan_code TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')),
  amount_krw INTEGER NOT NULL CHECK (amount_krw >= 0),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN (
    'trial', 'active', 'past_due', 'grace_period', 'suspended', 'cancelled'
  )),
  included_support_minutes INTEGER NOT NULL DEFAULT 0 CHECK (included_support_minutes >= 0),
  used_support_minutes INTEGER NOT NULL DEFAULT 0 CHECK (used_support_minutes >= 0),
  starts_at DATE NOT NULL,
  renews_at DATE,
  cancelled_at TIMESTAMPTZ,
  payment_provider_customer_ref TEXT,
  payment_provider_subscription_ref TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.staycare_partner_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.staycare_organizations(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'legal', 'immigration', 'labor', 'translation', 'telecom',
    'medical', 'accommodation', 'transport', 'education', 'other'
  )),
  name TEXT NOT NULL,
  region TEXT,
  locale_support TEXT[] NOT NULL DEFAULT '{}',
  sla_hours INTEGER NOT NULL DEFAULT 24 CHECK (sla_hours > 0),
  pricing_model TEXT NOT NULL DEFAULT 'quote'
    CHECK (pricing_model IN ('included', 'fixed', 'hourly', 'per_case', 'quote')),
  base_price_krw INTEGER CHECK (base_price_krw >= 0),
  status TEXT NOT NULL DEFAULT 'onboarding'
    CHECK (status IN ('onboarding', 'active', 'paused', 'closed')),
  credentials_verified_at TIMESTAMPTZ,
  credentials_verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- ---------------------------------------------------------------------------
-- Append-only audit domain
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.staycare_audit_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.staycare_tenants(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_membership_id UUID REFERENCES public.staycare_memberships(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  worker_id UUID REFERENCES public.staycare_workers(id) ON DELETE SET NULL,
  reason TEXT,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  ip_address INET,
  user_agent TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_staycare_organizations_tenant
  ON public.staycare_organizations(tenant_id, organization_type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_memberships_user
  ON public.staycare_memberships(user_id, tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_memberships_org
  ON public.staycare_memberships(organization_id, role, status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_tenant_status
  ON public.staycare_workers(tenant_id, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_employer
  ON public.staycare_workers(employer_organization_id, lifecycle_status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_expiry
  ON public.staycare_workers(tenant_id, visa_expires_at, passport_expires_at);
CREATE INDEX IF NOT EXISTS idx_staycare_consents_worker
  ON public.staycare_consents(worker_id, consent_type, captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_staycare_documents_worker
  ON public.staycare_documents(worker_id, document_type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_documents_expiry
  ON public.staycare_documents(tenant_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_staycare_tasks_board
  ON public.staycare_tasks(tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_staycare_tasks_assignee
  ON public.staycare_tasks(assigned_membership_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_staycare_tickets_queue
  ON public.staycare_tickets(tenant_id, priority, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staycare_subscriptions_status
  ON public.staycare_subscriptions(tenant_id, status, renews_at);
CREATE INDEX IF NOT EXISTS idx_staycare_partner_services_lookup
  ON public.staycare_partner_services(tenant_id, service_type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_audit_tenant_time
  ON public.staycare_audit_events(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staycare_audit_worker_time
  ON public.staycare_audit_events(worker_id, created_at DESC);

-- ---------------------------------------------------------------------------
-- Updated-at triggers
-- ---------------------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_staycare_tenants_updated_at ON public.staycare_tenants;
CREATE TRIGGER trg_staycare_tenants_updated_at
  BEFORE UPDATE ON public.staycare_tenants
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_organizations_updated_at ON public.staycare_organizations;
CREATE TRIGGER trg_staycare_organizations_updated_at
  BEFORE UPDATE ON public.staycare_organizations
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_memberships_updated_at ON public.staycare_memberships;
CREATE TRIGGER trg_staycare_memberships_updated_at
  BEFORE UPDATE ON public.staycare_memberships
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_workers_updated_at ON public.staycare_workers;
CREATE TRIGGER trg_staycare_workers_updated_at
  BEFORE UPDATE ON public.staycare_workers
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_documents_updated_at ON public.staycare_documents;
CREATE TRIGGER trg_staycare_documents_updated_at
  BEFORE UPDATE ON public.staycare_documents
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_workflow_templates_updated_at ON public.staycare_workflow_templates;
CREATE TRIGGER trg_staycare_workflow_templates_updated_at
  BEFORE UPDATE ON public.staycare_workflow_templates
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_tasks_updated_at ON public.staycare_tasks;
CREATE TRIGGER trg_staycare_tasks_updated_at
  BEFORE UPDATE ON public.staycare_tasks
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_tickets_updated_at ON public.staycare_tickets;
CREATE TRIGGER trg_staycare_tickets_updated_at
  BEFORE UPDATE ON public.staycare_tickets
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_subscriptions_updated_at ON public.staycare_subscriptions;
CREATE TRIGGER trg_staycare_subscriptions_updated_at
  BEFORE UPDATE ON public.staycare_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

DROP TRIGGER IF EXISTS trg_staycare_partner_services_updated_at ON public.staycare_partner_services;
CREATE TRIGGER trg_staycare_partner_services_updated_at
  BEFORE UPDATE ON public.staycare_partner_services
  FOR EACH ROW EXECUTE FUNCTION public.staycare_set_updated_at();

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- SECURITY DEFINER is required to avoid membership-policy recursion.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.staycare_has_any_role(
  target_tenant UUID,
  allowed_roles TEXT[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staycare_memberships m
    WHERE m.tenant_id = target_tenant
      AND m.user_id = auth.uid()
      AND m.status = 'active'
      AND m.role = ANY (allowed_roles)
  );
$$;

CREATE OR REPLACE FUNCTION public.staycare_has_membership(target_tenant UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staycare_memberships m
    WHERE m.tenant_id = target_tenant
      AND m.user_id = auth.uid()
      AND m.status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.staycare_can_access_worker(target_worker UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staycare_workers w
    WHERE w.id = target_worker
      AND (
        w.profile_user_id = auth.uid()
        OR EXISTS (
          SELECT 1
          FROM public.staycare_memberships m
          WHERE m.tenant_id = w.tenant_id
            AND m.user_id = auth.uid()
            AND m.status = 'active'
            AND (
              m.role IN (
                'super_admin', 'sejoong_admin', 'sejoong_lawyer',
                'operator_manager', 'operator_agent', 'auditor'
              )
              OR (
                m.role = 'employer_admin'
                AND m.organization_id = w.employer_organization_id
              )
            )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.staycare_current_user_organization(target_tenant UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.organization_id
  FROM public.staycare_memberships m
  WHERE m.tenant_id = target_tenant
    AND m.user_id = auth.uid()
    AND m.status = 'active'
    AND m.organization_id IS NOT NULL
  ORDER BY m.created_at
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.staycare_has_any_role(UUID, TEXT[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staycare_has_membership(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staycare_can_access_worker(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.staycare_current_user_organization(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.staycare_has_any_role(UUID, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staycare_has_membership(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staycare_can_access_worker(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.staycare_current_user_organization(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

ALTER TABLE public.staycare_tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_partner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staycare_audit_events ENABLE ROW LEVEL SECURITY;

-- Tenant
DROP POLICY IF EXISTS "staycare tenant read" ON public.staycare_tenants;
CREATE POLICY "staycare tenant read"
  ON public.staycare_tenants FOR SELECT TO authenticated
  USING (public.staycare_has_membership(id));

DROP POLICY IF EXISTS "staycare tenant update" ON public.staycare_tenants;
CREATE POLICY "staycare tenant update"
  ON public.staycare_tenants FOR UPDATE TO authenticated
  USING (public.staycare_has_any_role(id, ARRAY['super_admin', 'sejoong_admin']))
  WITH CHECK (public.staycare_has_any_role(id, ARRAY['super_admin', 'sejoong_admin']));

-- Organization
DROP POLICY IF EXISTS "staycare organization read" ON public.staycare_organizations;
CREATE POLICY "staycare organization read"
  ON public.staycare_organizations FOR SELECT TO authenticated
  USING (public.staycare_has_membership(tenant_id));

DROP POLICY IF EXISTS "staycare organization manage" ON public.staycare_organizations;
CREATE POLICY "staycare organization manage"
  ON public.staycare_organizations FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']));

-- Membership
DROP POLICY IF EXISTS "staycare membership read" ON public.staycare_memberships;
CREATE POLICY "staycare membership read"
  ON public.staycare_memberships FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'auditor'])
  );

DROP POLICY IF EXISTS "staycare membership manage" ON public.staycare_memberships;
CREATE POLICY "staycare membership manage"
  ON public.staycare_memberships FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']));

-- Worker
DROP POLICY IF EXISTS "staycare worker read" ON public.staycare_workers;
CREATE POLICY "staycare worker read"
  ON public.staycare_workers FOR SELECT TO authenticated
  USING (public.staycare_can_access_worker(id));

DROP POLICY IF EXISTS "staycare worker insert" ON public.staycare_workers;
CREATE POLICY "staycare worker insert"
  ON public.staycare_workers FOR INSERT TO authenticated
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'operator_agent']));

DROP POLICY IF EXISTS "staycare worker update" ON public.staycare_workers;
CREATE POLICY "staycare worker update"
  ON public.staycare_workers FOR UPDATE TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'operator_agent']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'operator_agent']));

DROP POLICY IF EXISTS "staycare worker delete" ON public.staycare_workers;
CREATE POLICY "staycare worker delete"
  ON public.staycare_workers FOR DELETE TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin']));

-- Consent is append-only for authenticated users who can access the worker.
DROP POLICY IF EXISTS "staycare consent read" ON public.staycare_consents;
CREATE POLICY "staycare consent read"
  ON public.staycare_consents FOR SELECT TO authenticated
  USING (public.staycare_can_access_worker(worker_id));

DROP POLICY IF EXISTS "staycare consent insert" ON public.staycare_consents;
CREATE POLICY "staycare consent insert"
  ON public.staycare_consents FOR INSERT TO authenticated
  WITH CHECK (public.staycare_can_access_worker(worker_id));

-- Document metadata. Raw file access must additionally use short-lived signed URLs.
DROP POLICY IF EXISTS "staycare document read" ON public.staycare_documents;
CREATE POLICY "staycare document read"
  ON public.staycare_documents FOR SELECT TO authenticated
  USING (public.staycare_can_access_worker(worker_id));

DROP POLICY IF EXISTS "staycare document insert" ON public.staycare_documents;
CREATE POLICY "staycare document insert"
  ON public.staycare_documents FOR INSERT TO authenticated
  WITH CHECK (
    public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent'])
    OR EXISTS (
      SELECT 1 FROM public.staycare_workers w
      WHERE w.id = worker_id AND w.profile_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "staycare document update" ON public.staycare_documents;
CREATE POLICY "staycare document update"
  ON public.staycare_documents FOR UPDATE TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent']));

DROP POLICY IF EXISTS "staycare document delete" ON public.staycare_documents;
CREATE POLICY "staycare document delete"
  ON public.staycare_documents FOR DELETE TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin']));

-- Workflow template
DROP POLICY IF EXISTS "staycare workflow template read" ON public.staycare_workflow_templates;
CREATE POLICY "staycare workflow template read"
  ON public.staycare_workflow_templates FOR SELECT TO authenticated
  USING (public.staycare_has_membership(tenant_id));

DROP POLICY IF EXISTS "staycare workflow template manage" ON public.staycare_workflow_templates;
CREATE POLICY "staycare workflow template manage"
  ON public.staycare_workflow_templates FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']));

-- Task
DROP POLICY IF EXISTS "staycare task read" ON public.staycare_tasks;
CREATE POLICY "staycare task read"
  ON public.staycare_tasks FOR SELECT TO authenticated
  USING (
    public.staycare_can_access_worker(worker_id)
    OR assigned_membership_id IN (
      SELECT m.id FROM public.staycare_memberships m
      WHERE m.user_id = auth.uid() AND m.status = 'active'
    )
    OR assigned_organization_id = public.staycare_current_user_organization(tenant_id)
  );

DROP POLICY IF EXISTS "staycare task manage" ON public.staycare_tasks;
CREATE POLICY "staycare task manage"
  ON public.staycare_tasks FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent']));

-- Ticket
DROP POLICY IF EXISTS "staycare ticket read" ON public.staycare_tickets;
CREATE POLICY "staycare ticket read"
  ON public.staycare_tickets FOR SELECT TO authenticated
  USING (
    public.staycare_can_access_worker(worker_id)
    OR opened_by = auth.uid()
    OR owner_membership_id IN (
      SELECT m.id FROM public.staycare_memberships m
      WHERE m.user_id = auth.uid() AND m.status = 'active'
    )
    OR assigned_organization_id = public.staycare_current_user_organization(tenant_id)
  );

DROP POLICY IF EXISTS "staycare ticket insert" ON public.staycare_tickets;
CREATE POLICY "staycare ticket insert"
  ON public.staycare_tickets FOR INSERT TO authenticated
  WITH CHECK (public.staycare_can_access_worker(worker_id));

DROP POLICY IF EXISTS "staycare ticket update" ON public.staycare_tickets;
CREATE POLICY "staycare ticket update"
  ON public.staycare_tickets FOR UPDATE TO authenticated
  USING (
    public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'sejoong_lawyer', 'operator_manager', 'operator_agent'])
    OR owner_membership_id IN (
      SELECT m.id FROM public.staycare_memberships m
      WHERE m.user_id = auth.uid() AND m.status = 'active'
    )
    OR assigned_organization_id = public.staycare_current_user_organization(tenant_id)
  )
  WITH CHECK (public.staycare_has_membership(tenant_id));

-- Subscription
DROP POLICY IF EXISTS "staycare subscription read" ON public.staycare_subscriptions;
CREATE POLICY "staycare subscription read"
  ON public.staycare_subscriptions FOR SELECT TO authenticated
  USING (
    public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'auditor'])
    OR EXISTS (
      SELECT 1 FROM public.staycare_workers w
      WHERE w.id = worker_id AND w.profile_user_id = auth.uid()
    )
    OR payer_organization_id = public.staycare_current_user_organization(tenant_id)
  );

DROP POLICY IF EXISTS "staycare subscription manage" ON public.staycare_subscriptions;
CREATE POLICY "staycare subscription manage"
  ON public.staycare_subscriptions FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin']));

-- Partner service catalogue
DROP POLICY IF EXISTS "staycare partner service read" ON public.staycare_partner_services;
CREATE POLICY "staycare partner service read"
  ON public.staycare_partner_services FOR SELECT TO authenticated
  USING (public.staycare_has_membership(tenant_id));

DROP POLICY IF EXISTS "staycare partner service manage" ON public.staycare_partner_services;
CREATE POLICY "staycare partner service manage"
  ON public.staycare_partner_services FOR ALL TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']))
  WITH CHECK (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager']));

-- Audit is append-only through trusted server/service-role code.
DROP POLICY IF EXISTS "staycare audit read" ON public.staycare_audit_events;
CREATE POLICY "staycare audit read"
  ON public.staycare_audit_events FOR SELECT TO authenticated
  USING (public.staycare_has_any_role(tenant_id, ARRAY['super_admin', 'sejoong_admin', 'operator_manager', 'auditor']));

-- ---------------------------------------------------------------------------
-- Grants. RLS remains the authorization boundary for authenticated users.
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_tenants TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_memberships TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_workers TO authenticated;
GRANT SELECT, INSERT ON public.staycare_consents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_workflow_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staycare_tickets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_subscriptions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staycare_partner_services TO authenticated;
GRANT SELECT ON public.staycare_audit_events TO authenticated;

COMMENT ON TABLE public.staycare_workers IS
  'Foreign-worker operational profile. Full passport/ARC images must remain in private storage, not columns.';
COMMENT ON TABLE public.staycare_audit_events IS
  'Append-only audit evidence. Inserts should be performed by trusted server or service-role code.';
COMMENT ON COLUMN public.staycare_subscriptions.payment_provider_customer_ref IS
  'External provider reference only. Never store raw card number or CVC.';
