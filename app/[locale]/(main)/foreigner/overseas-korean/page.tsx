import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Globe, Users, FileText, Scale, Heart, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "재외동포법률지원 | 법무법인 세중",
    description:
      "재외동포를 위한 법률 지원 서비스를 제공합니다. 비자, 체류, 투자 등 재외동포 관련 모든 법률 문제를 해결합니다.",
  }
}

export default async function OverseasKoreanPage() {
  const services = [
    {
      title: "재외동포 비자",
      description: "F-4 재외동포 비자 신청 및 연장",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "체류허가",
      description: "재외동포 체류허가 연장 및 변경",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "투자 지원",
      description: "재외동포 투자 관련 법률 자문",
      icon: <Globe className="w-6 h-6" />,
    },
    {
      title: "가족 초청",
      description: "가족 초청을 통한 체류 지원",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      title: "법률 상담",
      description: "재외동포 관련 종합 법률 상담",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "분쟁 해결",
      description: "재외동포 관련 법률 분쟁 해결",
      icon: <Scale className="w-6 h-6" />,
    },
  ]

  const process = [
    {
      step: 1,
      title: "상담 및 자격 확인",
      description: "재외동포 자격 요건을 확인하고 상담합니다.",
    },
    {
      step: 2,
      title: "서류 준비",
      description: "재외동포 증명, 가족관계 증명 등 서류 준비",
    },
    {
      step: 3,
      title: "신청서 작성",
      description: "비자 또는 체류허가 신청서 작성",
    },
    {
      step: 4,
      title: "신청 및 추적",
      description: "출입국관리사무소에 신청 및 진행 상황 추적",
    },
    {
      step: 5,
      title: "결과 확인",
      description: "승인 여부 확인 및 후속 절차 안내",
    },
  ]

  const faqs = [
    {
      question: "재외동포 비자(F-4) 신청 자격은 무엇인가요?",
      answer:
        "한국 국적을 보유했던 자 또는 그 직계비속으로, 일정 요건을 충족하는 경우 F-4 비자를 신청할 수 있습니다.",
    },
    {
      question: "재외동포 비자로 취업이 가능한가요?",
      answer:
        "네, F-4 비자는 취업 활동이 자유롭습니다. 별도의 취업비자 신청 없이도 취업이 가능합니다.",
    },
    {
      question: "재외동포 투자 시 혜택이 있나요?",
      answer:
        "재외동포 투자 시 일부 세제 혜택과 간소화된 절차가 적용될 수 있습니다. 전문 변호사와 상담하시기 바랍니다.",
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">재외동포법률지원</h1>
            <p className="body-text text-lg">
              재외동포를 위한 법률 지원 서비스를 제공합니다. 비자, 체류, 투자 등 재외동포 관련 모든 법률 문제를 해결합니다.
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
          <p className="text-xl mb-8 opacity-90">재외동포 전문 변호사가 직접 상담해드립니다.</p>
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
