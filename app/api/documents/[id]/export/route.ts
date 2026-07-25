import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  DOCUMENT_OPERATOR_ROLES,
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import { generatePDFPackage } from "@/lib/documents/package-generator"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { isVersionReadyForExport } from "@/lib/workflow/approval"

const exportSchema = z.object({
  versionId: z.string().uuid(),
  targetLangs: z
    .array(z.enum(["en", "si", "ta"]))
    .min(1)
    .max(3)
    .optional()
    .default(["en"]),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, documentId, "export"))) return forbidden()

    const parsed = exportSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "내보내기 요청을 확인해 주세요." },
        { status: 400 }
      )
    }
    const targetLangs = [...new Set(parsed.data.targetLangs)]

    const supabase = getServiceClient()
    const { data: version, error: versionError } = await supabase
      .from("document_versions")
      .select("id, document_id")
      .eq("id", parsed.data.versionId)
      .eq("document_id", documentId)
      .single()
    if (versionError || !version) {
      return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
    }

    const ready = await isVersionReadyForExport(parsed.data.versionId, targetLangs)
    if (!ready) {
      return NextResponse.json(
        { error: "필수 번역과 승인이 완료되지 않아 내보낼 수 없습니다." },
        { status: 409 }
      )
    }

    const packageResult = await generatePDFPackage(
      parsed.data.versionId,
      targetLangs,
      actor.id
    )

    await supabase
      .from("document_versions")
      .update({ status: "exported" })
      .eq("id", parsed.data.versionId)

    const { data: document } = await supabase
      .from("documents")
      .select("case_id")
      .eq("id", documentId)
      .single()
    await supabase.from("audit_events").insert({
      case_id: document?.case_id || null,
      entity_type: "export",
      entity_id: parsed.data.versionId,
      action: "created",
      actor: actor.id,
      meta: {
        document_id: documentId,
        package_hash: packageResult.hash,
        target_langs: targetLangs,
      },
    })

    return new NextResponse(new Uint8Array(packageResult.buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document-package-${parsed.data.versionId}.pdf"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
        "X-Package-Hash": packageResult.hash,
        "X-QR-Code-URL": packageResult.qrCodeUrl,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error exporting document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "문서 내보내기에 실패했습니다.",
      500
    )
  }
}
