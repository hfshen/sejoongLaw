import type { Metadata } from "next"
import StayCareStaffWorkspace, {
  type StaffApplication,
  type StaffAuditEvent,
  type StaffDocument,
  type StaffImmigrationCase,
  type StaffTicket,
  type StaffWorker,
} from "@/components/staycare/StayCareStaffWorkspace"
import { getStayCareEnvironmentReport } from "@/lib/env/staycare-status"
import { requireStaffContext } from "@/lib/staycare/auth"
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

export default async function StayCareAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireStaffContext(locale)
  const tenantIds = Array.from(
    new Set<string>(context.memberships.map((membership) => String(membership.tenant_id)))
  )

  if (!tenantIds.length) {
    throw new Error("StayCare staff account has no active tenant membership.")
  }

  const role = rolePriority.find((candidate) =>
    context.memberships.some((membership) => membership.role === candidate)
  ) || "auditor"
  const safeRole = isStayCareRole(role) ? role : "auditor"
  const capabilities = getStayCareRoleCapabilities(safeRole)

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
        "id, ticket_no, title, category, priority, status, description, assigned_department, worker_visible_summary, first_response_due_at, resolution_due_at, created_at, worker:staycare_workers(id, full_name, full_name_en, member_no), events:staycare_ticket_events(id, event_type, worker_visible, body, created_at)"
      )
      .in("tenant_id", tenantIds)
      .not("status", "eq", "closed")
      .order("created_at", { ascending: false })
      .limit(500),
    context.supabase
      .from("staycare_immigration_cases")
      .select(
        "id, case_type, official_authority, official_reference, deadline_at, appointment_at, status, required_documents, decision_summary, worker:staycare_workers(full_name, full_name_en, member_no)"
      )
      .in("tenant_id", tenantIds)
      .order("deadline_at", { ascending: true, nullsFirst: false })
      .limit(500),
    context.supabase
      .from("staycare_audit_events")
      .select("id, actor_role, action, entity_type, severity, metadata, occurred_at")
      .in("tenant_id", tenantIds)
      .order("occurred_at", { ascending: false })
      .limit(300),
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

  return (
    <StayCareStaffWorkspace
      role={safeRole}
      capabilities={capabilities}
      userEmail={context.user.email}
      applications={(applicationsResult.data || []) as unknown as StaffApplication[]}
      workers={(workersResult.data || []) as unknown as StaffWorker[]}
      documents={(documentsResult.data || []) as unknown as StaffDocument[]}
      tickets={(ticketsResult.data || []) as unknown as StaffTicket[]}
      immigrationCases={(immigrationResult.data || []) as unknown as StaffImmigrationCase[]}
      auditEvents={(auditResult.data || []) as StaffAuditEvent[]}
      environment={getStayCareEnvironmentReport()}
      databaseStatus={{ connected: true, tenantCount: tenantIds.length }}
    />
  )
}
