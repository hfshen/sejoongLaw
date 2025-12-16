import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Plane, FileText, Users, Heart, Briefcase, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "이민비자 | 법무법인 세중",
    description:
      "영주권, 시민권, 가족초청 등 이민비자 신청 서비스를 제공합니다.",
  }
}

export default async function ImmigrantPage() {
  const services = [
    {
      title: "영주권 (F-5)",
      description: "한국 영주권 신청 및 갱신",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "시민권",
      description: "한국 시민권 취득 신청",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "가족초청 (F-3)",
      description: "가족 초청을 통한 이민비자 신청",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "투자이민 (F-5)",
      description: "투자를 통한 영주권 취득",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      title: "결혼이민 (F-6)",
      description: "결혼을 통한 이민비자 신청",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "이민 상담",
      description: "이민 전략 수립 및 종합 상담",
      icon: <FileText className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "이민 계획 수립",
      description: "이민 목적, 자격 요건 등을 검토하여 계획을 수립합니다.",
    },
    {
      step: 2,
      title: "자격 요건 확인",
      description: "이민비자 신청 자격 요건 확인 및 준비",
    },
    {
      step: 3,
      title: "서류 준비",
      description: "이민비자 신청에 필요한 서류 수집 및 준비",
    },
    {
      step: 4,
      title: "신청 및 추적",
      description: "이민비자 신청 및 진행 상황 추적",
    },
    {
      step: 5,
      title: "비자 발급 및 정착",
      description: "비자 발급 후 한국 정착 지원",
    },
  ]

  const faqs = [
    {
      question: "영주권 신청 자격은 무엇인가요?",
      answer:
        "5년 이상 합법적으로 체류하고, 일정 소득 요건을 충족하는 경우 영주권을 신청할 수 있습니다. 자세한 요건은 상담을 통해 확인하시기 바랍니다.",
    },
    {
      question: "시민권 취득은 어떻게 하나요?",
      answer:
        "영주권을 취득한 후 일정 기간 체류하고, 한국어 능력 및 사회통합프로그램 이수 등의 요건을 충족하면 시민권을 신청할 수 있습니다.",
    },
    {
      question: "이민비자 신청 기간은 얼마나 걸리나요?",
      answer:
        "이민비자 유형에 따라 다르지만, 일반적으로 6개월에서 1년 정도 소요됩니다. 복잡한 사건의 경우 더 오래 걸릴 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">해외이주</Badge>
            <h1 className="section-title mb-6">이민비자</h1>
            <p className="body-text text-lg">
              영주권, 시민권, 가족초청 등 이민비자 신청 서비스를 제공합니다.
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
