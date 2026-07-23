-- ============================================================================
-- Sejoong StayCare demo tenant seed for the Supabase SQL Editor
-- ============================================================================
--
-- WHAT THIS FILE DOES
--   * Validates that migrations 012 and 013 are already applied.
--   * Validates that the 10 login-capable Auth users already exist.
--   * Resets ONLY the `sejoong-staycare-demo` tenant.
--   * Creates organizations, memberships, synthetic workers, journey steps,
--     services, applications, provider work, tickets, notifications and return plan.
--
-- WHAT THIS FILE DOES NOT DO
--   * It does not INSERT or UPDATE auth.users/auth.identities.
--   * Create Auth users through Authentication -> Users -> Add user,
--     or through the Supabase Auth Admin API.
--
-- REQUIRED AUTH USERS (all with password: StayCareDemo!2026)
--   demo.worker@sejoonglaw.kr
--   demo.admin@sejoonglaw.kr
--   demo.lawyer@sejoonglaw.kr
--   demo.immigration@sejoonglaw.kr
--   demo.operator.manager@sejoonglaw.kr
--   demo.operator.agent@sejoonglaw.kr
--   demo.employer@sejoonglaw.kr
--   demo.institution@sejoonglaw.kr
--   demo.provider@sejoonglaw.kr
--   demo.auditor@sejoonglaw.kr
--
-- SAFE TO RE-RUN
--   The script deletes and recreates only the fixed demo tenant slug.
--   It never deletes the production `sejoong-staycare` tenant or Auth users.
-- ============================================================================

BEGIN;

DO $$
DECLARE
  v_missing TEXT;
  v_audit_trigger_exists BOOLEAN := false;

  v_tenant UUID;
  v_org_sejoong UUID;
  v_org_operator UUID;
  v_org_employer UUID;
  v_org_institution UUID;
  v_org_provider UUID;

  v_user_worker UUID;
  v_user_admin UUID;
  v_user_lawyer UUID;
  v_user_immigration UUID;
  v_user_operator_manager UUID;
  v_user_operator_agent UUID;
  v_user_employer UUID;
  v_user_institution UUID;
  v_user_provider UUID;
  v_user_auditor UUID;

  v_worker_primary UUID;
  v_journey UUID;

  v_service_telecom UUID;
  v_service_salary UUID;
  v_service_remittance UUID;
  v_service_immigration UUID;
  v_service_return UUID;

  v_provider_telecom UUID;
  v_provider_remittance UUID;

  v_application_telecom UUID;
  v_application_immigration UUID;
  v_application_salary UUID;
  v_application_remittance UUID;
BEGIN
  -- --------------------------------------------------------------------------
  -- 1. Schema preflight
  -- --------------------------------------------------------------------------
  IF to_regclass('public.staycare_tenants') IS NULL
     OR to_regclass('public.staycare_memberships') IS NULL
     OR to_regclass('public.staycare_workers') IS NULL
     OR to_regclass('public.staycare_service_applications') IS NULL
     OR to_regclass('public.staycare_webhook_events') IS NULL THEN
    RAISE EXCEPTION
      'StayCare schema is incomplete. Apply migrations 012_staycare_platform_v1.sql and 013_staycare_production_hardening.sql first.';
  END IF;

  -- --------------------------------------------------------------------------
  -- 2. Auth user preflight
  -- Direct INSERT into auth.users is intentionally prohibited here.
  -- --------------------------------------------------------------------------
  SELECT string_agg(required.email, ', ' ORDER BY required.email)
    INTO v_missing
  FROM (
    VALUES
      ('demo.worker@sejoonglaw.kr'),
      ('demo.admin@sejoonglaw.kr'),
      ('demo.lawyer@sejoonglaw.kr'),
      ('demo.immigration@sejoonglaw.kr'),
      ('demo.operator.manager@sejoonglaw.kr'),
      ('demo.operator.agent@sejoonglaw.kr'),
      ('demo.employer@sejoonglaw.kr'),
      ('demo.institution@sejoonglaw.kr'),
      ('demo.provider@sejoonglaw.kr'),
      ('demo.auditor@sejoonglaw.kr')
  ) AS required(email)
  LEFT JOIN auth.users users
    ON lower(users.email) = required.email
  WHERE users.id IS NULL;

  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Missing Supabase Auth users: %', v_missing
      USING HINT = 'Authentication -> Users -> Add user -> Create new user. Use password StayCareDemo!2026 and enable Auto Confirm User.';
  END IF;

  SELECT id INTO STRICT v_user_worker
    FROM auth.users WHERE lower(email) = 'demo.worker@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_admin
    FROM auth.users WHERE lower(email) = 'demo.admin@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_lawyer
    FROM auth.users WHERE lower(email) = 'demo.lawyer@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_immigration
    FROM auth.users WHERE lower(email) = 'demo.immigration@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_operator_manager
    FROM auth.users WHERE lower(email) = 'demo.operator.manager@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_operator_agent
    FROM auth.users WHERE lower(email) = 'demo.operator.agent@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_employer
    FROM auth.users WHERE lower(email) = 'demo.employer@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_institution
    FROM auth.users WHERE lower(email) = 'demo.institution@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_provider
    FROM auth.users WHERE lower(email) = 'demo.provider@sejoonglaw.kr' LIMIT 1;
  SELECT id INTO STRICT v_user_auditor
    FROM auth.users WHERE lower(email) = 'demo.auditor@sejoonglaw.kr' LIMIT 1;

  -- --------------------------------------------------------------------------
  -- 3. Reset only the isolated demo tenant
  -- 013 makes audit rows append-only. SQL Editor runs as postgres, so disable
  -- the immutable trigger only for this transactional demo reset.
  -- --------------------------------------------------------------------------
  SELECT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgrelid = 'public.staycare_audit_events'::regclass
      AND tgname = 'staycare_audit_events_immutable'
      AND NOT tgisinternal
  ) INTO v_audit_trigger_exists;

  IF v_audit_trigger_exists THEN
    EXECUTE 'ALTER TABLE public.staycare_audit_events DISABLE TRIGGER staycare_audit_events_immutable';
  END IF;

  DELETE FROM public.staycare_tenants
  WHERE slug = 'sejoong-staycare-demo';

  IF v_audit_trigger_exists THEN
    EXECUTE 'ALTER TABLE public.staycare_audit_events ENABLE TRIGGER staycare_audit_events_immutable';
  END IF;

  -- --------------------------------------------------------------------------
  -- 4. Demo tenant and organizations
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_tenants (
    slug,
    name,
    service_owner_name,
    status,
    default_language,
    timezone
  ) VALUES (
    'sejoong-staycare-demo',
    'Sejoong StayCare Demo',
    '법무법인 세중',
    'active',
    'si',
    'Asia/Seoul'
  )
  RETURNING id INTO v_tenant;

  INSERT INTO public.staycare_organizations (
    tenant_id, type, name, country_code, service_regions,
    supported_languages, status, metadata
  ) VALUES (
    v_tenant, 'sejoong', '법무법인 세중 Demo', 'KR',
    ARRAY['Seoul', 'Incheon', 'Gyeonggi'], ARRAY['ko', 'en', 'si'],
    'active', '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_org_sejoong;

  INSERT INTO public.staycare_organizations (
    tenant_id, type, name, country_code, service_regions,
    supported_languages, status, metadata
  ) VALUES (
    v_tenant, 'operator', 'StayCare Demo Operations', 'KR',
    ARRAY['Seoul', 'Incheon', 'Gyeonggi'], ARRAY['ko', 'en', 'si'],
    'active', '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_org_operator;

  INSERT INTO public.staycare_organizations (
    tenant_id, type, name, country_code, service_regions,
    supported_languages, status, metadata
  ) VALUES (
    v_tenant, 'employer', 'Demo Manufacturing Korea', 'KR',
    ARRAY['Incheon', 'Gyeonggi'], ARRAY['ko', 'en'],
    'active', '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_org_employer;

  INSERT INTO public.staycare_organizations (
    tenant_id, type, name, country_code, service_regions,
    supported_languages, status, metadata
  ) VALUES (
    v_tenant, 'training_institution', 'Sri Lanka Demo Training Institute', 'LK',
    ARRAY['Colombo', 'Kandy'], ARRAY['en', 'si'],
    'active', '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_org_institution;

  INSERT INTO public.staycare_organizations (
    tenant_id, type, name, country_code, service_regions,
    supported_languages, status, metadata
  ) VALUES (
    v_tenant, 'provider', 'Demo Telecom & Remittance Provider', 'KR',
    ARRAY['Nationwide'], ARRAY['ko', 'en', 'si'],
    'active', '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_org_provider;

  -- --------------------------------------------------------------------------
  -- 5. Role memberships
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_memberships (
    tenant_id, organization_id, user_id, role, status, activated_at
  ) VALUES
    (v_tenant, NULL,                   v_user_worker,           'worker',              'active', now()),
    (v_tenant, v_org_sejoong,          v_user_admin,            'sejoong_admin',       'active', now()),
    (v_tenant, v_org_sejoong,          v_user_lawyer,           'sejoong_lawyer',      'active', now()),
    (v_tenant, v_org_sejoong,          v_user_immigration,      'immigration_manager', 'active', now()),
    (v_tenant, v_org_operator,         v_user_operator_manager, 'operator_manager',    'active', now()),
    (v_tenant, v_org_operator,         v_user_operator_agent,   'operator_agent',      'active', now()),
    (v_tenant, v_org_employer,         v_user_employer,         'employer_admin',      'active', now()),
    (v_tenant, v_org_institution,      v_user_institution,      'institution_admin',   'active', now()),
    (v_tenant, v_org_provider,         v_user_provider,         'provider_agent',      'active', now()),
    (v_tenant, v_org_sejoong,          v_user_auditor,          'auditor',             'active', now());

  -- --------------------------------------------------------------------------
  -- 6. Synthetic workers
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_workers (
    tenant_id,
    auth_user_id,
    employer_organization_id,
    training_organization_id,
    member_no,
    full_name,
    full_name_en,
    nationality_code,
    preferred_language,
    visa_type,
    occupation,
    status,
    current_phase,
    expected_arrival_date,
    visa_expires_at,
    passport_expires_at,
    foreigner_registration_status,
    phone_number,
    accommodation_summary,
    risk_score,
    profile_completion,
    next_action,
    next_action_due_at,
    metadata
  ) VALUES (
    v_tenant,
    v_user_worker,
    v_org_employer,
    v_org_institution,
    'DEMO-LK-001',
    'Kasun Jayasinghe',
    'KASUN JAYASINGHE',
    'LK',
    'si',
    'E-9',
    'Manufacturing',
    'settling',
    'settlement',
    DATE '2026-08-15',
    DATE '2029-08-14',
    DATE '2031-03-20',
    'scheduled',
    '+82-10-0000-0001',
    'Demo dormitory, Incheon',
    18,
    72,
    'Complete foreigner registration appointment documents',
    now() + interval '7 days',
    '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_worker_primary;

  INSERT INTO public.staycare_workers (
    tenant_id, employer_organization_id, training_organization_id,
    member_no, full_name, full_name_en, nationality_code, preferred_language,
    visa_type, occupation, status, current_phase, profile_completion,
    risk_score, next_action, next_action_due_at, metadata
  ) VALUES
    (
      v_tenant, v_org_employer, v_org_institution,
      'DEMO-LK-002', 'Nimal Perera', 'NIMAL PERERA', 'LK', 'si',
      'E-9', 'Manufacturing', 'preparing', 'prepare', 44,
      32, 'Upload training completion record', now() + interval '12 days',
      '{"demo":true,"synthetic":true}'::jsonb
    ),
    (
      v_tenant, v_org_employer, v_org_institution,
      'DEMO-LK-003', 'Kumari Silva', 'KUMARI SILVA', 'LK', 'en',
      'E-9', 'Food processing', 'pre_departure', 'pre_departure', 88,
      9, 'Confirm airport SIM pickup and accommodation transfer', now() + interval '20 days',
      '{"demo":true,"synthetic":true,"expectedArrival":"2026-09-03"}'::jsonb
    );

  -- --------------------------------------------------------------------------
  -- 7. Primary worker journey and lifecycle steps
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_journey_instances (
    tenant_id, worker_id, current_phase, status, metadata
  ) VALUES (
    v_tenant, v_worker_primary, 'settlement', 'active',
    '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_journey;

  INSERT INTO public.staycare_journey_steps (
    tenant_id, journey_id, worker_id, step_code, phase,
    title, description, responsibility, official_process, required,
    status, due_at, data, completed_at
  ) VALUES
    (
      v_tenant, v_journey, v_worker_primary, 'official-recruitment', 'official',
      '{"ko":"정부 공식 모집·EPS 상태","en":"Official recruitment and EPS status","si":"නිල බඳවාගැනීම් හා EPS තත්ත්වය"}'::jsonb,
      '{"ko":"정부·공공기관이 처리하는 공식 모집 상태를 연결해서 보여줍니다.","en":"Shows the official recruitment state handled by public authorities.","si":"රාජ්‍ය ආයතන විසින් කළමනාකරණය කරන නිල බඳවාගැනීම් තත්ත්වය පෙන්වයි."}'::jsonb,
      ARRAY['government','sejoong','worker'], true, true,
      'completed', NULL, '{"demo":true,"actions":["guide","track"]}'::jsonb, now()
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'visa-issued', 'official',
      '{"ko":"비자 발급 완료","en":"Visa issued","si":"වීසා නිකුත් කර ඇත"}'::jsonb,
      '{"ko":"비자 발급 이후 민간 원스톱 서비스를 시작합니다.","en":"Starts the private one-stop service after visa issuance.","si":"වීසා නිකුත් කිරීමෙන් පසු එක්-ස්ථාන සේවාව ආරම්භ වේ."}'::jsonb,
      ARRAY['government','sejoong','worker'], true, true,
      'completed', NULL, '{"demo":true,"actions":["guide","track"]}'::jsonb, now()
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'esim-order', 'pre_departure',
      '{"ko":"eSIM·공항 SIM 수령 선택","en":"Select eSIM or airport SIM pickup","si":"eSIM හෝ ගුවන් තොටුපළ SIM තෝරන්න"}'::jsonb,
      '{"ko":"단말 호환성 확인 후 eSIM, 공항수령 또는 숙소배송을 선택합니다.","en":"Choose eSIM, airport pickup or accommodation delivery after compatibility review.","si":"උපාංග ගැළපීම පරීක්ෂා කර eSIM හෝ ලබාගැනීම තෝරන්න."}'::jsonb,
      ARRAY['sejoong','partner','worker'], false, true,
      'completed', NULL, '{"demo":true,"actions":["apply","track"]}'::jsonb, now()
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'arrival-transfer', 'arrival',
      '{"ko":"공항 일괄수령·숙소 이동","en":"Airport handover and accommodation transfer","si":"ගුවන් තොටුපළ භාරදීම හා නවාතැන් ගමන්"}'::jsonb,
      '{"ko":"공항 또는 숙소에서 준비물과 통신서비스를 인계합니다.","en":"Coordinates airport or accommodation handover of prepared items and telecom service.","si":"ගුවන් තොටුපළ හෝ නවාතැනේ සේවා භාරදීම සම්බන්ධ කරයි."}'::jsonb,
      ARRAY['sejoong','partner','worker'], false, true,
      'completed', NULL, '{"demo":true,"actions":["track"]}'::jsonb, now()
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'foreigner-registration', 'settlement',
      '{"ko":"외국인등록 방문 준비","en":"Foreigner registration appointment","si":"විදේශික ලියාපදිංචි හමුව"}'::jsonb,
      '{"ko":"예약, 준비서류, 제출상태와 발급 진행을 관리합니다.","en":"Manages appointments, documents, submission and issuance status.","si":"හමුවීම්, ලේඛන සහ නිකුත් කිරීමේ තත්ත්වය පාලනය කරයි."}'::jsonb,
      ARRAY['government','sejoong','worker'], true, true,
      'in_progress', now() + interval '7 days', '{"demo":true,"actions":["upload","track"]}'::jsonb, NULL
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'salary-account', 'settlement',
      '{"ko":"급여계좌 준비","en":"Salary bank account preparation","si":"වැටුප් බැංකු ගිණුම සූදානම් කිරීම"}'::jsonb,
      '{"ko":"은행 방문자료, 예약과 계좌개설 진행상태를 관리합니다.","en":"Manages bank records, appointment and account-opening status.","si":"බැංකු ලේඛන, හමුවීම් සහ ගිණුම් තත්ත්වය පාලනය කරයි."}'::jsonb,
      ARRAY['sejoong','partner','worker'], false, true,
      'ready', now() + interval '10 days', '{"demo":true,"actions":["apply","track"]}'::jsonb, NULL
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'remittance-setup', 'living',
      '{"ko":"스리랑카 송금 수취인 등록","en":"Sri Lanka remittance beneficiary setup","si":"ශ්‍රී ලංකා මුදල් ලබන්නා සකස් කිරීම"}'::jsonb,
      '{"ko":"인가 송금사업자의 본인확인과 수취인 등록을 연결합니다.","en":"Connects licensed-provider identity verification and beneficiary registration.","si":"බලපත්‍රලාභී සේවා සපයන්නාගේ තහවුරු කිරීම හා ලබන්නා ලියාපදිංචිය සම්බන්ධ කරයි."}'::jsonb,
      ARRAY['sejoong','partner','worker'], false, false,
      'not_started', NULL, '{"demo":true,"actions":["apply"]}'::jsonb, NULL
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'stay-extension', 'renewal',
      '{"ko":"체류연장 기한관리","en":"Stay extension deadline management","si":"රැඳී සිටීම දිගු කිරීමේ කාලසීමාව"}'::jsonb,
      '{"ko":"만료일 전에 필요한 자료, 예약과 접수상태를 관리합니다.","en":"Manages documents, appointments and submission before expiry.","si":"කල් ඉකුත්වීමට පෙර ලේඛන සහ අයදුම් තත්ත්වය පාලනය කරයි."}'::jsonb,
      ARRAY['government','sejoong','worker'], true, true,
      'not_started', NULL, '{"demo":true,"actions":["guide"]}'::jsonb, NULL
    ),
    (
      v_tenant, v_journey, v_worker_primary, 'return-plan', 'return',
      '{"ko":"급여·보험·송금·귀국 체크리스트","en":"Salary, insurance, remittance and return checklist","si":"වැටුප්, රක්ෂණ, මුදල් යැවීම හා ආපසු යාමේ ලැයිස්තුව"}'::jsonb,
      '{"ko":"최종급여, 퇴직금, 보험, 송금, 통신·계좌·숙소 종료와 출국자료를 관리합니다.","en":"Manages final salary, insurance, remittance, service closure and departure records.","si":"අවසන් වැටුප, රක්ෂණ, මුදල් යැවීම සහ සේවා අවසන් කිරීම පාලනය කරයි."}'::jsonb,
      ARRAY['sejoong','partner','worker'], false, true,
      'not_started', NULL, '{"demo":true,"actions":["guide"]}'::jsonb, NULL
    );

  -- --------------------------------------------------------------------------
  -- 8. Service catalog
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_service_catalog (
    tenant_id, code, category, name, description, available_from_phase,
    ownership, delivery_modes, required_data, result_description,
    integration_mode, legal_boundary, status
  ) VALUES (
    v_tenant,
    'telecom-esim',
    'telecom',
    '{"ko":"eSIM·SIM 사전신청","en":"eSIM / SIM pre-order","si":"eSIM / SIM පෙර ඇණවුම"}'::jsonb,
    '{"ko":"단말 호환성을 확인하고 공항수령·숙소배송·eSIM을 신청합니다.","en":"Check device compatibility and request eSIM, airport pickup or accommodation delivery.","si":"උපාංග ගැළපීම පරීක්ෂා කර eSIM හෝ ලබාගැනීම ඉල්ලන්න."}'::jsonb,
    'pre_departure', ARRAY['sejoong','partner'], ARRAY['digital','airport','accommodation'],
    '[]'::jsonb,
    '{"ko":"신청상태와 수령·개통 결과를 앱에서 확인합니다.","en":"Track fulfillment and activation in the app.","si":"ලබාදීම සහ සක්‍රිය කිරීම app එකෙන් බලන්න."}'::jsonb,
    'manual_review',
    '{"ko":"실제 개통과 본인확인은 통신사업자 또는 인가 제휴사가 수행합니다.","en":"The licensed telecom provider performs final identity verification and activation.","si":"අවසන් තහවුරු කිරීම හා සක්‍රිය කිරීම බලපත්‍රලාභී සපයන්නා සිදු කරයි."}'::jsonb,
    'active'
  ) RETURNING id INTO v_service_telecom;

  INSERT INTO public.staycare_service_catalog (
    tenant_id, code, category, name, description, available_from_phase,
    ownership, delivery_modes, required_data, result_description,
    integration_mode, legal_boundary, status
  ) VALUES (
    v_tenant,
    'salary-account',
    'finance',
    '{"ko":"급여계좌 준비","en":"Salary account preparation","si":"වැටුප් ගිණුම සූදානම් කිරීම"}'::jsonb,
    '{"ko":"은행 방문자료, 예약과 계좌개설 진행상태를 관리합니다.","en":"Manage bank records, appointments and account-opening status.","si":"බැංකු ලේඛන, හමුවීම් සහ ගිණුම් තත්ත්වය පාලනය කරන්න."}'::jsonb,
    'settlement', ARRAY['sejoong','partner'], ARRAY['branch'],
    '[]'::jsonb,
    '{"ko":"준비자료와 계좌개설 진행상태를 확인합니다.","en":"Track required records and account-opening status.","si":"අවශ්‍ය ලේඛන සහ ගිණුම් තත්ත්වය බලන්න."}'::jsonb,
    'manual_review',
    '{"ko":"계좌개설 승인과 고객확인은 은행이 수행합니다.","en":"The bank performs customer verification and approves account opening.","si":"ගනුදෙනුකරු තහවුරු කිරීම හා ගිණුම් අනුමැතිය බැංකුව සිදු කරයි."}'::jsonb,
    'active'
  ) RETURNING id INTO v_service_salary;

  INSERT INTO public.staycare_service_catalog (
    tenant_id, code, category, name, description, available_from_phase,
    ownership, delivery_modes, required_data, result_description,
    integration_mode, legal_boundary, status
  ) VALUES (
    v_tenant,
    'lk-remittance',
    'remittance',
    '{"ko":"스리랑카 본국송금","en":"Sri Lanka remittance","si":"ශ්‍රී ලංකා මුදල් යැවීම"}'::jsonb,
    '{"ko":"등록된 송금사업자의 견적·본인확인·처리상태와 영수증을 연결합니다.","en":"Connect licensed-provider quotes, identity checks, transfer status and receipts.","si":"බලපත්‍රලාභී සපයන්නාගේ මිල, තහවුරු කිරීම සහ ලදුපත සම්බන්ධ කරන්න."}'::jsonb,
    'living', ARRAY['sejoong','partner'], ARRAY['digital'],
    '[]'::jsonb,
    '{"ko":"견적, 송금 진행과 수취완료 상태를 확인합니다.","en":"Track quote, transfer and payout status.","si":"මිල, මුදල් යැවීම සහ ගෙවීම් තත්ත්වය බලන්න."}'::jsonb,
    'manual_review',
    '{"ko":"환율 제시, 자금수취와 해외송금은 등록된 송금사업자가 수행합니다.","en":"A licensed remittance provider executes the regulated transfer and payout.","si":"බලපත්‍රලාභී මුදල් යැවීමේ සපයන්නා නියාමිත ගනුදෙනුව සිදු කරයි."}'::jsonb,
    'active'
  ) RETURNING id INTO v_service_remittance;

  INSERT INTO public.staycare_service_catalog (
    tenant_id, code, category, name, description, available_from_phase,
    ownership, delivery_modes, required_data, result_description,
    integration_mode, legal_boundary, status
  ) VALUES (
    v_tenant,
    'stay-administration',
    'immigration',
    '{"ko":"체류행정 데스크","en":"Stay administration desk","si":"රැඳී සිටීමේ පරිපාලන සේවාව"}'::jsonb,
    '{"ko":"외국인등록, 주소변경, 체류연장과 귀국절차의 자료·기한을 관리합니다.","en":"Manage records and deadlines for registration, address changes, extension and departure.","si":"ලියාපදිංචිය, ලිපිනය, දිගු කිරීම සහ පිටත්වීමේ ලේඛන හා කාලසීමා පාලනය කරන්න."}'::jsonb,
    'arrival', ARRAY['government','sejoong'], ARRAY['digital','branch'],
    '[]'::jsonb,
    '{"ko":"준비, 예약, 접수와 결과상태를 하나의 화면에서 확인합니다.","en":"Track preparation, appointment, submission and result in one screen.","si":"සූදානම, හමුවීම, අයදුම සහ ප්‍රතිඵලය එකම තිරයකින් බලන්න."}'::jsonb,
    'manual_review',
    '{"ko":"허가와 최종 결정은 출입국·외국인관서 등 관계기관이 수행합니다.","en":"Immigration authorities perform statutory approval and final decisions.","si":"නීතිමය අනුමැතිය සහ අවසන් තීරණ ආගමන ආයතන විසින් සිදු කරයි."}'::jsonb,
    'active'
  ) RETURNING id INTO v_service_immigration;

  INSERT INTO public.staycare_service_catalog (
    tenant_id, code, category, name, description, available_from_phase,
    ownership, delivery_modes, required_data, result_description,
    integration_mode, legal_boundary, status
  ) VALUES (
    v_tenant,
    'return-support',
    'return',
    '{"ko":"귀국 원스톱 준비","en":"Return preparation","si":"ආපසු යාමේ සූදානම"}'::jsonb,
    '{"ko":"최종급여, 보험, 송금, 통신·계좌·숙소 종료와 출국자료를 관리합니다.","en":"Manage final salary, insurance, remittance, service closure and departure records.","si":"අවසන් වැටුප, රක්ෂණ, මුදල් යැවීම සහ සේවා අවසන් කිරීම පාලනය කරන්න."}'::jsonb,
    'return', ARRAY['sejoong','partner','worker'], ARRAY['digital','branch'],
    '[]'::jsonb,
    '{"ko":"귀국 전 해야 할 업무와 완료상태를 통합 확인합니다.","en":"Track all pre-return tasks and completion status.","si":"ආපසු යාමට පෙර කාර්ය සහ සම්පූර්ණ තත්ත්වය බලන්න."}'::jsonb,
    'internal',
    '{"ko":"보험금, 금융거래와 공식 출국기록의 최종 처리는 각 관계기관이 수행합니다.","en":"Each authority or provider performs its regulated final transaction.","si":"අදාළ ආයතනය නියාමිත අවසන් ගනුදෙනුව සිදු කරයි."}'::jsonb,
    'active'
  ) RETURNING id INTO v_service_return;

  -- --------------------------------------------------------------------------
  -- 9. Provider connections
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_provider_connections (
    tenant_id, organization_id, kind, provider_code, status, auth_type,
    capabilities, metadata
  ) VALUES (
    v_tenant, v_org_provider, 'telecom', 'demo-telecom-provider',
    'sandbox', 'manual_portal',
    ARRAY['esim','physical_sim','airport_pickup','accommodation_delivery'],
    '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_provider_telecom;

  INSERT INTO public.staycare_provider_connections (
    tenant_id, organization_id, kind, provider_code, status, auth_type,
    capabilities, metadata
  ) VALUES (
    v_tenant, v_org_provider, 'remittance', 'demo-remittance-provider',
    'sandbox', 'manual_portal',
    ARRAY['quote','beneficiary_verification','transfer_status','receipt'],
    '{"demo":true,"synthetic":true}'::jsonb
  ) RETURNING id INTO v_provider_remittance;

  -- --------------------------------------------------------------------------
  -- 10. Service applications
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_service_applications (
    tenant_id, worker_id, service_id, provider_connection_id,
    application_no, status, language, submitted_data,
    assigned_organization_id, submitted_at, external_reference
  ) VALUES (
    v_tenant, v_worker_primary, v_service_telecom, v_provider_telecom,
    'DEMO-APP-0001', 'waiting_provider', 'si',
    '{"simType":"esim","deliveryMethod":"airport","airport":"ICN","demo":true}'::jsonb,
    v_org_provider, now(), 'DEMO-TEL-001'
  ) RETURNING id INTO v_application_telecom;

  INSERT INTO public.staycare_service_applications (
    tenant_id, worker_id, service_id, application_no, status, language,
    submitted_data, assigned_organization_id, assigned_user_id,
    submitted_at
  ) VALUES (
    v_tenant, v_worker_primary, v_service_immigration,
    'DEMO-APP-0002', 'reviewing', 'si',
    '{"caseType":"foreigner_registration","demo":true}'::jsonb,
    v_org_sejoong, v_user_immigration, now()
  ) RETURNING id INTO v_application_immigration;

  INSERT INTO public.staycare_service_applications (
    tenant_id, worker_id, service_id, application_no, status, language,
    submitted_data, assigned_organization_id, assigned_user_id,
    submitted_at
  ) VALUES (
    v_tenant, v_worker_primary, v_service_salary,
    'DEMO-APP-0003', 'submitted', 'si',
    '{"preferredArea":"Incheon","demo":true}'::jsonb,
    v_org_operator, v_user_operator_agent, now()
  ) RETURNING id INTO v_application_salary;

  INSERT INTO public.staycare_service_applications (
    tenant_id, worker_id, service_id, provider_connection_id,
    application_no, status, language, submitted_data,
    assigned_organization_id, submitted_at, external_reference
  ) VALUES (
    v_tenant, v_worker_primary, v_service_remittance, v_provider_remittance,
    'DEMO-APP-0004', 'waiting_worker', 'si',
    '{"sourceCurrency":"KRW","destinationCurrency":"LKR","demo":true}'::jsonb,
    v_org_provider, now(), 'DEMO-REM-001'
  ) RETURNING id INTO v_application_remittance;

  INSERT INTO public.staycare_application_events (
    tenant_id, application_id, event_type, visible_to_worker, body, created_by
  ) VALUES
    (
      v_tenant, v_application_telecom, 'provider_ready_for_pickup', true,
      '{"ko":"공항 수령 준비가 완료되었습니다.","en":"Airport pickup is ready.","si":"ගුවන් තොටුපළ ලබාගැනීම සූදානම්."}'::jsonb,
      v_user_operator_agent
    ),
    (
      v_tenant, v_application_immigration, 'document_review_started', true,
      '{"ko":"외국인등록 서류를 검토 중입니다.","en":"Registration documents are under review.","si":"ලියාපදිංචි ලේඛන පරීක්ෂා කරමින් පවතී."}'::jsonb,
      v_user_immigration
    );

  -- --------------------------------------------------------------------------
  -- 11. Telecom order and immigration case
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_telecom_orders (
    tenant_id, application_id, worker_id, sim_type, device_model,
    imei_last6, device_compatible, identity_method, delivery_method,
    arrival_airport, arrival_terminal, pickup_location, order_status
  ) VALUES (
    v_tenant, v_application_telecom, v_worker_primary, 'esim',
    'Demo Phone Pro', '123456', true, 'passport', 'airport',
    'ICN', 'T1', 'Demo telecom counter', 'ready_for_pickup'
  );

  INSERT INTO public.staycare_immigration_cases (
    tenant_id, application_id, worker_id, case_type, official_authority,
    deadline_at, appointment_at, status, required_documents, assigned_user_id
  ) VALUES (
    v_tenant, v_application_immigration, v_worker_primary,
    'foreigner_registration', 'Demo Immigration Office',
    now() + interval '25 days', now() + interval '7 days', 'reviewing',
    '["passport","employment_contract","accommodation_confirmation"]'::jsonb,
    v_user_immigration
  );

  -- --------------------------------------------------------------------------
  -- 12. Remittance beneficiary and intent contain synthetic/masked values only
  -- --------------------------------------------------------------------------
  WITH beneficiary AS (
    INSERT INTO public.staycare_remittance_beneficiaries (
      tenant_id, worker_id, full_name, relationship, country_code,
      bank_name, bank_branch, account_masked, verification_status
    ) VALUES (
      v_tenant, v_worker_primary, 'Demo Beneficiary', 'family', 'LK',
      'Demo Lanka Bank', 'Colombo Demo Branch', '****1234', 'submitted'
    )
    RETURNING id
  )
  INSERT INTO public.staycare_remittance_intents (
    tenant_id, application_id, worker_id, beneficiary_id,
    provider_connection_id, source_currency, source_amount,
    destination_currency, quoted_rate, quoted_fee,
    quoted_destination_amount, quote_expires_at, purpose_code, status
  )
  SELECT
    v_tenant, v_application_remittance, v_worker_primary, beneficiary.id,
    v_provider_remittance, 'KRW', 500000,
    'LKR', 0.22500000, 5000,
    111375, now() + interval '30 minutes', 'family_support', 'quoted'
  FROM beneficiary;

  -- --------------------------------------------------------------------------
  -- 13. Ticket, return plan, consents and notifications
  -- --------------------------------------------------------------------------
  INSERT INTO public.staycare_tickets (
    tenant_id, worker_id, application_id, ticket_no, title, category,
    priority, status, intake_channel, description,
    assigned_department, assigned_organization_id, assigned_user_id,
    first_response_due_at, resolution_due_at,
    worker_visible_summary, employer_visible_summary, created_by
  ) VALUES (
    v_tenant, v_worker_primary, v_application_immigration,
    'DEMO-TKT-0001',
    'Foreigner registration appointment document check',
    'immigration', 'P2', 'in_progress', 'app',
    'Synthetic demo request. No real personal information is included.',
    'Immigration Desk', v_org_sejoong, v_user_immigration,
    now() + interval '1 day', now() + interval '5 days',
    'Sejoong is reviewing the appointment checklist.',
    'Registration preparation is in progress.',
    v_user_worker
  );

  INSERT INTO public.staycare_return_plans (
    tenant_id, worker_id, expected_return_date, contract_end_date,
    final_salary_status, severance_status, insurance_claim_status,
    final_remittance_status, bank_closure_status, telecom_closure_status,
    accommodation_checkout_status, departure_record_status,
    reintegration_status, checklist, status, assigned_user_id
  ) VALUES (
    v_tenant, v_worker_primary, DATE '2029-08-01', DATE '2029-07-31',
    'not_started', 'not_started', 'not_started',
    'not_started', 'not_started', 'not_started',
    'not_started', 'not_started', 'not_started',
    '["final_salary","severance","insurance","remittance","bank","telecom","housing","departure"]'::jsonb,
    'not_started', v_user_operator_manager
  );

  INSERT INTO public.staycare_consents (
    tenant_id, worker_id, consent_type, document_version,
    language, granted, source, evidence
  ) VALUES
    (v_tenant, v_worker_primary, 'terms',         'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb),
    (v_tenant, v_worker_primary, 'privacy',       'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb),
    (v_tenant, v_worker_primary, 'sensitive',     'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb),
    (v_tenant, v_worker_primary, 'third_party',   'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb),
    (v_tenant, v_worker_primary, 'outsourcing',   'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb),
    (v_tenant, v_worker_primary, 'ai',            'demo-v1', 'si', true, 'admin_import', '{"demo":true,"synthetic":true}'::jsonb);

  INSERT INTO public.staycare_notifications (
    tenant_id, worker_id, user_id, channel, language,
    template_code, subject, body, status, sent_at
  ) VALUES
    (
      v_tenant, v_worker_primary, v_user_worker, 'in_app', 'si',
      'demo_registration_reminder',
      'Foreigner registration appointment',
      'Your synthetic demo appointment checklist is ready.',
      'sent', now()
    ),
    (
      v_tenant, v_worker_primary, v_user_worker, 'in_app', 'si',
      'demo_esim_ready',
      'eSIM / airport pickup',
      'Your synthetic demo telecom order is ready for airport pickup.',
      'sent', now()
    );

  INSERT INTO public.staycare_audit_events (
    tenant_id, actor_user_id, actor_role, action,
    entity_type, entity_id, severity, metadata
  ) VALUES (
    v_tenant, v_user_admin, 'demo_sql_seed', 'demo.tenant_seeded',
    'staycare_tenants', v_tenant, 'info',
    jsonb_build_object(
      'demo', true,
      'synthetic', true,
      'authUsers', 10,
      'workers', 3,
      'applications', 4,
      'seededAt', now()
    )
  );
END
$$;

COMMIT;

-- ============================================================================
-- Verification result
-- Expected: 1 tenant, 10 memberships, 3 workers, 4 applications, 5 services
-- ============================================================================
SELECT
  tenants.slug,
  tenants.name,
  (SELECT count(*) FROM public.staycare_memberships memberships WHERE memberships.tenant_id = tenants.id) AS memberships,
  (SELECT count(*) FROM public.staycare_workers workers WHERE workers.tenant_id = tenants.id) AS workers,
  (SELECT count(*) FROM public.staycare_service_catalog services WHERE services.tenant_id = tenants.id) AS services,
  (SELECT count(*) FROM public.staycare_service_applications applications WHERE applications.tenant_id = tenants.id) AS applications,
  (SELECT count(*) FROM public.staycare_tickets tickets WHERE tickets.tenant_id = tenants.id) AS tickets,
  (SELECT count(*) FROM public.staycare_audit_events audit_events WHERE audit_events.tenant_id = tenants.id) AS audit_events
FROM public.staycare_tenants tenants
WHERE tenants.slug = 'sejoong-staycare-demo';
