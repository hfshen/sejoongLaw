import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Globe, Building2, FileText, Scale, CheckCircle, DollarSign } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "해외투자 | 법무법인 세중",
    description:
      "해외 투자, 해외 법인 설립, 해외 M&A 등 해외투자 관련 법률 서비스를 제공합니다.",
  }
}

export default async function OverseasPage() {
  const services = [
    {
      title: "해외 법인 설립",
      description: "해외 국가별 법인 설립 및 인허가 절차 지원",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "해외 M&A",
      description: "해외 기업 인수합병 관련 법률 서비스",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "해외 투자 규제",
      description: "외국인투자법, 외환거래법 등 해외 투자 규제 대응",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "국제 계약",
      description: "해외 투자 관련 각종 계약서 작성 및 검토",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "세무 계획",
      description: "해외 투자 관련 세무 계획 및 절세 방안",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "분쟁 해결",
      description: "해외 투자 관련 분쟁 해결 및 국제 중재",
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "투자 계획 수립",
      description: "해외 투자 목적, 대상 국가, 투자 규모 등을 계획합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "투자 대상 국가의 법률 및 규제 검토",
    },
    {
      step: 3,
      title: "인허가 및 신고",
      description: "필요한 인허가 신청 및 외국인투자 신고",
    },
    {
      step: 4,
      title: "계약 체결",
      description: "해외 투자 관련 각종 계약 체결",
    },
    {
      step: 5,
      title: "후속 관리",
      description: "해외 투자 후 지속적인 법률 자문 및 관리",
    },
  ]

  const faqs = [
    {
      question: "해외 법인 설립은 어떤 절차가 필요한가요?",
      answer:
        "투자 대상 국가의 법률에 따라 다르지만, 일반적으로 법인 설립, 인허가, 외국인투자 신고 등이 필요합니다. 각 국가별 전문 변호사와 협력하여 진행합니다.",
    },
    {
      question: "해외 투자 시 세무 문제는 어떻게 해결하나요?",
      answer:
        "해외 투자 전 단계에서 세무 계획을 수립하여 이중과세 방지 및 절세 방안을 제시합니다. 각 국가의 세법을 고려한 종합적인 자문을 제공합니다.",
    },
    {
      question: "해외 투자 분쟁이 발생하면 어떻게 하나요?",
      answer:
        "국제 중재 또는 해당 국가의 법원을 통한 분쟁 해결이 가능합니다. 국제 중재 전문 변호사가 대리합니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">기업자문</Badge>
            <h1 className="section-title mb-6">해외투자</h1>
            <p className="body-text text-lg">
              해외 투자, 해외 법인 설립, 해외 M&A 등 해외투자 관련 법률 서비스를 제공합니다.
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
          <p className="text-xl mb-8 opacity-90">해외투자 전문 변호사가 직접 상담해드립니다.</p>
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
