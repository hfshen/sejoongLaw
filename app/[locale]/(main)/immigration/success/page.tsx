import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { CheckCircle, Plane, FileText, Users, Award, TrendingUp, Scale } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.success.title")} | ${t("common.title")}`,
    description: t("pages.success.description"),
  }
}

export default async function SuccessPage() {
  const t = await getTranslations("pages.success")

  const cases = [
    {
      title: t("cases.reapplication.title"),
      description: t("cases.reapplication.description"),
      category: t("cases.reapplication.category"),
      result: t("cases.reapplication.result"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: t("cases.waiver.title"),
      description: t("cases.waiver.description"),
      category: t("cases.waiver.category"),
      result: t("cases.waiver.result"),
      icon: <Plane className="w-6 h-6" />,
    },
    {
      title: t("cases.permanent.title"),
      description: t("cases.permanent.description"),
      category: t("cases.permanent.category"),
      result: t("cases.permanent.result"),
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: t("cases.appeal.title"),
      description: t("cases.appeal.description"),
      category: t("cases.appeal.category"),
      result: t("cases.appeal.result"),
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: t("cases.family.title"),
      description: t("cases.family.description"),
      category: t("cases.family.category"),
      result: t("cases.family.result"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: t("cases.investment.title"),
      description: t("cases.investment.description"),
      category: t("cases.investment.category"),
      result: t("cases.investment.result"),
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ]

  const stats = [
    { label: t("stats.approvalRate"), value: "95%", suffix: "+" },
    { label: t("stats.successCases"), value: "1000", suffix: "+" },
    { label: t("stats.satisfiedClients"), value: "5000", suffix: "+" },
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

      {/* Stats */}
      <section className="section-padding bg-background-alt">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <p className="text-text-secondary">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">{t("mainCases")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem, index) => (
              <Card key={index} hover>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary">{caseItem.icon}</div>
                    <Badge variant="primary" className="text-xs">
                      {caseItem.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-text text-sm mb-4">{caseItem.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {caseItem.result}
                    </span>
                  </div>
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
