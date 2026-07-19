import "server-only"
import { NextRequest } from "next/server"

export function getRequestIp(request: NextRequest) {
  return (
    request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  )
}

export function isTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin")
  if (!origin) return request.method === "GET" || request.method === "HEAD"

  const configured = process.env.NEXT_PUBLIC_SITE_URL
  const allowed = new Set<string>()

  if (configured) allowed.add(new URL(configured).origin)
  allowed.add(request.nextUrl.origin)

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) allowed.add(`https://${vercelUrl}`)

  return allowed.has(origin)
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
  if (!key || key.length < 16 || key.length > 128) {
    const error = new Error("A valid x-idempotency-key header is required")
    error.name = "IdempotencyKeyError"
    throw error
  }
  return key
}
