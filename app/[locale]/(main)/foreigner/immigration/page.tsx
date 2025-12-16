import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Building2, FileText, Scale, CheckCircle, AlertTriangle, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "출입국관리사무소 관련업무 | 법무법인 세중",
    description:
      "출입국관리사무소 관련 각종 업무를 대행합니다. 비자 신청, 체류허가, 외국인등록 등 전 과정을 지원합니다.",
  }
}

export default async function ForeignerImmigrationPage() {
  const services = [
    {
      title: "비자 신청 대행",
      description: "각종 비자 신청서 작성 및 제출 대행",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "체류허가 신청",
      description: "체류허가 연장, 변경 등 각종 신청 대행",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "외국인등록",
      description: "외국인등록증 발급 및 갱신 대행",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "행정심판",
      description: "출입국관리 처분에 대한 행정심판 청구",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "소송 대리",
      description: "출입국관리 관련 소송 대리",
      icon: <Building2 className="w-6 h-6" />,
    },
    {
      title: "긴급 대응",
      description: "강제퇴거, 입국거부 등 긴급 상황 대응",
      icon: <AlertTriangle className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "업무 파악",
      description: "출입국관리사무소에서 처리할 업무를 파악합니다.",
    },
    {
      step: 2,
      title: "서류 준비",
      description: "필요한 서류 수집 및 준비",
    },
    {
      step: 3,
      title: "신청서 작성",
      description: "각종 신청서 작성 및 서류 정리",
    },
    {
      step: 4,
      title: "제출 및 추적",
      description: "출입국관리사무소에 제출 및 진행 상황 추적",
    },
    {
      step: 5,
      title: "결과 확인",
      description: "승인 여부 확인 및 후속 절차 안내",
    },
  ]

  const faqs = [
    {
      question: "출입국관리사무소 방문이 어렵습니다. 대행이 가능한가요?",
      answer:
        "일부 업무는 대행이 가능하지만, 일부는 본인 방문이 필요합니다. 상담을 통해 가능 여부를 확인하시기 바랍니다.",
    },
    {
      question: "출입국관리사무소 처분에 불만이 있습니다.",
      answer:
        "행정심판을 통해 처분을 취소할 수 있습니다. 전문 변호사와 상담하여 행정심판을 진행하시기 바랍니다.",
    },
    {
      question: "강제퇴거 통지를 받았습니다. 어떻게 해야 하나요?",
      answer:
        "즉시 변호사와 상담하여 대응 방안을 수립해야 합니다. 웨이버 신청이나 소송을 통해 강제퇴거를 막을 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">출입국관리사무소 관련업무</h1>
            <p className="body-text text-lg">
              출입국관리사무소 관련 각종 업무를 대행합니다. 비자 신청, 체류허가, 외국인등록 등 전 과정을 지원합니다.
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
