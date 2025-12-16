import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { CheckCircle, Plane, FileText, Users, Award, TrendingUp, Scale } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "비자 성공사례 | 법무법인 세중",
    description:
      "법무법인 세중의 비자 성공사례를 소개합니다. 《출입국관리법》 저자 이상국 대표변호사의 전문성을 확인하세요.",
  }
}

export default async function SuccessPage() {
  const cases = [
    {
      title: "비자 거절 후 재신청 성공",
      description: "E-2 비자 거절 후 서류 보완 및 재신청을 통해 승인받은 사례",
      category: "비자 재신청",
      result: "승인",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      title: "입국 금지 해제 성공",
      description: "웨이버 신청을 통해 입국 금지 해제에 성공한 사례",
      category: "웨이버",
      result: "승인",
      icon: <Plane className="w-6 h-6" />,
    },
    {
      title: "영주권 신청 성공",
      description: "F-5 영주권 신청을 성공적으로 완료한 사례",
      category: "영주권",
      result: "승인",
      icon: <Award className="w-6 h-6" />,
    },
    {
      title: "행정심판 승소",
      description: "비자 거절 처분에 대한 행정심판에서 승소한 사례",
      category: "행정심판",
      result: "승소",
      icon: <Scale className="w-6 h-6" />,
    },
    {
      title: "가족초청 비자 성공",
      description: "F-3 가족초청 비자 신청을 성공적으로 완료한 사례",
      category: "가족초청",
      result: "승인",
      icon: <Users className="w-6 h-6" />,
    },
    {
      title: "투자이민 성공",
      description: "투자를 통한 영주권 취득에 성공한 사례",
      category: "투자이민",
      result: "승인",
      icon: <TrendingUp className="w-6 h-6" />,
    },
  ]

  const stats = [
    { label: "비자 승인율", value: "95%", suffix: "+" },
    { label: "성공 사례", value: "1000", suffix: "+" },
    { label: "만족 고객", value: "5000", suffix: "+" },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">해외이주</Badge>
            <h1 className="section-title mb-6">비자 성공사례</h1>
            <p className="body-text text-lg">
              법무법인 세중의 비자 성공사례를 소개합니다. 《출입국관리법》 저자 이상국 대표변호사의 전문성을 확인하세요.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="section-padding bg-background-alt">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {stat.value}{stat.suffix}
                  </div>
                  <p className="text-text-secondary">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Cases */}
      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">주요 성공사례</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((caseItem, index) => (
              <Card key={index} hover>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary">{caseItem.icon}</div>
                    <Badge variant="primary" className="text-xs">
                      {caseItem.category}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{caseItem.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-text text-sm mb-4">{caseItem.description}</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-600">
                      {caseItem.result}
                    </span>
                  </div>
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
