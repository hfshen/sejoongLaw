import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Scale, FileText, DollarSign, AlertTriangle, CheckCircle, Calculator } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "조세소송 | 법무법인 세중",
    description:
      "부가가치세, 소득세, 법인세 등 조세 관련 소송 및 행정심판을 전문적으로 해결합니다.",
  }
}

export default async function TaxPage() {
  const services = [
    {
      title: "부가가치세",
      description: "부가가치세 과세처분 취소 소송 및 행정심판",
      icon: <Calculator className="w-6 h-6" />,
    },
    {
      title: "소득세",
      description: "소득세 과세처분 취소 소송 및 행정심판",
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      title: "법인세",
      description: "법인세 과세처분 취소 소송 및 행정심판",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "세무조사 대응",
      description: "세무조사 대응 및 조정 협상",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
    {
      title: "세무 자문",
      description: "세무 계획 수립 및 절세 방안 제시",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "행정심판",
      description: "과세처분에 대한 행정심판 청구",
      icon: <Scale className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "과세처분 분석",
      description: "과세처분의 내용, 근거, 절차 등을 분석합니다.",
    },
    {
      step: 2,
      title: "법률 검토",
      description: "관련 세법 및 판례를 검토하여 과세처분의 적법성 검토",
    },
    {
      step: 3,
      title: "증거 수집",
      description: "과세처분 취소를 위한 증거 자료 수집",
    },
    {
      step: 4,
      title: "행정심판",
      description: "과세처분에 대한 행정심판 청구",
    },
    {
      step: 5,
      title: "소송 진행",
      description: "행정심판 기각 시 소송을 통해 과세처분 취소 청구",
    },
  ]

  const faqs = [
    {
      question: "세무조사를 받고 있습니다. 어떻게 대응해야 하나요?",
      answer:
        "세무조사 초기 단계에서 변호사와 상담하여 적절히 대응하는 것이 중요합니다. 조사 과정에서 발생할 수 있는 문제를 예방할 수 있습니다.",
    },
    {
      question: "과세처분이 부당합니다. 취소할 수 있나요?",
      answer:
        "네, 행정심판 또는 소송을 통해 과세처분을 취소할 수 있습니다. 과세처분의 하자나 절차상 문제를 지적하여 취소를 요구합니다.",
    },
    {
      question: "조세소송 기간은 얼마나 걸리나요?",
      answer:
        "행정심판은 3-6개월, 소송은 1-2년 정도 소요됩니다. 사건의 복잡도에 따라 달라질 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">소송업무</Badge>
            <h1 className="section-title mb-6">조세소송</h1>
            <p className="body-text text-lg">
              부가가치세, 소득세, 법인세 등 조세 관련 소송 및 행정심판을 전문적으로 해결합니다.
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
          <p className="text-xl mb-8 opacity-90">조세소송 전문 변호사가 직접 상담해드립니다.</p>
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
