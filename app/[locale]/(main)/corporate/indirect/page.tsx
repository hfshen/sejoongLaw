import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, TrendingUp, FileText, Scale, CheckCircle, DollarSign } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "부동산간접투자 | 법무법인 세중",
    description:
      "부동산 간접투자 상품 설립, 운용, 해산 등 부동산간접투자 관련 법률 서비스를 제공합니다.",
  }
}

export default async function IndirectPage() {
  const services = [
    {
      title: "펀드 설립",
      description: "부동산 간접투자 펀드 설립 및 인허가",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "펀드 운용",
      description: "부동산 펀드 운용 관련 법률 자문",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "투자자 보호",
      description: "투자자 보호를 위한 법률 자문 및 계약 검토",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "규제 대응",
      description: "자본시장법 등 관련 규제 대응",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "계약서 작성",
      description: "펀드 관련 각종 계약서 작성 및 검토",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "펀드 해산",
      description: "부동산 펀드 해산 절차 및 분배",
      icon: <DollarSign className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "투자 계획 수립",
      description: "부동산 간접투자 목적, 규모, 구조 등을 계획합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "자본시장법 등 관련 법령 검토 및 인허가 요건 확인",
    },
    {
      step: 3,
      title: "펀드 설립",
      description: "펀드 설립 및 인허가 신청",
    },
    {
      step: 4,
      title: "운용 관리",
      description: "펀드 운용 과정에서의 법률 자문 및 관리",
    },
    {
      step: 5,
      title: "해산 및 분배",
      description: "펀드 해산 시 절차 및 수익 분배",
    },
  ]

  const faqs = [
    {
      question: "부동산 간접투자 펀드 설립에 필요한 인허가는 무엇인가요?",
      answer:
        "자본시장법에 따른 집합투자업 인허가가 필요합니다. 전문 변호사와 상담하여 인허가 절차를 진행하시기 바랍니다.",
    },
    {
      question: "펀드 운용 중 법률 문제가 발생하면 어떻게 하나요?",
      answer:
        "펀드 운용 과정에서 발생하는 법률 문제에 대해 지속적인 자문을 제공합니다. 문제 발생 시 즉시 대응할 수 있습니다.",
    },
    {
      question: "투자자 보호를 위해 어떤 조치를 취하나요?",
      answer:
        "투자설명서 검토, 계약서 개선, 투자자 권리 보호를 위한 각종 조치를 취합니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">기업자문</Badge>
            <h1 className="section-title mb-6">부동산간접투자</h1>
            <p className="body-text text-lg">
              부동산 간접투자 상품 설립, 운용, 해산 등 부동산간접투자 관련 법률 서비스를 제공합니다.
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
          <p className="text-xl mb-8 opacity-90">부동산간접투자 전문 변호사가 직접 상담해드립니다.</p>
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
