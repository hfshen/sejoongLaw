import { getTranslations } from "next-intl/server"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Scale, FileText, Users, CheckCircle } from "lucide-react"
import Link from "next/link"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: "부동산 분쟁 | 법무법인 세중",
    description:
      "부동산 계약, 소유권 분쟁, 임대차 분쟁 등 다양한 부동산 관련 법률 문제를 전문적으로 해결합니다.",
  }
}

export default async function RealEstatePage() {
  const t = await getTranslations()

  const services = [
    {
      title: "부동산 계약 분쟁",
      description:
        "매매계약, 전세계약, 임대차계약 등 부동산 계약 관련 분쟁 해결",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "소유권 분쟁",
      description: "등기부등본 오류, 명의신탁, 소유권 이전 등 소유권 관련 분쟁",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "임대차 분쟁",
      description: "전세금 반환, 보증금 반환, 계약 갱신 등 임대차 관련 분쟁",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "건설 분쟁",
      description: "하자보수, 공사 지연, 계약 해지 등 건설 관련 분쟁",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 사건 분석",
      description: "고객과 상담을 통해 사건의 전반적인 상황을 파악하고 분석합니다.",
    },
    {
      step: 2,
      title: "증거 수집 및 조사",
      description: "관련 서류, 계약서, 증거 자료를 수집하고 법적 검토를 진행합니다.",
    },
    {
      step: 3,
      title: "법률 검토 및 전략 수립",
      description: "수집한 자료를 바탕으로 법률적 검토를 하고 해결 전략을 수립합니다.",
    },
    {
      step: 4,
      title: "협상 및 조정",
      description: "상대방과의 협상을 통해 조정 가능성을 모색합니다.",
    },
    {
      step: 5,
      title: "소송 진행 (필요시)",
      description: "협상이 불가능한 경우 소송을 통해 고객의 권리를 보호합니다.",
    },
  ]

  const faqs = [
    {
      question: "부동산 분쟁 소송 기간은 얼마나 걸리나요?",
      answer:
        "사건의 복잡도에 따라 다르지만, 일반적으로 6개월에서 1년 정도 소요됩니다. 간단한 사건의 경우 더 빠르게 해결될 수 있습니다.",
    },
    {
      question: "부동산 분쟁 상담은 무료인가요?",
      answer:
        "네, 초기 상담은 무료로 제공됩니다. 상담을 통해 사건의 개요를 파악하고 해결 방안을 제시해드립니다.",
    },
    {
      question: "어떤 종류의 부동산 분쟁을 다루나요?",
      answer:
        "부동산 계약 분쟁, 소유권 분쟁, 임대차 분쟁, 건설 분쟁 등 모든 부동산 관련 법률 문제를 다룹니다.",
    },
  ]

  return (
    <>
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="container-max">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="primary" className="mb-4">
                소송업무
              </Badge>
              <h1 className="section-title mb-6">부동산 분쟁</h1>
              <p className="body-text text-lg">
                부동산 계약, 소유권 분쟁, 임대차 분쟁 등 다양한 부동산 관련
                법률 문제를 전문적으로 해결합니다.
              </p>
            </div>
          </div>
        </section>

        {/* Services */}
        <section className="section-padding">
          <div className="container-max">
            <h2 className="section-title text-center mb-12">주요 서비스</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
              부동산 분쟁 전문 변호사가 직접 상담해드립니다.
            </p>
            <Link
              href="/consultation"
              className="premium-button-secondary px-8 py-4 text-lg bg-white text-primary hover:bg-gray-100"
            >
              무료 상담 신청
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
