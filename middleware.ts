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

function authFailureReason(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error")
  const code = request.nextUrl.searchParams.get("error_code")
  const description = (
    request.nextUrl.searchParams.get("error_description") || ""
  ).toLowerCase()

  if (!error && !code) return null
  if (
    code === "otp_expired" ||
    description.includes("expired") ||
    description.includes("invalid")
  ) {
    return "otp_expired"
  }
  return error === "access_denied" ? "auth_callback_failed" : null
}

function safeOrigin(value?: string) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function stayCareContentSecurityPolicy() {
  const connectSources = [
    "'self'",
    "https://challenges.cloudflare.com",
    "https://vitals.vercel-insights.com",
    "https://*.sentry.io",
  ]
  const supabaseOrigin = safeOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL)
  if (supabaseOrigin) {
    connectSources.push(supabaseOrigin)
    connectSources.push(supabaseOrigin.replace(/^https:/, "wss:"))
  }

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "frame-src https://challenges.cloudflare.com",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    process.env.NODE_ENV === "production" ? "upgrade-insecure-requests" : "",
  ]
    .filter(Boolean)
    .join("; ")
}

function applyStayCareSecurityHeaders(
  response: NextResponse,
  { privateData = false }: { privateData?: boolean } = {}
) {
  if (privateData) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
  }
  response.headers.set(
    "Content-Security-Policy",
    stayCareContentSecurityPolicy()
  )
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin")
  response.headers.set("Cross-Origin-Resource-Policy", "same-site")
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  )
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    )
  }
  return response
}

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api/staycare")) {
    return applyStayCareSecurityHeaders(NextResponse.next(), {
      privateData: true,
    })
  }

  const authFailure = authFailureReason(request)
  if (authFailure && !pathname.includes("/staycare/login")) {
    const locale = localeFromPath(pathname)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/staycare/login`
    loginUrl.search = ""
    loginUrl.searchParams.set("error", "auth_callback_failed")
    loginUrl.searchParams.set("reason", authFailure)
    loginUrl.searchParams.set("next", `/${locale}/staycare/app`)
    // An explicit replacement fragment prevents the browser from inheriting
    // Supabase's original #error=... fragment across the redirect.
    loginUrl.hash = "auth-recovery"
    return applyStayCareSecurityHeaders(NextResponse.redirect(loginUrl), {
      privateData: true,
    })
  }

  let response = pathname.startsWith("/admin")
    ? NextResponse.next({ request })
    : intlMiddleware(request)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const protectedStayCare =
    pathname.includes("/staycare/app") ||
    pathname.includes("/staycare/admin") ||
    pathname.includes("/staycare/portal")
  const loginPath = pathname.includes("/staycare/login")
  const stayCarePath = pathname.includes("/staycare")

  if (!supabaseUrl || !supabaseKey) {
    return stayCarePath ? applyStayCareSecurityHeaders(response) : response
  }

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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (protectedStayCare && !user) {
    const locale = localeFromPath(pathname)
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = `/${locale}/staycare/login`
    loginUrl.searchParams.set("next", pathname)
    return applyStayCareSecurityHeaders(NextResponse.redirect(loginUrl), {
      privateData: true,
    })
  }

  // The server component performs the authoritative role and tenant check.
  // Middleware is retained here to rotate Supabase auth cookies, which server
  // components cannot reliably write after a token refresh.
  if (protectedStayCare || loginPath) {
    return applyStayCareSecurityHeaders(response, { privateData: true })
  }

  return stayCarePath ? applyStayCareSecurityHeaders(response) : response
}

export const config = {
  matcher: [
    "/api/staycare/:path*",
    "/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)",
  ],
}
