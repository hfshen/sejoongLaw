import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { MapPin, Train, Bus, Car, Building2 } from "lucide-react"
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
      name: "서울 주사무소",
      nameEn: "SEOUL HEADQUARTERS",
      address: "서울특별시 서초구 법원로2길 15, 길도빌딩 303호",
      addressDetail: "",
      focus: "기업법무, 고난도 행정소송, 대법원 상고심",
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
      name: "의정부 분사무소",
      nameEn: "UIJEONGBU BRANCH",
      address: "경기도 의정부시 녹양로 34번길 30, 406호",
      addressDetail: "(법원 앞)",
      focus: "부동산, 민사, 가사, 경기북부 일반송무",
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
      name: "안산 분사무소",
      nameEn: "ANSAN BRANCH",
      address: "경기도 안산시 단원구 원곡로 45 세중빌딩 2층",
      addressDetail: "",
      focus: "외국인 사건, 출입국 사범, 산재/노동",
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
              법인소개
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              오시는 길
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              법무법인 세중 각 분사무소로 오시는 길을 안내해드립니다.
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
                              <h3 className="font-semibold text-secondary mb-2">주소</h3>
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
                                  주요 업무
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
