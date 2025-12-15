import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"

async function checkAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return !!data
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await checkAdmin()

  if (!isAdmin) {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">관리자 페이지</h1>
            <div className="flex gap-4">
              <Link href="/admin" className="hover:text-primary">
                대시보드
              </Link>
              <Link href="/admin/board" className="hover:text-primary">
                게시판 관리
              </Link>
              <Link href="/admin/content" className="hover:text-primary">
                콘텐츠 관리
              </Link>
              <Link href="/admin/members" className="hover:text-primary">
                구성원 관리
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

