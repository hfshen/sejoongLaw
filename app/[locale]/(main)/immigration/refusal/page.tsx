import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { AlertTriangle, FileText, Scale, CheckCircle, RefreshCw, Shield } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "비자거절 | 법무법인 세중",
    description:
      "비자 거절 사유 분석, 재신청, 행정심판 등 비자 거절 대응 서비스를 제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.",
  }
}

export default async function RefusalPage() {
  const services = [
    {
      title: "거절 사유 분석",
      description: "비자 거절 사유를 정확히 분석하고 대응 방안을 제시합니다.",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "서류 보완",
      description: "부족한 서류를 보완하여 재신청 준비",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "재신청",
      description: "보완된 서류로 비자 재신청",
      icon: <RefreshCw className="w-6 h-6" />,
    },
    {
      title: "행정심판",
      description: "비자 거절 처분에 대한 행정심판 청구",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "소송",
      description: "행정심판 기각 시 소송을 통한 거절 처분 취소",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "웨이버 신청",
      description: "입국 금지 해제를 위한 웨이버 신청",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "거절 사유 분석",
      description: "비자 거절 통지서를 분석하여 거절 사유를 정확히 파악합니다.",
    },
    {
      step: 2,
      title: "대응 전략 수립",
      description: "거절 사유에 따른 대응 전략을 수립합니다.",
    },
    {
      step: 3,
      title: "서류 보완",
      description: "부족한 서류를 보완하거나 추가 증거를 수집",
    },
    {
      step: 4,
      title: "재신청 또는 행정심판",
      description: "서류 보완 후 재신청하거나 행정심판 청구",
    },
    {
      step: 5,
      title: "소송 (필요시)",
      description: "행정심판 기각 시 소송을 통해 거절 처분 취소",
    },
  ]

  const faqs = [
    {
      question: "비자가 거절되었습니다. 재신청이 가능한가요?",
      answer:
        "네, 거절 사유를 해결한 후 재신청이 가능합니다. 거절 사유를 정확히 분석하고 보완하여 재신청하면 승인 가능성이 높아집니다.",
    },
    {
      question: "행정심판과 재신청 중 어떤 것이 좋은가요?",
      answer:
        "거절 사유에 따라 다릅니다. 서류 보완으로 해결 가능한 경우 재신청이 빠르고, 법적 해석 문제인 경우 행정심판이 효과적입니다.",
    },
    {
      question: "비자 거절 후 얼마나 기다려야 재신청할 수 있나요?",
      answer:
        "거절 사유에 따라 다르지만, 일반적으로 즉시 재신청이 가능합니다. 다만 거절 사유를 해결한 후 재신청하는 것이 중요합니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">해외이주</Badge>
            <h1 className="section-title mb-6">비자거절</h1>
            <p className="body-text text-lg">
              비자 거절 사유 분석, 재신청, 행정심판 등 비자 거절 대응 서비스를 제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.
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
