"use client"

import { Badge } from "@/components/ui/Badge"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent } from "@/components/ui/Card"
import { Award, Users, Globe, Heart } from "lucide-react"
import MembersGrid, { Member } from "@/components/about/MembersGrid"
import { MapPin, Phone, Train, Bus, Car } from "lucide-react"
import KakaoMap from "@/components/maps/KakaoMap"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { useTranslations } from "next-intl"

// Members data
const members: Member[] = [
  {
    id: "1",
    name: "이상국",
    position: "대표변호사",
    specialties: ["민사", "형사", "가사소송", "출입국관리법", "이민 행정"],
    phone: "031-8044-8805",
    email: "lskesq@withvisa.com",
    description:
      "법무법인 세중의 대표 변호사로서 민사, 형사, 가사소송 업무를 총괄하고 있습니다. 중앙대학교 법학전문대학원 겸임교수이며 중앙대학교 산학협력 선도대학(LINC)육성사업단 자문변호사로도 활발히 활동하고 있습니다. 최고의 실력과 경쟁력을 갖춘 법무법인 세중이 고객 여러분의 목소리에 귀 기울이겠습니다.",
    education: [
      "1980.02 달성고등학교 졸업",
      "1985.02 중앙대학교 법학과 졸업",
      "1985.07 법원행정고시 합격(제8회)",
      "1986.02 사법연수원 17기 수료(사법고시 27회~1988.2)",
      "2004.12 외국법연수과정 수료(외국법연수원)",
      "2006.11 저작권아카데미 수료(저작권심의조정위원회)",
      "2007.08 한양대학교 최고경영자과정 수료",
    ],
    history: [
      "1988.03 군법무관",
      "1991.03 변호사 개업",
      "1999.03 미국버클리대학연수 및 이민법전문로펌근무(~2001.3)",
      "2001.03 미국이민법전문법률사무소설립(SFIP한국담당)",
      "2008.08 법무법인 세중 설립(대표변호사)",
      "2009.04 분사무소겸 외국인법률상담센타설립(안산)",
    ],
    career: [
      "1995 버스공제조합고문변호사",
      "1996 기술신용보증기금 고문변호사",
      "2001 재단법인 한국산업의학연구소 감사",
      "2003 다시함께센터 법률지원단(서울시), 북한이탈주민지원변호사",
      "2004 가락고등학교 학교폭력대책위원",
      "2005 경기북부가정위탁센타 자문위원",
      "2007 해외이주법인 설립(주식회사 로웰), 신용보증기금 고문변호사, 6.3 동지회 법률지원단 자문변호사",
      "2008 대한주택공사 자문변호사",
      "2010 중학법학회 이사, 안산상록경찰서 법률지원상담관",
      "2011 재단법인 한국어능력평가원 감사",
      "2012 한중교류협회 고문",
      "2013 대한변호사협회 조사위원회 위원",
      "2014 중앙대학교 산학협력단 자문변호사, 방송통신위원회 심사위원, 중앙대학교병원 발전후원회 감사",
      "2015 중앙대학교 법학전문대학원 겸임교수",
    ],
    achievements: ["《출입국관리법》 저자"],
  },
  {
    id: "2",
    name: "최종인",
    position: "변호사",
    specialties: ["일반 민·형사", "손해배상(산업재해, 교통사고 등)", "건설·부동산", "가사", "행정", "기업일반"],
    phone: "031-8044-8805",
    email: "jichoi@withvisa.com",
    education: [
      "배명고등학교 졸업",
      "고려대학교 화공생명공학과 졸업",
      "한국외국어대학교 법학전문대학원 졸업",
    ],
    career: [
      "대림산업 기술지원팀 근무",
      "법무법인 백상 실무수습",
      "감사원 실무수습",
      "수유중학교 변호사명예교사",
      "현 법무법인 세중 변호사",
    ],
    clients: [
      "중앙대학교 산합협력단",
      "주식회사 코리아스포터스",
      "한국바이오협회",
      "주식회사 케이에스국민신발",
      "주식회사 이노룰스",
      "전국대학도서관협회",
      "American Federal Contractors, Inc.",
    ],
    cases: [
      "주식회사 동진비지네스폼",
      "주식회사 코리아스포터스",
      "삼원개발 주식회사",
      "주식회사 삼연테크",
      "주식회사 우정티앤아이",
      "주식회사 케이에스국민신발",
      "주식회사 프라미스에셋",
      "나은섬유 주식회사",
      "주식회사 푸른강산",
      "Sarooj Construction Company",
      "Abu Reem Trading and Contracting",
      "United Arab Shipping and Marine Services",
      "스트룀스홀멘 에이비이 (Stromsholmen AB)",
    ],
  },
  {
    id: "3",
    name: "이정세",
    position: "변호사",
    specialties: ["소송업무"],
    phone: "02-596-8862",
  },
  {
    id: "4",
    name: "박영일",
    position: "변호사",
    specialties: ["형사(마약)", "민사"],
    phone: "02-596-8872",
  },
  {
    id: "5",
    name: "Jenny K. Hong",
    position: "외국 변호사",
    specialties: ["이민법"],
    isForeign: true,
    education: [
      "B.A., University of California, Davis (1993)",
      "J.D., University of San Francisco School of Law (1998)",
    ],
    achievements: [
      "California State Courts",
      "U.S. District Court, Northern District of California",
      "California Real Estate Broker's License",
      "American Bar Association",
      "Asian American Bar Association",
    ],
  },
  {
    id: "6",
    name: "George D. Hepner lll",
    position: "외국 변호사",
    specialties: ["이민법"],
    isForeign: true,
    education: [
      "Pennsylvania State University, B.A. French Language and Culture (1976)",
      "Penn State University, Dickinson, J.D. School of Law (1998)",
    ],
    achievements: [
      "1989 Maine and U.S. District Court",
      "1989 Pennsylvania and U.S. District Court",
      "American Immigration Lawyers Association",
      "2003-2004 listed in the Best Lawyers in America (Immigration)",
    ],
  },
  {
    id: "7",
    name: "Donna H. Fujioka",
    position: "외국 변호사",
    specialties: ["이민법"],
    isForeign: true,
    education: [
      "University of California, B.A. Sociology (1977)",
      "Masters in Public Administration (MPA) UC of Southern California (1981)",
      "University of California, Davis School of Law J.D. (1985)",
    ],
    achievements: [
      "1986 California and U.S. District Court, Northern District of California",
      "Ninth Circuit Court of Appeals",
    ],
    career: [
      "1987-1994 Edward R. Litwin a Professional Corporation, San Francisco, CA Immigration Law-Focusing on labor certifications and business immigration",
      "1994-2008 Law office of Danna Fujioka, Oakland - Immigration and nationality law",
    ],
  },
  {
    id: "8",
    name: "Larry D. Pascal",
    position: "외국 변호사",
    specialties: ["이민법"],
    isForeign: true,
    education: [
      "San Francisco State University, B.A. History (1972)",
      "San Francisco State University M.A. History (1975)",
      "Golden Gate University, J.D. School of Law (1983)",
    ],
    achievements: ["1984 California and U.S. District Court, Northern District of California"],
    career: [
      "1981 ~1985 Jackson & Hertogs Law Firm, Immigration Law",
      "1986 ~2009 Law office of Larry D. Pascal, San Jose, Immigration and Nationality Law",
      "2008 ~ Present Sedona Law Group, Immigration and nationality Law",
    ],
  },
  {
    id: "9",
    name: "Claire Degerin",
    position: "외국 변호사",
    specialties: ["이민법"],
    isForeign: true,
    education: [
      "Universite de la Mediterranee, Master in Corporate/Business Law (1993)",
      "Universitetet i Oslo, Postgraduate Degree in International Law (1994)",
      "George Washington Law School(J.D) (2003)",
    ],
    achievements: [
      "2003 New York Bar",
      "2003 American Immigration Lawyers Association",
    ],
  },
  {
    id: "10",
    name: "Joon Lee",
    position: "사무장 / 케이스 매니저",
    specialties: ["케이스 관리", "이민법"],
    isManager: true,
    career: [
      "1990 ~1995 Los Angeles CA 유학생후원회 회장",
      "1994 ~1998 The Ezell Group - Mr. Ezell (Former Western Regional INS Commissioner) and Mr. Bill King Jr",
      "1995 ~1997 Law Office of Young Lee - Case Manager",
      "1997 ~2007 Stand & Seaborn Immigration Law Firm - Case Manager",
      "2007 ~ Present Sedona Law Group Immigration Law Firm - Case Manager",
    ],
    achievements: ["1990 ~1995 Los Angeles CA 유학생후원회 회장"],
  },
  {
    id: "11",
    name: "왕 빈",
    position: "외국 변호사",
    specialties: ["중국 법률"],
    isForeign: true,
    education: [
      "2000 중국 길림대학교 졸업",
      "2002 중국 사법시험 합격",
    ],
    career: [
      "2003 길림 쉬양 변호사 사무소",
      "2012 ~ 길림 둔의 변호사 사무소",
    ],
    achievements: [
      "한국 영주권 취득",
      "2014년 한국어 능력시험(TOPIK) 중급(4급) 통과",
    ],
  },
]

const location = {
  name: "본사",
  address: "서울시 서초구 서초대로 272, 10층",
  addressDetail: "(서초동, 한국아이비에스빌딩)",
  phone: "031-8044-8805",
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
}

export default function AboutPage() {
  const t = useTranslations()
  
  const values = [
    {
      icon: <Award className="w-8 h-8" />,
      title: t("about.tabs.greeting.firmValues.items.expertise.title"),
      description: t("about.tabs.greeting.firmValues.items.expertise.description"),
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t("about.tabs.greeting.firmValues.items.trust.title"),
      description: t("about.tabs.greeting.firmValues.items.trust.description"),
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: t("about.tabs.greeting.firmValues.items.global.title"),
      description: t("about.tabs.greeting.firmValues.items.global.description"),
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: t("about.tabs.greeting.firmValues.items.customer.title"),
      description: t("about.tabs.greeting.firmValues.items.customer.description"),
    },
  ]
  
  const tabs = [
    {
      id: "greeting",
      label: t("about.tabs.greeting.label"),
      content: (
        <div className="space-y-8">
          {/* Vision Section */}
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
                  <span className="text-primary">世中</span> - {t("about.tabs.greeting.vision.title")}
                </h2>
                <p className="text-lg text-text-secondary italic">
                  {t("about.tabs.greeting.vision.subtitle")}
                </p>
              </div>
              <div className="prose prose-lg max-w-none">
                <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
                  {t("about.description")}
                </p>
                <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
                  {t("about.tabs.greeting.vision.description2")}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Values Section */}
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8 text-center">
                {t("about.tabs.greeting.values.title")}
              </h2>
              <div className="space-y-8">
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-secondary mb-4">
                    {t("about.tabs.greeting.values.commitment.title")}
                  </h3>
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
                    {t("about.tabs.greeting.values.commitment.description")}
                  </p>
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-xl font-semibold text-secondary mb-4">
                    {t("about.tabs.greeting.values.trust.title")}
                  </h3>
                  <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
                    {t("about.tabs.greeting.values.trust.description")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-8 text-center">
              {t("about.tabs.greeting.firmValues.title")}
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
      ),
    },
    {
      id: "members",
      label: t("about.tabs.members.label"),
      content: (
        <div>
          <div className="mb-8">
            <p className="text-base md:text-lg text-text-secondary leading-relaxed mb-6">
              {t("about.tabs.members.description")}
            </p>
          </div>
          <MembersGrid members={members} />
        </div>
      ),
    },
    {
      id: "location",
      label: t("about.tabs.location.label"),
      content: (
        <div>
          <Card>
            <CardContent className="p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-secondary mb-6">
                    {location.name}
                  </h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-secondary mb-2">{t("about.tabs.location.address")}</h3>
                        <p className="text-text-secondary text-base">{location.address}</p>
                        <p className="text-text-secondary text-base">{location.addressDetail}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-secondary mb-2">{t("about.tabs.location.phone")}</h3>
                        <a
                          href={`tel:${location.phone.replace(/[^0-9]/g, "")}`}
                          className="text-primary font-semibold text-base hover:underline"
                        >
                          {location.phone}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Train className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-secondary mb-2">{t("about.tabs.location.subway")}</h3>
                        <ul className="space-y-1">
                          {location.subway.map((line, idx) => (
                            <li key={idx} className="text-text-secondary text-sm">
                              {line}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Bus className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-secondary mb-2">{t("about.tabs.location.bus")}</h3>
                        <ul className="space-y-1">
                          {location.bus.map((bus, idx) => (
                            <li key={idx} className="text-text-secondary text-sm">
                              {bus}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Car className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-secondary mb-2">{t("about.tabs.location.car")}</h3>
                        <p className="text-text-secondary text-sm">
                          {t("about.tabs.location.parking")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-4">{t("about.tabs.location.map")}</h3>
                  <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg">
                    <KakaoMap lat={location.lat} lng={location.lng} name={location.name} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ),
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
              {t("about.hero.badge")}
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
              {t("about.hero.title")}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              {t("about.hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="section-padding">
        <div className="container-max">
          <div className="max-w-6xl mx-auto">
            <Tabs tabs={tabs} defaultTab="greeting" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t("about.cta.title")}
          </h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            {t("about.cta.description")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/consultation">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-primary hover:bg-gray-100"
              >
                {t("about.cta.button")}
              </Button>
            </Link>
            <Link href="tel:03180448805">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                {t("about.cta.phone")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
