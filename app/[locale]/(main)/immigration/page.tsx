import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { 
  Plane, 
  FileCheck, 
  Shield, 
  Globe, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react"
import CTASection from "@/components/sections/CTASection"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("nav.immigration")} | ${t("common.title")}`,
    description: t("immigration.description"),
  }
}

export default async function ImmigrationPage() {
  const t = await getTranslations()

  const services = [
    {
      icon: <Plane className="w-8 h-8" />,
      title: t("immigration.services.visa.title"),
      description: t("immigration.services.visa.description"),
      link: "/immigration/visa",
      features: [
        t("immigration.services.visa.features.0"),
        t("immigration.services.visa.features.1"),
        t("immigration.services.visa.features.2"),
        t("immigration.services.visa.features.3"),
      ],
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: t("immigration.services.nonImmigrant.title"),
      description: t("immigration.services.nonImmigrant.description"),
      link: "/immigration/non-immigrant",
      features: [
        t("immigration.services.nonImmigrant.features.0"),
        t("immigration.services.nonImmigrant.features.1"),
        t("immigration.services.nonImmigrant.features.2"),
        t("immigration.services.nonImmigrant.features.3"),
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: t("immigration.services.immigrant.title"),
      description: t("immigration.services.immigrant.description"),
      link: "/immigration/immigrant",
      features: [
        t("immigration.services.immigrant.features.0"),
        t("immigration.services.immigrant.features.1"),
        t("immigration.services.immigrant.features.2"),
        t("immigration.services.immigrant.features.3"),
      ],
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: t("immigration.services.refusal.title"),
      description: t("immigration.services.refusal.description"),
      link: "/immigration/refusal",
      features: [
        t("immigration.services.refusal.features.0"),
        t("immigration.services.refusal.features.1"),
        t("immigration.services.refusal.features.2"),
        t("immigration.services.refusal.features.3"),
      ],
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("immigration.services.waiver.title"),
      description: t("immigration.services.waiver.description"),
      link: "/immigration/waiver",
      features: [
        t("immigration.services.waiver.features.0"),
        t("immigration.services.waiver.features.1"),
        t("immigration.services.waiver.features.2"),
        t("immigration.services.waiver.features.3"),
      ],
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: t("immigration.services.success.title"),
      description: t("immigration.services.success.description"),
      link: "/immigration/success",
      features: [
        t("immigration.services.success.features.0"),
        t("immigration.services.success.features.1"),
        t("immigration.services.success.features.2"),
        t("immigration.services.success.features.3"),
      ],
    },
  ]

  const process = [
    {
      step: 1,
      title: t("immigration.process.steps.consultation.title"),
      description: t("immigration.process.steps.consultation.description"),
    },
    {
      step: 2,
      title: t("immigration.process.steps.preparation.title"),
      description: t("immigration.process.steps.preparation.description"),
    },
    {
      step: 3,
      title: t("immigration.process.steps.application.title"),
      description: t("immigration.process.steps.application.description"),
    },
    {
      step: 4,
      title: t("immigration.process.steps.submission.title"),
      description: t("immigration.process.steps.submission.description"),
    },
    {
      step: 5,
      title: t("immigration.process.steps.result.title"),
      description: t("immigration.process.steps.result.description"),
    },
  ]

  const faqs = [
    {
      question: t("immigration.faq.items.duration.question"),
      answer: t("immigration.faq.items.duration.answer"),
    },
    {
      question: t("immigration.faq.items.rejection.question"),
      answer: t("immigration.faq.items.rejection.answer"),
    },
    {
      question: t("immigration.faq.items.online.question"),
      answer: t("immigration.faq.items.online.answer"),
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container-max relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              {t("nav.immigration")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("immigration.title")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8">
              {t("immigration.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
                <Button size="lg" className="w-full sm:w-auto">
                  <Calendar className="w-5 h-5 mr-2" />
                  {t("immigration.cta.button")}
                </Button>
              </Link>
              <a href="tel:03180448805">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <Phone className="w-5 h-5 mr-2" />
                  031-8044-8805
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("immigration.mainServices")}</h2>
            <p className="body-text max-w-2xl mx-auto">
              {t("immigration.servicesDescription")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} hover className="h-full">
                <CardContent className="p-6">
                  <div className="text-primary mb-4">{service.icon}</div>
                  <h3 className="text-xl font-bold text-secondary mb-3">
                    {service.title}
                  </h3>
                  <p className="text-text-secondary mb-4">{service.description}</p>
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start text-sm text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href={service.link}>
                    <Button variant="outline" className="w-full">
                      {t("immigration.cta.viewMore")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-background-alt">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("immigration.process.title")}</h2>
            <p className="body-text max-w-2xl mx-auto">
              {t("immigration.process.description")}
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {process.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="font-bold text-secondary mb-2">{item.title}</h3>
                  <p className="text-sm text-text-secondary">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="section-title">{t("immigration.faq.title")}</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-secondary mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-text-secondary">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

