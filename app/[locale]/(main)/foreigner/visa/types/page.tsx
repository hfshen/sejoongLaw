import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { Users, Briefcase, GraduationCap, Heart, Plane, FileText, CheckCircle } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "사증종류별 대상자 | 법무법인 세중",
    description:
      "각 사증 종류별 신청 자격 및 대상자 정보를 제공합니다.",
  }
}

export default async function TypesPage() {
  const visaTypes = [
    {
      code: "A-1",
      title: "외교",
      description: "외교 공관원 및 그 가족",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "A-2",
      title: "공무",
      description: "공무 수행자 및 그 가족",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "A-3",
      title: "협정",
      description: "협정에 의한 사증",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "B-1",
      title: "비즈니스",
      description: "비즈니스 목적의 단기 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "B-2",
      title: "관광/의료",
      description: "관광, 의료 목적의 단기 체류",
      icon: <Plane className="w-6 h-6" />,
    },
    {
      code: "C-1",
      title: "일시입국",
      description: "일시 입국 목적의 단기 체류",
      icon: <Plane className="w-6 h-6" />,
    },
    {
      code: "C-3",
      title: "단기상용",
      description: "단기 상용 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "C-4",
      title: "단기취업",
      description: "단기 취업 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-1",
      title: "문화예술",
      description: "문화예술 활동 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "D-2",
      title: "유학",
      description: "학업 목적의 장기 체류",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "D-3",
      title: "산업연수",
      description: "산업연수 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-4",
      title: "일반연수",
      description: "일반연수 목적의 체류",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "D-5",
      title: "취재",
      description: "취재 목적의 체류",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "D-6",
      title: "종교",
      description: "종교 활동 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "D-7",
      title: "주재",
      description: "주재 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-8",
      title: "기업투자",
      description: "기업투자 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-9",
      title: "무역경영",
      description: "무역경영 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "D-10",
      title: "구직",
      description: "구직 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-1",
      title: "교수",
      description: "교수 활동 목적의 체류",
      icon: <GraduationCap className="w-6 h-6" />,
    },
    {
      code: "E-2",
      title: "회화지도",
      description: "회화지도 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "E-3",
      title: "연구",
      description: "연구 목적의 체류",
      icon: <FileText className="w-6 h-6" />,
    },
    {
      code: "E-4",
      title: "기술지도",
      description: "기술지도 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-5",
      title: "전문직",
      description: "전문직 종사 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-6",
      title: "예술흥행",
      description: "예술흥행 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "E-7",
      title: "특정활동",
      description: "특정활동 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-9",
      title: "비전문취업",
      description: "비전문취업 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "E-10",
      title: "선원취업",
      description: "선원취업 목적의 체류",
      icon: <Briefcase className="w-6 h-6" />,
    },
    {
      code: "F-1",
      title: "방문동거",
      description: "방문동거 목적의 체류",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "F-2",
      title: "거주",
      description: "거주 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "F-3",
      title: "동반",
      description: "동반 목적의 체류",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "F-4",
      title: "재외동포",
      description: "재외동포 목적의 체류",
      icon: <Users className="w-6 h-6" />,
    },
    {
      code: "F-5",
      title: "영주",
      description: "영주 목적의 체류",
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      code: "F-6",
      title: "결혼이민",
      description: "결혼이민 목적의 체류",
      icon: <Heart className="w-6 h-6" />,
    },
    {
      code: "G-1",
      title: "기타",
      description: "기타 목적의 체류",
      icon: <FileText className="w-6 h-6" />,
    },
  ]

  return (
    <>
      <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
        <div className="container-max">
          <div className="max-w-3xl mx-auto text-center">
            <Badge variant="primary" className="mb-4">외국인센터</Badge>
            <h1 className="section-title mb-6">사증종류별 대상자</h1>
            <p className="body-text text-lg">
              각 사증 종류별 신청 자격 및 대상자 정보를 제공합니다.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-max">
          <h2 className="section-title text-center mb-12">사증 종류</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visaTypes.map((visa, index) => (
              <Card key={index} hover>
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-primary">{visa.icon}</div>
                    <Badge variant="primary" className="text-xs">
                      {visa.code}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{visa.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="body-text text-sm">{visa.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gradient-to-br from-primary to-accent text-white">
        <div className="container-max text-center">
          <h2 className="text-4xl font-bold mb-6">지금 바로 상담받으세요</h2>
          <p className="text-xl mb-8 opacity-90">《출입국관리법》 저자 이상국 대표변호사가 직접 상담해드립니다.</p>
          <Link href="/consultation">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-gray-100">
              무료 상담 신청
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
