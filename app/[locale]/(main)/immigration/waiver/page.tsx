import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Shield, FileText, CheckCircle, AlertTriangle, RefreshCw, Scale } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "웨이버(Waiver)신청 | 법무법인 세중",
    description:
      "입국 금지 해제를 위한 웨이버(Waiver) 신청 서비스를 제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.",
  }
}

export default async function WaiverPage() {
  const services = [
    {
      title: "입국 금지 해제",
      description: "입국 금지 사유 해제를 위한 웨이버 신청",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "사유 분석",
      description: "입국 금지 사유를 분석하고 해제 가능성 검토",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "서류 준비",
      description: "웨이버 신청에 필요한 서류 수집 및 준비",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "신청서 작성",
      description: "웨이버 신청서 작성 및 제출",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "재신청",
      description: "거절 시 추가 서류 보완 후 재신청",
      icon: <RefreshCw className="w-6 h-6" />,
    },
    {
      title: "행정심판",
      description: "웨이버 거절 시 행정심판 청구",
      icon: <Scale className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "입국 금지 사유 확인",
      description: "입국 금지 사유를 확인하고 해제 가능성을 검토합니다.",
    },
    {
      step: 2,
      title: "해제 사유 정리",
      description: "입국 금지 해제를 위한 사유 및 증거 자료 정리",
    },
    {
      step: 3,
      title: "서류 준비",
      description: "웨이버 신청에 필요한 각종 서류 수집 및 준비",
    },
    {
      step: 4,
      title: "신청서 제출",
      description: "웨이버 신청서 작성 및 출입국관리사무소에 제출",
    },
    {
      step: 5,
      title: "결과 대응",
      description: "승인 시 입국 안내, 거절 시 재신청 또는 행정심판",
    },
  ]

  const faqs = [
    {
      question: "웨이버(Waiver)가 무엇인가요?",
      answer:
        "웨이버는 입국 금지 사유가 있는 경우에도 특별한 사정이 있어 입국을 허용하는 제도입니다. 출입국관리사무소에 신청하여 승인을 받아야 합니다.",
    },
    {
      question: "웨이버 신청이 거절되면 어떻게 하나요?",
      answer:
        "거절 사유를 분석하고 추가 서류를 보완하여 재신청하거나, 행정심판을 통해 거절 처분을 취소할 수 있습니다.",
    },
    {
      question: "웨이버 신청 기간은 얼마나 걸리나요?",
      answer:
        "일반적으로 3개월에서 6개월 정도 소요됩니다. 사건의 복잡도에 따라 달라질 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">해외이주</Badge>
            <h1 className="section-title mb-6">웨이버(Waiver)신청</h1>
            <p className="body-text text-lg">
              입국 금지 해제를 위한 웨이버(Waiver) 신청 서비스를 제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.
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
