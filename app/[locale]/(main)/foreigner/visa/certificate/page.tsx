import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { FileText, CheckCircle, AlertTriangle, Clock, Users, Globe } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("foreigner.certificate")} | ${t("common.title")}`,
    description: t("pages.certificate.description"),
  }
}

export default async function CertificatePage() {
  const t = await getTranslations()
  const services = [
    {
      title: t("pages.certificate.services.application.title"),
      description: t("pages.certificate.services.application.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("pages.certificate.services.preparation.title"),
      description: t("pages.certificate.services.preparation.description"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: t("pages.certificate.services.form.title"),
      description: t("pages.certificate.services.form.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("pages.certificate.services.tracking.title"),
      description: t("pages.certificate.services.tracking.description"),
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: t("pages.certificate.services.rejection.title"),
      description: t("pages.certificate.services.rejection.description"),
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: t("pages.certificate.services.embassy.title"),
      description: t("pages.certificate.services.embassy.description"),
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: t("pages.certificate.process.step1.title"),
      description: t("pages.certificate.process.step1.description"),
    },
    {
      step: 2,
      title: t("pages.certificate.process.step2.title"),
      description: t("pages.certificate.process.step2.description"),
    },
    {
      step: 3,
      title: t("pages.certificate.process.step3.title"),
      description: t("pages.certificate.process.step3.description"),
    },
    {
      step: 4,
      title: t("pages.certificate.process.step4.title"),
      description: t("pages.certificate.process.step4.description"),
    },
    {
      step: 5,
      title: t("pages.certificate.process.step5.title"),
      description: t("pages.certificate.process.step5.description"),
    },
  ]

  const faqs = [
    {
      question: t("pages.certificate.faqs.q1.question"),
      answer: t("pages.certificate.faqs.q1.answer"),
    },
    {
      question: t("pages.certificate.faqs.q2.question"),
      answer: t("pages.certificate.faqs.q2.answer"),
    },
    {
      question: t("pages.certificate.faqs.q3.question"),
      answer: t("pages.certificate.faqs.q3.answer"),
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">{t("nav.foreigner")}</Badge>
            <h1 className="section-title mb-6">{t("foreigner.certificate")}</h1>
            <p className="body-text text-lg">
              {t("pages.certificate.description")}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">{t("pages.certificate.mainServices")}</h2>
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
          <h2 className="section-title text-center mb-12">{t("pages.certificate.process.title")}</h2>
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
          <h2 className="section-title text-center mb-12">{t("pages.certificate.faqs.title")}</h2>
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
          <h2 className="text-4xl font-bold mb-6">{t("pages.certificate.cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90">{t("pages.certificate.cta.description")}</p>
          <Link href="/consultation">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              {t("pages.certificate.cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
