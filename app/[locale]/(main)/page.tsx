import { Metadata } from "next"
import dynamic from "next/dynamic"
import { getTranslations } from "next-intl/server"

// Hero 섹션만 동적 로드 (가장 큰 컴포넌트)
const HeroSectionAnsan = dynamic(() => import("@/components/sections/ansan/HeroSectionAnsan"), {
  loading: () => <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-secondary">Loading...</div></div>,
  ssr: true, // SSR 활성화로 초기 로딩 개선
})

// 나머지 섹션들은 정적 import로 변경 (번들 크기가 작은 경우)
import IntroductionSection from "@/components/sections/ansan/IntroductionSection"
import ServicesGridSection from "@/components/sections/ansan/ServicesGridSection"
import PainPointsSection from "@/components/sections/ansan/PainPointsSection"
import DifferentiatorsSection from "@/components/sections/ansan/DifferentiatorsSection"
import ContactSectionAnsan from "@/components/sections/ansan/ContactSectionAnsan"
import CTASectionAnsan from "@/components/sections/ansan/CTASectionAnsan"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ansan.metadata")
  const tCommon = await getTranslations("common")
  
  return {
    title: `${t("title")} | ${tCommon("title")}`,
    description: t("description"),
    keywords: t("keywords").split(",").map(k => k.trim()),
    openGraph: {
      title: `${t("title")} | ${tCommon("title")}`,
      description: t("ogDescription"),
      type: "website",
      images: [
        {
          url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: "/",
    },
  }
}

export default function HomePage() {
  return (
    <>
      <HeroSectionAnsan />
      <IntroductionSection />
      <ServicesGridSection />
      <PainPointsSection />
      <DifferentiatorsSection />
      <ContactSectionAnsan />
      <CTASectionAnsan />
    </>
  )
}

