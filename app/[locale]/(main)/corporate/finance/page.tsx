import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, DollarSign, FileText, Scale, CheckCircle, TrendingUp } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "부동산금융 | 법무법인 세중",
    description:
      "부동산 담보대출, 부동산 펀드, REITs 등 부동산금융 관련 법률 서비스를 제공합니다.",
  }
}

export default async function FinancePage() {
  const services = [
    {
      title: "부동산 담보대출",
      description: "부동산 담보대출 계약 검토 및 분쟁 해결",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "부동산 펀드",
      description: "부동산 펀드 설립, 운용, 해산 관련 자문",
      icon: <TrendingUp className="w-6 h-6" />,
    },
    {
      title: "REITs",
      description: "부동산투자회사(REITs) 설립 및 운용 자문",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "부동산 금융 규제",
      description: "부동산금융 관련 규제 대응 및 인허가",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "계약서 검토",
      description: "부동산금융 관련 각종 계약서 검토 및 작성",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "분쟁 해결",
      description: "부동산금융 관련 분쟁 해결 및 소송 대리",
      icon: <CheckCircle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 현황 파악",
      description: "부동산금융 거래의 전반적인 현황을 파악합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "관련 법령 및 규제를 검토하여 법적 리스크 분석",
    },
    {
      step: 3,
      title: "계약서 검토",
      description: "계약서의 법률적 검토 및 개선 사항 제시",
    },
    {
      step: 4,
      title: "인허가 지원",
      description: "필요한 인허가 신고 및 절차 지원",
    },
    {
      step: 5,
      title: "후속 관리",
      description: "거래 완료 후 지속적인 법률 자문 및 관리",
    },
  ]

  const faqs = [
    {
      question: "부동산 펀드 설립은 어떻게 하나요?",
      answer:
        "부동산 펀드 설립을 위해서는 자본시장법에 따른 인허가가 필요합니다. 전문 변호사와 상담하여 설립 절차를 진행하시기 바랍니다.",
    },
    {
      question: "REITs와 부동산 펀드의 차이는 무엇인가요?",
      answer:
        "REITs는 상장 가능한 부동산투자회사이고, 부동산 펀드는 사모펀드 형태입니다. 각각 다른 법적 요건과 규제가 적용됩니다.",
    },
    {
      question: "부동산 담보대출 계약서를 검토받을 수 있나요?",
      answer:
        "네, 부동산 담보대출 계약서의 법률적 검토를 통해 불리한 조항을 개선하고 리스크를 최소화할 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">기업자문</Badge>
            <h1 className="section-title mb-6">부동산금융</h1>
            <p className="body-text text-lg">
              부동산 담보대출, 부동산 펀드, REITs 등 부동산금융 관련 법률 서비스를 제공합니다.
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
          <p className="text-xl mb-8 opacity-90">부동산금융 전문 변호사가 직접 상담해드립니다.</p>
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
