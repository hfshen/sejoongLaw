import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Scale, FileText, Users, Heart, Globe, Shield } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "이혼/국제이혼 | 법무법인 세중",
    description:
      "이혼소송, 국제이혼, 재산분할, 위자료, 양육권 등 이혼 관련 모든 법률 문제를 전문적으로 해결합니다.",
  }
}

export default async function DivorcePage() {
  const t = await getTranslations()

  const services = [
    {
      title: "재판상 이혼",
      description: "협의 이혼이 불가능한 경우 재판을 통한 이혼 절차 진행",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "협의 이혼",
      description: "부부 간 합의를 통한 이혼 협상 및 이혼서류 작성",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "재산분할",
      description: "혼인 중 형성된 재산의 공정한 분할 및 청구",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "위자료 청구",
      description: "이혼 원인 제공자에 대한 위자료 청구 및 협상",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "양육권 및 친권",
      description: "자녀의 양육권자 지정 및 친권자 결정",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "국제이혼",
      description: "내국인과 외국인 간의 이혼 및 가사분쟁 해결",
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 사건 분석",
      description: "이혼 사유, 재산 상황, 자녀 양육 등 전반적인 상황을 파악합니다.",
    },
    {
      step: 2,
      title: "증거 수집",
      description: "이혼 사유 입증을 위한 증거 자료 수집 및 정리",
    },
    {
      step: 3,
      title: "협상 전략 수립",
      description: "재산분할, 위자료, 양육권 등에 대한 협상 전략 수립",
    },
    {
      step: 4,
      title: "협상 및 조정",
      description: "상대방과의 협상을 통해 합의점 도출 시도",
    },
    {
      step: 5,
      title: "소송 진행 (필요시)",
      description: "협상이 불가능한 경우 재판을 통해 이혼 및 관련 사항 결정",
    },
  ]

  const faqs = [
    {
      question: "이혼 소송 기간은 얼마나 걸리나요?",
      answer:
        "협의 이혼의 경우 1-2개월, 재판상 이혼의 경우 6개월에서 1년 정도 소요됩니다. 사건의 복잡도에 따라 달라질 수 있습니다.",
    },
    {
      question: "재산분할은 어떻게 이루어지나요?",
      answer:
        "혼인 중 형성된 재산을 부부가 기여한 정도에 따라 공정하게 분할합니다. 협의가 어려운 경우 법원이 결정합니다.",
    },
    {
      question: "국제이혼도 가능한가요?",
      answer:
        "네, 내국인과 외국인 간의 이혼, 복수국적자 간의 이혼 등 국제가사사건도 전문적으로 처리합니다.",
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
            <h1 className="section-title mb-6">이혼/국제이혼</h1>
            <p className="body-text text-lg">
              이혼소송, 국제이혼, 재산분할, 위자료, 양육권 등 이혼 관련 모든 법률
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
            이혼 전문 변호사가 직접 상담해드립니다.
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
