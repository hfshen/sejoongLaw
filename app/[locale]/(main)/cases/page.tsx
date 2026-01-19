import { getTranslations } from "next-intl/server"
import CaseStudiesSection from "@/components/sections/CaseStudiesSection"

export default async function CasesPage() {
  const t = await getTranslations()
  
  return (
    <>
      <main className="min-h-screen bg-background">
        <div className="section-padding-sm bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="container-max text-center">
            <h1 className="section-title">{t("cases.page.title")}</h1>
            <p className="body-text max-w-2xl mx-auto">
              {t("cases.page.description")}
            </p>
          </div>
        </div>
        <CaseStudiesSection />
      </main>
    </>
  )
}

