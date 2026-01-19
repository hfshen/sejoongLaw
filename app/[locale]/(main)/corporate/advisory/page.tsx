import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, FileText, Scale, Users, Shield, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.advisory.title")} | ${t("common.title")}`,
    description: t("pages.advisory.description"),
  }
}

export default async function AdvisoryPage() {
  const t = await getTranslations("pages.advisory")

  const services = [
    {
      title: t("services.corporate.title"),
      description: t("services.corporate.description"),
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: t("services.contract.title"),
      description: t("services.contract.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("services.regulation.title"),
      description: t("services.regulation.description"),
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: t("services.labor.title"),
      description: t("services.labor.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: t("services.ip.title"),
      description: t("services.ip.description"),
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: t("services.structure.title"),
      description: t("services.structure.description"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: t("processSteps.consultation.title"),
      description: t("processSteps.consultation.description"),
    },
    {
      step: 2,
      title: t("processSteps.review.title"),
      description: t("processSteps.review.description"),
    },
    {
      step: 3,
      title: t("processSteps.solution.title"),
      description: t("processSteps.solution.description"),
    },
    {
      step: 4,
      title: t("processSteps.execution.title"),
      description: t("processSteps.execution.description"),
    },
    {
      step: 5,
      title: t("processSteps.followup.title"),
      description: t("processSteps.followup.description"),
    },
  ]

  const faqs = [
    {
      question: t("faqs.format.question"),
      answer: t("faqs.format.answer"),
    },
    {
      question: t("faqs.small.question"),
      answer: t("faqs.small.answer"),
    },
    {
      question: t("faqs.urgent.question"),
      answer: t("faqs.urgent.answer"),
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">
              {t("badge")}
            </Badge>
            <h1 className="section-title mb-6">{t("title")}</h1>
            <p className="body-text text-lg">
              {t("description")}
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">{t("mainServices")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <h2 className="section-title text-center mb-12">{t("process")}</h2>
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
          <h2 className="section-title text-center mb-12">{t("faq")}</h2>
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
          <h2 className="text-4xl font-bold mb-6">{t("ctaTitle")}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t("ctaDescription")}
          </p>
          <Link href="/consultation">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              {t("ctaButton")}
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
