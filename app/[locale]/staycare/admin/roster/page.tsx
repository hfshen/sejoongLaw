import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareRosterImport from "@/components/staycare/StayCareRosterImport"
import { requireStaffContext } from "@/lib/staycare/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 근로자 명부 등록",
  robots: { index: false, follow: false },
}

export default async function StayCareRosterPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireStaffContext(locale)
  const membership = context.memberships.find((item) =>
    ["sejoong_admin", "operator_manager"].includes(String(item.role))
  )
  if (!membership) redirect(`/${locale}/staycare/admin`)
  return <StayCareRosterImport locale={locale} tenantId={String(membership.tenant_id)} />
}
