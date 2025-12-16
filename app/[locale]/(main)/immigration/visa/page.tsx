import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Plane, FileText, CheckCircle, AlertCircle, Globe, Shield } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "비자/이민 | 법무법인 세중",
    description:
      "비자 신청, 이민 상담, 비자 거절 대응 등 출입국관리법 전문 서비스를 제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.",
  }
}

export default async function VisaPage() {
  const t = await getTranslations()

  const services = [
    {
      title: "비자 신청",
      description: "각종 비자 신청 및 연장, 변경 신청 대행",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "이민 상담",
      description: "영주권, 시민권 등 이민 관련 종합 상담",
      icon: <Plane className="w-6 h-6" />,
    },
    {
      title: "비자 거절 대응",
      description: "비자 거절 사유 분석 및 재신청, 행정심판",
      icon: <AlertCircle className="w-6 h-6" />,
    },
    {
      title: "웨이버 신청",
      description: "입국 금지 해제를 위한 웨이버(Waiver) 신청",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "출입국 관리 소송",
      description: "강제퇴거, 입국거부 등 출입국관리 관련 소송",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "국제 이민",
      description: "미국, 캐나다, 호주 등 각국 이민 서비스",
      icon: <Globe className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 사건 분석",
      description: "비자 유형, 신청 자격, 필요 서류 등을 분석합니다.",
    },
    {
      step: 2,
      title: "서류 준비",
      description: "필요한 서류 수집 및 번역, 공증 등 준비",
    },
    {
      step: 3,
      title: "신청서 작성",
      description: "비자 신청서 작성 및 서류 정리",
    },
    {
      step: 4,
      title: "신청 및 추적",
      description: "출입국관리사무소에 신청 및 진행 상황 추적",
    },
    {
      step: 5,
      title: "결과 대응",
      description: "승인 시 후속 절차 안내, 거절 시 재신청 또는 소송",
    },
  ]

  const faqs = [
    {
      question: "비자 신청 기간은 얼마나 걸리나요?",
      answer:
        "비자 유형에 따라 다르지만, 일반적으로 2주에서 3개월 정도 소요됩니다. 복잡한 사건의 경우 더 오래 걸릴 수 있습니다.",
    },
    {
      question: "비자가 거절된 경우 어떻게 하나요?",
      answer:
        "거절 사유를 분석하고, 부족한 서류를 보완하여 재신청하거나, 행정심판을 통해 거절 처분을 취소할 수 있습니다.",
    },
    {
      question: "《출입국관리법》 저자 변호사가 직접 상담하나요?",
      answer:
        "네, 이상국 대표변호사가 직접 상담합니다. 출입국관리법의 권위자로서 최고 수준의 전문 서비스를 제공합니다.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">
              해외이주
            </Badge>
            <h1 className="section-title mb-6">비자/이민</h1>
            <p className="body-text text-lg">
              비자 신청, 이민 상담, 비자 거절 대응 등 출입국관리법 전문 서비스를
              제공합니다. 《출입국관리법》 저자 이상국 대표변호사가 직접 상담합니다.
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
            《출입국관리법》 저자 이상국 대표변호사가 직접 상담해드립니다.
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
