import { NextRequest, NextResponse } from "next/server"
import {
  documentUpdateSchema,
  firstDocumentValidationMessage,
} from "@/lib/admin/document-validation"
import {
  DOCUMENT_OPERATOR_ROLES,
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import { extractReadableText } from "@/lib/documents/text-extractor"
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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getDocumentActor()
    if (!actor) return forbidden()

    const { id } = await params
    if (!DOCUMENT_UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, id, "view"))) return forbidden()

    const supabase = getServiceClient()
    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !document) {
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Document not found"),
        "서류를 찾을 수 없습니다.",
        404
      )
    }

    logger.info("Document fetched", {
      actorUserId: actor.id,
      documentId: id,
    })
    return noStore(createSuccessResponse({ document }))
  } catch (error) {
    logger.error("Error fetching document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류를 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let storagePath: string | null = null
  let versionId: string | null = null

  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return forbidden()

    const { id } = await params
    if (!DOCUMENT_UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, id, "view"))) return forbidden()

    const parsed = documentUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstDocumentValidationMessage(parsed.error) },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const { data: previous, error: previousError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (previousError || !previous) {
      return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 })
    }

    const updateData = { ...parsed.data }
    if (previous.is_case_linked && previous.case_id) {
      const { data: caseRecord, error: caseError } = await supabase
        .from("cases")
        .select("case_name")
        .eq("id", previous.case_id)
        .single()
      if (caseError || !caseRecord) {
        return createNextErrorResponse(
          NextResponse,
          caseError || new Error("Linked case missing"),
          "연결된 케이스를 확인하지 못했습니다.",
          500
        )
      }
      updateData.name = caseRecord.case_name
    }

    const { data: document, error: updateError } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError || !document) {
      return createNextErrorResponse(
        NextResponse,
        updateError || new Error("Updated document was not returned"),
        "서류 수정에 실패했습니다.",
        500
      )
    }

    const documentText = JSON.stringify(
      {
        document_type: document.document_type,
        name: document.name,
        date: document.date,
        data: document.data,
        locale: document.locale,
      },
      null,
      2
    )
    const fileContent = Buffer.from(documentText, "utf-8")
    storagePath = `documents/${id}/v_${Date.now()}.txt`

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
      documentId: id,
      storagePath,
      fileContent,
      createdBy: actor.id,
    })
    versionId = version.id

    const readableText = extractReadableText(
      document.document_type,
      document.data,
      document.locale
    )
    const segments = await createVersionSegments(version.id, readableText)

    await supabase.from("audit_events").insert({
      case_id: document.case_id || null,
      entity_type: "version",
      entity_id: version.id,
      action: "created",
      actor: actor.id,
      meta: {
        document_id: id,
        version_no: version.version_no,
        changed_fields: Object.keys(updateData),
      },
    })

    if (segments.length > 0 && document.locale === "ko") {
      const { translateVersion } = await import("@/lib/documents/translation")
      for (const targetLanguage of ["en", "si", "ta"] as const) {
        try {
          await translateVersion(version.id, "ko", targetLanguage, actor.id)
        } catch (translationError) {
          logger.warn("Automatic document translation failed", {
            error: translationError,
            actorUserId: actor.id,
            documentId: id,
            versionId: version.id,
            targetLanguage,
          })
        }
      }
    }

    logger.info("Document updated", {
      actorUserId: actor.id,
      documentId: id,
      versionId: version.id,
    })
    return noStore(
      createSuccessResponse(
        { document: { ...document, current_version_id: version.id } },
        "서류가 수정되었습니다."
      )
    )
  } catch (error) {
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    const { id } = await params
    if (actor && DOCUMENT_UUID_PATTERN.test(id)) {
      const supabase = getServiceClient()
      if (versionId) await supabase.from("document_versions").delete().eq("id", versionId)
      if (storagePath) await supabase.storage.from("documents").remove([storagePath])

      // Restore the previously committed document state when versioning fails.
      const { data: latest } = await supabase.from("documents").select("*").eq("id", id).single()
      if (latest) {
        const { data: previousVersion } = await supabase
          .from("document_versions")
          .select("id")
          .eq("document_id", id)
          .order("version_no", { ascending: false })
          .limit(1)
          .maybeSingle()
        await supabase
          .from("documents")
          .update({ current_version_id: previousVersion?.id || null })
          .eq("id", id)
      }
    }

    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error updating document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 수정에 실패했습니다.",
      500
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const admin = await getDocumentActor(["admin"])
    if (!admin) return forbidden()

    const { id } = await params
    if (!DOCUMENT_UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }

    const supabase = getServiceClient()
    const { data: versions, error: versionError } = await supabase
      .from("document_versions")
      .select("storage_path")
      .eq("document_id", id)
    if (versionError) {
      return createNextErrorResponse(
        NextResponse,
        versionError,
        "문서 버전을 확인하지 못했습니다.",
        500
      )
    }

    const { data: deleted, error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)
      .select("id")
      .maybeSingle()
    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 삭제에 실패했습니다.",
        500
      )
    }
    if (!deleted) {
      return NextResponse.json({ error: "서류를 찾을 수 없습니다." }, { status: 404 })
    }

    const storagePaths = (versions || [])
      .map((version) => version.storage_path)
      .filter((path): path is string => Boolean(path))
    if (storagePaths.length) {
      const { error: storageError } = await supabase.storage
        .from("documents")
        .remove(storagePaths)
      if (storageError) {
        logger.warn("Document deleted but version storage cleanup failed", {
          error: storageError,
          actorUserId: admin.id,
          documentId: id,
        })
      }
    }

    logger.info("Document deleted", {
      actorUserId: admin.id,
      documentId: id,
    })
    return noStore(createSuccessResponse({ success: true }, "서류가 삭제되었습니다."))
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error deleting document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 삭제에 실패했습니다.",
      500
    )
  }
}
