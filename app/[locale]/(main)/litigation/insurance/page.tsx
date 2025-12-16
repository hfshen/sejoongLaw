import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Shield, FileText, DollarSign, AlertTriangle, Car, Heart } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "보험소송 | 법무법인 세중",
    description:
      "자동차보험, 생명보험, 화재보험 등 보험 분쟁 및 소송을 전문적으로 해결합니다.",
  }
}

export default async function InsurancePage() {
  const services = [
    {
      title: "자동차보험",
      description: "자동차보험 사고 처리, 보험금 청구, 구상금 분쟁",
      icon: <Car className="w-6 h-6" />,
    },
    {
      title: "생명보험",
      description: "보험약관 해석, 보험사기, 불완전판매 분쟁",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "화재보험",
      description: "화재보험금 청구, 보험약관 해석 분쟁",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "산재보험",
      description: "산업재해보험 보상금 청구 및 분쟁",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "보험약관 해석",
      description: "보험약관의 법적 해석 및 보험금 지급 여부 판단",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "보험금 청구",
      description: "각종 보험금 청구 및 거부 처분 취소 소송",
      icon: <DollarSign className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "보험 사건 분석",
      description: "보험 계약 내용, 사고 경위, 보험금 거부 사유 등을 분석합니다.",
    },
    {
      step: 2,
      title: "보험약관 검토",
      description: "보험약관의 법적 해석 및 보험금 지급 여부 검토",
    },
    {
      step: 3,
      title: "증거 수집",
      description: "보험 계약서, 사고 관련 서류, 진단서 등 증거 수집",
    },
    {
      step: 4,
      title: "보험사 협상",
      description: "보험사와 협상을 통해 보험금 지급 요구",
    },
    {
      step: 5,
      title: "소송 진행",
      description: "협상 실패 시 소송을 통해 보험금 지급 청구",
    },
  ]

  const faqs = [
    {
      question: "보험사가 보험금 지급을 거부했습니다. 어떻게 해야 하나요?",
      answer:
        "거부 사유를 분석하고, 보험약관과 법률을 근거로 보험금 지급을 요구합니다. 협상이 어려운 경우 소송을 통해 해결할 수 있습니다.",
    },
    {
      question: "보험약관이 복잡해서 이해하기 어렵습니다.",
      answer:
        "보험약관의 법적 해석을 통해 보험금 지급 여부를 판단하고, 고객에게 명확히 설명해드립니다.",
    },
    {
      question: "보험 불완전판매로 피해를 입었습니다.",
      answer:
        "보험 판매 과정에서 중요한 사항을 설명하지 않아 계약을 취소하거나 손해배상을 청구할 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">소송업무</Badge>
            <h1 className="section-title mb-6">보험소송</h1>
            <p className="body-text text-lg">
              자동차보험, 생명보험, 화재보험 등 보험 분쟁 및 소송을 전문적으로 해결합니다.
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
          <p className="text-xl mb-8 opacity-90">보험소송 전문 변호사가 직접 상담해드립니다.</p>
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
