import { getTranslations } from "next-intl/server"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Image from "next/image"

export async function generateMetadata() {
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
  image?: string
}

const members: Member[] = [
  {
    id: "1",
    name: "홍길동",
    position: "대표 변호사",
    specialties: ["부동산 분쟁", "이혼 소송", "상속 분쟁"],
    experience: "15년",
    education: ["서울대학교 법학과", "서울대학교 법학전문대학원"],
  },
  {
    id: "2",
    name: "김철수",
    position: "변호사",
    specialties: ["비자 신청", "해외이주", "외국인 투자"],
    experience: "10년",
    education: ["연세대학교 법학과", "연세대학교 법학전문대학원"],
  },
  {
    id: "3",
    name: "이영희",
    position: "변호사",
    specialties: ["기업 자문", "M&A", "기업 인수합병"],
    experience: "12년",
    education: ["고려대학교 법학과", "고려대학교 법학전문대학원"],
  },
]

export default async function MembersPage() {
  const t = await getTranslations()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <section className="section-padding-sm bg-gradient-to-br from-primary/10 to-accent/5">
          <div className="container-max">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="section-title mb-6">구성원 소개</h1>
              <p className="body-text text-lg">
                법무법인 세중의 전문 변호사들은 다양한 법률 분야에서 풍부한
                경험과 전문성을 바탕으로 고객의 권리를 보호합니다.
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding">
          <div className="container-max">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {members.map((member) => (
                <Card key={member.id} hover className="text-center">
                  <CardHeader>
                    <div className="w-32 h-32 rounded-full bg-gray-200 mx-auto mb-4 flex items-center justify-center">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={128}
                          height={128}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-4xl text-gray-400">
                          {member.name[0]}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl">{member.name}</CardTitle>
                    <p className="text-text-secondary font-medium">
                      {member.position}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 justify-center mb-4">
                      {member.specialties.map((specialty, index) => (
                        <Badge key={index} variant="primary">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    <div className="space-y-2 text-sm text-text-secondary">
                      <p>
                        <strong>경력:</strong> {member.experience}
                      </p>
                      <div>
                        <strong>학력:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {member.education.map((edu, index) => (
                            <li key={index}>{edu}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
