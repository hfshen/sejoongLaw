import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import { UUID_PATTERN } from "@/lib/admin/case-validation"
import { getAuditTrail } from "@/lib/audit/events"
import logger from "@/lib/logger"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const CASE_ROLES = ["admin", "korea_agent"] as const

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await getAuthenticatedBackofficeProfile(CASE_ROLES)
    if (!actor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id: caseId } = await params
    if (!UUID_PATTERN.test(caseId)) {
      return NextResponse.json({ error: "올바른 케이스 ID가 필요합니다." }, { status: 400 })
    }

    const events = await getAuditTrail(caseId)
    logger.info("Case audit trail fetched", {
      actorUserId: actor.id,
      caseId,
      eventCount: events.length,
    })
    return createSuccessResponse({ events })
  } catch (error) {
    logger.error("Error fetching case audit trail", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "감사 이력을 불러오는데 실패했습니다.",
      500
    )
  }
}
