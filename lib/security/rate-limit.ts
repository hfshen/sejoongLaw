import "server-only"

interface RateLimitInput {
  key: string
  limit: number
  windowSeconds: number
}

interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  source: "upstash" | "memory"
}

const memoryStore = new Map<string, { count: number; resetAt: number }>()

const lua = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("EXPIRE", KEYS[1], ARGV[2])
end
local ttl = redis.call("TTL", KEYS[1])
return {current, ttl}
`

function memoryRateLimit({ key, limit, windowSeconds }: RateLimitInput): RateLimitResult {
  const now = Date.now()
  const existing = memoryStore.get(key)

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + windowSeconds * 1000
    memoryStore.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: Math.max(0, limit - 1), resetAt, source: "memory" }
  }

  existing.count += 1
  return {
    allowed: existing.count <= limit,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
    source: "memory",
  }
}

export async function rateLimit(input: RateLimitInput): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!url || !token) return memoryRateLimit(input)

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
        String(input.limit),
        String(input.windowSeconds),
      ]),
      cache: "no-store",
    })

    if (!response.ok) throw new Error(`Upstash rate limit failed: ${response.status}`)

    const payload = (await response.json()) as { result?: [number, number]; error?: string }
    if (payload.error || !Array.isArray(payload.result)) {
      throw new Error(payload.error || "Invalid Upstash response")
    }

    const [count, ttl] = payload.result
    return {
      allowed: count <= input.limit,
      remaining: Math.max(0, input.limit - count),
      resetAt: Date.now() + Math.max(0, ttl) * 1000,
      source: "upstash",
    }
  } catch {
    // Availability is preferred over a total outage. Production health reports the fallback.
    return memoryRateLimit(input)
  }
}
