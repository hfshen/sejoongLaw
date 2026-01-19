import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Train, Bus, Car, Building2 } from "lucide-react"
import KakaoMap from "@/components/maps/KakaoMap"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations()
  return {
    title: `${t("pages.location.title")} | ${t("common.title")}`,
    description: t("pages.location.description"),
  }
}

export default async function LocationPage() {
  const t = await getTranslations()

  const locations = [
    {
      name: t("pages.location.locations.seoul.name"),
      nameEn: t("pages.location.locations.seoul.nameEn"),
      address: t("pages.location.locations.seoul.address"),
      addressDetail: "",
      focus: t("pages.location.locations.seoul.focus"),
      lat: 37.5015,
      lng: 127.0037,
      subway: [
        "지하철 2호선 서초역 3번 출구 도보 5분",
        "지하철 2호선 강남역 7번 출구 도보 10분",
      ],
      bus: [
        "간선: 146, 341, 362, 463, 641, 643",
        "지선: 3412, 6411",
        "광역: 9404, 9408",
      ],
    },
    {
      name: t("pages.location.locations.uijeongbu.name"),
      nameEn: t("pages.location.locations.uijeongbu.nameEn"),
      address: t("pages.location.locations.uijeongbu.address"),
      addressDetail: t("pages.location.locations.uijeongbu.addressDetail"),
      focus: t("pages.location.locations.uijeongbu.focus"),
      lat: 37.7381,
      lng: 127.0476,
      subway: [
        "지하철 1호선 의정부역 도보 10분",
      ],
      bus: [
        "의정부 시내버스 이용 가능",
      ],
    },
    {
      name: t("pages.location.locations.ansan.name"),
      nameEn: t("pages.location.locations.ansan.nameEn"),
      address: t("pages.location.locations.ansan.address"),
      addressDetail: "",
      focus: t("pages.location.locations.ansan.focus"),
      lat: 37.3219,
      lng: 126.8308,
      subway: [
        "수인분당선 안산역 1번 출구에서 686m",
        "지하철 1호선 안산역 1번 출구에서 도보 10분",
      ],
      bus: [
        "안산 시내버스 이용 가능",
      ],
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
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-6 text-sm md:text-base">
              {t("pages.location.badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("pages.location.title")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("pages.location.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Location Details */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-6xl mx-auto">
            {locations.map((location, index) => (
              <div key={index} className="mb-12">
                <Card>
                  <CardContent className="p-8 md:p-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Left: Address Info */}
                      <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                          {location.name}
                        </h2>
                        {location.nameEn && (
                          <p className="text-sm text-text-secondary mb-6">{location.nameEn}</p>
                        )}

                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">{t("pages.location.address")}</h3>
                              <p className="text-text-secondary text-lg">
                                {location.address}
                              </p>
                              {location.addressDetail && (
                                <p className="text-text-secondary text-lg">
                                  {location.addressDetail}
                                </p>
                              )}
                            </div>
                          </div>

                          {location.focus && (
                            <div className="flex items-start gap-4">
                              <Building2 className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                              <div>
                                <h3 className="font-semibold text-secondary mb-2">
                                  {t("pages.location.mainBusiness")}
                                </h3>
                                <p className="text-text-secondary text-lg">
                                  {location.focus}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-4">
                            <Train className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">
                                {t("pages.location.subway")}
                              </h3>
                              <ul className="space-y-1">
                                {location.subway.map((line, idx) => (
                                  <li key={idx} className="text-text-secondary">
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Bus className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">
                                {t("pages.location.bus")}
                              </h3>
                              <ul className="space-y-1">
                                {location.bus.map((bus, idx) => (
                                  <li key={idx} className="text-text-secondary">
                                    {bus}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Car className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">
                                {t("pages.location.car")}
                              </h3>
                              <p className="text-text-secondary">
                                {t("pages.location.parking")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Map */}
                      <div>
                        <h3 className="font-semibold text-secondary mb-4">{t("pages.location.map")}</h3>
                        <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                          <KakaoMap
                            lat={location.lat}
                            lng={location.lng}
                            name={location.name}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
