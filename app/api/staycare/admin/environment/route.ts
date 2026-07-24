import { NextResponse } from "next/server"
import { getStayCareEnvironmentReport } from "@/lib/env/staycare-status"
import { getStaffContext } from "@/lib/staycare/auth"
import { tenantIdsForCapability } from "@/lib/staycare/authorization"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const context = await getStaffContext()
  if (!context) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const authorizedTenants = tenantIdsForCapability(
    context.memberships,
    "canSeeEnvironment"
  )
  if (!authorizedTenants.length) {
    return NextResponse.json(
      { error: "Your role cannot view production environment status" },
      { status: 403 }
    )
  }

  return NextResponse.json(
    {
      environment: getStayCareEnvironmentReport(),
    },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  )
}
