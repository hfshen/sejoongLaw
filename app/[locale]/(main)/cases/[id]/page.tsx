import { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { ArrowLeft, Phone, Calendar, CheckCircle, TrendingUp } from "lucide-react"
import CTASection from "@/components/sections/CTASection"

interface CaseStudy {
  id: string
  title: string
  category: string
  description: string
  result: string
  image?: string
  problem?: string
  solution?: string
  timeline?: string
  relatedServices?: string[]
}

const getCaseStudies = (t: any): CaseStudy[] => [
  {
    id: "1",
    title: t("cases.detail.cases.1.title"),
    category: t("cases.categories.realEstate"),
    description: t("cases.detail.cases.1.description"),
    result: t("cases.detail.cases.1.result"),
    image: "/images/cases/case-1.svg",
    problem: t("cases.detail.cases.1.problem"),
    solution: t("cases.detail.cases.1.solution"),
    timeline: t("cases.detail.cases.1.timeline"),
    relatedServices: t.raw("cases.detail.cases.1.relatedServices") as string[],
  },
  {
    id: "2",
    title: t("cases.detail.cases.2.title"),
    category: t("cases.categories.divorce"),
    description: t("cases.detail.cases.2.description"),
    result: t("cases.detail.cases.2.result"),
    image: "/images/cases/case-2.svg",
    problem: t("cases.detail.cases.2.problem"),
    solution: t("cases.detail.cases.2.solution"),
    timeline: t("cases.detail.cases.2.timeline"),
    relatedServices: t.raw("cases.detail.cases.2.relatedServices") as string[],
  },
  {
    id: "3",
    title: t("cases.detail.cases.3.title"),
    category: t("cases.categories.visa"),
    description: t("cases.detail.cases.3.description"),
    result: t("cases.detail.cases.3.result"),
    image: "/images/cases/case-3.svg",
    problem: t("cases.detail.cases.3.problem"),
    solution: t("cases.detail.cases.3.solution"),
    timeline: t("cases.detail.cases.3.timeline"),
    relatedServices: t.raw("cases.detail.cases.3.relatedServices") as string[],
  },
  {
    id: "4",
    title: t("cases.detail.cases.4.title"),
    category: t("cases.categories.corporate"),
    description: t("cases.detail.cases.4.description"),
    result: t("cases.detail.cases.4.result"),
    image: "/images/cases/case-4.svg",
    problem: t("cases.detail.cases.4.problem"),
    solution: t("cases.detail.cases.4.solution"),
    timeline: t("cases.detail.cases.4.timeline"),
    relatedServices: t.raw("cases.detail.cases.4.relatedServices") as string[],
  },
]

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string }
}): Promise<Metadata> {
  const t = await getTranslations()
  const caseStudies = getCaseStudies(t)
  const caseStudy = caseStudies.find((c) => c.id === params.id)
  
  if (!caseStudy) {
    return {
      title: `${t("cases.detail.metadata.notFound")} | ${t("common.title")}`,
    }
  }

  return {
    title: `${caseStudy.title} | ${t("common.title")}`,
    description: caseStudy.description,
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const t = await getTranslations()
  const locale = params.locale
  const caseStudies = getCaseStudies(t)
  const caseStudy = caseStudies.find((c) => c.id === params.id)

  if (!caseStudy) {
    notFound()
  }

  // 관련 케이스 (같은 카테고리 제외)
  const relatedCases = caseStudies
    .filter((c) => c.id !== caseStudy.id && c.category !== caseStudy.category)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="section-padding-sm bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container-max">
          <Link
            href={`/${locale}/cases`}
            className="inline-flex items-center gap-2 text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t("cases.detail.backToList")}</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {caseStudy.image && (
              <div className="relative aspect-video rounded-lg overflow-hidden shadow-premium-lg">
                <Image
                  src={caseStudy.image}
                  alt={caseStudy.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div>
              <Badge variant="primary" className="mb-4">
                {caseStudy.category}
              </Badge>
              <h1 className="section-title mb-4">{caseStudy.title}</h1>
              <p className="body-text text-lg mb-6">{caseStudy.description}</p>
              
              <div className="bg-primary/10 p-4 rounded-lg mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h3 className="font-bold text-lg text-secondary">{t("cases.detail.result")}</h3>
                </div>
                <p className="text-primary font-semibold">{caseStudy.result}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/${locale}/consultation`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Calendar className="w-5 h-5 mr-2" />
                    {t("cases.detail.requestConsultation")}
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
        </div>
      </div>

      {/* 상세 내용 */}
      <div className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {caseStudy.problem && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm font-bold">
                        1
                      </span>
                      {t("cases.detail.problem")}
                    </h2>
                    <p className="text-text-secondary leading-relaxed">{caseStudy.problem}</p>
                  </CardContent>
                </Card>
              )}

              {caseStudy.solution && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">
                        2
                      </span>
                      {t("cases.detail.solution")}
                    </h2>
                    <p className="text-text-secondary leading-relaxed">{caseStudy.solution}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {caseStudy.timeline && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-primary" />
                    {t("cases.detail.timeline")}
                  </h2>
                  <p className="text-lg text-text-secondary">{caseStudy.timeline}</p>
                </CardContent>
              </Card>
            )}

            {caseStudy.relatedServices && caseStudy.relatedServices.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4">{t("cases.detail.relatedServices")}</h2>
                  <div className="flex flex-wrap gap-2">
                    {caseStudy.relatedServices.map((service, index) => (
                      <Badge key={index} variant="default" className="text-sm">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 관련 케이스 */}
      {relatedCases.length > 0 && (
        <div className="section-padding bg-background-alt">
          <div className="container-max">
            <h2 className="section-title text-center mb-8">{t("cases.detail.relatedCases.title")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedCases.map((relatedCase) => (
                <Link key={relatedCase.id} href={`/${locale}/cases/${relatedCase.id}`}>
                  <Card hover className="h-full">
                    {relatedCase.image && (
                      <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
                        <Image
                          src={relatedCase.image}
                          alt={relatedCase.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-110"
                        />
                      </div>
                    )}
                    <CardContent className="p-4">
                      <Badge variant="primary" className="mb-2 text-xs">
                        {relatedCase.category}
                      </Badge>
                      <h3 className="font-bold text-lg mb-2">{relatedCase.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2">
                        {relatedCase.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}

