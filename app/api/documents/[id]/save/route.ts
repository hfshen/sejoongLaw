import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  DOCUMENT_OPERATOR_ROLES,
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const autosaveSchema = z.object({
  data: z.record(z.string(), z.unknown()),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    if (!DOCUMENT_UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, id, "view"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const parsed = autosaveSchema.safeParse(await request.json())
    if (!parsed.success || JSON.stringify(parsed.data?.data || {}).length > 1_000_000) {
      return NextResponse.json({ error: "자동 저장 데이터를 확인해 주세요." }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { data: document, error } = await supabase
      .from("documents")
      .update({ data: parsed.data.data })
      .eq("id", id)
      .select()
      .single()

    if (error || !document) {
      logger.error("Document autosave failed", {
        error,
        actorUserId: actor.id,
        documentId: id,
      })
      return NextResponse.json({ error: "문서 자동 저장에 실패했습니다." }, { status: 500 })
    }

    const response = NextResponse.json({ document })
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
    return response
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    logger.error("Document autosave failed", { error })
    return NextResponse.json({ error: "문서 자동 저장에 실패했습니다." }, { status: 500 })
  }
}
