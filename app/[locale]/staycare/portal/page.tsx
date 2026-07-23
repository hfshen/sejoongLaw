import type { Metadata } from "next"
import StayCarePartnerWorkspace, {
  type PartnerApplication,
  type PartnerTicket,
  type PartnerWorker,
} from "@/components/staycare/StayCarePartnerWorkspace"
import { requireExternalPortalContext } from "@/lib/staycare/auth"
import {
  getStayCareRoleCapabilities,
  isStayCareRole,
} from "@/lib/staycare/role-capabilities"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 협력기관 포털",
  robots: { index: false, follow: false },
}

const externalRoles = ["employer_admin", "institution_admin", "provider_agent"] as const
type ExternalRole = (typeof externalRoles)[number]

function asExternalRole(value: unknown): ExternalRole {
  return externalRoles.includes(value as ExternalRole)
    ? (value as ExternalRole)
    : "employer_admin"
}

export default async function StayCareExternalPortalPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireExternalPortalContext(locale)
  const role = asExternalRole(context.memberships[0]?.role)
  const capabilities = getStayCareRoleCapabilities(isStayCareRole(role) ? role : "employer_admin")
  const tenantIds = Array.from(
    new Set<string>(context.memberships.map((membership) => String(membership.tenant_id)))
  )
  const organizationIds = Array.from(
    new Set<string>(
      context.memberships
        .map((membership) => membership.organization_id)
        .filter(Boolean)
        .map(String)
    )
  )

  const [organizationsResult, workersResult, applicationsResult, ticketsResult] = await Promise.all([
    organizationIds.length
      ? context.supabase
          .from("staycare_organizations")
          .select("id, name")
          .in("id", organizationIds)
      : Promise.resolve({ data: [], error: null }),
    context.supabase
      .from("staycare_workers")
      .select(
        "id, member_no, full_name, full_name_en, status, current_phase, profile_completion, visa_type, expected_arrival_date, visa_expires_at, next_action, next_action_due_at"
      )
      .in("tenant_id", tenantIds)
      .neq("status", "closed")
      .order("profile_completion", { ascending: true })
      .limit(500),
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, submitted_at, external_reference, rejected_reason, submitted_data, worker:staycare_workers(member_no, full_name, full_name_en), service:staycare_service_catalog(code, category, name), events:staycare_application_events(id, event_type, body, created_at)"
      )
      .in("tenant_id", tenantIds)
      .not("status", "in", "(cancelled)")
      .order("created_at", { ascending: false })
      .limit(300),
    context.supabase
      .from("staycare_tickets")
      .select(
        "id, ticket_no, title, category, priority, status, employer_visible_summary, created_at, worker:staycare_workers(member_no, full_name, full_name_en)"
      )
      .in("tenant_id", tenantIds)
      .order("created_at", { ascending: false })
      .limit(200),
  ])

  const firstError = [
    organizationsResult.error,
    workersResult.error,
    applicationsResult.error,
    ticketsResult.error,
  ].find(Boolean)
  if (firstError) throw firstError

  const organizationName =
    organizationsResult.data?.map((organization) => organization.name).join(" · ") ||
    "Sejoong StayCare Partner"

  return (
    <StayCarePartnerWorkspace
      locale={locale}
      role={role}
      capabilities={capabilities}
      organizationName={organizationName}
      userEmail={context.user.email}
      initialWorkers={(workersResult.data || []) as PartnerWorker[]}
      initialApplications={(applicationsResult.data || []) as unknown as PartnerApplication[]}
      initialTickets={(ticketsResult.data || []) as unknown as PartnerTicket[]}
    />
  )
}
