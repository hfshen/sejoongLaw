import { NextRequest, NextResponse } from "next/server"
import {
  DOCUMENT_LOCALES,
  DOCUMENT_SORT_COLUMNS,
  documentCreateSchema,
  firstDocumentValidationMessage,
  normalizeDocumentSearch,
  type DocumentLocale,
  type DocumentSortColumn,
} from "@/lib/admin/document-validation"
import { DOCUMENT_TYPES } from "@/lib/admin/case-validation"
import {
  accessibleDocumentIds,
  DOCUMENT_OPERATOR_ROLES,
  getDocumentActor,
} from "@/lib/documents/access"
import { extractReadableText } from "@/lib/documents/text-extractor"
import type { DocumentType } from "@/lib/documents/templates"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function noStore<T extends NextResponse>(response: T): T {
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function isDocumentType(value: string | null): value is DocumentType {
  return DOCUMENT_TYPES.includes(value as DocumentType)
}

function isDocumentLocale(value: string | null): value is DocumentLocale {
  return DOCUMENT_LOCALES.includes(value as DocumentLocale)
}

export async function GET(request: NextRequest) {
  try {
    const actor = await getDocumentActor()
    if (!actor) return forbidden()

    const allowedIds = await accessibleDocumentIds(actor, "view")
    if (allowedIds && allowedIds.length === 0) {
      return noStore(createSuccessResponse({ documents: [] }))
    }

    const { searchParams } = new URL(request.url)
    const requestedType = searchParams.get("type")
    const requestedLocale = searchParams.get("locale")
    const documentType = isDocumentType(requestedType) ? requestedType : null
    const locale = isDocumentLocale(requestedLocale) ? requestedLocale : "ko"
    const name = normalizeDocumentSearch(searchParams.get("name"), 200)
    const search = normalizeDocumentSearch(searchParams.get("search"))
    const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.get("date") || "")
      ? searchParams.get("date")
      : null
    const caseLinked = searchParams.get("case_linked")
    const requestedSort = searchParams.get("sortBy")
    const sortBy: DocumentSortColumn = DOCUMENT_SORT_COLUMNS.includes(
      requestedSort as DocumentSortColumn
    )
      ? (requestedSort as DocumentSortColumn)
      : "created_at"
    const ascending = searchParams.get("sortOrder") === "asc"

    const supabase = getServiceClient()
    let query = supabase
      .from("documents")
      .select("*")
      .eq("locale", locale)
      .limit(500)

    if (allowedIds) query = query.in("id", allowedIds)
    if (documentType) query = query.eq("document_type", documentType)
    if (name) query = query.ilike("name", `%${name}%`)
    if (date) query = query.eq("date", date)
    if (search) query = query.ilike("name", `%${search}%`)
    if (caseLinked === "true" || caseLinked === "false") {
      query = query.eq("is_case_linked", caseLinked === "true")
    }

    const { data, error } = await query.order(sortBy, { ascending })
    if (error) {
      logger.error("Failed to fetch documents", {
        error,
        actorUserId: actor.id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Documents fetched", {
      actorUserId: actor.id,
      role: actor.role,
      count: data?.length || 0,
    })
    return noStore(createSuccessResponse({ documents: data || [] }))
  } catch (error) {
    logger.error("Error fetching documents", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 목록을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest) {
  let documentId: string | null = null
  let storagePath: string | null = null

  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return forbidden()

    const parsed = documentCreateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstDocumentValidationMessage(parsed.error) },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const { data: document, error } = await supabase
      .from("documents")
      .insert({
        ...parsed.data,
        source_lang: parsed.data.locale,
        created_by: actor.id,
      })
      .select()
      .single()

    if (error || !document) {
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Created document was not returned"),
        "서류 생성에 실패했습니다.",
        500
      )
    }
    documentId = document.id

    const documentText = JSON.stringify(parsed.data, null, 2)
    const fileContent = Buffer.from(documentText, "utf-8")
    storagePath = `documents/${document.id}/v1_${Date.now()}.txt`

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileContent, {
        contentType: "text/plain; charset=utf-8",
        upsert: false,
      })
    if (uploadError) throw uploadError

    const { createDocumentVersion } = await import("@/lib/documents/versioning")
    const { createVersionSegments } = await import("@/lib/documents/segmentation")
    const version = await createDocumentVersion({
      documentId: document.id,
      storagePath,
      fileContent,
      createdBy: actor.id,
    })

    const readableText = extractReadableText(
      parsed.data.document_type,
      parsed.data.data,
      parsed.data.locale
    )
    const segments = await createVersionSegments(version.id, readableText)

    await supabase.from("audit_events").insert({
      case_id: null,
      entity_type: "document",
      entity_id: document.id,
      action: "created",
      actor: actor.id,
      meta: {
        document_type: parsed.data.document_type,
        locale: parsed.data.locale,
        version_id: version.id,
      },
    })

    // Translation generation is a best-effort post-create enhancement. The
    // document, version and source segments are already complete at this point.
    if (segments.length > 0 && parsed.data.locale === "ko") {
      const targetLanguages = ["en", "si", "ta"] as const
      const { translateVersion } = await import("@/lib/documents/translation")
      for (const targetLanguage of targetLanguages) {
        try {
          await translateVersion(version.id, "ko", targetLanguage, actor.id)
        } catch (translationError) {
          logger.warn("Automatic document translation failed", {
            error: translationError,
            actorUserId: actor.id,
            documentId: document.id,
            versionId: version.id,
            targetLanguage,
          })
        }
      }
    }

    logger.info("Document created", {
      actorUserId: actor.id,
      documentId: document.id,
      versionId: version.id,
    })
    return noStore(
      createSuccessResponse(
        { document: { ...document, current_version_id: version.id } },
        "서류가 생성되었습니다.",
        201
      )
    )
  } catch (error) {
    if (documentId) {
      const supabase = getServiceClient()
      await supabase.from("documents").delete().eq("id", documentId)
      if (storagePath) await supabase.storage.from("documents").remove([storagePath])
    }

    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error creating document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 생성에 실패했습니다.",
      500
    )
  }
}
