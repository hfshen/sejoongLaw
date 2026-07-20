import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareDemoLogin from "@/components/staycare/StayCareDemoLogin"
import StayCareLogin from "@/components/staycare/StayCareLogin"
import { resolveStayCareDestination } from "@/lib/staycare/auth"

export const metadata: Metadata = {
  title: "StayCare 로그인",
  robots: { index: false, follow: false },
}

export default async function StayCareLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const destination = await resolveStayCareDestination(locale)
  if (destination) redirect(destination)

  return (
    <>
      <StayCareLogin locale={locale} />
      <StayCareDemoLogin locale={locale} />
    </>
  )
}
