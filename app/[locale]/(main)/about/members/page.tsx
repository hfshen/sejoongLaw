import { getTranslations } from "next-intl/server"
import { Metadata } from "next"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Award, GraduationCap, Briefcase, BookOpen } from "lucide-react"

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "구성원 소개 | 법무법인 세중",
    description: "법무법인 세중의 전문 변호사들을 소개합니다.",
  }
}

interface Member {
  id: string
  name: string
  position: string
  specialties: string[]
  experience: string
  education: string[]
  achievements?: string[]
  image?: string
}

const members: Member[] = [
  {
    id: "1",
    name: "이상국",
    position: "대표변호사 / 법학박사",
    specialties: ["출입국관리법", "이민 행정", "부동산 분쟁", "행정 소송"],
    experience: "20년 이상",
    education: [
      "서울대학교 법학과",
      "서울대학교 법학전문대학원",
      "법학박사 (출입국관리법 전공)",
    ],
    achievements: [
      "《출입국관리법》 저자",
      "대한변호사협회 인정 전문변호사",
      "법무부 출입국관리정책 자문위원",
    ],
  },
  {
    id: "2",
    name: "홍길동",
    position: "변호사",
    specialties: ["부동산 분쟁", "이혼 소송", "상속 분쟁", "민사 소송"],
    experience: "15년",
    education: [
      "서울대학교 법학과",
      "서울대학교 법학전문대학원",
    ],
  },
  {
    id: "3",
    name: "김철수",
    position: "변호사",
    specialties: ["비자 신청", "해외이주", "외국인 투자", "국제거래"],
    experience: "12년",
    education: [
      "연세대학교 법학과",
      "연세대학교 법학전문대학원",
      "미국 변호사 자격",
    ],
  },
  {
    id: "4",
    name: "이영희",
    position: "변호사",
    specialties: ["기업 자문", "M&A", "기업 인수합병", "기업법무"],
    experience: "10년",
    education: [
      "고려대학교 법학과",
      "고려대학교 법학전문대학원",
    ],
  },
]

export default async function MembersPage() {
  const t = await getTranslations()

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
              구성원 소개
            </h1>
            <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
              법무법인 세중의 전문 변호사들은 다양한 법률 분야에서 풍부한 경험과
              전문성을 바탕으로 고객의 권리를 보호합니다.
            </p>
          </div>
        </div>
      </section>

      {/* Members Grid */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member) => (
              <Card key={member.id} hover className="text-center h-full">
                <CardHeader>
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mx-auto mb-6 flex items-center justify-center relative">
                    {member.image ? (
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-5xl font-bold text-primary">
                        {member.name[0]}
                      </span>
                    )}
                    {member.id === "1" && (
                      <div className="absolute -top-2 -right-2">
                        <Badge variant="primary" className="text-xs">
                          대표
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardTitle className="text-2xl mb-2">{member.name}</CardTitle>
                  <p className="text-text-secondary font-semibold mb-4">
                    {member.position}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {member.specialties.map((specialty, index) => (
                      <Badge key={index} variant="primary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                  <div className="space-y-4 text-sm text-text-secondary text-left">
                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-secondary">경력:</strong>{" "}
                        {member.experience}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-secondary">학력:</strong>
                        <ul className="list-disc list-inside mt-1 space-y-1">
                          {member.education.map((edu, index) => (
                            <li key={index}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {member.achievements && (
                      <div className="flex items-start gap-3">
                        <Award className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-secondary">주요 성과:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {member.achievements.map((achievement, index) => (
                              <li key={index}>{achievement}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
