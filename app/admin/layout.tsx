"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ToastContainer from "@/components/ui/Toast"
import {
  LayoutDashboard,
  Briefcase,
  Files,
  MessageSquare,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import Button from "@/components/ui/Button"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

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

  const primaryNav = [
    { href: "/admin", label: "대시보드", icon: LayoutDashboard },
    { href: "/admin/cases", label: "케이스", icon: Briefcase },
    { href: "/admin/documents", label: "문서함(전체)", icon: Files },
  ] as const

  const siteNav = [
    { href: "/admin/consultations", label: "상담", icon: MessageSquare },
    { href: "/admin/board", label: "게시판", icon: ClipboardList },
    { href: "/admin/content", label: "콘텐츠", icon: ClipboardList },
    { href: "/admin/members", label: "구성원", icon: Users },
  ] as const

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin" || pathname === "/admin/dashboard"
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const pageTitle = (() => {
    if (pathname === "/admin" || pathname === "/admin/dashboard") return "대시보드"
    if (pathname.startsWith("/admin/cases")) return "케이스"
    if (pathname.startsWith("/admin/documents")) return "문서함(전체)"
    if (pathname.startsWith("/admin/consultations")) return "상담"
    if (pathname.startsWith("/admin/board")) return "게시판"
    if (pathname.startsWith("/admin/content")) return "콘텐츠"
    if (pathname.startsWith("/admin/members")) return "구성원"
    return "관리자"
  })()

  // /admin/login, /admin/reset-password 경로는 layout 없이 렌더링
  if (pathname === "/admin/login" || pathname === "/admin/reset-password") {
    return <>{children}</>
  }

  // 인증 확인 중이거나 인증되지 않은 경우
  if (isAuthenticated === null || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background flex">
      <ToastContainer />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex md:flex-col ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200">
          <Link href="/admin" className="font-bold text-secondary" onClick={() => setMobileOpen(false)}>
            관리자
          </Link>
          <button
            type="button"
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              업무
            </div>
            {primaryNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-secondary hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="space-y-1">
            <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              사이트 운영
            </div>
            {siteNav.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-secondary hover:bg-gray-100"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="p-3 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-center"
          >
            <LogOut className="w-4 h-4 mr-2" />
            로그아웃
          </Button>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="md:hidden p-2 rounded hover:bg-gray-100"
                aria-label="메뉴 열기"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-secondary truncate">
                  {pageTitle}
                </h1>
                <p className="text-xs text-text-secondary truncate">{pathname}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

