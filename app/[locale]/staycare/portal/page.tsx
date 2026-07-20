import type { Metadata } from "next"
import StayCareExternalPortal, {
  type ExternalPortalApplication,
  type ExternalPortalWorker,
} from "@/components/staycare/StayCareExternalPortal"
import { requireExternalPortalContext } from "@/lib/staycare/auth"

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

  const [organizationsResult, workersResult, applicationsResult] = await Promise.all([
    organizationIds.length
      ? context.supabase
          .from("staycare_organizations")
          .select("id, name")
          .in("id", organizationIds)
      : Promise.resolve({ data: [], error: null }),
    context.supabase
      .from("staycare_workers")
      .select(
        "id, member_no, full_name, full_name_en, status, current_phase, profile_completion, visa_type, next_action"
      )
      .in("tenant_id", tenantIds)
      .neq("status", "closed")
      .order("profile_completion", { ascending: true })
      .limit(100),
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, submitted_at, worker:staycare_workers(member_no, full_name, full_name_en), service:staycare_service_catalog(code, category, name)"
      )
      .in("tenant_id", tenantIds)
      .not("status", "in", "(fulfilled,cancelled)")
      .order("created_at", { ascending: true })
      .limit(100),
  ])

  const firstError = [
    organizationsResult.error,
    workersResult.error,
    applicationsResult.error,
  ].find(Boolean)
  if (firstError) throw firstError

  const organizationName =
    organizationsResult.data?.map((organization) => organization.name).join(" · ") ||
    "Sejoong StayCare Partner"

  return (
    <StayCareExternalPortal
      locale={locale}
      role={role}
      organizationName={organizationName}
      userEmail={context.user.email}
      workers={(workersResult.data || []) as ExternalPortalWorker[]}
      applications={(applicationsResult.data || []) as unknown as ExternalPortalApplication[]}
    />
  )
}
