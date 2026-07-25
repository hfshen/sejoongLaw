import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import { UUID_PATTERN } from "@/lib/admin/case-validation"
import logger from "@/lib/logger"
import { getServiceClient } from "@/lib/supabase/service"

const CASE_ROLES = ["admin", "korea_agent"] as const

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("Content-Disposition", "inline")
  return response
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthenticatedBackofficeProfile(CASE_ROLES)
    if (!actor) return jsonNoStore({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    if (!UUID_PATTERN.test(id)) {
      return jsonNoStore({ error: "올바른 케이스 ID가 필요합니다." }, { status: 400 })
    }

    const supabase = getServiceClient()
    const [{ data: caseRecord, error: caseError }, { data: documents, error: docsError }] =
      await Promise.all([
        supabase.from("cases").select("*").eq("id", id).single(),
        supabase
          .from("documents")
          .select("*")
          .eq("case_id", id)
          .eq("is_case_linked", true)
          .order("created_at", { ascending: false }),
      ])

    if (caseError || !caseRecord) {
      return jsonNoStore({ error: "케이스를 찾을 수 없습니다." }, { status: 404 })
    }
    if (docsError) {
      logger.error("Failed to fetch documents for case export", {
        error: docsError,
        actorUserId: actor.id,
        caseId: id,
      })
      return jsonNoStore({ error: "서류를 불러오는데 실패했습니다." }, { status: 500 })
    }
    if (!documents?.length) {
      return jsonNoStore({ error: "내보낼 서류가 없습니다." }, { status: 404 })
    }

    logger.info("Case export payload fetched", {
      actorUserId: actor.id,
      caseId: id,
      documentCount: documents.length,
    })
    return jsonNoStore({
      case: caseRecord,
      documents,
      message: "Generate the ZIP in the authenticated client.",
    })
  } catch (error) {
    logger.error("Case export payload failed", { error })
    return jsonNoStore({ error: "케이스 내보내기에 실패했습니다." }, { status: 500 })
  }
}
