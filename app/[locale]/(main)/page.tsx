import { Metadata } from "next"
import dynamic from "next/dynamic"

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

export const metadata: Metadata = {
  title: "법률사무소 세중 안산지사 | 원스톱 법률 솔루션",
  description:
    "체류부터 가정, 일터, 사고, 형사까지 — 안산에서 시작하는 글로벌 원스톱 법률솔루션. 출입국/체류, 이혼/가사, 산재/교통사고, 임금/퇴직금, 민사/형사 사건 전문.",
  keywords: [
    "법률사무소 세중",
    "안산 변호사",
    "원스톱 법률 서비스",
    "체류 비자",
    "이혼 소송",
    "산재 보상",
    "교통사고",
    "임금 체불",
    "형사 변호",
    "안산 법률 상담",
    "원곡동 변호사",
    "안산 변호사 추천",
    "안산 법률 상담소",
    "경기도 변호사",
  ],
  openGraph: {
    title: "법률사무소 세중 안산지사 | 원스톱 법률 솔루션",
    description:
      "체류부터 가정, 일터, 사고, 형사까지 — 안산에서 시작하는 글로벌 원스톱 법률솔루션.",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "법률사무소 세중 안산지사",
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

