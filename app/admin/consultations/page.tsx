import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { redirect } from "next/navigation"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils"

async function getConsultations() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching consultations:", error)
    return []
  }

  return data || []
}

export default async function ConsultationsPage() {
  const isAdmin = await isAdminAuthenticated()
  
  if (!isAdmin) {
    redirect("/admin/login")
  }
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin/login")
  }

  const consultations = await getConsultations()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="mb-8">
            <h1 className="section-title">상담 관리</h1>
            <p className="body-text">상담 신청 내역을 확인하고 관리합니다.</p>
          </div>

          <div className="space-y-4">
            {consultations.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-text-secondary">상담 신청 내역이 없습니다.</p>
                </CardContent>
              </Card>
            ) : (
              consultations.map((consultation) => (
                <Card key={consultation.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="card-title mb-2">{consultation.subject}</h3>
                        <div className="flex gap-2 mb-2">
                          <Badge
                            variant={
                              consultation.status === "pending"
                                ? "warning"
                                : consultation.status === "completed"
                                  ? "success"
                                  : "default"
                            }
                          >
                            {consultation.status === "pending"
                              ? "대기 중"
                              : consultation.status === "completed"
                                ? "완료"
                                : "진행 중"}
                          </Badge>
                          <Badge variant="primary">{consultation.service}</Badge>
                        </div>
                      </div>
                      <span className="text-sm text-text-secondary">
                        {formatDate(consultation.created_at)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-text-secondary mb-1">이름</p>
                        <p className="font-medium">{consultation.name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary mb-1">이메일</p>
                        <p className="font-medium">{consultation.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-text-secondary mb-1">연락처</p>
                        <p className="font-medium">{consultation.phone}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary mb-1">상담 내용</p>
                      <p className="body-text">{consultation.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

