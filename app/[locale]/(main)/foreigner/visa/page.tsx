import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { FileText, Users, CheckCircle, ArrowRight } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.foreignerVisa.title")} | ${t("common.title")}`,
    description: t("pages.foreignerVisa.description"),
  }
}

export default async function ForeignerVisaPage() {
  const t = await getTranslations("pages.foreignerVisa")

  const services = [
    {
      title: t("services.certificate.title"),
      description: t("services.certificate.description"),
      href: "/foreigner/visa/certificate",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: t("services.types.title"),
      description: t("services.types.description"),
      href: "/foreigner/visa/types",
      icon: <Users className="w-6 h-6" />,
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card hover className="h-full">
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-2xl mb-3">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="body-text mb-4">{service.description}</p>
                    <div className="flex items-center text-primary font-semibold">
                      {t("readMore")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
