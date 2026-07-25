"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import {
  Briefcase,
  ClipboardList,
  Files,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Users,
  X,
} from "lucide-react"
import Button from "@/components/ui/Button"
import ToastContainer from "@/components/ui/Toast"

type BackofficeRole =
  | "admin"
  | "korea_agent"
  | "translator"
  | "foreign_lawyer"
  | "family_viewer"

type AuthResponse = {
  authenticated?: boolean
  user?: {
    id: string
    email: string | null
    name: string | null
    role: BackofficeRole
  } | null
}

type NavItem = {
  href: string
  label: string
  icon: typeof LayoutDashboard
  roles: readonly BackofficeRole[]
}

const ALL_BACKOFFICE_ROLES: readonly BackofficeRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
  "family_viewer",
]

const DOCUMENT_ROLES: readonly BackofficeRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
  "family_viewer",
]

const primaryNav: readonly NavItem[] = [
  {
    href: "/admin",
    label: "대시보드",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    href: "/admin/cases",
    label: "케이스",
    icon: Briefcase,
    roles: ["admin", "korea_agent"],
  },
  {
    href: "/admin/documents",
    label: "문서함(전체)",
    icon: Files,
    roles: DOCUMENT_ROLES,
  },
]

const siteNav: readonly NavItem[] = [
  {
    href: "/admin/consultations",
    label: "상담",
    icon: MessageSquare,
    roles: ["admin", "korea_agent"],
  },
  {
    href: "/admin/board",
    label: "게시판",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    href: "/admin/content",
    label: "콘텐츠",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    href: "/admin/members",
    label: "구성원",
    icon: Users,
    roles: ["admin"],
  },
  {
    href: "/admin/users",
    label: "사용자 관리",
    icon: Users,
    roles: ["admin"],
  },
]

function roleHome(role: BackofficeRole) {
  if (role === "admin") return "/admin"
  if (role === "korea_agent") return "/admin/cases"
  return "/admin/documents"
}

function canAccessPath(role: BackofficeRole, pathname: string) {
  if (role === "admin") return true

  if (role === "korea_agent") {
    return ["/admin/cases", "/admin/documents", "/admin/consultations"].some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    )
  }

  return pathname === "/admin/documents" || pathname.startsWith("/admin/documents/")
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [userRole, setUserRole] = useState<BackofficeRole | null>(null)
  const [userName, setUserName] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isPublicAuthPage =
    pathname === "/admin/login" || pathname === "/admin/reset-password"

  useEffect(() => {
    if (isPublicAuthPage) {
      setIsAuthenticated(true)
      return
    }

    let active = true

    const checkAuth = async () => {
      try {
        const response = await fetch("/api/admin/check-auth", {
          credentials: "same-origin",
          cache: "no-store",
        })
        const data = (await response.json()) as AuthResponse
        if (!active) return

        const role = data.user?.role || null
        const authenticated = Boolean(data.authenticated && role)
        setIsAuthenticated(authenticated)
        setUserRole(role)
        setUserName(data.user?.name || data.user?.email || null)

        if (!authenticated || !role) {
          router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
          return
        }

        if (!canAccessPath(role, pathname)) {
          router.replace(roleHome(role))
        }
      } catch {
        if (!active) return
        setIsAuthenticated(false)
        setUserRole(null)
        router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
      }
    }

    void checkAuth()
    return () => {
      active = false
    }
  }, [isPublicAuthPage, pathname, router])

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } finally {
      router.replace("/auth/login")
      router.refresh()
    }
  }

  const visiblePrimaryNav = useMemo(
    () =>
      userRole
        ? primaryNav.filter((item) => item.roles.includes(userRole))
        : [],
    [userRole]
  )
  const visibleSiteNav = useMemo(
    () =>
      userRole ? siteNav.filter((item) => item.roles.includes(userRole)) : [],
    [userRole]
  )

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin" || pathname === "/admin/dashboard"
    }
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
    if (pathname.startsWith("/admin/users")) return "사용자 관리"
    return "업무 시스템"
  })()

  if (isPublicAuthPage) {
    return <>{children}</>
  }

  if (isAuthenticated === null || !isAuthenticated || !userRole) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-background">
      <ToastContainer />

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 transform flex-col border-r border-gray-200 bg-white transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
          <Link
            href={roleHome(userRole)}
            className="font-bold text-secondary"
            onClick={() => setMobileOpen(false)}
          >
            세중 업무 시스템
          </Link>
          <button
            type="button"
            className="rounded p-2 hover:bg-gray-100 md:hidden"
            aria-label="메뉴 닫기"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {visiblePrimaryNav.length ? (
            <div className="space-y-1">
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                업무
              </div>
              {visiblePrimaryNav.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-secondary hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ) : null}

          {visibleSiteNav.length ? (
            <div className="space-y-1">
              <div className="px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                사이트 운영
              </div>
              {visibleSiteNav.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-secondary hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ) : null}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <div className="mb-3 px-2 text-xs text-gray-500">
            <p className="truncate font-semibold text-gray-700">{userName || "사용자"}</p>
            <p>{userRole}</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full justify-center"
          >
            <LogOut className="mr-2 h-4 w-4" />
            로그아웃
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 h-16 border-b border-gray-200 bg-white">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="rounded p-2 hover:bg-gray-100 md:hidden"
                aria-label="메뉴 열기"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-secondary">
                  {pageTitle}
                </h1>
                <p className="truncate text-xs text-text-secondary">{pathname}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
