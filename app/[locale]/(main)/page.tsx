import { Metadata } from "next"
import HeroSection from "@/components/sections/HeroSection"
import WhySejoongSection from "@/components/sections/WhySejoongSection"
import LeaderSection from "@/components/sections/LeaderSection"
import StatsSection from "@/components/sections/StatsSection"
import ServicesSection from "@/components/sections/ServicesSection"
import NetworkSection from "@/components/sections/NetworkSection"
import MediaInsightSection from "@/components/sections/MediaInsightSection"
import CaseStudiesSection from "@/components/sections/CaseStudiesSection"
import TestimonialsSection from "@/components/sections/TestimonialsSection"
import CTASection from "@/components/sections/CTASection"
import InteractiveFAQ from "@/components/faq/InteractiveFAQ"
import AIChatbot from "@/components/chat/AIChatbot"
import SmartCTA from "@/components/cta/SmartCTA"

export const metadata: Metadata = {
  title: "법무법인 세중 | 전문 법률 서비스",
  description:
    "법무법인 세중은 부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인입니다.",
  keywords: [
    "법무법인",
    "변호사",
    "법률 서비스",
    "부동산 분쟁",
    "이혼 소송",
    "비자 신청",
    "기업 자문",
  ],
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <WhySejoongSection />
      <LeaderSection />
      <StatsSection />
      <ServicesSection />
      <NetworkSection />
      <MediaInsightSection />
      <CaseStudiesSection />
      <InteractiveFAQ />
      <TestimonialsSection />
      <CTASection />
      <AIChatbot />
      <SmartCTA variant="floating" position="bottom-right" />
    </>
  )
}

