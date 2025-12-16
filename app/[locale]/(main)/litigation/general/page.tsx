import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Scale, FileText, Users, Shield, AlertTriangle, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "가사/민사/형사/행정 | 법무법인 세중",
    description:
      "가사, 민사, 형사, 행정 등 다양한 법률 분야의 소송을 전문적으로 해결합니다.",
  }
}

export default async function GeneralPage() {
  const services = [
    {
      title: "가사소송",
      description: "이혼, 상속, 친권 등 가사 관련 소송",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "민사소송",
      description: "계약 분쟁, 손해배상, 채권 회수 등 민사 소송",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "형사소송",
      description: "형사 사건 변호 및 형사소송 대리",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "행정소송",
      description: "행정처분 취소, 의무이행 소송 등 행정 소송",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "보전처분",
      description: "가압류, 가처분 등 보전처분 신청",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "조정 및 중재",
      description: "법원 조정, 중재 등을 통한 분쟁 해결",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 사건 분석",
      description: "사건의 전반적인 상황을 파악하고 법적 검토를 진행합니다.",
    },
    {
      step: 2,
      title: "증거 수집",
      description: "관련 서류, 증거 자료 수집 및 정리",
    },
    {
      step: 3,
      title: "법률 검토",
      description: "관련 법령 및 판례 검토를 통한 법적 검토",
    },
    {
      step: 4,
      title: "전략 수립",
      description: "사건 해결을 위한 최적의 전략 수립",
    },
    {
      step: 5,
      title: "소송 진행",
      description: "소송 진행 및 최선의 결과 도출",
    },
  ]

  const faqs = [
    {
      question: "어떤 종류의 소송을 다루나요?",
      answer:
        "가사, 민사, 형사, 행정 등 모든 법률 분야의 소송을 다룹니다. 각 분야별 전문 변호사가 상담 및 소송을 진행합니다.",
    },
    {
      question: "소송 기간은 얼마나 걸리나요?",
      answer:
        "사건의 종류와 복잡도에 따라 다르지만, 일반적으로 6개월에서 2년 정도 소요됩니다. 간단한 사건은 더 빠르게 해결될 수 있습니다.",
    },
    {
      question: "소송 전 조정이 가능한가요?",
      answer:
        "네, 소송 전 조정이나 협상을 통해 해결할 수 있는 경우 조정을 먼저 시도합니다. 조정이 성공하면 시간과 비용을 절약할 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">소송업무</Badge>
            <h1 className="section-title mb-6">가사/민사/형사/행정</h1>
            <p className="body-text text-lg">
              가사, 민사, 형사, 행정 등 다양한 법률 분야의 소송을 전문적으로 해결합니다.
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
          <p className="text-xl mb-8 opacity-90">전문 변호사가 직접 상담해드립니다.</p>
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
