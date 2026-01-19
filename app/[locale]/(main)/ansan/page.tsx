import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import HeroSectionAnsan from "@/components/sections/ansan/HeroSectionAnsan"
import IntroductionSection from "@/components/sections/ansan/IntroductionSection"
import ServicesGridSection from "@/components/sections/ansan/ServicesGridSection"
import PainPointsSection from "@/components/sections/ansan/PainPointsSection"
import DifferentiatorsSection from "@/components/sections/ansan/DifferentiatorsSection"
import ContactSectionAnsan from "@/components/sections/ansan/ContactSectionAnsan"
import CTASectionAnsan from "@/components/sections/ansan/CTASectionAnsan"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ansan.metadata")
  
  return {
    title: t("title"),
    description: t("description"),
    keywords: [
      t("keywords.lawFirm"),
      t("keywords.ansanLawyer"),
      t("keywords.oneStop"),
      t("keywords.stayVisa"),
      t("keywords.divorce"),
      t("keywords.industrial"),
      t("keywords.traffic"),
      t("keywords.wage"),
      t("keywords.criminal"),
      t("keywords.consultation"),
      t("keywords.lawyer"),
    ],
    openGraph: {
      title: t("openGraph.title"),
      description: t("openGraph.description"),
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function AnsanPage() {
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
