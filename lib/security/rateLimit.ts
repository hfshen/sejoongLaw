import { NextRequest, NextResponse } from "next/server"

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export function rateLimit(
  maxRequests: number = 100,
  windowMs: number = 60000
) {
  return (req: NextRequest) => {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const key = `rate_limit_${ip}`
    const now = Date.now()

    if (!store[key] || now > store[key].resetTime) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      }
      return null
    }

    if (store[key].count >= maxRequests) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      )
    }

    store[key].count++
    return null
  }
}

