"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ToastContainer from "@/components/ui/Toast"
import { LogOut } from "lucide-react"
import Button from "@/components/ui/Button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)

  useEffect(() => {
    // /admin/login, /admin/reset-password 경로는 인증 체크 제외
    if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
      setIsAuthenticated(true)
      return
    }

    // API를 통해 인증 상태 확인 (httpOnly 쿠키는 클라이언트에서 읽을 수 없음)
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth")
        const data = await response.json()
        setIsAuthenticated(data.authenticated)

        if (!data.authenticated) {
          router.push("/admin/login")
        }
      } catch (error) {
        setIsAuthenticated(false)
        router.push("/admin/login")
      }
    }

    checkAuth()
  }, [pathname, router])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      // 에러는 무시 (로그아웃은 항상 성공으로 처리)
    }
  }

  // /admin/login, /admin/reset-password 경로는 layout 없이 렌더링
  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>
  }

  // 인증 확인 중이거나 인증되지 않은 경우
  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      <nav className="bg-secondary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-bold">관리자 페이지</h1>
            <div className="flex items-center gap-4">
              <Link href="/admin/documents" className="hover:text-primary">
                서류 관리
              </Link>
              <Link href="/admin/cases" className="hover:text-primary">
                케이스 관리
              </Link>
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
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                로그아웃
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}

