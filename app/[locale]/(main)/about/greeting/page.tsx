import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Award, Users, Globe, Heart } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "인사말 | 법무법인 세중",
    description:
      "법무법인 세중의 인사말과 비전을 소개합니다. 고객의 권익 보호와 법률 서비스의 질 향상을 위해 최선을 다하겠습니다.",
  }
}

export default async function GreetingPage() {
  const t = await getTranslations()

  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: "전문성",
      description: "각 분야별 전문 변호사들이 최고의 법률 서비스를 제공합니다.",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "신뢰성",
      description: "고객과의 신뢰를 바탕으로 투명하고 정직한 법률 서비스를 제공합니다.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "글로벌",
      description: "국경을 넘나드는 법률 문제까지 원스톱으로 해결합니다.",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "고객 중심",
      description: "고객의 권익 보호를 최우선으로 생각하며 최선을 다합니다.",
    },
  ]

  return (
    <>
      {/* Hero Section */}
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>
        <div className="container-max relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              법인소개
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              인사말
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              법무법인 세중을 방문해주셔서 진심으로 감사드립니다.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <Card className="mb-12">
              <CardContent className="p-8 md:p-12">
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    법무법인 세중은 고객의 권익 보호와 법률 서비스의 질 향상을 위해
                    최선을 다하고 있습니다.
                  </p>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    우리는 다양한 법률 분야에서 전문적인 서비스를 제공하며, 특히
                    출입국관리법과 이민 행정, 부동산 분쟁, 이혼·상속, 기업 자문 등에서
                    깊이 있는 전문성을 보유하고 있습니다.
                  </p>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-6">
                    《출입국관리법》 저자이자 법학박사인 이상국 대표변호사를 중심으로,
                    각 분야의 전문가들이 모여 고객 여러분의 복잡한 법률 문제를
                    명쾌하게 해결해드립니다.
                  </p>
                  <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                    법무법인 세중은 고객 여러분의 신뢰를 바탕으로 최고의 법률 서비스를
                    제공하겠습니다. 감사합니다.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Values */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8 text-center">
                법무법인 세중의 가치
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <Card key={index} hover className="text-center">
                    <CardContent className="p-6 md:p-8">
                      <div className="flex justify-center mb-4 text-primary">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold text-secondary mb-3">
                        {value.title}
                      </h3>
                      <p className="text-text-secondary leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            지금 바로 상담받으세요
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            전문 변호사가 직접 상담해드립니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                무료 상담 신청
              </Button>
            </Link>
            <Link href="tel:025910372">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                전화 상담: 02) 591-0372
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
