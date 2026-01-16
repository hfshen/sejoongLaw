import { getTranslations } from "next-intl/server"
import DocumentGenerator from "@/components/documents/DocumentGenerator"
import { Card, CardContent } from "@/components/ui/Card"
import { FileText, CheckCircle, Download, Mail } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: `${t("pages.documents.title")} | ${t("common.title")}`,
    description: t("pages.documents.description"),
  }
}

export default async function DocumentsPage() {
  const t = await getTranslations()

  const features = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: t("pages.documents.featuresItems.templates.title"),
      description: t("pages.documents.featuresItems.templates.description"),
    },
    {
      icon: <Download className="w-6 h-6" />,
      title: t("pages.documents.featuresItems.download.title"),
      description: t("pages.documents.featuresItems.download.description"),
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: t("pages.documents.featuresItems.email.title"),
      description: t("pages.documents.featuresItems.email.description"),
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t("pages.documents.featuresItems.review.title"),
      description: t("pages.documents.featuresItems.review.description"),
    },
  ]

  return (
    <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">{t("pages.documents.title")}</h1>
              <p className="body-text max-w-2xl mx-auto">
                {t("pages.documents.description")}
                <br />
                {t("pages.documents.subDescription")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <DocumentGenerator />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t("pages.documents.features")}</h3>
                    <div className="space-y-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="text-primary flex-shrink-0 mt-1">
                            {feature.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {feature.title}
                            </h4>
                            <p className="text-xs text-text-secondary">
                              {feature.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t("pages.documents.notice")}</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• {t("pages.documents.noticeItems.review")}</li>
                      <li>• {t("pages.documents.noticeItems.pdf")}</li>
                      <li>• {t("pages.documents.noticeItems.autoEmail")}</li>
                      <li>• {t("pages.documents.noticeItems.modification")}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
    </main>
  )
}

