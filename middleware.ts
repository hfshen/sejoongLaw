import createIntlMiddleware from "next-intl/middleware"
import { createServerClient } from "@supabase/ssr"
import { NextRequest, NextResponse } from "next/server"
import { routing } from "./lib/routing"

const intlMiddleware = createIntlMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
  localeDetection: true,
})

function localeFromPath(pathname: string) {
  const first = pathname.split("/").filter(Boolean)[0]
  return routing.locales.includes(first as (typeof routing.locales)[number])
    ? first
    : routing.defaultLocale
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  let response: NextResponse

  if (pathname.startsWith("/admin")) {
    response = NextResponse.next({ request })
  } else {
    response = intlMiddleware(request)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) return response

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const protectedStayCare =
    pathname.includes("/staycare/app") || pathname.includes("/staycare/admin")
  const loginPath = pathname.includes("/staycare/login")

  if (protectedStayCare && !user) {
    const locale = localeFromPath(pathname)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/staycare/login`
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (loginPath && user) {
    const locale = localeFromPath(pathname)
    const next = request.nextUrl.searchParams.get("next")
    const appUrl = request.nextUrl.clone()
    appUrl.pathname = next?.startsWith("/") ? next : `/${locale}/staycare/app`
    appUrl.search = ""
    return NextResponse.redirect(appUrl)
  }

  if (protectedStayCare || loginPath) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)"],
}
