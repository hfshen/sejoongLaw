import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { UserRole } from "@/lib/auth/role-guard"
import {
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import {
  canUserApprove,
  checkApprovalStatus,
  createApproval,
  getApprovalChain,
  isVersionReadyForExport,
} from "@/lib/workflow/approval"

const APPROVER_ROLES: readonly UserRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
]
const TARGET_LANGUAGES = ["source", "en", "si", "ta"] as const
const approvalSchema = z.object({
  versionId: z.string().uuid(),
  targetLang: z.enum(TARGET_LANGUAGES).optional().default("source"),
  decision: z.enum(["approved", "rejected"]),
  comment: z.string().trim().max(2000).optional().nullable(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function noStore<T extends NextResponse>(response: T): T {
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

async function versionBelongsToDocument(versionId: string, documentId: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("document_versions")
    .select("id, document_id")
    .eq("id", versionId)
    .eq("document_id", documentId)
    .single()
  return error || !data ? null : data
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await getDocumentActor()
    if (!actor) return forbidden()

    const { id: documentId } = await params
    const versionId = request.nextUrl.searchParams.get("versionId") || ""
    const targetLang = request.nextUrl.searchParams.get("targetLang") || "source"
    if (
      !DOCUMENT_UUID_PATTERN.test(documentId) ||
      !DOCUMENT_UUID_PATTERN.test(versionId) ||
      !TARGET_LANGUAGES.includes(targetLang as (typeof TARGET_LANGUAGES)[number])
    ) {
      return NextResponse.json(
        { error: "문서, 버전, 승인 언어를 확인해 주세요." },
        { status: 400 }
      )
    }
    if (!(await hasDocumentPermission(actor, documentId, "view"))) return forbidden()
    if (!(await versionBelongsToDocument(versionId, documentId))) {
      return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
    }

    const [status, chain] = await Promise.all([
      checkApprovalStatus(versionId, targetLang),
      getApprovalChain(versionId),
    ])
    return noStore(createSuccessResponse({ status, chain }))
  } catch (error) {
    logger.error("Error fetching approval status", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "승인 상태를 불러오지 못했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(APPROVER_ROLES)
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }

    const parsed = approvalSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "승인 요청을 확인해 주세요." },
        { status: 400 }
      )
    }
    if (!(await hasDocumentPermission(actor, documentId, "approve"))) return forbidden()
    if (!(await versionBelongsToDocument(parsed.data.versionId, documentId))) {
      return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
    }
    if (!canUserApprove(actor.role, parsed.data.targetLang)) return forbidden()

    const forwardedFor = request.headers.get("x-forwarded-for")
    const ipAddress = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip")
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null

    const approval = await createApproval({
      versionId: parsed.data.versionId,
      targetLang: parsed.data.targetLang,
      approvedBy: actor.id,
      role: actor.role as Exclude<UserRole, "system">,
      decision: parsed.data.decision,
      comment: parsed.data.comment || undefined,
      ipAddress,
      userAgent,
    })

    const supabase = getServiceClient()
    if (parsed.data.decision === "approved") {
      const ready = await isVersionReadyForExport(parsed.data.versionId, ["en", "si", "ta"])
      await supabase
        .from("document_versions")
        .update({ status: ready ? "approved" : "pending_approval" })
        .eq("id", parsed.data.versionId)
    } else {
      await supabase
        .from("document_versions")
        .update({ status: "pending_approval" })
        .eq("id", parsed.data.versionId)
    }

    const { data: document } = await supabase
      .from("documents")
      .select("case_id")
      .eq("id", documentId)
      .single()
    await supabase.from("audit_events").insert({
      case_id: document?.case_id || null,
      entity_type: "approval",
      entity_id: approval.id,
      action: parsed.data.decision === "approved" ? "approved" : "rejected",
      actor: actor.id,
      meta: {
        document_id: documentId,
        version_id: parsed.data.versionId,
        target_lang: parsed.data.targetLang,
        role: actor.role,
      },
    })

    return noStore(
      createSuccessResponse(
        { approval },
        parsed.data.decision === "approved"
          ? "문서를 승인했습니다."
          : "문서를 반려했습니다.",
        201
      )
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error creating approval", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "문서 승인 처리에 실패했습니다.",
      500
    )
  }
}
