import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import ConsultationForm from "@/components/consultation/ConsultationForm"
import { Card, CardContent } from "@/components/ui/Card"
import { Phone, Mail, Clock, CheckCircle } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: "무료 상담 신청 | 법무법인 세중",
    description: "전문 변호사가 직접 상담해드립니다. 무료 상담으로 시작하세요.",
  }
}

export default async function ConsultationPage() {
  const t = await getTranslations()

  const benefits = [
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "전문 변호사 직접 상담",
      description: "경험이 풍부한 전문 변호사가 직접 상담해드립니다.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "빠른 응답",
      description: "상담 신청 후 24시간 이내에 연락드립니다.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "무료 상담",
      description: "초기 상담은 무료로 제공됩니다.",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "다양한 연락 방법",
      description: "전화, 이메일, 방문 상담 모두 가능합니다.",
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">무료 상담 신청</h1>
              <p className="body-text max-w-2xl mx-auto">
                법무법인 세중의 전문 변호사가 직접 상담해드립니다.
                <br />
                아래 양식을 작성해주시면 빠른 시일 내에 연락드리겠습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2">
                <ConsultationForm />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">상담 혜택</h3>
                    <div className="space-y-4">
                      {benefits.map((benefit, index) => (
                        <div key={index} className="flex gap-3">
                          <div className="text-primary flex-shrink-0 mt-1">
                            {benefit.icon}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm mb-1">
                              {benefit.title}
                            </h4>
                            <p className="text-xs text-text-secondary">
                              {benefit.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">연락처</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-primary" />
                        <a
                          href="tel:025910372"
                          className="link-hover font-medium"
                        >
                          02) 591-0372
                        </a>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-primary" />
                        <a
                          href="mailto:consult@sejoonglaw.com"
                          className="link-hover font-medium"
                        >
                          consult@sejoonglaw.com
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

