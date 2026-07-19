import { NextRequest, NextResponse } from "next/server"
import { processDueStayCareNotifications } from "@/lib/staycare/notifications"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request: NextRequest) {
  const secret = process.env.STAYCARE_CRON_SECRET || process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get("authorization") === `Bearer ${secret}`
}

async function run(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await processDueStayCareNotifications(50)
    return NextResponse.json({
      ok: true,
      ...result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error(
      "StayCare notification worker failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Notification worker failed" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  return run(request)
}

export async function POST(request: NextRequest) {
  return run(request)
}
