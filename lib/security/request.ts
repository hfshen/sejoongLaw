import "server-only"
import { NextRequest } from "next/server"

function toOrigin(value: string | undefined | null) {
  if (!value) return null
  try {
    return new URL(value).origin
  } catch {
    return null
  }
}

function allowedOrigins(request: NextRequest) {
  const allowed = new Set<string>()
  const configured = toOrigin(process.env.NEXT_PUBLIC_SITE_URL)
  if (configured) allowed.add(configured)

  for (const value of (process.env.STAYCARE_ALLOWED_ORIGINS || "").split(",")) {
    const origin = toOrigin(value.trim())
    if (origin) allowed.add(origin)
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) allowed.add(`https://${vercelUrl}`)
  const vercelBranchUrl = process.env.VERCEL_BRANCH_URL
  if (vercelBranchUrl) allowed.add(`https://${vercelBranchUrl}`)

  // Local development must still work without weakening production CSRF checks.
  if (process.env.NODE_ENV !== "production") {
    allowed.add(request.nextUrl.origin)
    allowed.add("http://localhost:3000")
    allowed.add("http://127.0.0.1:3000")
  }

  return allowed
}

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function isTrustedOrigin(request: NextRequest) {
  if (request.method === "GET" || request.method === "HEAD" || request.method === "OPTIONS") {
    return true
  }

  const origin = toOrigin(request.headers.get("origin"))
  if (!origin) return false

  const fetchSite = request.headers.get("sec-fetch-site")
  if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
    return false
  }

  return allowedOrigins(request).has(origin)
}

export function requireTrustedOrigin(request: NextRequest) {
  if (!isTrustedOrigin(request)) {
    const error = new Error("Untrusted request origin")
    error.name = "UntrustedOriginError"
    throw error
  }
}

export function requireIdempotencyKey(request: NextRequest) {
  const key = request.headers.get("x-idempotency-key")?.trim()
  if (
    !key ||
    key.length < 16 ||
    key.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(key)
  ) {
    const error = new Error("A valid x-idempotency-key header is required")
    error.name = "IdempotencyKeyError"
    throw error
  }
  return key
}
