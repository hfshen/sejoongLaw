import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import { FileText, Users, CheckCircle, ArrowRight } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "사증(VISA) | 법무법인 세중",
    description:
      "사증발급인정서, 사증종류별 대상자 등 사증(VISA) 관련 서비스를 제공합니다.",
  }
}

export default async function ForeignerVisaPage() {
  const services = [
    {
      title: "사증발급인정서",
      description: "한국 입국 전 필요한 사증발급인정서 발급 신청",
      href: "/foreigner/visa/certificate",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      title: "사증종류별 대상자",
      description: "각 사증 종류별 신청 자격 및 대상자 안내",
      href: "/foreigner/visa/types",
      icon: <Users className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">사증(VISA)</h1>
            <p className="body-text text-lg">
              사증발급인정서, 사증종류별 대상자 등 사증(VISA) 관련 서비스를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <Link key={index} href={service.href}>
                <Card hover className="h-full">
                  <CardHeader>
                    <div className="text-primary mb-4">{service.icon}</div>
                    <CardTitle className="text-2xl mb-3">{service.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="body-text mb-4">{service.description}</p>
                    <div className="flex items-center text-primary font-semibold">
                      자세히 보기
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
