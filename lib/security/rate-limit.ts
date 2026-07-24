import "server-only"
import { NextResponse } from "next/server"

interface RateLimitInput {
  key: string
  limit: number
  windowSeconds: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  source: "upstash" | "memory" | "unavailable"
  reason?: "limit_exceeded" | "backend_unavailable"
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()
const MAX_MEMORY_KEYS = 10_000

const lua = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("TTL", KEYS[1])
return {current, ttl}
`

function cleanupMemoryStore(now: number) {
  if (memoryStore.size < MAX_MEMORY_KEYS) return
  for (const [key, value] of memoryStore) {
    if (now >= value.resetAt) memoryStore.delete(key)
  }
  if (memoryStore.size >= MAX_MEMORY_KEYS) {
    const oldestKeys = Array.from(memoryStore.keys()).slice(0, Math.ceil(MAX_MEMORY_KEYS / 10))
    for (const key of oldestKeys) memoryStore.delete(key)
  }
}

function memoryRateLimit({ key, limit, windowSeconds }: RateLimitInput): RateLimitResult {
  const now = Date.now()
  cleanupMemoryStore(now)
  const existing = memoryStore.get(key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowSeconds * 1000
    memoryStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt, source: "memory" }
  }

  existing.count += 1
  const allowed = existing.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    source: "memory",
    reason: allowed ? undefined : "limit_exceeded",
  }
}

function unavailableRateLimit(windowSeconds: number): RateLimitResult {
  return {
    allowed: false,
    remaining: 0,
    resetAt: Date.now() + Math.min(windowSeconds, 60) * 1000,
    source: "unavailable",
    reason: "backend_unavailable",
  }
}

function failClosedInProduction() {
  return (
    process.env.NODE_ENV === "production" &&
    process.env.STAYCARE_RATE_LIMIT_FAIL_CLOSED !== "false"
  )
}

export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) {
    return failClosedInProduction()
      ? unavailableRateLimit(input.windowSeconds)
      : memoryRateLimit(input)
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        "EVAL",
        lua,
        "1",
        `staycare:ratelimit:${input.key}`,
        String(input.windowSeconds),
      ]),
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    })

    if (!response.ok) throw new Error(`Upstash rate limit failed: ${response.status}`)

    const payload = (await response.json()) as { result?: [number, number]; error?: string }
    if (payload.error || !Array.isArray(payload.result)) {
      throw new Error(payload.error || "Invalid Upstash response")
    }

    const [count, ttl] = payload.result
    const allowed = count <= input.limit
    return {
      allowed,
      remaining: Math.max(0, input.limit - count),
      resetAt: Date.now() + Math.max(0, ttl) * 1000,
      source: "upstash",
      reason: allowed ? undefined : "limit_exceeded",
    }
  } catch {
    return failClosedInProduction()
      ? unavailableRateLimit(input.windowSeconds)
      : memoryRateLimit(input)
  }
}

export function rateLimitFailureResponse(
  result: RateLimitResult,
  exceededMessage = "Too many requests"
) {
  const retryAfter = Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))
  if (result.reason === "backend_unavailable") {
    return NextResponse.json(
      { error: "Request protection is temporarily unavailable. Please try again shortly." },
      {
        status: 503,
        headers: {
          "Retry-After": String(retryAfter),
          "Cache-Control": "no-store",
        },
      }
    )
  }

  return NextResponse.json(
    { error: exceededMessage },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
        "X-RateLimit-Remaining": String(result.remaining),
        "Cache-Control": "no-store",
      },
    }
  )
}
