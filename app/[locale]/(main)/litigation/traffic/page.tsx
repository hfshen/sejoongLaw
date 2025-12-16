import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Car, AlertTriangle, DollarSign, FileText, Scale, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "교통사고 | 법무법인 세중",
    description:
      "교통사고 손해배상, 보험금 청구, 과실비율 분쟁 등 교통사고 관련 모든 법률 문제를 전문적으로 해결합니다.",
  }
}

export default async function TrafficPage() {
  const services = [
    {
      title: "손해배상 청구",
      description: "교통사고로 인한 재산상 손해 및 정신적 손해 배상 청구",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "보험금 청구",
      description: "자동차보험, 상해보험 등 보험금 청구 및 분쟁 해결",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "과실비율 분쟁",
      description: "사고 원인 분석 및 과실비율 산정, 분쟁 해결",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "형사처벌 대응",
      description: "도로교통법 위반, 과실치상 등 형사처벌 대응",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "후유증 및 장해",
      description: "교통사고 후유증 및 장해 등급 산정, 추가 배상 청구",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "사고 조사",
      description: "사고 현장 조사, 증거 수집, 사고 원인 분석",
      icon: <Car className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "사고 현황 파악",
      description: "교통사고 발생 경위, 피해 내용, 보험 가입 현황 등을 파악합니다.",
    },
    {
      step: 2,
      title: "증거 수집",
      description: "사고 현장 사진, CCTV, 진단서, 치료비 영수증 등 증거 수집",
    },
    {
      step: 3,
      title: "과실비율 산정",
      description: "사고 원인 분석 및 과실비율 산정",
    },
    {
      step: 4,
      title: "손해액 산정",
      description: "치료비, 휴업손해, 위자료 등 손해액 산정",
    },
    {
      step: 5,
      title: "협상 및 소송",
      description: "보험사와 협상, 협상 실패 시 소송 진행",
    },
  ]

  const faqs = [
    {
      question: "교통사고 후 언제까지 변호사에게 상담받아야 하나요?",
      answer:
        "가능한 한 빨리 상담받으시는 것이 좋습니다. 특히 보험사와의 협상 전에 상담받으시면 더 유리한 조건을 얻을 수 있습니다.",
    },
    {
      question: "보험사가 제시한 금액이 낮은 것 같습니다. 어떻게 해야 하나요?",
      answer:
        "변호사와 상담하여 손해액을 정확히 산정하고, 보험사와 재협상하거나 소송을 통해 적정한 배상을 받을 수 있습니다.",
    },
    {
      question: "과실비율이 불공정하게 산정되었습니다.",
      answer:
        "사고 원인을 재분석하여 과실비율을 재산정하고, 보험사나 상대방과 협상하거나 소송을 통해 조정할 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">소송업무</Badge>
            <h1 className="section-title mb-6">교통사고</h1>
            <p className="body-text text-lg">
              교통사고 손해배상, 보험금 청구, 과실비율 분쟁 등 교통사고 관련 모든 법률 문제를 전문적으로 해결합니다.
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
          <p className="text-xl mb-8 opacity-90">교통사고 전문 변호사가 직접 상담해드립니다.</p>
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
