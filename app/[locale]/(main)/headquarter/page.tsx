import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import HeroSection from "@/components/sections/HeroSection"
import WhySejoongSection from "@/components/sections/WhySejoongSection"
import LeaderSection from "@/components/sections/LeaderSection"
import StatsSection from "@/components/sections/StatsSection"
import ServicesSection from "@/components/sections/ServicesSection"
import NetworkSection from "@/components/sections/NetworkSection"
import CaseStudiesSection from "@/components/sections/CaseStudiesSection"
import TestimonialsSection from "@/components/sections/TestimonialsSection"
import CTASection from "@/components/sections/CTASection"
import InteractiveFAQ from "@/components/faq/InteractiveFAQ"
import AIChatbot from "@/components/chat/AIChatbot"
import SmartCTA from "@/components/cta/SmartCTA"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("branches.headquarter")} | ${t("common.title")}`,
    description: t("headquarter.description"),
    keywords: [
      t("headquarter.keywords.lawFirm"),
      t("headquarter.keywords.lawyer"),
      t("headquarter.keywords.legalService"),
      t("headquarter.keywords.realEstate"),
      t("headquarter.keywords.divorce"),
      t("headquarter.keywords.visa"),
      t("headquarter.keywords.corporate"),
    ],
  }
}

export default function HeadquarterPage() {
  return (
    <>
      <HeroSection />
      <WhySejoongSection />
      <LeaderSection />
      <StatsSection />
      <ServicesSection />
      <NetworkSection />
      <CaseStudiesSection />
      <InteractiveFAQ />
      <TestimonialsSection />
      <CTASection />
      <AIChatbot />
      <SmartCTA variant="floating" position="bottom-right" />
    </>
  )
}

