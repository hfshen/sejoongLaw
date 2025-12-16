import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, FileText, Scale, CheckCircle, DollarSign, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "기업인수합병(M&A) | 법무법인 세중",
    description:
      "기업 인수합병(M&A) 관련 법률 서비스를 제공합니다. 기업 가치 평가, 계약서 작성, 인허가 절차 등 전 과정을 지원합니다.",
  }
}

export default async function MAPage() {
  const t = await getTranslations()

  const services = [
    {
      title: "기업 가치 평가",
      description: "인수 대상 기업의 가치 평가 및 실사(Due Diligence)",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "M&A 계약서 작성",
      description: "인수합병 계약서, 주식양수도계약서 등 각종 계약서 작성",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "인허가 절차",
      description: "공정거래위원회 신고, 외국인투자 신고 등 인허가 절차 대행",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "조세 자문",
      description: "M&A 관련 세무 계획 및 절세 방안 제시",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "노동 문제",
      description: "인수합병 시 발생하는 노동 문제 해결 및 대응",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "기업 구조 재편",
      description: "합병, 분할, 전환 등 기업 구조 재편 지원",
      icon: <Building2 className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 계획 수립",
      description: "M&A 목적, 대상, 방식 등을 검토하고 전략을 수립합니다.",
    },
    {
      step: 2,
      title: "실사(Due Diligence)",
      description: "법률, 재무, 세무, 노동 등 전 분야에 대한 실사 진행",
    },
    {
      step: 3,
      title: "가치 평가 및 협상",
      description: "기업 가치 평가 및 인수가격 협상",
    },
    {
      step: 4,
      title: "계약서 작성 및 검토",
      description: "인수합병 계약서 작성 및 각종 조건 협상",
    },
    {
      step: 5,
      title: "인허가 및 등기",
      description: "필요한 인허가 신고 및 등기 절차 진행",
    },
  ]

  const faqs = [
    {
      question: "M&A 소요 기간은 얼마나 걸리나요?",
      answer:
        "사건의 규모와 복잡도에 따라 다르지만, 일반적으로 3개월에서 1년 정도 소요됩니다. 실사 기간이 가장 오래 걸립니다.",
    },
    {
      question: "실사(Due Diligence)는 무엇인가요?",
      answer:
        "인수 대상 기업의 법률, 재무, 세무, 노동 등 전 분야를 조사하여 잠재적 리스크를 파악하는 과정입니다.",
    },
    {
      question: "외국 기업 인수도 가능한가요?",
      answer:
        "네, 해외 기업 인수도 가능합니다. 각국의 법률과 규제를 고려한 종합적인 자문을 제공합니다.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">
              기업자문
            </Badge>
            <h1 className="section-title mb-6">기업인수합병(M&A)</h1>
            <p className="body-text text-lg">
              기업 인수합병(M&A) 관련 법률 서비스를 제공합니다. 기업 가치 평가,
              계약서 작성, 인허가 절차 등 전 과정을 지원합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">주요 서비스</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <Card key={index} hover>
                <CardHeader>
                  <div className="text-primary mb-4">{service.icon}</div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-text text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="section-padding bg-background-alt">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">처리 프로세스</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {process.map((item, index) => (
                <div key={index} className="flex gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="subsection-title mb-2">{item.title}</h3>
                    <p className="body-text">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">자주 묻는 질문</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-secondary mb-3">
                    {faq.question}
                  </h3>
                  <p className="body-text">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 상담받으세요</h2>
          <p className="text-xl mb-8 opacity-90">
            M&A 전문 변호사가 직접 상담해드립니다.
          </p>
          <Link href="/consultation">
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              무료 상담 신청
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
