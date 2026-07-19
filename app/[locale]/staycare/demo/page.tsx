import type { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Sejoong StayCare App",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function StayCareDemoPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${locale}/staycare/app`)
}
