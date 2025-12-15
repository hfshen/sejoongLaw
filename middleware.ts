import createMiddleware from "next-intl/middleware"
import { routing } from "./lib/routing"
import { NextRequest, NextResponse } from "next/server"

const intlMiddleware = createMiddleware({
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  localePrefix: routing.localePrefix,
  localeDetection: true,
})

// Rate limiting store
const rateLimitStore: Record<
  string,
  { count: number; resetTime: number }
> = {}

function rateLimit(req: NextRequest): NextResponse | null {
  const ip =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "unknown"
  const key = `rate_limit_${ip}`
  const now = Date.now()
  const maxRequests = 100
  const windowMs = 60000

  if (!rateLimitStore[key] || now > rateLimitStore[key].resetTime) {
    rateLimitStore[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return null
  }

  if (rateLimitStore[key].count >= maxRequests) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  rateLimitStore[key].count++
  return null
}

export default function middleware(req: NextRequest) {
  // Rate limiting for API routes
  if (req.nextUrl.pathname.startsWith("/api")) {
    const rateLimitResult = rateLimit(req)
    if (rateLimitResult) {
      return rateLimitResult
    }
  }

  return intlMiddleware(req)
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}
