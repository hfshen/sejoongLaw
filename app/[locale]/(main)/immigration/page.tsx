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
  return {
    title: "해외이주 | 법무법인 세중",
    description: "비자 신청, 이민 상담, 출입국 관리 등 해외이주 관련 전문 법률 서비스를 제공합니다.",
  }
}

export default async function ImmigrationPage() {
  const t = await getTranslations()

  const services = [
    {
      icon: <Plane className="w-8 h-8" />,
      title: "비자 신청",
      description: "각종 비자 신청서 작성 및 제출 대행, 비자 거절 대응",
      link: "/immigration/visa",
      features: [
        "비자 신청서 작성 및 제출",
        "비자 거절 재신청",
        "비자 연장 및 변경",
        "비자 상담 및 자문",
      ],
    },
    {
      icon: <FileCheck className="w-8 h-8" />,
      title: "비이민비자",
      description: "관광, 비즈니스, 유학 등 비이민 목적의 비자 신청",
      link: "/immigration/non-immigrant",
      features: [
        "관광비자 (B-2)",
        "비즈니스비자 (C-2)",
        "유학비자 (D-2)",
        "단기취업비자 (C-4)",
      ],
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "이민비자",
      description: "영주권, 귀화, 결혼이민 등 이민 목적의 비자 신청",
      link: "/immigration/immigrant",
      features: [
        "영주권 신청 (F-5)",
        "결혼이민비자 (F-6)",
        "귀화 신청",
        "국적 회복",
      ],
    },
    {
      icon: <AlertCircle className="w-8 h-8" />,
      title: "비자 거절 대응",
      description: "비자 거절 사유 분석 및 재신청 전략 수립",
      link: "/immigration/refusal",
      features: [
        "거절 사유 분석",
        "재신청 전략 수립",
        "추가 서류 준비",
        "행정심판 청구",
      ],
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "웨이버(Waiver) 신청",
      description: "입국 금지 해제를 위한 웨이버 신청",
      link: "/immigration/waiver",
      features: [
        "입국 금지 사유 분석",
        "웨이버 신청서 작성",
        "추가 서류 준비",
        "신청 절차 안내",
      ],
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "비자 성공사례",
      description: "다양한 비자 신청 성공 사례를 확인하세요",
      link: "/immigration/success",
      features: [
        "거절 후 재신청 성공",
        "복잡한 사건 해결",
        "신속한 처리",
        "고객 만족도",
      ],
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 사건 파악",
      description: "고객의 상황을 정확히 파악하고 적절한 비자 유형을 결정합니다.",
    },
    {
      step: 2,
      title: "서류 준비",
      description: "필요한 서류를 체계적으로 수집하고 정리합니다.",
    },
    {
      step: 3,
      title: "신청서 작성",
      description: "전문 변호사가 신청서를 작성하고 검토합니다.",
    },
    {
      step: 4,
      title: "제출 및 추적",
      description: "관할 기관에 제출하고 진행 상황을 지속적으로 추적합니다.",
    },
    {
      step: 5,
      title: "결과 확인 및 후속 조치",
      description: "결과를 확인하고 필요한 후속 절차를 안내합니다.",
    },
  ]

  const faqs = [
    {
      question: "비자 신청은 얼마나 걸리나요?",
      answer: "비자 유형과 국가에 따라 다르지만, 일반적으로 2주에서 3개월 정도 소요됩니다. 긴급한 경우 가속 처리 서비스를 이용할 수 있습니다.",
    },
    {
      question: "비자가 거절되면 어떻게 하나요?",
      answer: "거절 사유를 분석하고 재신청 전략을 수립합니다. 필요시 행정심판을 청구할 수 있습니다.",
    },
    {
      question: "온라인으로 상담받을 수 있나요?",
      answer: "네, 온라인 화상 상담이 가능합니다. 예약 시 온라인 상담을 선택하시면 됩니다.",
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
              해외이주
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              전문적인 해외이주 법률 서비스
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8">
              비자 신청부터 이민 상담까지, 법무법인 세중이 함께합니다.
              <br />
              경험 많은 전문 변호사가 최상의 서비스를 제공합니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/consultation">
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
      </section>

      {/* Services Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="text-center mb-12">
            <h2 className="section-title">주요 서비스</h2>
            <p className="body-text max-w-2xl mx-auto">
              다양한 해외이주 관련 법률 서비스를 제공합니다.
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
                      자세히 보기
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
            <h2 className="section-title">처리 절차</h2>
            <p className="body-text max-w-2xl mx-auto">
              체계적이고 전문적인 절차로 진행됩니다.
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
            <h2 className="section-title">자주 묻는 질문</h2>
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

