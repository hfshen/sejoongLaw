import type { Metadata } from "next"
import StayCareLanding from "@/components/staycare/StayCareLanding"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.sejoonglaw.kr"

  const english = locale === "en"
  const title = english
    ? "Sejoong StayCare | Sri Lanka to Korea Life One-stop Platform"
    : "Sejoong StayCare | 스리랑카 근로자 한국생활 원스톱 플랫폼"
  const description = english
    ? "A multilingual platform connecting official EPS steps with post-visa telecom, banking, remittance, stay administration, healthcare, AI interpretation and return support."
    : "정부·EPS 공식절차를 연결하고 비자 발급 이후 통신, 은행, 스리랑카 송금, 체류행정, 병원, AI 통역과 귀국준비를 통합하는 한국어·영어·싱할라어·타밀어 플랫폼입니다."

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/${locale}/staycare`,
    },
    openGraph: {
      title,
      description,
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
