import { redirect } from "next/navigation"

export default async function StayCareDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/staycare/app`)
}
