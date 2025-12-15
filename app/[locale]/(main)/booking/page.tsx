import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import BookingCalendar from "@/components/booking/BookingCalendar"
import { Card, CardContent } from "@/components/ui/Card"
import { CheckCircle, Clock, Calendar, Video } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: "온라인 예약 | 법무법인 세중",
    description:
      "원하시는 날짜와 시간에 전문 변호사와 상담을 예약하세요. 방문 상담 또는 온라인 화상 상담을 선택할 수 있습니다.",
  }
}

export default async function BookingPage() {
  const t = await getTranslations()

  const benefits = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "24시간 예약 가능",
      description: "언제든지 원하시는 시간에 예약하실 수 있습니다.",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "실시간 일정 확인",
      description: "상담사 일정을 실시간으로 확인하고 예약하세요.",
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "온라인 상담 가능",
      description: "방문이 어려우시면 화상 통화로 상담받으실 수 있습니다.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "자동 알림",
      description: "예약 확인 및 리마인더를 이메일/SMS로 받으실 수 있습니다.",
    },
  ]

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">온라인 예약</h1>
              <p className="body-text max-w-2xl mx-auto">
                원하시는 날짜와 시간에 전문 변호사와 상담을 예약하세요.
                <br />
                방문 상담 또는 온라인 화상 상담을 선택할 수 있습니다.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <BookingCalendar />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">예약 혜택</h3>
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
                    <h3 className="font-bold text-lg mb-4">예약 안내</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• 예약은 최소 24시간 전에 해주세요.</li>
                      <li>• 예약 변경/취소는 예약일 하루 전까지 가능합니다.</li>
                      <li>• 온라인 상담의 경우 링크가 이메일로 발송됩니다.</li>
                      <li>• 방문 상담은 사무실 주소로 안내됩니다.</li>
                    </ul>
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

