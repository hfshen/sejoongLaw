import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Users, Briefcase, GraduationCap, Heart, Plane, FileText, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("foreigner.types")} | ${t("common.title")}`,
    description: t("pages.types.description"),
  }
}

export default async function TypesPage() {
  const t = await getTranslations()
  const visaTypes = [
    {
      code: "A-1",
      title: t("visaTypes.types.A-1.title"),
      description: t("visaTypes.types.A-1.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "A-2",
      title: t("visaTypes.types.A-2.title"),
      description: t("visaTypes.types.A-2.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "A-3",
      title: t("visaTypes.types.A-3.title"),
      description: t("visaTypes.types.A-3.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "B-1",
      title: t("visaTypes.types.B-1.title"),
      description: t("visaTypes.types.B-1.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "B-2",
      title: t("visaTypes.types.B-2.title"),
      description: t("visaTypes.types.B-2.description"),
      icon: <Plane className="w-6 h-6" />,
    },
    {
      code: "C-1",
      title: t("visaTypes.types.C-1.title"),
      description: t("visaTypes.types.C-1.description"),
      icon: <Plane className="w-6 h-6" />,
    },
    {
      code: "C-3",
      title: t("visaTypes.types.C-3.title"),
      description: t("visaTypes.types.C-3.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "C-4",
      title: t("visaTypes.types.C-4.title"),
      description: t("visaTypes.types.C-4.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-1",
      title: t("visaTypes.types.D-1.title"),
      description: t("visaTypes.types.D-1.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "D-2",
      title: t("visaTypes.types.D-2.title"),
      description: t("visaTypes.types.D-2.description"),
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "D-3",
      title: t("visaTypes.types.D-3.title"),
      description: t("visaTypes.types.D-3.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-4",
      title: t("visaTypes.types.D-4.title"),
      description: t("visaTypes.types.D-4.description"),
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "D-5",
      title: t("visaTypes.types.D-5.title"),
      description: t("visaTypes.types.D-5.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "D-6",
      title: t("visaTypes.types.D-6.title"),
      description: t("visaTypes.types.D-6.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "D-7",
      title: t("visaTypes.types.D-7.title"),
      description: t("visaTypes.types.D-7.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-8",
      title: t("visaTypes.types.D-8.title"),
      description: t("visaTypes.types.D-8.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-9",
      title: t("visaTypes.types.D-9.title"),
      description: t("visaTypes.types.D-9.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-10",
      title: t("visaTypes.types.D-10.title"),
      description: t("visaTypes.types.D-10.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-1",
      title: t("visaTypes.types.E-1.title"),
      description: t("visaTypes.types.E-1.description"),
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "E-2",
      title: t("visaTypes.types.E-2.title"),
      description: t("visaTypes.types.E-2.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "E-3",
      title: t("visaTypes.types.E-3.title"),
      description: t("visaTypes.types.E-3.description"),
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "E-4",
      title: t("visaTypes.types.E-4.title"),
      description: t("visaTypes.types.E-4.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-5",
      title: t("visaTypes.types.E-5.title"),
      description: t("visaTypes.types.E-5.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-6",
      title: t("visaTypes.types.E-6.title"),
      description: t("visaTypes.types.E-6.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "E-7",
      title: t("visaTypes.types.E-7.title"),
      description: t("visaTypes.types.E-7.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-9",
      title: t("visaTypes.types.E-9.title"),
      description: t("visaTypes.types.E-9.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-10",
      title: t("visaTypes.types.E-10.title"),
      description: t("visaTypes.types.E-10.description"),
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "F-1",
      title: t("visaTypes.types.F-1.title"),
      description: t("visaTypes.types.F-1.description"),
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "F-2",
      title: t("visaTypes.types.F-2.title"),
      description: t("visaTypes.types.F-2.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "F-3",
      title: t("visaTypes.types.F-3.title"),
      description: t("visaTypes.types.F-3.description"),
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "F-4",
      title: t("visaTypes.types.F-4.title"),
      description: t("visaTypes.types.F-4.description"),
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "F-5",
      title: t("visaTypes.types.F-5.title"),
      description: t("visaTypes.types.F-5.description"),
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      code: "F-6",
      title: t("visaTypes.types.F-6.title"),
      description: t("visaTypes.types.F-6.description"),
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "G-1",
      title: t("visaTypes.types.G-1.title"),
      description: t("visaTypes.types.G-1.description"),
      icon: <FileText className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">{t("nav.foreigner")}</Badge>
            <h1 className="section-title mb-6">{t("foreigner.types")}</h1>
            <p className="body-text text-lg">
              {t("pages.types.description")}
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">{t("visaTypes.title")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visaTypes.map((visa, index) => (
              <Card key={index} hover>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary">{visa.icon}</div>
                    <Badge variant="primary" className="text-xs">
                      {visa.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{visa.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-text text-sm">{visa.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">{t("visaTypes.cta.title")}</h2>
          <p className="text-xl mb-8 opacity-90">{t("visaTypes.cta.description")}</p>
          <Link href="/consultation">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              {t("visaTypes.cta.button")}
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
