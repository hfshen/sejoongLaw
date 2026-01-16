import { getTranslations, getLocale } from "next-intl/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Scale, FileText, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: `${t("pages.realEstate.title")} | ${t("common.title")}`,
    description: t("pages.realEstate.description"),
  }
}

export default async function RealEstatePage() {
  const t = await getTranslations()
  const locale = await getLocale()

  const services = [
    {
      title: t("pages.realEstate.services.contract.title"),
      description: t("pages.realEstate.services.contract.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("pages.realEstate.services.ownership.title"),
      description: t("pages.realEstate.services.ownership.description"),
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: t("pages.realEstate.services.lease.title"),
      description: t("pages.realEstate.services.lease.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: t("pages.realEstate.services.construction.title"),
      description: t("pages.realEstate.services.construction.description"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: t("pages.realEstate.processSteps.consultation.title"),
      description: t("pages.realEstate.processSteps.consultation.description"),
    },
    {
      step: 2,
      title: t("pages.realEstate.processSteps.investigation.title"),
      description: t("pages.realEstate.processSteps.investigation.description"),
    },
    {
      step: 3,
      title: t("pages.realEstate.processSteps.strategy.title"),
      description: t("pages.realEstate.processSteps.strategy.description"),
    },
    {
      step: 4,
      title: t("pages.realEstate.processSteps.negotiation.title"),
      description: t("pages.realEstate.processSteps.negotiation.description"),
    },
    {
      step: 5,
      title: t("pages.realEstate.processSteps.litigation.title"),
      description: t("pages.realEstate.processSteps.litigation.description"),
    },
  ]

  const faqs = [
    {
      question: t("pages.realEstate.faqs.duration.question"),
      answer: t("pages.realEstate.faqs.duration.answer"),
    },
    {
      question: t("pages.realEstate.faqs.free.question"),
      answer: t("pages.realEstate.faqs.free.answer"),
    },
    {
      question: t("pages.realEstate.faqs.types.question"),
      answer: t("pages.realEstate.faqs.types.answer"),
    },
  ]

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="container-max">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="primary" className="mb-4">
                {t("pages.realEstate.badge")}
              </Badge>
              <h1 className="section-title mb-6">{t("pages.realEstate.title")}</h1>
              <p className="body-text text-lg">
                {t("pages.realEstate.description")}
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="section-title text-center mb-12">{t("pages.realEstate.mainServices")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <Card key={index} hover>
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-xl">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="body-text text-sm">{service.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section-padding bg-background-alt">
          <div className="container-max">
            <h2 className="section-title text-center mb-12">{t("pages.realEstate.process")}</h2>
            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {process.map((item, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                        {item.step}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="subsection-title mb-2">{item.title}</h3>
                      <p className="body-text">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="section-title text-center mb-12">{t("pages.realEstate.faq")}</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg text-secondary mb-3">
                      {faq.question}
                    </h3>
                    <p className="body-text">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
          <div className="container-max text-center">
            <h2 className="text-4xl font-bold mb-6">{t("pages.realEstate.ctaTitle")}</h2>
            <p className="text-xl mb-8 opacity-90">
              {t("pages.realEstate.ctaDescription")}
            </p>
            <Link
              href={`/${locale}/consultation`}
              className="premium-button-secondary px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100"
            >
              {t("pages.realEstate.ctaButton")}
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
