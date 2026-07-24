import { NextRequest, NextResponse } from "next/server"
import { isAuthorizedStayCareCron } from "@/lib/staycare/cron-auth"
import { processDueStayCareNotifications } from "@/lib/staycare/notifications"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function run(request: NextRequest) {
  if (!isAuthorizedStayCareCron(request)) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  try {
    const result = await processDueStayCareNotifications(50)
    return NextResponse.json(
      {
        ok: result.failed === 0,
        claimed: result.claimed,
        sent: result.sent,
        failed: result.failed,
        timestamp: new Date().toISOString(),
      },
      {
        status: result.failed === 0 ? 200 : 207,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    console.error(
      "StayCare notification worker failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Notification worker failed" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    )
  }
}

export async function GET(request: NextRequest) {
  return run(request)
}

export async function POST(request: NextRequest) {
  return run(request)
}
