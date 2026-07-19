import type { Metadata } from "next"
import StayCareCompletePortal from "@/components/staycare/StayCareCompletePortal"

export const metadata: Metadata = {
  title: "StayCare 통합 운영 플랫폼",
  description: "법무법인 세중이 주최하고 위탁 운영사가 실행하는 외국인 근로자 통합관리 플랫폼",
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
  return <StayCareCompletePortal locale={locale} />
}
