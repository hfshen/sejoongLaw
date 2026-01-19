import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Shield, FileText, CheckCircle, AlertTriangle, RefreshCw, Scale } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.waiver.title")} | ${t("common.title")}`,
    description: t("pages.waiver.description"),
  }
}

export default async function WaiverPage() {
  const t = await getTranslations("pages.waiver")

  const services = [
    {
      title: t("services.release.title"),
      description: t("services.release.description"),
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: t("services.analysis.title"),
      description: t("services.analysis.description"),
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: t("services.preparation.title"),
      description: t("services.preparation.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("services.application.title"),
      description: t("services.application.description"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: t("services.reapplication.title"),
      description: t("services.reapplication.description"),
      icon: <RefreshCw className="w-6 h-6" />,
    },
    {
      title: t("services.appeal.title"),
      description: t("services.appeal.description"),
      icon: <Scale className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: t("processSteps.check.title"),
      description: t("processSteps.check.description"),
    },
    {
      step: 2,
      title: t("processSteps.preparation.title"),
      description: t("processSteps.preparation.description"),
    },
    {
      step: 3,
      title: t("processSteps.documents.title"),
      description: t("processSteps.documents.description"),
    },
    {
      step: 4,
      title: t("processSteps.submission.title"),
      description: t("processSteps.submission.description"),
    },
    {
      step: 5,
      title: t("processSteps.result.title"),
      description: t("processSteps.result.description"),
    },
  ]

  const faqs = [
    {
      question: t("faqs.what.question"),
      answer: t("faqs.what.answer"),
    },
    {
      question: t("faqs.refusal.question"),
      answer: t("faqs.refusal.answer"),
    },
    {
      question: t("faqs.duration.question"),
      answer: t("faqs.duration.answer"),
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">{t("badge")}</Badge>
            <h1 className="section-title mb-6">{t("title")}</h1>
            <p className="body-text text-lg">
              {t("description")}
            </p>
          </div>
        </div>
      </section>

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

      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">{t("faq")}</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-secondary mb-3">{faq.question}</h3>
                  <p className="body-text">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">{t("ctaTitle")}</h2>
          <p className="text-xl mb-8 opacity-90">{t("ctaDescription")}</p>
          <Link href="/consultation">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              {t("ctaButton")}
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
