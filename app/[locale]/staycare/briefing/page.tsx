import type { Metadata } from "next"
import StayCareBriefing from "@/components/staycare/StayCareBriefing"

export const metadata: Metadata = {
  title: "Sejoong StayCare 200명 사업 브리핑",
  description: "스리랑카 인력 200명 도입을 위한 세중 통합관리 플랫폼의 가격·서비스·운영·SLA 브리핑",
  robots: {
    index: false,
    follow: false,
  },
}

export default async function StayCareBriefingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <StayCareBriefing locale={locale} />
}
