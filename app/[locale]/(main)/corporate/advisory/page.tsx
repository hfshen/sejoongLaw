import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, FileText, Scale, Users, Shield, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "기업자문 안내 | 법무법인 세중",
    description:
      "기업의 법률 문제 해결을 위한 전문적인 자문 서비스를 제공합니다. 기업법무, 계약 검토, 규제 대응 등 전 분야를 지원합니다.",
  }
}

export default async function AdvisoryPage() {
  const t = await getTranslations()

  const services = [
    {
      title: "기업법무 자문",
      description: "기업 운영 전반에 대한 법률 자문 및 위험 관리",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "계약서 검토 및 작성",
      description: "각종 계약서의 법률 검토 및 작성 지원",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "규제 대응",
      description: "공정거래법, 개인정보보호법 등 각종 규제 대응",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "노동법 자문",
      description: "근로계약, 퇴직금, 부당해고 등 노동 관련 자문",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "지적재산권",
      description: "특허, 상표, 저작권 등 지적재산권 보호",
      icon: <Shield className="w-6 h-6" />,
    },
    {
      title: "기업 구조 자문",
      description: "법인 설립, 조직 재편, 지배구조 개선 자문",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 현황 파악",
      description: "기업의 법률 문제 현황을 파악하고 분석합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "관련 법령 및 판례 검토를 통한 법적 검토",
    },
    {
      step: 3,
      title: "해결 방안 제시",
      description: "법률적 위험을 최소화하는 해결 방안 제시",
    },
    {
      step: 4,
      title: "실행 지원",
      description: "제시된 방안의 실행을 지원하고 모니터링",
    },
    {
      step: 5,
      title: "후속 관리",
      description: "지속적인 법률 자문 및 사후 관리",
    },
  ]

  const faqs = [
    {
      question: "기업자문은 어떤 형태로 제공되나요?",
      answer:
        "정기 자문, 사건별 자문, 전화/이메일 상담 등 다양한 형태로 제공됩니다. 기업의 필요에 맞는 형태를 선택하실 수 있습니다.",
    },
    {
      question: "소규모 기업도 자문을 받을 수 있나요?",
      answer:
        "네, 기업 규모에 상관없이 자문 서비스를 제공합니다. 소규모 기업을 위한 맞춤형 자문 패키지도 준비되어 있습니다.",
    },
    {
      question: "긴급한 법률 문제도 대응 가능한가요?",
      answer:
        "네, 긴급한 법률 문제에 대해서는 24시간 내 초기 대응을 제공합니다. 전화나 이메일로 즉시 연락 주시기 바랍니다.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">
              기업자문
            </Badge>
            <h1 className="section-title mb-6">기업자문 안내</h1>
            <p className="body-text text-lg">
              기업의 법률 문제 해결을 위한 전문적인 자문 서비스를 제공합니다.
              기업법무, 계약 검토, 규제 대응 등 전 분야를 지원합니다.
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
            기업자문 전문 변호사가 직접 상담해드립니다.
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
