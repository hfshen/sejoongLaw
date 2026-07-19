import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareLogin from "@/components/staycare/StayCareLogin"
import { getAuthenticatedUser } from "@/lib/staycare/auth"

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
  const user = await getAuthenticatedUser()
  if (user) redirect(`/${locale}/staycare/app`)

  return <StayCareLogin locale={locale} />
}
