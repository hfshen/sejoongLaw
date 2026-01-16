import { getTranslations } from "next-intl/server"
import ConsultationForm from "@/components/consultation/ConsultationForm"
import { Card, CardContent } from "@/components/ui/Card"
import { Phone, Mail, Clock, CheckCircle } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: `${t("pages.consultation.title")} | ${t("common.title")}`,
    description: t("pages.consultation.description"),
  }
}

export default async function ConsultationPage() {
  const t = await getTranslations()

  const benefits = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t("pages.consultation.benefitItems.direct.title"),
      description: t("pages.consultation.benefitItems.direct.description"),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("pages.consultation.benefitItems.fast.title"),
      description: t("pages.consultation.benefitItems.fast.description"),
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t("pages.consultation.benefitItems.free.title"),
      description: t("pages.consultation.benefitItems.free.description"),
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: t("pages.consultation.benefitItems.multiple.title"),
      description: t("pages.consultation.benefitItems.multiple.description"),
    },
  ]

  return (
    <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">{t("pages.consultation.title")}</h1>
              <p className="body-text max-w-2xl mx-auto">
                {t("pages.consultation.description")}
                <br />
                {t("pages.consultation.subDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <ConsultationForm />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t("pages.consultation.benefits")}</h3>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="text-primary flex-shrink-0 mt-1">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {benefit.title}
                            </h4>
                            <p className="text-xs text-text-secondary">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t("pages.consultation.contact")}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <a
                          href="tel:03180448805"
                          className="link-hover font-medium"
                        >
                          031-8044-8805
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <a
                          href="mailto:contact@sejoonglaw.kr"
                          className="link-hover font-medium"
                        >
                          contact@sejoonglaw.kr
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
    </main>
  )
}

