import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import type { UserRole } from "@/lib/auth/role-guard"
import {
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import type { TargetLanguage } from "@/lib/documents/translation"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const TRANSLATION_ROLES: readonly UserRole[] = ["admin", "korea_agent", "translator"]
const REVIEW_ROLES: readonly UserRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
]
const TARGET_LANGUAGES = [
  "en",
  "si",
  "ta",
  "zh-CN",
  "ja",
  "vi",
  "th",
  "id",
  "tl",
  "ru",
  "mn",
  "es",
  "fr",
  "de",
  "ar",
] as const satisfies readonly TargetLanguage[]

const translateSchema = z.object({
  versionId: z.string().uuid(),
  targetLang: z.enum(TARGET_LANGUAGES),
  sourceLang: z.string().trim().min(2).max(10).optional().default("ko"),
})
const reviewSchema = z.object({
  translationId: z.string().uuid(),
  approved: z.boolean(),
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

function canReviewLanguage(role: UserRole, targetLanguage: string) {
  if (role === "admin" || role === "korea_agent") return true
  if (role === "translator") return targetLanguage === "en"
  if (role === "foreign_lawyer") return targetLanguage === "si" || targetLanguage === "ta"
  return false
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
    const targetLang = request.nextUrl.searchParams.get("targetLang") || ""
    if (
      !DOCUMENT_UUID_PATTERN.test(documentId) ||
      !DOCUMENT_UUID_PATTERN.test(versionId) ||
      !TARGET_LANGUAGES.includes(targetLang as TargetLanguage)
    ) {
      return NextResponse.json(
        { error: "문서, 버전, 번역 언어를 확인해 주세요." },
        { status: 400 }
      )
    }
    if (!(await hasDocumentPermission(actor, documentId, "view"))) return forbidden()
    if (!(await versionBelongsToDocument(versionId, documentId))) {
      return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
    }

    const supabase = getServiceClient()
    const { data: segments, error: segmentError } = await supabase
      .from("version_segments")
      .select("id, seq")
      .eq("version_id", versionId)
      .order("seq", { ascending: true })
    if (segmentError) throw segmentError
    if (!segments?.length) return noStore(createSuccessResponse({ translations: [] }))

    const { data: translations, error } = await supabase
      .from("segment_translations")
      .select("*")
      .in(
        "segment_id",
        segments.map((segment) => segment.id)
      )
      .eq("target_lang", targetLang)
    if (error) throw error

    const bySegment = new Map((translations || []).map((item) => [item.segment_id, item]))
    const ordered = segments
      .map((segment) => bySegment.get(segment.id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
    return noStore(createSuccessResponse({ translations: ordered }))
  } catch (error) {
    logger.error("Error fetching translations", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "번역 결과를 불러오지 못했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(TRANSLATION_ROLES)
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }

    const parsed = translateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "번역 요청을 확인해 주세요." },
        { status: 400 }
      )
    }
    if (!(await hasDocumentPermission(actor, documentId, "translate"))) return forbidden()
    if (!(await versionBelongsToDocument(parsed.data.versionId, documentId))) {
      return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
    }

    const supabase = getServiceClient()
    await supabase
      .from("document_versions")
      .update({ status: "pending_translation" })
      .eq("id", parsed.data.versionId)

    const { translateVersion } = await import("@/lib/documents/translation")
    const translations = await translateVersion(
      parsed.data.versionId,
      parsed.data.sourceLang,
      parsed.data.targetLang,
      actor.id
    )

    const { data: document } = await supabase
      .from("documents")
      .select("case_id")
      .eq("id", documentId)
      .single()
    await supabase.from("audit_events").insert({
      case_id: document?.case_id || null,
      entity_type: "translation",
      entity_id: parsed.data.versionId,
      action: "created",
      actor: actor.id,
      meta: {
        document_id: documentId,
        target_lang: parsed.data.targetLang,
        segment_count: translations.length,
      },
    })

    return noStore(
      createSuccessResponse(
        { translations, count: translations.length },
        "번역이 완료되었습니다.",
        201
      )
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error translating document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "문서 번역에 실패했습니다.",
      500
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(REVIEW_ROLES)
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }

    const parsed = reviewSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "번역 검토 요청을 확인해 주세요." },
        { status: 400 }
      )
    }
    if (!(await hasDocumentPermission(actor, documentId, "approve"))) return forbidden()

    const supabase = getServiceClient()
    const { data: translation, error: translationError } = await supabase
      .from("segment_translations")
      .select("id, segment_id, target_lang")
      .eq("id", parsed.data.translationId)
      .single()
    if (translationError || !translation) {
      return NextResponse.json({ error: "번역 항목을 찾을 수 없습니다." }, { status: 404 })
    }
    if (!canReviewLanguage(actor.role, translation.target_lang)) return forbidden()

    const { data: segment, error: segmentError } = await supabase
      .from("version_segments")
      .select("version_id")
      .eq("id", translation.segment_id)
      .single()
    if (segmentError || !segment) return NextResponse.json({ error: "번역 원문을 찾을 수 없습니다." }, { status: 404 })
    if (!(await versionBelongsToDocument(segment.version_id, documentId))) {
      return NextResponse.json({ error: "다른 문서의 번역 항목입니다." }, { status: 400 })
    }

    const { error } = await supabase
      .from("segment_translations")
      .update({
        reviewed_by: actor.id,
        status: parsed.data.approved ? "approved" : "reviewed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", translation.id)
    if (error) throw error

    await supabase.from("audit_events").insert({
      case_id: null,
      entity_type: "translation",
      entity_id: translation.id,
      action: parsed.data.approved ? "approved" : "reviewed",
      actor: actor.id,
      meta: {
        document_id: documentId,
        target_lang: translation.target_lang,
      },
    })

    return noStore(
      createSuccessResponse(
        { translationId: translation.id, approved: parsed.data.approved },
        parsed.data.approved ? "번역을 승인했습니다." : "번역을 검토했습니다."
      )
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error reviewing translation", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "번역 검토에 실패했습니다.",
      500
    )
  }
}
