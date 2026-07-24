import { NextRequest, NextResponse } from "next/server"
import { isAuthorizedStayCareCron } from "@/lib/staycare/cron-auth"
import { runStayCareMaintenance } from "@/lib/staycare/maintenance"

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
    const result = await runStayCareMaintenance(100)
    return NextResponse.json(
      {
        ok: result.failed === 0,
        considered: result.considered,
        deleted: result.deleted,
        failed: result.failed,
        skipped: result.skipped,
        timestamp: new Date().toISOString(),
      },
      {
        status: result.failed === 0 ? 200 : 207,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    console.error(
      "StayCare maintenance worker failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Maintenance worker failed" },
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
