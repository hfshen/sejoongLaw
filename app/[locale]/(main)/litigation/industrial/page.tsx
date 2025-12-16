import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { AlertTriangle, FileText, DollarSign, Scale, CheckCircle, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "산업재해 | 법무법인 세중",
    description:
      "산업재해 인정, 장해등급 산정, 보상금 청구 등 산업재해 관련 모든 법률 문제를 전문적으로 해결합니다.",
  }
}

export default async function IndustrialPage() {
  const services = [
    {
      title: "산업재해 인정",
      description: "산업재해 인정 신청 및 거부 처분 취소 소송",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "장해등급 산정",
      description: "장해등급 재판정 신청 및 분쟁 해결",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "보상금 청구",
      description: "요양급여, 휴업급여, 장해급여 등 보상금 청구",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "유족급여",
      description: "사망 재해 시 유족급여 및 장의비 청구",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "재해보상 분쟁",
      description: "보험사와의 보상금 분쟁 해결",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "산재 소송",
      description: "산재 인정 거부, 장해등급 분쟁 등 소송 대리",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "사고 현황 파악",
      description: "산업재해 발생 경위, 치료 과정, 회사 대응 등을 파악합니다.",
    },
    {
      step: 2,
      title: "증거 수집",
      description: "사고 보고서, 진단서, 치료비 영수증 등 증거 수집",
    },
    {
      step: 3,
      title: "산재 인정 신청",
      description: "산업재해 인정 신청서 작성 및 제출",
    },
    {
      step: 4,
      title: "보상금 산정",
      description: "요양급여, 휴업급여, 장해급여 등 보상금 산정",
    },
    {
      step: 5,
      title: "분쟁 해결",
      description: "거부 처분 시 행정심판 또는 소송 진행",
    },
  ]

  const faqs = [
    {
      question: "산업재해 인정이 거부되었습니다. 어떻게 해야 하나요?",
      answer:
        "거부 사유를 분석하고, 추가 증거를 보완하여 재신청하거나 행정심판을 통해 거부 처분을 취소할 수 있습니다.",
    },
    {
      question: "장해등급이 낮게 산정되었습니다.",
      answer:
        "장해등급 재판정 신청을 통해 등급을 상향 조정할 수 있습니다. 전문 변호사와 상담하시기 바랍니다.",
    },
    {
      question: "산재 보상금은 얼마나 받을 수 있나요?",
      answer:
        "요양급여, 휴업급여, 장해급여 등으로 구성되며, 장해등급과 평균임금에 따라 달라집니다. 정확한 금액은 상담을 통해 산정됩니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">소송업무</Badge>
            <h1 className="section-title mb-6">산업재해</h1>
            <p className="body-text text-lg">
              산업재해 인정, 장해등급 산정, 보상금 청구 등 산업재해 관련 모든 법률 문제를 전문적으로 해결합니다.
            </p>
          </div>
        </div>
      </section>

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

      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">자주 묻는 질문</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-secondary mb-3">{faq.question}</h3>
                  <p className="body-text">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 상담받으세요</h2>
          <p className="text-xl mb-8 opacity-90">산업재해 전문 변호사가 직접 상담해드립니다.</p>
          <Link href="/consultation">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              무료 상담 신청
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
