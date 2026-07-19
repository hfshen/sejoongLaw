import type { Metadata } from "next"
import StayCareWorkerApp from "@/components/staycare/StayCareWorkerApp"

export const metadata: Metadata = {
  title: "Sejoong StayCare | Korea Life One-stop App",
  description: "Sri Lanka-to-Korea preparation, arrival, telecom, banking, remittance, stay administration, AI interpretation and return support in one multilingual app.",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function StayCareAppPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <StayCareWorkerApp initialLocale={locale} />
}
