import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareAuthRecoveryNotice from "@/components/staycare/StayCareAuthRecoveryNotice"
import StayCareDemoLogin from "@/components/staycare/StayCareDemoLogin"
import StayCareLogin from "@/components/staycare/StayCareLogin"
import { stayCareLoginRecoveryPath } from "@/lib/auth/redirects"
import { resolveStayCareDestination } from "@/lib/staycare/auth"
import { isStayCareProductionDemoAllowed } from "@/lib/staycare/demo-accounts"

export const metadata: Metadata = {
  title: "StayCare 로그인",
  robots: { index: false, follow: false },
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function StayCareLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const query = await searchParams
  const error = first(query.error)
  const reason = first(query.reason)
  const next = first(query.next)

  if (reason === "otp_expired" && error !== "otp_expired") {
    redirect(
      stayCareLoginRecoveryPath({
        locale,
        reason: "otp_expired",
        next,
      })
    )
  }

  const destination = await resolveStayCareDestination(locale)
  if (destination) redirect(destination)

  const showDemoLogin = isStayCareProductionDemoAllowed()

  return (
    <>
      <StayCareAuthRecoveryNotice locale={locale} reason={reason || error} />
      <StayCareLogin locale={locale} />
      {showDemoLogin ? <StayCareDemoLogin locale={locale} /> : null}
    </>
  )
}
