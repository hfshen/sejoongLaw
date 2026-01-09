import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { StatCard } from "@/components/ui/StatCard"
import { Users, Briefcase, Mail, Clock } from "lucide-react"
import Link from "next/link"

async function getStats() {
  const supabase = await createClient()
  
  // Get consultation count
  const { count: consultationCount } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })

  // Get pending consultations
  const { count: pendingCount } = await supabase
    .from("consultations")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return {
    consultations: consultationCount || 0,
    pending: pendingCount || 0,
  }
}

export default async function AdminDashboard() {
  const isAdmin = await isAdminAuthenticated()
  
  if (!isAdmin) {
    redirect("/admin/login")
  }

  const stats = await getStats()

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="mb-8">
            <h1 className="section-title">관리자 대시보드</h1>
            <p className="body-text">시스템 현황을 한눈에 확인하세요.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              value={stats.consultations}
              label="전체 상담 건수"
              icon={<Mail className="w-full h-full" />}
            />
            <StatCard
              value={stats.pending}
              label="대기 중인 상담"
              icon={<Clock className="w-full h-full" />}
            />
            <StatCard
              value={0}
              label="완료된 상담"
              icon={<Briefcase className="w-full h-full" />}
            />
            <StatCard
              value={0}
              label="활성 사용자"
              icon={<Users className="w-full h-full" />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Link
                    href="/admin/consultations"
                    className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-semibold text-secondary mb-1">
                      상담 관리
                    </div>
                    <div className="text-sm text-text-secondary">
                      상담 신청 내역을 확인하고 관리합니다.
                    </div>
                  </Link>
                  <Link
                    href="/admin/content"
                    className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-semibold text-secondary mb-1">
                      콘텐츠 관리
                    </div>
                    <div className="text-sm text-text-secondary">
                      웹사이트 콘텐츠를 편집하고 관리합니다.
                    </div>
                  </Link>
                  <Link
                    href="/admin/cases"
                    className="block p-4 rounded-lg border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
                  >
                    <div className="font-semibold text-secondary mb-1">
                      성공 사례 관리
                    </div>
                    <div className="text-sm text-text-secondary">
                      성공 사례를 추가하고 관리합니다.
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-text-secondary">
                    최근 활동 내역이 없습니다.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

