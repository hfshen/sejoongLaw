import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import { getAuditTrail } from "@/lib/audit/events"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: caseId } = await params
    const events = await getAuditTrail(caseId)

    return createSuccessResponse({ events })
  } catch (error) {
    logger.error("Error fetching audit trail", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to fetch audit trail",
      500
    )
  }
}
