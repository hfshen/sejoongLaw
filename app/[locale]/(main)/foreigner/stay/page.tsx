import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { RefreshCw, FileText, CheckCircle, AlertTriangle, Clock, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "체류허가 연장/변경 | 법무법인 세중",
    description:
      "체류허가 연장, 체류자격 변경 등 체류허가 관련 서비스를 제공합니다.",
  }
}

export default async function StayPage() {
  const services = [
    {
      title: "체류허가 연장",
      description: "체류 기간 연장 신청 및 처리",
      icon: <RefreshCw className="w-6 h-6" />,
    },
    {
      title: "체류자격 변경",
      description: "현재 체류자격에서 다른 자격으로 변경 신청",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "체류지 변경",
      description: "체류지 주소 변경 신고",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "사증 발급",
      description: "재입국 사증 발급 신청",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "외국인등록",
      description: "외국인등록증 발급 및 갱신",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "체류 불법 대응",
      description: "체류 기간 초과 등 불법 체류 문제 해결",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "현황 파악",
      description: "현재 체류 상태 및 연장/변경 목적을 파악합니다.",
    },
    {
      step: 2,
      title: "자격 요건 확인",
      description: "연장 또는 변경 신청 자격 요건 확인",
    },
    {
      step: 3,
      title: "서류 준비",
      description: "신청에 필요한 각종 서류 수집 및 준비",
    },
    {
      step: 4,
      title: "신청서 제출",
      description: "출입국관리사무소에 신청서 제출",
    },
    {
      step: 5,
      title: "결과 확인",
      description: "승인 여부 확인 및 후속 절차 안내",
    },
  ]

  const faqs = [
    {
      question: "체류허가 연장은 언제 신청해야 하나요?",
      answer:
        "체류 기간 만료 전 최소 2개월 전에 신청하는 것이 좋습니다. 만료 후 신청 시 불이익을 받을 수 있습니다.",
    },
    {
      question: "체류자격 변경이 가능한가요?",
      answer:
        "네, 일정 요건을 충족하면 체류자격 변경이 가능합니다. 예를 들어, 유학비자에서 취업비자로 변경하는 것이 가능합니다.",
    },
    {
      question: "체류 기간을 초과했는데 어떻게 하나요?",
      answer:
        "즉시 출입국관리사무소에 신고하고 연장 신청을 해야 합니다. 초과 기간이 길수록 불이익이 커질 수 있으므로 빠른 대응이 중요합니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">체류허가 연장/변경</h1>
            <p className="body-text text-lg">
              체류허가 연장, 체류자격 변경 등 체류허가 관련 서비스를 제공합니다.
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
          <p className="text-xl mb-8 opacity-90">《출입국관리법》 저자 이상국 대표변호사가 직접 상담해드립니다.</p>
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
