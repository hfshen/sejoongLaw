import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareWorkerClaim from "@/components/staycare/StayCareWorkerClaim"
import { getWorkerContext, requireAuthenticatedUser } from "@/lib/staycare/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare 공식 근로자 계정 연결",
  robots: { index: false, follow: false },
}

export default async function StayCareClaimPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  await requireAuthenticatedUser(locale)
  const context = await getWorkerContext()
  if (context?.worker) redirect(`/${locale}/staycare/app`)
  return <StayCareWorkerClaim locale={locale} />
}
