import "server-only"
import { timingSafeEqual } from "node:crypto"
import { NextRequest } from "next/server"

export function isAuthorizedStayCareCron(request: NextRequest) {
  const secret = process.env.STAYCARE_CRON_SECRET || process.env.CRON_SECRET
  const authorization = request.headers.get("authorization")
  if (!secret || !authorization?.startsWith("Bearer ")) return false

  const supplied = authorization.slice("Bearer ".length)
  const expectedBuffer = Buffer.from(secret)
  const suppliedBuffer = Buffer.from(supplied)
  return (
    expectedBuffer.length === suppliedBuffer.length &&
    timingSafeEqual(expectedBuffer, suppliedBuffer)
  )
}
