import { getTranslations } from "next-intl/server"
import BookingCalendar from "@/components/booking/BookingCalendar"
import { Card, CardContent } from "@/components/ui/Card"
import { CheckCircle, Clock, Calendar, Video } from "lucide-react"

export async function generateMetadata() {
  const t = await getTranslations()
  return {
    title: `${t("booking.title")} | ${t("common.title")}`,
    description: t("booking.description"),
  }
}

export default async function BookingPage() {
  const t = await getTranslations()

  const benefits = [
    {
      icon: <Calendar className="w-6 h-6" />,
      title: t("booking.features.available24h.title"),
      description: t("booking.features.available24h.description"),
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: t("booking.features.realtime.title"),
      description: t("booking.features.realtime.description"),
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: t("booking.features.online.title"),
      description: t("booking.features.online.description"),
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: t("booking.features.reminder.title"),
      description: t("booking.features.reminder.description"),
    },
  ]

  return (
    <>
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="section-title">{t("booking.title")}</h1>
              <p className="body-text max-w-2xl mx-auto">
                {t("booking.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <BookingCalendar />
              </div>
              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-bold text-lg mb-4">{t("booking.features.title")}</h3>
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
                    <h3 className="font-bold text-lg mb-4">{t("booking.notice.title")}</h3>
                    <ul className="space-y-2 text-sm text-text-secondary">
                      <li>• {t("booking.notice.items.min24h")}</li>
                      <li>• {t("booking.notice.items.change")}</li>
                      <li>• {t("booking.notice.items.online")}</li>
                      <li>• {t("booking.notice.items.visit")}</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

