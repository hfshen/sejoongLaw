-- Sejoong StayCare V1
-- Sri Lanka-to-Korea worker lifecycle, one-stop services, provider integrations and audit foundation.
-- Apply to a development/preview Supabase project before production.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_org_type') THEN
    CREATE TYPE staycare_org_type AS ENUM ('sejoong', 'operator', 'employer', 'training_institution', 'sending_agency', 'provider', 'public_partner');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_role') THEN
    CREATE TYPE staycare_role AS ENUM (
      'sejoong_admin',
      'sejoong_lawyer',
      'immigration_manager',
      'operator_manager',
      'operator_agent',
      'employer_admin',
      'institution_admin',
      'provider_agent',
      'worker',
      'auditor'
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_worker_status') THEN
    CREATE TYPE staycare_worker_status AS ENUM ('invited', 'preparing', 'official_process', 'pre_departure', 'arrived', 'settling', 'active', 'renewal', 'returning', 'returned', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_phase') THEN
    CREATE TYPE staycare_phase AS ENUM ('prepare', 'official', 'pre_departure', 'arrival', 'settlement', 'living', 'renewal', 'return');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_step_status') THEN
    CREATE TYPE staycare_step_status AS ENUM ('not_started', 'ready', 'in_progress', 'waiting', 'completed', 'attention', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_service_status') THEN
    CREATE TYPE staycare_service_status AS ENUM ('draft', 'active', 'paused', 'retired');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_application_status') THEN
    CREATE TYPE staycare_application_status AS ENUM ('draft', 'submitted', 'reviewing', 'waiting_worker', 'waiting_authority', 'waiting_provider', 'approved', 'fulfilled', 'rejected', 'cancelled');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_priority') THEN
    CREATE TYPE staycare_priority AS ENUM ('P0', 'P1', 'P2', 'P3');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_ticket_status') THEN
    CREATE TYPE staycare_ticket_status AS ENUM ('open', 'triaged', 'assigned', 'in_progress', 'waiting', 'resolved', 'closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_provider_kind') THEN
    CREATE TYPE staycare_provider_kind AS ENUM ('telecom', 'bank', 'remittance', 'delivery', 'insurance', 'healthcare', 'housing', 'transport', 'translation', 'other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staycare_order_status') THEN
    CREATE TYPE staycare_order_status AS ENUM ('draft', 'identity_required', 'ordered', 'scheduled', 'ready_for_pickup', 'shipped', 'delivered', 'activated', 'failed', 'cancelled', 'closed');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS staycare_tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  name TEXT NOT NULL,
  service_owner_name TEXT NOT NULL DEFAULT '법무법인 세중',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
  default_language TEXT NOT NULL DEFAULT 'ko' CHECK (default_language IN ('ko', 'en', 'si')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Seoul',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  type staycare_org_type NOT NULL,
  name TEXT NOT NULL,
  country_code TEXT NOT NULL DEFAULT 'KR',
  registration_number TEXT,
  license_type TEXT,
  license_number TEXT,
  service_regions TEXT[] NOT NULL DEFAULT '{}',
  supported_languages TEXT[] NOT NULL DEFAULT '{}',
  primary_contact_name TEXT,
  primary_contact_email TEXT,
  primary_contact_phone TEXT,
  status TEXT NOT NULL DEFAULT 'onboarding' CHECK (status IN ('onboarding', 'active', 'suspended', 'closed')),
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
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'suspended', 'revoked')),
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ,
  activated_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, organization_id, user_id, role)
);

CREATE TABLE IF NOT EXISTS staycare_workers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employer_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  sending_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  training_organization_id UUID REFERENCES staycare_organizations(id) ON DELETE SET NULL,
  member_no TEXT NOT NULL,
  full_name TEXT NOT NULL,
  full_name_en TEXT,
  date_of_birth DATE,
  nationality_code TEXT NOT NULL DEFAULT 'LK',
  preferred_language TEXT NOT NULL DEFAULT 'si' CHECK (preferred_language IN ('ko', 'en', 'si')),
  preferred_contact_channel TEXT NOT NULL DEFAULT 'app' CHECK (preferred_contact_channel IN ('app', 'sms', 'email', 'phone')),
  visa_type TEXT,
  occupation TEXT,
  status staycare_worker_status NOT NULL DEFAULT 'invited',
  current_phase staycare_phase NOT NULL DEFAULT 'prepare',
  official_reference_no TEXT,
  expected_arrival_date DATE,
  arrived_at TIMESTAMPTZ,
  visa_expires_at DATE,
  passport_expires_at DATE,
  passport_last4 TEXT CHECK (passport_last4 IS NULL OR length(passport_last4) BETWEEN 2 AND 8),
  foreigner_registration_status TEXT CHECK (foreigner_registration_status IN ('not_started', 'scheduled', 'submitted', 'issued', 'not_applicable')),
  phone_number TEXT,
  accommodation_summary TEXT,
  emergency_contact_summary TEXT,
  risk_score INTEGER NOT NULL DEFAULT 0 CHECK (risk_score BETWEEN 0 AND 100),
  profile_completion INTEGER NOT NULL DEFAULT 0 CHECK (profile_completion BETWEEN 0 AND 100),
  assigned_department TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  next_action TEXT,
  next_action_due_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, member_no)
);

CREATE TABLE IF NOT EXISTS staycare_journey_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name JSONB NOT NULL,
  origin_country_code TEXT NOT NULL DEFAULT 'LK',
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

CREATE TABLE IF NOT EXISTS staycare_journey_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  template_id UUID REFERENCES staycare_journey_templates(id) ON DELETE SET NULL,
  template_version INTEGER,
  current_phase staycare_phase NOT NULL DEFAULT 'prepare',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (worker_id, status)
);

CREATE TABLE IF NOT EXISTS staycare_journey_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  journey_id UUID NOT NULL REFERENCES staycare_journey_instances(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  step_code TEXT NOT NULL,
  phase staycare_phase NOT NULL,
  title JSONB NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
  responsibility TEXT[] NOT NULL DEFAULT '{}',
  official_process BOOLEAN NOT NULL DEFAULT false,
  required BOOLEAN NOT NULL DEFAULT false,
  status staycare_step_status NOT NULL DEFAULT 'not_started',
  due_at TIMESTAMPTZ,
  assigned_organization_id UUID REFERENCES staycare_organizations(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  official_reference_url TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (journey_id, step_code)
);

CREATE TABLE IF NOT EXISTS staycare_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN ('terms', 'privacy', 'sensitive', 'third_party', 'outsourcing', 'overseas_transfer', 'ai', 'marketing')),
  document_version TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('ko', 'en', 'si')),
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
  status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'scanning', 'review_required', 'approved', 'rejected', 'expired', 'deletion_pending', 'deleted')),
  rejection_reason TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  retention_until DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, storage_bucket, storage_path)
);

CREATE TABLE IF NOT EXISTS staycare_service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  category TEXT NOT NULL,
  name JSONB NOT NULL,
  description JSONB NOT NULL,
  available_from_phase staycare_phase NOT NULL,
  ownership TEXT[] NOT NULL DEFAULT '{}',
  delivery_modes TEXT[] NOT NULL DEFAULT '{}',
  required_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_description JSONB NOT NULL DEFAULT '{}'::jsonb,
  integration_mode TEXT NOT NULL CHECK (integration_mode IN ('official_link', 'manual_review', 'partner_api', 'internal')),
  legal_boundary JSONB NOT NULL DEFAULT '{}'::jsonb,
  status staycare_service_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, code)
);

CREATE TABLE IF NOT EXISTS staycare_provider_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES staycare_organizations(id) ON DELETE CASCADE,
  kind staycare_provider_kind NOT NULL,
  provider_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'research' CHECK (status IN ('research', 'contracting', 'sandbox', 'connected', 'paused', 'terminated')),
  auth_type TEXT CHECK (auth_type IN ('none', 'api_key', 'oauth2', 'mutual_tls', 'signed_webhook', 'manual_portal')),
  encrypted_credentials_ref TEXT,
  webhook_secret_ref TEXT,
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  privacy_contract_version TEXT,
  service_contract_version TEXT,
  last_health_check_at TIMESTAMPTZ,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, provider_code)
);

CREATE TABLE IF NOT EXISTS staycare_service_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES staycare_service_catalog(id),
  provider_connection_id UUID REFERENCES staycare_provider_connections(id) ON DELETE SET NULL,
  application_no TEXT NOT NULL,
  status staycare_application_status NOT NULL DEFAULT 'draft',
  language TEXT NOT NULL DEFAULT 'si' CHECK (language IN ('ko', 'en', 'si')),
  submitted_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  shared_document_ids UUID[] NOT NULL DEFAULT '{}',
  worker_consent_id UUID REFERENCES staycare_consents(id),
  assigned_organization_id UUID REFERENCES staycare_organizations(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  submitted_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ,
  rejected_reason TEXT,
  external_reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, application_no)
);

CREATE TABLE IF NOT EXISTS staycare_application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES staycare_service_applications(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  visible_to_worker BOOLEAN NOT NULL DEFAULT true,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_telecom_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  application_id UUID NOT NULL UNIQUE REFERENCES staycare_service_applications(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  sim_type TEXT NOT NULL CHECK (sim_type IN ('esim', 'physical_sim', 'resident_plan')),
  device_model TEXT,
  imei_last6 TEXT,
  device_compatible BOOLEAN,
  identity_method TEXT CHECK (identity_method IN ('passport', 'foreigner_registration', 'provider_in_person')),
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('digital', 'airport', 'accommodation', 'branch')),
  arrival_airport TEXT,
  arrival_terminal TEXT,
  pickup_location TEXT,
  delivery_address_summary TEXT,
  order_status staycare_order_status NOT NULL DEFAULT 'draft',
  korean_phone_number TEXT,
  activation_reference TEXT,
  activated_at TIMESTAMPTZ,
  termination_requested_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES staycare_service_applications(id) ON DELETE SET NULL,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE SET NULL,
  provider_connection_id UUID REFERENCES staycare_provider_connections(id) ON DELETE SET NULL,
  delivery_type TEXT NOT NULL CHECK (delivery_type IN ('airport_pickup', 'bulk_handover', 'accommodation_delivery', 'return_pickup')),
  item_type TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  address_summary TEXT,
  scheduled_at TIMESTAMPTZ,
  status staycare_order_status NOT NULL DEFAULT 'draft',
  tracking_reference TEXT,
  proof_of_delivery JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_remittance_beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  relationship TEXT,
  country_code TEXT NOT NULL DEFAULT 'LK',
  bank_name TEXT,
  bank_branch TEXT,
  account_masked TEXT,
  encrypted_provider_token_ref TEXT,
  verification_status TEXT NOT NULL DEFAULT 'not_started' CHECK (verification_status IN ('not_started', 'submitted', 'verified', 'rejected', 'expired')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_remittance_intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES staycare_service_applications(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  beneficiary_id UUID REFERENCES staycare_remittance_beneficiaries(id) ON DELETE SET NULL,
  provider_connection_id UUID REFERENCES staycare_provider_connections(id) ON DELETE SET NULL,
  source_currency TEXT NOT NULL DEFAULT 'KRW',
  source_amount NUMERIC(18,2) NOT NULL CHECK (source_amount > 0),
  destination_currency TEXT NOT NULL DEFAULT 'LKR',
  quoted_rate NUMERIC(18,8),
  quoted_fee NUMERIC(18,2),
  quoted_destination_amount NUMERIC(18,2),
  quote_expires_at TIMESTAMPTZ,
  purpose_code TEXT,
  status TEXT NOT NULL DEFAULT 'quote_requested' CHECK (status IN ('quote_requested', 'quoted', 'worker_confirmed', 'provider_processing', 'paid_out', 'failed', 'cancelled', 'refunded')),
  provider_transfer_reference TEXT,
  receipt_document_id UUID REFERENCES staycare_documents(id) ON DELETE SET NULL,
  paid_out_at TIMESTAMPTZ,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_immigration_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  application_id UUID REFERENCES staycare_service_applications(id) ON DELETE SET NULL,
  worker_id UUID NOT NULL REFERENCES staycare_workers(id) ON DELETE CASCADE,
  case_type TEXT NOT NULL CHECK (case_type IN ('foreigner_registration', 'stay_extension', 'address_change', 'workplace_change', 'visa_change', 'departure', 'certificate', 'other')),
  official_authority TEXT,
  official_reference TEXT,
  deadline_at TIMESTAMPTZ,
  appointment_at TIMESTAMPTZ,
  status staycare_application_status NOT NULL DEFAULT 'draft',
  required_documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  submitted_at TIMESTAMPTZ,
  decision_at TIMESTAMPTZ,
  decision_summary TEXT,
  assigned_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_ai_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE CASCADE,
  source_language TEXT NOT NULL CHECK (source_language IN ('ko', 'en', 'si')),
  target_language TEXT NOT NULL CHECK (target_language IN ('ko', 'en', 'si')),
  mode TEXT NOT NULL CHECK (mode IN ('translate', 'guide')),
  context TEXT NOT NULL DEFAULT 'general',
  consent_id UUID REFERENCES staycare_consents(id),
  model_name TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS staycare_ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES staycare_ai_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content_redacted TEXT NOT NULL,
  sensitive_identifier_blocked BOOLEAN NOT NULL DEFAULT false,
  token_usage JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE SET NULL,
  application_id UUID REFERENCES staycare_service_applications(id) ON DELETE SET NULL,
  ticket_no TEXT NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  priority staycare_priority NOT NULL DEFAULT 'P3',
  status staycare_ticket_status NOT NULL DEFAULT 'open',
  intake_channel TEXT NOT NULL DEFAULT 'app' CHECK (intake_channel IN ('app', 'phone', 'email', 'in_person', 'system')),
  description TEXT,
  assigned_department TEXT,
  assigned_organization_id UUID REFERENCES staycare_organizations(id),
  assigned_user_id UUID REFERENCES auth.users(id),
  first_response_due_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolution_due_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  worker_visible_summary TEXT,
  employer_visible_summary TEXT,
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
  worker_visible BOOLEAN NOT NULL DEFAULT true,
  employer_visible BOOLEAN NOT NULL DEFAULT false,
  body JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID REFERENCES staycare_workers(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('in_app', 'sms', 'email', 'push')),
  language TEXT NOT NULL CHECK (language IN ('ko', 'en', 'si')),
  template_code TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'failed', 'cancelled')),
  provider_reference TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS staycare_return_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES staycare_tenants(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL UNIQUE REFERENCES staycare_workers(id) ON DELETE CASCADE,
  expected_return_date DATE,
  contract_end_date DATE,
  final_salary_status TEXT,
  severance_status TEXT,
  insurance_claim_status TEXT,
  final_remittance_status TEXT,
  bank_closure_status TEXT,
  telecom_closure_status TEXT,
  accommodation_checkout_status TEXT,
  departure_record_status TEXT,
  reintegration_status TEXT,
  checklist JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'planning', 'in_progress', 'ready', 'completed', 'cancelled')),
  assigned_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
CREATE INDEX IF NOT EXISTS idx_staycare_workers_auth ON staycare_workers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_phase ON staycare_workers(tenant_id, current_phase, status);
CREATE INDEX IF NOT EXISTS idx_staycare_workers_employer ON staycare_workers(employer_organization_id);
CREATE INDEX IF NOT EXISTS idx_staycare_steps_due ON staycare_journey_steps(tenant_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_staycare_documents_worker ON staycare_documents(worker_id, document_type, status);
CREATE INDEX IF NOT EXISTS idx_staycare_applications_worker ON staycare_service_applications(worker_id, status);
CREATE INDEX IF NOT EXISTS idx_staycare_remittance_worker ON staycare_remittance_intents(worker_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_staycare_immigration_deadline ON staycare_immigration_cases(tenant_id, status, deadline_at);
CREATE INDEX IF NOT EXISTS idx_staycare_tickets_priority ON staycare_tickets(tenant_id, priority, status);
CREATE INDEX IF NOT EXISTS idx_staycare_notifications_schedule ON staycare_notifications(status, scheduled_at);
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
    'staycare_workers',
    'staycare_journey_templates',
    'staycare_journey_instances',
    'staycare_journey_steps',
    'staycare_documents',
    'staycare_service_catalog',
    'staycare_provider_connections',
    'staycare_service_applications',
    'staycare_telecom_orders',
    'staycare_delivery_orders',
    'staycare_remittance_beneficiaries',
    'staycare_remittance_intents',
    'staycare_immigration_cases',
    'staycare_tickets',
    'staycare_return_plans'
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
    SELECT 1 FROM staycare_memberships m
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
    SELECT 1 FROM staycare_memberships m
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
        OR staycare_has_role(w.tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent','auditor']::staycare_role[])
        OR (
          staycare_has_role(w.tenant_id, ARRAY['employer_admin']::staycare_role[])
          AND w.employer_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
        )
        OR (
          staycare_has_role(w.tenant_id, ARRAY['institution_admin']::staycare_role[])
          AND (w.sending_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id))
               OR w.training_organization_id IN (SELECT staycare_current_org_ids(w.tenant_id)))
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
ALTER TABLE staycare_workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_journey_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_journey_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_journey_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_provider_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_service_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_application_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_telecom_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_delivery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_remittance_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_remittance_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_immigration_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_ai_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_ticket_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_return_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE staycare_audit_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS staycare_tenants_read ON staycare_tenants;
CREATE POLICY staycare_tenants_read ON staycare_tenants FOR SELECT TO authenticated USING (staycare_is_member(id));

DROP POLICY IF EXISTS staycare_orgs_read ON staycare_organizations;
CREATE POLICY staycare_orgs_read ON staycare_organizations FOR SELECT TO authenticated USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_orgs_manage ON staycare_organizations;
CREATE POLICY staycare_orgs_manage ON staycare_organizations FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_memberships_read ON staycare_memberships;
CREATE POLICY staycare_memberships_read ON staycare_memberships FOR SELECT TO authenticated
USING (user_id = auth.uid() OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','auditor']::staycare_role[]));

DROP POLICY IF EXISTS staycare_memberships_manage ON staycare_memberships;
CREATE POLICY staycare_memberships_manage ON staycare_memberships FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin']::staycare_role[]));

DROP POLICY IF EXISTS staycare_workers_read ON staycare_workers;
CREATE POLICY staycare_workers_read ON staycare_workers FOR SELECT TO authenticated USING (staycare_can_read_worker(id));

DROP POLICY IF EXISTS staycare_workers_manage ON staycare_workers;
CREATE POLICY staycare_workers_manage ON staycare_workers FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_templates_read ON staycare_journey_templates;
CREATE POLICY staycare_templates_read ON staycare_journey_templates FOR SELECT TO authenticated USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_templates_manage ON staycare_journey_templates;
CREATE POLICY staycare_templates_manage ON staycare_journey_templates FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_journeys_read ON staycare_journey_instances;
CREATE POLICY staycare_journeys_read ON staycare_journey_instances FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_journeys_manage ON staycare_journey_instances;
CREATE POLICY staycare_journeys_manage ON staycare_journey_instances FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_steps_read ON staycare_journey_steps;
CREATE POLICY staycare_steps_read ON staycare_journey_steps FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_steps_manage ON staycare_journey_steps;
CREATE POLICY staycare_steps_manage ON staycare_journey_steps FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_consents_read ON staycare_consents;
CREATE POLICY staycare_consents_read ON staycare_consents FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_consents_insert ON staycare_consents;
CREATE POLICY staycare_consents_insert ON staycare_consents FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
  OR staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent']::staycare_role[])
);

DROP POLICY IF EXISTS staycare_documents_read ON staycare_documents;
CREATE POLICY staycare_documents_read ON staycare_documents FOR SELECT TO authenticated
USING (
  staycare_can_read_worker(worker_id)
  AND NOT (
    staycare_has_role(tenant_id, ARRAY['employer_admin','institution_admin']::staycare_role[])
    AND document_type IN ('legal_consultation','medical','criminal','human_rights','remittance_beneficiary')
  )
);

DROP POLICY IF EXISTS staycare_documents_manage ON staycare_documents;
CREATE POLICY staycare_documents_manage ON staycare_documents FOR ALL TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
)
WITH CHECK (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
);

DROP POLICY IF EXISTS staycare_catalog_read ON staycare_service_catalog;
CREATE POLICY staycare_catalog_read ON staycare_service_catalog FOR SELECT TO authenticated USING (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_catalog_manage ON staycare_service_catalog;
CREATE POLICY staycare_catalog_manage ON staycare_service_catalog FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_provider_read ON staycare_provider_connections;
CREATE POLICY staycare_provider_read ON staycare_provider_connections FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','auditor']::staycare_role[])
  OR organization_id IN (SELECT staycare_current_org_ids(tenant_id)));

DROP POLICY IF EXISTS staycare_provider_manage ON staycare_provider_connections;
CREATE POLICY staycare_provider_manage ON staycare_provider_connections FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager']::staycare_role[]));

DROP POLICY IF EXISTS staycare_applications_read ON staycare_service_applications;
CREATE POLICY staycare_applications_read ON staycare_service_applications FOR SELECT TO authenticated
USING (
  staycare_can_read_worker(worker_id)
  OR assigned_organization_id IN (SELECT staycare_current_org_ids(tenant_id))
);

DROP POLICY IF EXISTS staycare_applications_insert ON staycare_service_applications;
CREATE POLICY staycare_applications_insert ON staycare_service_applications FOR INSERT TO authenticated
WITH CHECK (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_applications_update ON staycare_service_applications;
CREATE POLICY staycare_applications_update ON staycare_service_applications FOR UPDATE TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent','provider_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid() AND status IN ('draft','waiting_worker'))
)
WITH CHECK (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_application_events_read ON staycare_application_events;
CREATE POLICY staycare_application_events_read ON staycare_application_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM staycare_service_applications a WHERE a.id = application_id AND staycare_can_read_worker(a.worker_id)));

DROP POLICY IF EXISTS staycare_application_events_insert ON staycare_application_events;
CREATE POLICY staycare_application_events_insert ON staycare_application_events FOR INSERT TO authenticated
WITH CHECK (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_telecom_read ON staycare_telecom_orders;
CREATE POLICY staycare_telecom_read ON staycare_telecom_orders FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_telecom_manage ON staycare_telecom_orders;
CREATE POLICY staycare_telecom_manage ON staycare_telecom_orders FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_delivery_read ON staycare_delivery_orders;
CREATE POLICY staycare_delivery_read ON staycare_delivery_orders FOR SELECT TO authenticated
USING (worker_id IS NULL OR staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_delivery_manage ON staycare_delivery_orders;
CREATE POLICY staycare_delivery_manage ON staycare_delivery_orders FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_beneficiary_read ON staycare_remittance_beneficiaries;
CREATE POLICY staycare_beneficiary_read ON staycare_remittance_beneficiaries FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_beneficiary_manage ON staycare_remittance_beneficiaries;
CREATE POLICY staycare_beneficiary_manage ON staycare_remittance_beneficiaries FOR ALL TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
)
WITH CHECK (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_remittance_read ON staycare_remittance_intents;
CREATE POLICY staycare_remittance_read ON staycare_remittance_intents FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_remittance_manage ON staycare_remittance_intents;
CREATE POLICY staycare_remittance_manage ON staycare_remittance_intents FOR ALL TO authenticated
USING (
  staycare_has_role(tenant_id, ARRAY['sejoong_admin','operator_manager','operator_agent','provider_agent']::staycare_role[])
  OR EXISTS (SELECT 1 FROM staycare_workers w WHERE w.id = worker_id AND w.auth_user_id = auth.uid())
)
WITH CHECK (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_immigration_read ON staycare_immigration_cases;
CREATE POLICY staycare_immigration_read ON staycare_immigration_cases FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_immigration_manage ON staycare_immigration_cases;
CREATE POLICY staycare_immigration_manage ON staycare_immigration_cases FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_ai_sessions_read ON staycare_ai_sessions;
CREATE POLICY staycare_ai_sessions_read ON staycare_ai_sessions FOR SELECT TO authenticated
USING (worker_id IS NULL OR staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_ai_sessions_insert ON staycare_ai_sessions;
CREATE POLICY staycare_ai_sessions_insert ON staycare_ai_sessions FOR INSERT TO authenticated
WITH CHECK (worker_id IS NULL OR staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_ai_messages_read ON staycare_ai_messages;
CREATE POLICY staycare_ai_messages_read ON staycare_ai_messages FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM staycare_ai_sessions s WHERE s.id = session_id AND (s.worker_id IS NULL OR staycare_can_read_worker(s.worker_id))));

-- AI message writes, provider webhooks and audit writes are service-role only.

DROP POLICY IF EXISTS staycare_tickets_read ON staycare_tickets;
CREATE POLICY staycare_tickets_read ON staycare_tickets FOR SELECT TO authenticated
USING (worker_id IS NULL OR staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_tickets_insert ON staycare_tickets;
CREATE POLICY staycare_tickets_insert ON staycare_tickets FOR INSERT TO authenticated
WITH CHECK (worker_id IS NULL OR staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_tickets_update ON staycare_tickets;
CREATE POLICY staycare_tickets_update ON staycare_tickets FOR UPDATE TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','sejoong_lawyer','immigration_manager','operator_manager','operator_agent','provider_agent']::staycare_role[]))
WITH CHECK (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_ticket_events_read ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_read ON staycare_ticket_events FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM staycare_tickets t WHERE t.id = ticket_id AND (t.worker_id IS NULL OR staycare_can_read_worker(t.worker_id))));

DROP POLICY IF EXISTS staycare_ticket_events_insert ON staycare_ticket_events;
CREATE POLICY staycare_ticket_events_insert ON staycare_ticket_events FOR INSERT TO authenticated WITH CHECK (staycare_is_member(tenant_id));

DROP POLICY IF EXISTS staycare_notifications_read ON staycare_notifications;
CREATE POLICY staycare_notifications_read ON staycare_notifications FOR SELECT TO authenticated
USING (user_id = auth.uid() OR (worker_id IS NOT NULL AND staycare_can_read_worker(worker_id)));

DROP POLICY IF EXISTS staycare_return_read ON staycare_return_plans;
CREATE POLICY staycare_return_read ON staycare_return_plans FOR SELECT TO authenticated USING (staycare_can_read_worker(worker_id));

DROP POLICY IF EXISTS staycare_return_manage ON staycare_return_plans;
CREATE POLICY staycare_return_manage ON staycare_return_plans FOR ALL TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager','operator_agent']::staycare_role[]))
WITH CHECK (staycare_has_role(tenant_id, ARRAY['sejoong_admin','immigration_manager','operator_manager','operator_agent']::staycare_role[]));

DROP POLICY IF EXISTS staycare_audit_read ON staycare_audit_events;
CREATE POLICY staycare_audit_read ON staycare_audit_events FOR SELECT TO authenticated
USING (staycare_has_role(tenant_id, ARRAY['sejoong_admin','auditor']::staycare_role[]));

INSERT INTO staycare_tenants (slug, name, service_owner_name, default_language)
VALUES ('sejoong-staycare', 'Sejoong StayCare', '법무법인 세중', 'ko')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO staycare_service_catalog (
  tenant_id,
  code,
  category,
  name,
  description,
  available_from_phase,
  ownership,
  delivery_modes,
  integration_mode,
  status
)
SELECT
  t.id,
  seed.code,
  seed.category,
  seed.name::jsonb,
  seed.description::jsonb,
  seed.available_from_phase::staycare_phase,
  seed.ownership,
  seed.delivery_modes,
  seed.integration_mode,
  'active'::staycare_service_status
FROM staycare_tenants t
CROSS JOIN (
  VALUES
    ('document-wallet', 'identity', '{"ko":"내 디지털 서류함","en":"Digital document wallet","si":"ඩිජිටල් ලේඛන ගබඩාව"}', '{"ko":"여권·비자·계약·보험·급여·송금영수증을 동의 후 재사용","en":"Reuse passport, visa, contract, insurance, payslip and receipts with consent","si":"ලේඛන අනුමැතියෙන් නැවත භාවිත කරන්න"}', 'prepare', ARRAY['worker','sejoong'], ARRAY['digital'], 'internal'),
    ('connectivity', 'telecom', '{"ko":"한국 통신 원스톱","en":"Korea connectivity one-stop","si":"කොරියා සන්නිවේදන සේවාව"}', '{"ko":"eSIM·SIM, 공항수령, 숙소배송, 장기요금제 전환","en":"eSIM/SIM, airport pickup, delivery and resident-plan conversion","si":"eSIM/SIM, ලබාගැනීම, බෙදාහැරීම හා දිගුකාලීන සැලැස්ම"}', 'pre_departure', ARRAY['worker','sejoong','provider'], ARRAY['digital','airport','accommodation','branch'], 'partner_api'),
    ('banking', 'finance', '{"ko":"급여계좌·자동이체","en":"Payroll banking","si":"වැටුප් බැංකු සේවා"}', '{"ko":"필요서류, 예약, 급여계좌, 체크카드와 자동이체","en":"Documents, appointment, payroll account, debit card and auto-pay","si":"ලේඛන, වෙන්කිරීම්, වැටුප් ගිණුම හා ස්වයං ගෙවීම්"}', 'settlement', ARRAY['worker','sejoong','provider','employer'], ARRAY['digital','branch'], 'manual_review'),
    ('remittance', 'remittance', '{"ko":"스리랑카 급여송금","en":"Salary remittance to Sri Lanka","si":"ශ්‍රී ලංකාවට වැටුප් මුදල් යැවීම"}', '{"ko":"인가사업자 환율·수수료·수취액 비교와 상태·영수증","en":"Licensed-provider quotes, status and receipt","si":"බලපත්‍රලාභී සේවා මිල, තත්ත්වය හා රිසිට්"}', 'settlement', ARRAY['worker','sejoong','provider'], ARRAY['digital','branch'], 'partner_api'),
    ('immigration-desk', 'immigration', '{"ko":"체류·비자 행정 데스크","en":"Stay and visa administration desk","si":"රැඳී සිටීම හා වීසා මධ්‍යස්ථානය"}', '{"ko":"외국인등록, 주소변경, 연장, 사업장변경과 출국","en":"Registration, address, extension, workplace change and departure","si":"ලියාපදිංචිය, ලිපින වෙනස, දිගු කිරීම හා පිටත්වීම"}', 'pre_departure', ARRAY['worker','sejoong','government','employer'], ARRAY['digital','video','phone','branch'], 'manual_review'),
    ('ai-language', 'translation', '{"ko":"AI 생활 통역·가이드","en":"AI interpreter and life guide","si":"AI පරිවර්තකය හා මාර්ගෝපදේශය"}', '{"ko":"한국어·영어·싱할라어 번역과 상황별 다음 행동","en":"Korean-English-Sinhala translation and next-step guidance","si":"කොරියානු-ඉංග්‍රීසි-සිංහල පරිවර්තනය හා ඊළඟ පියවර"}', 'prepare', ARRAY['worker','sejoong'], ARRAY['digital'], 'internal'),
    ('return-home', 'return', '{"ko":"귀국 원스톱","en":"Return-home one-stop","si":"ආපසු යාමේ එක්-තැනක සේවාව"}', '{"ko":"보험·퇴직금·최종송금·서비스 종료와 재정착","en":"Insurance, severance, final remittance, service closure and reintegration","si":"රක්ෂණ, සේවා අවසන් දීමනා, අවසන් මුදල් යැවීම හා නැවත පදිංචිය"}', 'return', ARRAY['worker','sejoong','government','employer','provider'], ARRAY['digital','phone','video','branch'], 'internal')
) AS seed(code, category, name, description, available_from_phase, ownership, delivery_modes, integration_mode)
WHERE t.slug = 'sejoong-staycare'
ON CONFLICT (tenant_id, code) DO NOTHING;

COMMENT ON TABLE staycare_workers IS 'One worker profile reused across official-status tracking and private one-stop services with explicit consent.';
COMMENT ON TABLE staycare_journey_steps IS 'Worker-specific lifecycle steps. official_process distinguishes public-authority work from Sejoong orchestration.';
COMMENT ON TABLE staycare_service_applications IS 'Unified application envelope for telecom, banking, remittance, immigration, healthcare and return services.';
COMMENT ON TABLE staycare_remittance_intents IS 'Quote and status orchestration only. StayCare must not hold, exchange or transmit funds.';
COMMENT ON TABLE staycare_ai_messages IS 'Redacted AI content only. Raw passport, registration, bank-card and other identifiers must be blocked before the API call.';
COMMENT ON TABLE staycare_audit_events IS 'Append-only audit evidence written by trusted server/service-role code.';
