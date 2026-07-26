import type { Metadata } from "next"
import StayCareIdentityCenter from "@/components/staycare/StayCareIdentityCenter"
import { requireWorkerContext } from "@/lib/staycare/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 계정·연락수단 관리",
  robots: { index: false, follow: false },
}

export default async function StayCareAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireWorkerContext(locale)
  return (
    <StayCareIdentityCenter
      locale={locale}
      memberNo={context.worker.member_no}
      currentPhone={context.user.phone || context.worker.phone_number}
      currentEmail={context.user.email}
    />
  )
}
