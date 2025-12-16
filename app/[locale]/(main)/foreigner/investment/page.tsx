import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, DollarSign, FileText, Scale, CheckCircle, Globe } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "외국인투자 | 법무법인 세중",
    description:
      "외국인투자 신고, 외국인투자 기업 설립, 외국인투자 비자 등 외국인투자 관련 법률 서비스를 제공합니다.",
  }
}

export default async function ForeignerInvestmentPage() {
  const services = [
    {
      title: "외국인투자 신고",
      description: "외국인투자법에 따른 외국인투자 신고 및 인허가",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "외국인투자 기업 설립",
      description: "외국인투자 기업의 법인 설립 및 등기",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "외국인투자 비자",
      description: "외국인투자와 연계된 비자 신청 (D-8, F-5 등)",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "세무 계획",
      description: "외국인투자 관련 세무 계획 및 절세 방안",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "규제 대응",
      description: "외국인투자 관련 각종 규제 대응",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "국제 계약",
      description: "해외 투자자와의 계약서 작성 및 검토",
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "투자 계획 수립",
      description: "외국인투자 목적, 규모, 구조 등을 계획합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "외국인투자법 등 관련 법령 검토",
    },
    {
      step: 3,
      title: "기업 설립",
      description: "외국인투자 기업의 법인 설립",
    },
    {
      step: 4,
      title: "외국인투자 신고",
      description: "외국인투자 신고 및 인허가 절차 진행",
    },
    {
      step: 5,
      title: "비자 및 후속 관리",
      description: "투자 관련 비자 신청 및 지속적인 법률 자문",
    },
  ]

  const faqs = [
    {
      question: "외국인투자 신고는 필수인가요?",
      answer:
        "네, 외국인투자법에 따라 일정 금액 이상의 투자는 반드시 신고해야 합니다. 신고하지 않으면 불이익을 받을 수 있습니다.",
    },
    {
      question: "외국인투자로 영주권을 받을 수 있나요?",
      answer:
        "일정 금액 이상의 투자를 통해 영주권(F-5)을 신청할 수 있습니다. 투자 금액과 요건에 따라 달라질 수 있습니다.",
    },
    {
      question: "외국인투자 기업 설립 절차는 어떻게 되나요?",
      answer:
        "법인 설립, 외국인투자 신고, 외환거래 신고 등의 절차가 필요합니다. 전문 변호사와 상담하여 진행하시기 바랍니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">외국인투자</h1>
            <p className="body-text text-lg">
              외국인투자 신고, 외국인투자 기업 설립, 외국인투자 비자 등 외국인투자 관련 법률 서비스를 제공합니다.
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
          <p className="text-xl mb-8 opacity-90">외국인투자 전문 변호사가 직접 상담해드립니다.</p>
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
