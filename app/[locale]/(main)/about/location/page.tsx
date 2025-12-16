import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Phone, Train, Bus, Car } from "lucide-react"
import KakaoMap from "@/components/maps/KakaoMap"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "오시는 길 | 법무법인 세중",
    description: "법무법인 세중 본사 위치 및 교통편 안내입니다.",
  }
}

export default async function LocationPage() {
  const t = await getTranslations()

  const locations = [
    {
      name: "본사",
      address: "서울시 서초구 서초대로 272, 10층",
      addressDetail: "(서초동, 한국아이비에스빌딩)",
      phone: "02) 591-0372",
      lat: 37.4836,
      lng: 127.0329,
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
              법인소개
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              오시는 길
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              법무법인 세중 본사로 오시는 길을 안내해드립니다.
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
                        <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
                          {location.name}
                        </h2>

                        <div className="space-y-6">
                          <div className="flex items-start gap-4">
                            <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">주소</h3>
                              <p className="text-text-secondary text-lg">
                                {location.address}
                              </p>
                              <p className="text-text-secondary text-lg">
                                {location.addressDetail}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">
                                대표전화
                              </h3>
                              <a
                                href={`tel:${location.phone.replace(/[^0-9]/g, "")}`}
                                className="text-primary font-semibold text-lg hover:underline"
                              >
                                {location.phone}
                              </a>
                            </div>
                          </div>

                          <div className="flex items-start gap-4">
                            <Train className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                            <div>
                              <h3 className="font-semibold text-secondary mb-2">
                                지하철 이용시
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
                                버스 이용시
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
                                자가용 이용시
                              </h3>
                              <p className="text-text-secondary">
                                건물 지하 주차장 이용 가능 (유료)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Map */}
                      <div>
                        <h3 className="font-semibold text-secondary mb-4">지도</h3>
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
