import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Plane, FileText, Briefcase, GraduationCap, Heart, Users } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "비이민비자 | 법무법인 세중",
    description:
      "관광, 비즈니스, 유학, 의료 등 비이민비자 신청 및 연장 서비스를 제공합니다.",
  }
}

export default async function NonImmigrantPage() {
  const services = [
    {
      title: "관광비자 (B-2)",
      description: "관광 목적의 단기 체류 비자 신청",
      icon: <Plane className="w-6 h-6" />,
    },
    {
      title: "비즈니스비자 (B-1)",
      description: "비즈니스 목적의 단기 체류 비자 신청",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      title: "유학비자 (F-1)",
      description: "학업 목적의 장기 체류 비자 신청",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      title: "의료비자 (B-2)",
      description: "의료 목적의 단기 체류 비자 신청",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "방문동거비자 (F-1)",
      description: "가족 방문 목적의 장기 체류 비자 신청",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "비자 연장",
      description: "체류 기간 연장 신청 및 변경",
      icon: <FileText className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "비자 유형 결정",
      description: "체류 목적에 맞는 비자 유형을 결정합니다.",
    },
    {
      step: 2,
      title: "서류 준비",
      description: "비자 신청에 필요한 서류 수집 및 준비",
    },
    {
      step: 3,
      title: "신청서 작성",
      description: "비자 신청서 작성 및 서류 정리",
    },
    {
      step: 4,
      title: "신청 및 추적",
      description: "대사관 또는 출입국관리사무소에 신청 및 진행 상황 추적",
    },
    {
      step: 5,
      title: "비자 발급",
      description: "비자 발급 후 입국 및 체류 안내",
    },
  ]

  const faqs = [
    {
      question: "비이민비자는 어떤 종류가 있나요?",
      answer:
        "관광(B-2), 비즈니스(B-1), 유학(F-1), 의료(B-2), 방문동거(F-1) 등 다양한 비자 유형이 있습니다. 체류 목적에 맞는 비자를 선택하시면 됩니다.",
    },
    {
      question: "비자 신청 기간은 얼마나 걸리나요?",
      answer:
        "비자 유형과 신청 경로에 따라 다르지만, 일반적으로 2주에서 1개월 정도 소요됩니다.",
    },
    {
      question: "비자 연장은 언제 신청해야 하나요?",
      answer:
        "체류 기간 만료 전 최소 2개월 전에 신청하는 것이 좋습니다. 만료 후 신청 시 불이익을 받을 수 있습니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">해외이주</Badge>
            <h1 className="section-title mb-6">비이민비자</h1>
            <p className="body-text text-lg">
              관광, 비즈니스, 유학, 의료 등 비이민비자 신청 및 연장 서비스를 제공합니다.
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
