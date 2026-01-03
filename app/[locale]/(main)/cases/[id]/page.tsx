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

const caseStudies: CaseStudy[] = [
  {
    id: "1",
    title: "부동산 분쟁 소송 승소",
    category: "부동산",
    description: "복잡한 부동산 계약 분쟁에서 고객의 권리를 보호하고 승소를 이끌어냈습니다.",
    result: "배상금 50% 증가, 소송 기간 30% 단축",
    image: "/images/cases/case-1.svg",
    problem: "부동산 매매 계약 과정에서 매도인이 계약 조건을 위반하여 분쟁이 발생했습니다. 고객은 계약금을 지불했으나 매도인이 소유권 이전을 거부하며 계약을 파기하려고 했습니다.",
    solution: "법무법인 세중은 계약서 분석, 관련 법규 검토, 증거 수집을 통해 고객의 권리를 명확히 입증했습니다. 법원에 계약 이행 청구 소송을 제기하고, 전문 변호사 팀이 체계적으로 사건을 진행하여 승소 판결을 받았습니다.",
    timeline: "소송 제기부터 판결까지 약 8개월",
    relatedServices: ["부동산 분쟁", "계약 분쟁", "소송 대리"],
  },
  {
    id: "2",
    title: "이혼 재산분할 성공",
    category: "이혼",
    description: "공정한 재산분할을 통해 고객의 권익을 최대한 보호했습니다.",
    result: "고객 만족도 95%, 재산분할 합의 성공",
    image: "/images/cases/case-2.svg",
    problem: "이혼 과정에서 배우자와 재산분할에 대한 의견 차이로 분쟁이 발생했습니다. 공동 재산의 평가와 분할 비율에 대해 합의가 이루어지지 않았습니다.",
    solution: "법무법인 세중은 재산 목록 정리, 평가, 법적 근거 제시를 통해 공정한 재산분할 방안을 제시했습니다. 협상을 통해 양 당사자가 만족할 수 있는 합의안을 도출했습니다.",
    timeline: "상담부터 합의까지 약 3개월",
    relatedServices: ["이혼 상담", "재산분할", "협상 대리"],
  },
  {
    id: "3",
    title: "비자 거절 재신청 성공",
    category: "비자",
    description: "비자 거절 후 재신청을 통해 성공적으로 비자를 발급받았습니다.",
    result: "재신청 성공률 100%, 처리 기간 단축",
    image: "/images/cases/case-3.svg",
    problem: "비자 신청이 거절되었고, 거절 사유에 대한 명확한 설명이 부족했습니다. 재신청을 위한 구체적인 방안이 필요했습니다.",
    solution: "법무법인 세중은 거절 사유 분석, 필요한 서류 정리, 재신청 전략 수립을 통해 체계적으로 재신청을 진행했습니다. 전문 변호사의 법률 검토와 행정 절차 안내로 성공적으로 비자를 발급받았습니다.",
    timeline: "재신청부터 발급까지 약 2개월",
    relatedServices: ["비자 신청", "출입국 상담", "행정 심판"],
  },
  {
    id: "4",
    title: "기업 M&A 법률 자문",
    category: "기업자문",
    description: "대규모 기업 인수합병(M&A) 과정에서 전문적인 법률 자문을 제공했습니다.",
    result: "거래 성공, 법적 리스크 최소화",
    image: "/images/cases/case-4.svg",
    problem: "대규모 기업 인수합병 과정에서 복잡한 법적 이슈와 리스크가 발생했습니다. 계약서 검토, 인수 대상 기업의 법적 상태 확인, 규제 준수 등 다양한 법률 검토가 필요했습니다.",
    solution: "법무법인 세중은 전담 변호사 팀을 구성하여 인수합병 전 과정에 걸쳐 법률 자문을 제공했습니다. 계약서 검토, 실사(Due Diligence), 규제 준수 확인, 협상 지원 등을 통해 거래를 성공적으로 완료했습니다.",
    timeline: "자문 시작부터 거래 완료까지 약 6개월",
    relatedServices: ["기업 자문", "M&A", "계약 검토"],
  },
]

export async function generateMetadata({
  params,
}: {
  params: { id: string; locale: string }
}): Promise<Metadata> {
  const caseStudy = caseStudies.find((c) => c.id === params.id)
  
  if (!caseStudy) {
    return {
      title: "케이스를 찾을 수 없습니다 | 법무법인 세중",
    }
  }

  return {
    title: `${caseStudy.title} | 법무법인 세중`,
    description: caseStudy.description,
  }
}

export default async function CaseDetailPage({
  params,
}: {
  params: { id: string; locale: string }
}) {
  const locale = params.locale
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
            <span>성공 사례 목록으로</span>
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
                  <h3 className="font-bold text-lg text-secondary">성과</h3>
                </div>
                <p className="text-primary font-semibold">{caseStudy.result}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/${locale}/consultation`}>
                  <Button size="lg" className="w-full sm:w-auto">
                    <Calendar className="w-5 h-5 mr-2" />
                    상담 신청하기
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
                      문제 상황
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
                      해결 과정
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
                    처리 기간
                  </h2>
                  <p className="text-lg text-text-secondary">{caseStudy.timeline}</p>
                </CardContent>
              </Card>
            )}

            {caseStudy.relatedServices && caseStudy.relatedServices.length > 0 && (
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h2 className="font-bold text-xl mb-4">관련 서비스</h2>
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
            <h2 className="section-title text-center mb-8">다른 성공 사례</h2>
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

