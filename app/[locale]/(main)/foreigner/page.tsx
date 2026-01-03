import { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { 
  FileText, 
  Clock, 
  Building2, 
  DollarSign, 
  Users, 
  CheckCircle,
  ArrowRight,
  Phone,
  Calendar
} from "lucide-react"
import CTASection from "@/components/sections/CTASection"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "외국인센터 | 법무법인 세중",
    description: "외국인을 위한 비자, 체류허가, 출입국 관리 등 전문 법률 서비스를 제공합니다.",
  }
}

export default async function ForeignerPage() {
  const t = await getTranslations()

  const services = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: "사증(VISA)",
      description: "각종 사증 신청 및 발급인정서 발급",
      link: "/foreigner/visa",
      features: [
        "사증 발급인정서",
        "사증 종류별 대상자 안내",
        "사증 신청 대행",
        "사증 연장 및 변경",
      ],
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "체류허가 연장/변경",
      description: "체류기간 연장 및 체류자격 변경 신청",
      link: "/foreigner/stay",
      features: [
        "체류기간 연장 신청",
        "체류자격 변경 신청",
        "외국인등록증 갱신",
        "주소 변경 신고",
      ],
    },
    {
      icon: <Building2 className="w-8 h-8" />,
      title: "출입국관리사무소 관련업무",
      description: "출입국관리사무소에서 처리하는 모든 업무 대행",
      link: "/foreigner/immigration",
      features: [
        "비자 신청 대행",
        "체류허가 신청",
        "외국인등록",
        "행정심판 청구",
      ],
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "외국인투자",
      description: "외국인 투자 관련 법률 자문 및 신청 대행",
      link: "/foreigner/investment",
      features: [
        "외국인투자 신고",
        "투자비자 신청",
        "기업 설립 자문",
        "세무 자문",
      ],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "재외동포법률지원",
      description: "재외동포를 위한 법률 서비스 제공",
      link: "/foreigner/overseas-korean",
      features: [
        "재외동포 비자 신청",
        "국적 회복 상담",
        "귀국 관련 자문",
        "법률 상담",
      ],
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 신청",
      description: "온라인 또는 전화로 상담을 신청합니다.",
    },
    {
      step: 2,
      title: "사건 분석",
      description: "고객의 상황을 분석하고 필요한 서비스를 결정합니다.",
    },
    {
      step: 3,
      title: "서류 준비",
      description: "필요한 서류를 체계적으로 수집하고 정리합니다.",
    },
    {
      step: 4,
      title: "신청 및 추적",
      description: "관할 기관에 신청하고 진행 상황을 추적합니다.",
    },
    {
      step: 5,
      title: "결과 확인",
      description: "결과를 확인하고 후속 절차를 안내합니다.",
    },
  ]

  const faqs = [
    {
      question: "외국인등록증은 어떻게 발급받나요?",
      answer: "입국 후 90일 이내에 출입국관리사무소에 신청해야 합니다. 필요한 서류를 준비하여 신청하시면 됩니다.",
    },
    {
      question: "체류기간 연장은 언제 신청하나요?",
      answer: "체류기간 만료 4개월 전부터 신청 가능합니다. 만료 전에 반드시 신청하셔야 합니다.",
    },
    {
      question: "비자 거절 시 재신청이 가능한가요?",
      answer: "네, 거절 사유를 해결하고 재신청할 수 있습니다. 전문 변호사의 도움을 받으시면 성공 가능성이 높아집니다.",
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
              외국인센터
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              외국인을 위한 전문 법률 서비스
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-8">
              비자부터 체류허가까지, 한국에서의 생활을 지원합니다.
              <br />
              다국어 상담이 가능한 전문 변호사가 도와드립니다.
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
              외국인을 위한 다양한 법률 서비스를 제공합니다.
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

