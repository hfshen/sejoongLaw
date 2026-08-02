import type { Metadata } from "next"
import StayCareStaffWorkspace, {
  type StaffApplication,
  type StaffAuditEvent,
  type StaffDocument,
  type StaffImmigrationCase,
  type StaffTicket,
  type StaffWorker,
} from "@/components/staycare/StayCareStaffWorkspace"
import {
  getStayCareEnvironmentReport,
  type StayCareEnvironmentReport,
} from "@/lib/env/staycare-status"
import { requireStaffContext } from "@/lib/staycare/auth"
import { membershipsForRole } from "@/lib/staycare/authorization"
import {
  getStayCareRoleCapabilities,
  isStayCareRole,
  type StayCareRole,
} from "@/lib/staycare/role-capabilities"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 통합 운영센터",
  robots: { index: false, follow: false },
}

const rolePriority: StayCareRole[] = [
  "sejoong_admin",
  "sejoong_lawyer",
  "immigration_manager",
  "operator_manager",
  "operator_agent",
  "auditor",
]

const lawyerApplicationCategories = new Set([
  "legal",
  "labor",
  "human_rights",
  "immigration",
])
const lawyerTicketCategories = new Set([
  "legal",
  "labor",
  "human_rights",
  "emergency_followup",
])
const legalDocumentTypes = new Set([
  "passport",
  "visa",
  "employment_contract",
  "foreigner_registration",
  "complaint",
  "medical_record",
])
const immigrationDocumentTypes = new Set([
  "passport",
  "visa",
  "employment_contract",
  "foreigner_registration",
  "accommodation_confirmation",
])

function relationId(value: unknown) {
  if (!value || typeof value !== "object") return null
  const id = (value as { id?: unknown }).id
  return typeof id === "string" ? id : null
}

function restrictedEnvironmentReport(): StayCareEnvironmentReport {
  return {
    environment: "restricted",
    commitSha: null,
    generatedAt: new Date().toISOString(),
    items: [],
    summary: {
      coreConfigured: 0,
      coreTotal: 0,
      productionConfigured: 0,
      productionTotal: 0,
      overallConfigured: 0,
      overallTotal: 0,
      percentage: 0,
      releaseState: "blocked",
    },
  }
}

export default async function StayCareAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireStaffContext(locale)

  const role =
    rolePriority.find((candidate) =>
      context.memberships.some((membership) => membership.role === candidate)
    ) || "auditor"
  const safeRole = isStayCareRole(role) ? role : "auditor"
  const capabilities = getStayCareRoleCapabilities(safeRole)

  // A user may hold different roles in different tenants. Only memberships for
  // the selected workspace role are queried, preventing authority in tenant A
  // from widening read or mutation scope in tenant B.
  const roleMemberships = membershipsForRole(context.memberships, safeRole)
  const tenantIds = Array.from(
    new Set<string>(
      roleMemberships.map((membership) => String(membership.tenant_id))
    )
  )

  if (!tenantIds.length) {
    throw new Error("StayCare staff account has no active membership for this role.")
  }

  const [
    applicationsResult,
    workersResult,
    documentsResult,
    ticketsResult,
    immigrationResult,
    auditResult,
  ] = await Promise.all([
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, submitted_at, external_reference, rejected_reason, submitted_data, assigned_user_id, worker:staycare_workers(id, full_name, full_name_en, member_no, visa_type), service:staycare_service_catalog(code, category, name, integration_mode), events:staycare_application_events(id, event_type, body, created_at)"
      )
      .in("tenant_id", tenantIds)
      .order("created_at", { ascending: false })
      .limit(500),
    context.supabase
      .from("staycare_workers")
      .select(
        "id, member_no, full_name, full_name_en, status, current_phase, profile_completion, visa_type, occupation, expected_arrival_date, visa_expires_at, passport_expires_at, next_action, next_action_due_at, risk_score, employer:staycare_organizations!staycare_workers_employer_organization_id_fkey(name), training:staycare_organizations!staycare_workers_training_organization_id_fkey(name)"
      )
      .in("tenant_id", tenantIds)
      .neq("status", "closed")
      .order("risk_score", { ascending: false })
      .limit(1000),
    context.supabase
      .from("staycare_documents")
      .select(
        "id, document_type, original_filename, mime_type, byte_size, status, rejection_reason, expiry_date, created_at, worker:staycare_workers(id, full_name, full_name_en, member_no)"
      )
      .in("tenant_id", tenantIds)
      .neq("status", "deleted")
      .order("created_at", { ascending: false })
      .limit(500),
    context.supabase
      .from("staycare_tickets")
      .select(
        "id, ticket_no, title, category, priority, status, description, assigned_department, assigned_user_id, worker_visible_summary, first_response_due_at, resolution_due_at, created_at, worker:staycare_workers(id, full_name, full_name_en, member_no), events:staycare_ticket_events(id, event_type, worker_visible, body, created_at)"
      )
      .in("tenant_id", tenantIds)
      .neq("status", "closed")
      .order("created_at", { ascending: false })
      .limit(500),
    context.supabase
      .from("staycare_immigration_cases")
      .select(
        "id, case_type, official_authority, official_reference, deadline_at, appointment_at, status, required_documents, decision_summary, assigned_user_id, worker:staycare_workers(id, full_name, full_name_en, member_no)"
      )
      .in("tenant_id", tenantIds)
      .order("deadline_at", { ascending: true, nullsFirst: false })
      .limit(500),
    capabilities.canSeeEnvironment || safeRole === "auditor"
      ? context.supabase
          .from("staycare_audit_events")
          .select(
            "id, actor_role, action, entity_type, severity, metadata, occurred_at"
          )
          .in("tenant_id", tenantIds)
          .order("occurred_at", { ascending: false })
          .limit(300)
      : Promise.resolve({ data: [], error: null }),
  ])

  const error = [
    applicationsResult.error,
    workersResult.error,
    documentsResult.error,
    ticketsResult.error,
    immigrationResult.error,
    auditResult.error,
  ].find(Boolean)
  if (error) throw error

  const allApplications = (applicationsResult.data || []) as unknown as StaffApplication[]
  const allWorkers = (workersResult.data || []) as unknown as StaffWorker[]
  const allDocuments = (documentsResult.data || []) as unknown as StaffDocument[]
  const allTickets = (ticketsResult.data || []) as unknown as Array<
    StaffTicket & { assigned_user_id?: string | null }
  >
  const allImmigrationCases = (immigrationResult.data || []) as unknown as Array<
    StaffImmigrationCase & {
      assigned_user_id?: string | null
      worker?: {
        id?: string
        member_no?: string
        full_name?: string
        full_name_en?: string | null
      } | null
    }
  >

  let applications = allApplications
  let documents = allDocuments
  let tickets: StaffTicket[] = allTickets
  let immigrationCases: StaffImmigrationCase[] = allImmigrationCases
  let workers = allWorkers
  let auditEvents = (auditResult.data || []) as StaffAuditEvent[]

  if (safeRole === "sejoong_lawyer") {
    applications = allApplications.filter((application) =>
      lawyerApplicationCategories.has(application.service?.category || "")
    )
    tickets = allTickets.filter(
      (ticket) =>
        lawyerTicketCategories.has(ticket.category) ||
        ["P0", "P1"].includes(ticket.priority)
    )
    documents = allDocuments.filter((document) =>
      legalDocumentTypes.has(document.document_type)
    )
    auditEvents = []
  }

  if (safeRole === "immigration_manager") {
    applications = allApplications.filter(
      (application) => application.service?.category === "immigration"
    )
    tickets = allTickets.filter((ticket) => ticket.category === "immigration")
    documents = allDocuments.filter((document) =>
      immigrationDocumentTypes.has(document.document_type)
    )
    auditEvents = []
  }

  if (safeRole === "operator_agent") {
    applications = allApplications.filter(
      (application) =>
        !application.assigned_user_id ||
        application.assigned_user_id === context.user.id
    )
    tickets = allTickets.filter(
      (ticket) =>
        !ticket.assigned_user_id || ticket.assigned_user_id === context.user.id
    )
    immigrationCases = allImmigrationCases.filter(
      (item) =>
        !item.assigned_user_id || item.assigned_user_id === context.user.id
    )
    documents = allDocuments.filter((document) =>
      ["uploaded", "scanning", "review_required", "rejected"].includes(
        document.status
      )
    )
    auditEvents = []
  }

  if (
    ["sejoong_lawyer", "immigration_manager", "operator_agent"].includes(
      safeRole
    )
  ) {
    const scopedWorkerIds = new Set<string>()
    applications.forEach((item) => {
      const id = relationId(item.worker)
      if (id) scopedWorkerIds.add(id)
    })
    documents.forEach((item) => {
      const id = relationId(item.worker)
      if (id) scopedWorkerIds.add(id)
    })
    tickets.forEach((item) => {
      const id = relationId(item.worker)
      if (id) scopedWorkerIds.add(id)
    })
    immigrationCases.forEach((item) => {
      const id = relationId(item.worker)
      if (id) scopedWorkerIds.add(id)
    })
    workers = allWorkers.filter((worker) => scopedWorkerIds.has(worker.id))
  }

  if (!["sejoong_admin", "operator_manager", "auditor"].includes(safeRole)) {
    auditEvents = []
  }

  const environment = capabilities.canSeeEnvironment
    ? getStayCareEnvironmentReport()
    : restrictedEnvironmentReport()

  return (
    <StayCareStaffWorkspace
      locale={locale}
      role={safeRole}
      capabilities={capabilities}
      userEmail={context.user.email}
      applications={applications}
      workers={workers}
      documents={documents}
      tickets={tickets}
      immigrationCases={immigrationCases}
      auditEvents={auditEvents}
      environment={environment}
      databaseStatus={{ connected: true, tenantCount: tenantIds.length }}
    />
  )
}
