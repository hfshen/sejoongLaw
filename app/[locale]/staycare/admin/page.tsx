import type { Metadata } from "next"
import StayCareAdminDashboard from "@/components/staycare/StayCareAdminDashboard"
import { requireStaffContext } from "@/lib/staycare/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 통합 운영센터",
  robots: { index: false, follow: false },
}

export default async function StayCareAdminPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireStaffContext(locale)
  const tenantIds = [...new Set(context.memberships.map((membership) => membership.tenant_id))]

  const [applicationsResult, workersResult, documentsResult, ticketsResult] = await Promise.all([
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, language, submitted_at, external_reference, submitted_data, worker:staycare_workers(full_name, full_name_en, member_no, visa_type), service:staycare_service_catalog(code, category, name, integration_mode)"
      )
      .in("tenant_id", tenantIds)
      .not("status", "in", "(fulfilled,cancelled)")
      .order("created_at", { ascending: true })
      .limit(300),
    context.supabase
      .from("staycare_workers")
      .select("id", { count: "exact", head: true })
      .in("tenant_id", tenantIds)
      .neq("status", "closed"),
    context.supabase
      .from("staycare_documents")
      .select("id", { count: "exact", head: true })
      .in("tenant_id", tenantIds)
      .eq("status", "review_required"),
    context.supabase
      .from("staycare_tickets")
      .select("id", { count: "exact", head: true })
      .in("tenant_id", tenantIds)
      .in("priority", ["P0", "P1"])
      .not("status", "in", "(resolved,closed)"),
  ])

  const error = [applicationsResult.error, workersResult.error, documentsResult.error, ticketsResult.error].find(Boolean)
  if (error) throw error

  return (
    <StayCareAdminDashboard
      applications={(applicationsResult.data || []) as never[]}
      metrics={{
        workers: workersResult.count || 0,
        openApplications: applicationsResult.data?.length || 0,
        reviewDocuments: documentsResult.count || 0,
        urgentTickets: ticketsResult.count || 0,
      }}
    />
  )
}
