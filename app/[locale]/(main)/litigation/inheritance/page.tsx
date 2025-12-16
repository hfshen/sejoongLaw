import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Scale, FileText, Users, DollarSign, Shield, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "상속분쟁 | 법무법인 세중",
    description:
      "상속재산분할, 유류분반환청구, 상속회복청구 등 상속 관련 모든 법률 문제를 전문적으로 해결합니다.",
  }
}

export default async function InheritancePage() {
  const t = await getTranslations()

  const services = [
    {
      title: "상속재산분할",
      description: "상속재산의 공정한 분할 및 분할 협상",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "유류분반환청구",
      description: "유류분 권리자의 권리 보호 및 반환청구",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "상속회복청구",
      description: "상속권 침해에 대한 회복청구 소송",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "유언 및 상속계획",
      description: "상속 전 단계의 상속계획 수립 및 유언 작성",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "상속세 절세",
      description: "상속세 절세를 위한 법률 자문 및 계획",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "국내외 상속사건",
      description: "해외 재산이 있는 경우의 상속 사건 처리",
      icon: <Users className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 상속재산 파악",
      description: "상속재산의 종류, 규모, 상속인 등을 파악합니다.",
    },
    {
      step: 2,
      title: "상속재산 조사",
      description: "은행 계좌, 부동산, 주식 등 모든 상속재산 조사",
    },
    {
      step: 3,
      title: "법률 검토",
      description: "상속법에 따른 상속분, 유류분 등 법적 권리 검토",
    },
    {
      step: 4,
      title: "협상 및 조정",
      description: "상속인 간 협상을 통한 재산분할 합의 도출",
    },
    {
      step: 5,
      title: "소송 진행 (필요시)",
      description: "협상이 불가능한 경우 재판을 통해 해결",
    },
  ]

  const faqs = [
    {
      question: "상속분쟁 소송 기간은 얼마나 걸리나요?",
      answer:
        "사건의 복잡도에 따라 다르지만, 일반적으로 6개월에서 1년 정도 소요됩니다. 재산 규모가 크거나 상속인이 많은 경우 더 오래 걸릴 수 있습니다.",
    },
    {
      question: "유류분이 무엇인가요?",
      answer:
        "유류분은 상속인이 법정상속분의 일정 비율을 보장받는 제도입니다. 유류분을 침해당한 경우 반환을 청구할 수 있습니다.",
    },
    {
      question: "상속세 절세가 가능한가요?",
      answer:
        "네, 상속 전 단계에서 적절한 상속계획을 수립하면 상속세를 절감할 수 있습니다. 전문 변호사와 상담하시기 바랍니다.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">
              소송업무
            </Badge>
            <h1 className="section-title mb-6">상속분쟁</h1>
            <p className="body-text text-lg">
              상속재산분할, 유류분반환청구, 상속회복청구 등 상속 관련 모든 법률
              문제를 전문적으로 해결합니다.
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
            상속 전문 변호사가 직접 상담해드립니다.
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
