import type { Metadata } from "next"
import StayCareLanding from "@/components/staycare/StayCareLanding"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.kr"

  return {
    title: "Sejoong StayCare | 외국인 근로자 체류·정착 운영 플랫폼",
    description:
      "입국 준비, 외국인등록, 체류기한, 숙소, 통신, 보험, 생활민원과 전문상담 연결을 하나의 업무흐름으로 관리하는 법무법인 세중의 외국인 근로자 서비스입니다.",
    alternates: {
      canonical: `${baseUrl}/${locale}/staycare`,
    },
    openGraph: {
      title: "Sejoong StayCare",
      description: "외국인 근로자의 입국 전 준비부터 한국 체류·정착까지 관리하는 운영 플랫폼",
      url: `${baseUrl}/${locale}/staycare`,
      type: "website",
      siteName: "법무법인 세중",
    },
  }
}

export default async function StayCarePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return <StayCareLanding locale={locale} />
}
