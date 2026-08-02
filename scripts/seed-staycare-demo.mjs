#!/usr/bin/env node

import { readFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const config = JSON.parse(
  await readFile(resolve(root, "config/staycare-demo-accounts.json"), "utf8")
)

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function findUserByEmail(targetEmail) {
  for (let page = 1; page <= 30; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const user = data.users.find((item) => item.email?.toLowerCase() === targetEmail)
    if (user) return user
    if (data.users.length < 100) return null
  }
  return null
}

async function ensureAuthUser(account) {
  const existing = await findUserByEmail(account.email)
  const metadata = {
    demo: true,
    demo_role: account.role,
    demo_tenant_slug: config.tenantSlug,
  }

  if (existing) {
    const { data, error } = await supabase.auth.admin.updateUserById(existing.id, {
      password: config.sharedPassword,
      email_confirm: true,
      user_metadata: {
        ...(existing.user_metadata || {}),
        ...metadata,
        display_name: account.label.en,
      },
      app_metadata: {
        ...(existing.app_metadata || {}),
        ...metadata,
      },
    })
    if (error || !data.user) throw error || new Error(`Unable to update ${account.email}`)
    return data.user
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: account.email,
    password: config.sharedPassword,
    email_confirm: true,
    user_metadata: { ...metadata, display_name: account.label.en },
    app_metadata: metadata,
  })
  if (error || !data.user) throw error || new Error(`Unable to create ${account.email}`)
  return data.user
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 86400000).toISOString()
}

async function insertOne(table, row, columns = "*") {
  const { data, error } = await supabase.from(table).insert(row).select(columns).single()
  if (error || !data) throw error || new Error(`Unable to insert ${table}`)
  return data
}

async function main() {
  console.log(`Resetting isolated demo tenant: ${config.tenantSlug}`)

  const { data: existingTenant, error: existingTenantError } = await supabase
    .from("staycare_tenants")
    .select("id")
    .eq("slug", config.tenantSlug)
    .maybeSingle()
  if (existingTenantError) throw existingTenantError
  if (existingTenant?.id) {
    const { error } = await supabase.from("staycare_tenants").delete().eq("id", existingTenant.id)
    if (error) throw error
  }

  const tenant = await insertOne("staycare_tenants", {
    slug: config.tenantSlug,
    name: "Sejoong StayCare Demo",
    service_owner_name: "법무법인 세중",
    status: "active",
    default_language: "si",
    timezone: "Asia/Seoul",
  }, "id, slug, name")

  const organizationRows = [
    {
      key: "sejoong",
      type: "sejoong",
      name: "법무법인 세중 Demo",
      country_code: "KR",
      supported_languages: ["ko", "en", "si", "ta"],
    },
    {
      key: "operator",
      type: "operator",
      name: "StayCare Demo Operations",
      country_code: "KR",
      supported_languages: ["ko", "en", "si", "ta"],
    },
    {
      key: "employer",
      type: "employer",
      name: "Demo Manufacturing Korea",
      country_code: "KR",
      supported_languages: ["ko", "en", "si", "ta"],
    },
    {
      key: "institution",
      type: "training_institution",
      name: "Sri Lanka Demo Training Institute",
      country_code: "LK",
      supported_languages: ["ko", "en", "si", "ta"],
    },
    {
      key: "provider",
      type: "provider",
      name: "Demo Telecom & Remittance Provider",
      country_code: "KR",
      supported_languages: ["ko", "en", "si", "ta"],
    },
  ]

  const organizations = {}
  for (const item of organizationRows) {
    organizations[item.key] = await insertOne("staycare_organizations", {
      tenant_id: tenant.id,
      type: item.type,
      name: item.name,
      country_code: item.country_code,
      supported_languages: item.supported_languages,
      service_regions: ["Seoul", "Incheon", "Gyeonggi"],
      status: "active",
      metadata: { demo: true },
    }, "id, name, type")
  }

  const users = {}
  for (const account of config.accounts) {
    users[account.id] = await ensureAuthUser(account)
  }

  const organizationForRole = {
    worker: null,
    sejoong_admin: organizations.sejoong.id,
    sejoong_lawyer: organizations.sejoong.id,
    immigration_manager: organizations.sejoong.id,
    operator_manager: organizations.operator.id,
    operator_agent: organizations.operator.id,
    employer_admin: organizations.employer.id,
    institution_admin: organizations.institution.id,
    provider_agent: organizations.provider.id,
    auditor: organizations.sejoong.id,
  }

  const membershipRows = config.accounts.map((account) => ({
    tenant_id: tenant.id,
    organization_id: organizationForRole[account.role] || null,
    user_id: users[account.id].id,
    role: account.role,
    status: "active",
    activated_at: new Date().toISOString(),
  }))
  const { error: membershipError } = await supabase
    .from("staycare_memberships")
    .insert(membershipRows)
  if (membershipError) throw membershipError

  const workerRows = [
    {
      tenant_id: tenant.id,
      auth_user_id: users.worker.id,
      employer_organization_id: organizations.employer.id,
      training_organization_id: organizations.institution.id,
      member_no: "DEMO-LK-001",
      full_name: "Kasun Jayasinghe",
      full_name_en: "KASUN JAYASINGHE",
      nationality_code: "LK",
      preferred_language: "si",
      visa_type: "E-9",
      occupation: "Manufacturing",
      status: "settling",
      current_phase: "settlement",
      expected_arrival_date: "2026-08-15",
      visa_expires_at: "2029-08-14",
      passport_expires_at: "2031-03-20",
      foreigner_registration_status: "scheduled",
      phone_number: "+82-10-0000-0001",
      accommodation_summary: "Demo dormitory, Incheon",
      risk_score: 18,
      profile_completion: 72,
      next_action: "Complete foreigner registration appointment documents",
      next_action_due_at: daysFromNow(7),
      metadata: { demo: true, synthetic: true },
    },
    {
      tenant_id: tenant.id,
      auth_user_id: null,
      employer_organization_id: organizations.employer.id,
      training_organization_id: organizations.institution.id,
      member_no: "DEMO-LK-002",
      full_name: "Nimal Perera",
      full_name_en: "NIMAL PERERA",
      nationality_code: "LK",
      preferred_language: "si",
      visa_type: "E-9",
      occupation: "Manufacturing",
      status: "preparing",
      current_phase: "prepare",
      profile_completion: 44,
      risk_score: 32,
      next_action: "Upload training completion record",
      next_action_due_at: daysFromNow(12),
      metadata: { demo: true, synthetic: true },
    },
    {
      tenant_id: tenant.id,
      auth_user_id: null,
      employer_organization_id: organizations.employer.id,
      training_organization_id: organizations.institution.id,
      member_no: "DEMO-LK-003",
      full_name: "Kumari Silva",
      full_name_en: "KUMARI SILVA",
      nationality_code: "LK",
      preferred_language: "en",
      visa_type: "E-9",
      occupation: "Food processing",
      status: "pre_departure",
      current_phase: "pre_departure",
      expected_arrival_date: "2026-09-03",
      profile_completion: 88,
      risk_score: 9,
      next_action: "Confirm airport SIM pickup and accommodation transfer",
      next_action_due_at: daysFromNow(20),
      metadata: { demo: true, synthetic: true },
    },
  ]

  const { data: workers, error: workersError } = await supabase
    .from("staycare_workers")
    .insert(workerRows)
    .select("id, member_no, auth_user_id")
  if (workersError || !workers?.length) throw workersError || new Error("Unable to create demo workers")
  const worker = workers.find((item) => item.member_no === "DEMO-LK-001")
  if (!worker) throw new Error("Primary demo worker was not created")

  const journey = await insertOne("staycare_journey_instances", {
    tenant_id: tenant.id,
    worker_id: worker.id,
    current_phase: "settlement",
    status: "active",
    metadata: { demo: true },
  }, "id")

  const steps = [
    ["official-recruitment", "official", "Official recruitment and EPS status", "නිල බඳවාගැනීම් හා EPS තත්ත්වය", true, true, "completed"],
    ["visa-issued", "official", "Visa issued", "වීසා නිකුත් කර ඇත", true, true, "completed"],
    ["esim-order", "pre_departure", "Select eSIM or airport SIM pickup", "eSIM හෝ ගුවන් තොටුපළ SIM තෝරන්න", false, true, "completed"],
    ["arrival-transfer", "arrival", "Airport handover and accommodation transfer", "ගුවන් තොටුපළ භාරදීම හා නවාතැන් ගමන්", false, true, "completed"],
    ["foreigner-registration", "settlement", "Foreigner registration appointment", "විදේශික ලියාපදිංචි හමුව", true, true, "in_progress"],
    ["salary-account", "settlement", "Salary bank account preparation", "වැටුප් බැංකු ගිණුම සූදානම් කිරීම", false, true, "ready"],
    ["remittance-setup", "living", "Sri Lanka remittance beneficiary setup", "ශ්‍රී ලංකා මුදල් ලබන්නා සකස් කිරීම", false, false, "not_started"],
    ["stay-extension", "renewal", "Stay extension deadline management", "රැඳී සිටීම දිගු කිරීමේ කාලසීමාව", true, true, "not_started"],
    ["return-plan", "return", "Salary, insurance, remittance and return checklist", "වැටුප්, රක්ෂණ, මුදල් යැවීම හා ආපසු යාමේ ලැයිස්තුව", false, true, "not_started"],
  ].map(([code, phase, englishTitle, sinhalaTitle, official, required, status]) => ({
    tenant_id: tenant.id,
    journey_id: journey.id,
    worker_id: worker.id,
    step_code: code,
    phase,
    title: { ko: englishTitle, en: englishTitle, si: sinhalaTitle },
    description: {
      ko: `${englishTitle} 단계의 준비자료와 진행상태를 확인합니다.`,
      en: `Review required records and status for ${englishTitle}.`,
      si: `${sinhalaTitle} සඳහා අවශ්‍ය ලේඛන සහ තත්ත්වය බලන්න.`,
    },
    responsibility: official ? ["government", "sejoong", "worker"] : ["sejoong", "partner", "worker"],
    official_process: official,
    required,
    status,
    due_at: ["completed", "not_started"].includes(status) ? null : daysFromNow(7),
    data: { demo: true, actions: ["guide", "track"] },
    completed_at: status === "completed" ? new Date().toISOString() : null,
  }))
  const { error: stepsError } = await supabase.from("staycare_journey_steps").insert(steps)
  if (stepsError) throw stepsError

  const serviceRows = [
    {
      code: "telecom-esim",
      category: "telecom",
      name: { ko: "eSIM·SIM 사전신청", en: "eSIM / SIM pre-order", si: "eSIM / SIM පෙර ඇණවුම" },
      description: { ko: "단말 호환성을 확인하고 공항수령·숙소배송·eSIM을 신청합니다.", en: "Check device compatibility and request eSIM, airport pickup or accommodation delivery.", si: "උපාංග ගැළපීම පරීක්ෂා කර eSIM හෝ ලබාගැනීම ඉල්ලන්න." },
      available_from_phase: "pre_departure",
      ownership: ["sejoong", "partner"],
      delivery_modes: ["digital", "airport", "accommodation"],
      integration_mode: "manual_review",
    },
    {
      code: "salary-account",
      category: "finance",
      name: { ko: "급여계좌 준비", en: "Salary account preparation", si: "වැටුප් ගිණුම සූදානම් කිරීම" },
      description: { ko: "은행 방문자료, 예약과 계좌개설 진행상태를 관리합니다.", en: "Manage bank-visit records, appointments and account-opening status.", si: "බැංකු ලේඛන, හමුවීම් සහ ගිණුම් තත්ත්වය පාලනය කරන්න." },
      available_from_phase: "settlement",
      ownership: ["sejoong", "partner"],
      delivery_modes: ["branch"],
      integration_mode: "manual_review",
    },
    {
      code: "lk-remittance",
      category: "remittance",
      name: { ko: "스리랑카 본국송금", en: "Sri Lanka remittance", si: "ශ්‍රී ලංකා මුදල් යැවීම" },
      description: { ko: "등록된 송금사업자의 견적·본인확인·처리상태와 영수증을 연결합니다.", en: "Connect licensed-provider quotes, identity checks, transfer status and receipts.", si: "බලපත්‍රලාභී සේවා සපයන්නාගේ මිල, තහවුරු කිරීම සහ ලදුපත සම්බන්ධ කරන්න." },
      available_from_phase: "living",
      ownership: ["sejoong", "partner"],
      delivery_modes: ["digital"],
      integration_mode: "manual_review",
    },
    {
      code: "stay-administration",
      category: "immigration",
      name: { ko: "체류행정 데스크", en: "Stay administration desk", si: "රැඳී සිටීමේ පරිපාලන සේවාව" },
      description: { ko: "외국인등록, 주소변경, 체류연장과 귀국절차의 자료·기한을 관리합니다.", en: "Manage records and deadlines for registration, address changes, extension and departure.", si: "ලියාපදිංචිය, ලිපිනය, දිගු කිරීම සහ පිටත්වීමේ ලේඛන හා කාලසීමා පාලනය කරන්න." },
      available_from_phase: "arrival",
      ownership: ["government", "sejoong"],
      delivery_modes: ["digital", "branch"],
      integration_mode: "manual_review",
    },
    {
      code: "return-support",
      category: "return",
      name: { ko: "귀국 원스톱 준비", en: "Return preparation", si: "ආපසු යාමේ සූදානම" },
      description: { ko: "최종급여, 보험, 송금, 통신·계좌·숙소 종료와 출국자료를 관리합니다.", en: "Manage final salary, insurance, remittance, service closure and departure records.", si: "අවසන් වැටුප, රක්ෂණ, මුදල් යැවීම සහ සේවා අවසන් කිරීම පාලනය කරන්න." },
      available_from_phase: "return",
      ownership: ["sejoong", "partner", "worker"],
      delivery_modes: ["digital", "branch"],
      integration_mode: "internal",
    },
  ].map((service) => ({
    ...service,
    tenant_id: tenant.id,
    required_data: [],
    result_description: service.description,
    legal_boundary: {
      ko: "최종 승인과 인가업무는 관계기관 또는 인가 사업자가 수행합니다.",
      en: "Authorities or licensed providers perform final approval and regulated execution.",
      si: "අවසන් අනුමැතිය සහ බලපත්‍ර සේවා නිල ආයතන හෝ බලපත්‍රලාභී සපයන්නන් විසින් සිදු කරයි.",
    },
    status: "active",
  }))

  const { data: services, error: serviceError } = await supabase
    .from("staycare_service_catalog")
    .insert(serviceRows)
    .select("id, code, category")
  if (serviceError || !services?.length) throw serviceError || new Error("Unable to create demo services")
  const serviceByCode = Object.fromEntries(services.map((service) => [service.code, service]))

  const providerConnection = await insertOne("staycare_provider_connections", {
    tenant_id: tenant.id,
    organization_id: organizations.provider.id,
    kind: "telecom",
    provider_code: "demo-provider",
    status: "sandbox",
    auth_type: "manual_portal",
    capabilities: ["esim", "airport_pickup", "remittance_quote"],
    metadata: { demo: true, synthetic: true },
  }, "id")

  const applicationRows = [
    {
      serviceCode: "telecom-esim",
      application_no: "DEMO-APP-0001",
      status: "waiting_provider",
      assigned_organization_id: organizations.provider.id,
      provider_connection_id: providerConnection.id,
      submitted_data: { simType: "esim", deliveryMethod: "airport", airport: "ICN", demo: true },
      external_reference: "DEMO-TEL-001",
    },
    {
      serviceCode: "stay-administration",
      application_no: "DEMO-APP-0002",
      status: "reviewing",
      assigned_organization_id: organizations.sejoong.id,
      provider_connection_id: null,
      submitted_data: { caseType: "foreigner_registration", demo: true },
      external_reference: null,
    },
    {
      serviceCode: "salary-account",
      application_no: "DEMO-APP-0003",
      status: "submitted",
      assigned_organization_id: organizations.operator.id,
      provider_connection_id: null,
      submitted_data: { preferredArea: "Incheon", demo: true },
      external_reference: null,
    },
    {
      serviceCode: "lk-remittance",
      application_no: "DEMO-APP-0004",
      status: "waiting_worker",
      assigned_organization_id: organizations.provider.id,
      provider_connection_id: providerConnection.id,
      submitted_data: { sourceCurrency: "KRW", destinationCurrency: "LKR", demo: true },
      external_reference: "DEMO-REM-001",
    },
  ]

  const createdApplications = []
  for (const item of applicationRows) {
    const service = serviceByCode[item.serviceCode]
    const application = await insertOne("staycare_service_applications", {
      tenant_id: tenant.id,
      worker_id: worker.id,
      service_id: service.id,
      provider_connection_id: item.provider_connection_id,
      application_no: item.application_no,
      status: item.status,
      language: "si",
      submitted_data: item.submitted_data,
      assigned_organization_id: item.assigned_organization_id,
      submitted_at: new Date().toISOString(),
      external_reference: item.external_reference,
    }, "id, application_no, status")
    createdApplications.push(application)
  }

  const telecomApplication = createdApplications.find((item) => item.application_no === "DEMO-APP-0001")
  const immigrationApplication = createdApplications.find((item) => item.application_no === "DEMO-APP-0002")

  await insertOne("staycare_telecom_orders", {
    tenant_id: tenant.id,
    application_id: telecomApplication.id,
    worker_id: worker.id,
    sim_type: "esim",
    device_model: "Demo Phone Pro",
    imei_last6: "123456",
    device_compatible: true,
    identity_method: "passport",
    delivery_method: "airport",
    arrival_airport: "ICN",
    arrival_terminal: "T1",
    pickup_location: "Demo telecom counter",
    order_status: "ready_for_pickup",
  }, "id")

  await insertOne("staycare_immigration_cases", {
    tenant_id: tenant.id,
    application_id: immigrationApplication.id,
    worker_id: worker.id,
    case_type: "foreigner_registration",
    official_authority: "Demo Immigration Office",
    deadline_at: daysFromNow(25),
    appointment_at: daysFromNow(7),
    status: "reviewing",
    required_documents: ["passport", "employment_contract", "accommodation_confirmation"],
    assigned_user_id: users["immigration-manager"].id,
  }, "id")

  await insertOne("staycare_tickets", {
    tenant_id: tenant.id,
    worker_id: worker.id,
    ticket_no: "DEMO-TKT-0001",
    title: "Foreigner registration appointment document check",
    category: "immigration",
    priority: "P2",
    status: "in_progress",
    intake_channel: "app",
    description: "Synthetic demo request. No real personal information is included.",
    assigned_department: "Immigration Desk",
    assigned_organization_id: organizations.sejoong.id,
    assigned_user_id: users["immigration-manager"].id,
    first_response_due_at: daysFromNow(1),
    resolution_due_at: daysFromNow(5),
    worker_visible_summary: "Sejoong is reviewing the appointment checklist.",
    employer_visible_summary: "Registration preparation is in progress.",
    created_by: users.worker.id,
  }, "id")

  await insertOne("staycare_return_plans", {
    tenant_id: tenant.id,
    worker_id: worker.id,
    expected_return_date: "2029-08-01",
    contract_end_date: "2029-07-31",
    final_salary_status: "not_started",
    severance_status: "not_started",
    insurance_claim_status: "not_started",
    final_remittance_status: "not_started",
    bank_closure_status: "not_started",
    telecom_closure_status: "not_started",
    accommodation_checkout_status: "not_started",
    departure_record_status: "not_started",
    reintegration_status: "not_started",
    checklist: ["final_salary", "insurance", "remittance", "bank", "telecom", "housing", "departure"],
    status: "not_started",
  }, "id")

  const consentRows = ["terms", "privacy", "sensitive", "third_party", "ai"].map((consentType) => ({
    tenant_id: tenant.id,
    worker_id: worker.id,
    consent_type: consentType,
    document_version: "demo-v1",
    language: "si",
    granted: true,
    source: "admin_import",
    evidence: { demo: true, synthetic: true },
  }))
  const { error: consentError } = await supabase.from("staycare_consents").insert(consentRows)
  if (consentError) throw consentError

  await supabase.from("staycare_notifications").insert([
    {
      tenant_id: tenant.id,
      worker_id: worker.id,
      user_id: users.worker.id,
      channel: "in_app",
      language: "si",
      template_code: "demo_registration_reminder",
      subject: "Foreigner registration appointment",
      body: "Your synthetic demo appointment checklist is ready.",
      status: "sent",
      sent_at: new Date().toISOString(),
    },
  ])

  await supabase.from("staycare_audit_events").insert({
    tenant_id: tenant.id,
    actor_user_id: users["sejoong-admin"].id,
    actor_role: "demo_seed_script",
    action: "demo.tenant_seeded",
    entity_type: "staycare_tenants",
    entity_id: tenant.id,
    metadata: {
      demo: true,
      accountCount: config.accounts.length,
      workerCount: workerRows.length,
      applicationCount: applicationRows.length,
    },
  })

  console.log("\nStayCare demo tenant is ready.\n")
  console.table(
    config.accounts.map((account) => ({
      role: account.role,
      email: account.email,
      password: config.sharedPassword,
      destination: account.target,
    }))
  )
  console.log(`Tenant: ${tenant.slug}`)
  console.log("Only synthetic demo data was created.")
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
