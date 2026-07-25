import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  DOCUMENT_OPERATOR_ROLES,
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const MAX_VERSION_BYTES = 10 * 1024 * 1024

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

function validText(buffer: Buffer) {
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(buffer)
    return true
  } catch {
    return false
  }
}

function detectVersionFile(buffer: Buffer, declaredType: string) {
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return declaredType && declaredType !== "application/pdf"
      ? null
      : { contentType: "application/pdf", extension: "pdf" }
  }

  if (validText(buffer)) {
    return declaredType && !declaredType.startsWith("text/")
      ? null
      : { contentType: "text/plain; charset=utf-8", extension: "txt" }
  }

  return null
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const actor = await getDocumentActor()
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, documentId, "view"))) return forbidden()

    const versionId = request.nextUrl.searchParams.get("versionId")
    const supabase = getServiceClient()

    if (versionId) {
      if (!DOCUMENT_UUID_PATTERN.test(versionId)) {
        return NextResponse.json({ error: "올바른 버전 ID가 필요합니다." }, { status: 400 })
      }

      const { data: version, error: versionError } = await supabase
        .from("document_versions")
        .select("id")
        .eq("id", versionId)
        .eq("document_id", documentId)
        .single()
      if (versionError || !version) {
        return NextResponse.json({ error: "문서 버전을 찾을 수 없습니다." }, { status: 404 })
      }

      const { data: segments, error } = await supabase
        .from("version_segments")
        .select("*")
        .eq("version_id", versionId)
        .order("seq", { ascending: true })
      if (error) {
        return createNextErrorResponse(
          NextResponse,
          error,
          "문서 세그먼트를 불러오지 못했습니다.",
          500
        )
      }
      return noStore(createSuccessResponse({ segments: segments || [] }))
    }

    const { data: versions, error } = await supabase
      .from("document_versions")
      .select("*")
      .eq("document_id", documentId)
      .order("version_no", { ascending: false })
    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "문서 버전을 불러오지 못했습니다.",
        500
      )
    }
    return noStore(createSuccessResponse({ versions: versions || [] }))
  } catch (error) {
    logger.error("Error fetching document versions", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "문서 버전을 불러오지 못했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  let storagePath: string | null = null
  let versionId: string | null = null

  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return forbidden()

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, documentId, "view"))) return forbidden()

    const formData = await request.formData()
    const candidate = formData.get("file")
    const sourceTextValue = formData.get("sourceText")
    const sourceText = typeof sourceTextValue === "string" ? sourceTextValue.trim() : ""

    if (!(candidate instanceof File) && !sourceText) {
      return NextResponse.json(
        { error: "PDF·텍스트 파일 또는 원문 텍스트가 필요합니다." },
        { status: 400 }
      )
    }

    let fileContent: Buffer
    let contentType: string
    let extension: string

    if (candidate instanceof File) {
      if (candidate.size <= 0 || candidate.size > MAX_VERSION_BYTES) {
        return NextResponse.json(
          { error: "버전 파일은 0바이트보다 크고 10MB 이하여야 합니다." },
          { status: 400 }
        )
      }
      fileContent = Buffer.from(await candidate.arrayBuffer())
      const format = detectVersionFile(fileContent, candidate.type)
      if (!format) {
        return NextResponse.json(
          { error: "실제 파일 형식이 PDF 또는 UTF-8 텍스트가 아닙니다." },
          { status: 400 }
        )
      }
      contentType = format.contentType
      extension = format.extension
    } else {
      if (Buffer.byteLength(sourceText, "utf8") > MAX_VERSION_BYTES) {
        return NextResponse.json({ error: "원문 텍스트가 너무 큽니다." }, { status: 400 })
      }
      fileContent = Buffer.from(sourceText, "utf8")
      contentType = "text/plain; charset=utf-8"
      extension = "txt"
    }

    const supabase = getServiceClient()
    storagePath = `documents/${documentId}/${randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(storagePath, fileContent, {
        contentType,
        upsert: false,
      })
    if (uploadError) throw uploadError

    const { createDocumentVersion } = await import("@/lib/documents/versioning")
    const version = await createDocumentVersion({
      documentId,
      storagePath,
      fileContent,
      createdBy: actor.id,
    })
    versionId = version.id

    if (sourceText) {
      const { createVersionSegments } = await import("@/lib/documents/segmentation")
      await createVersionSegments(version.id, sourceText)
    }

    const { data: document } = await supabase
      .from("documents")
      .select("case_id")
      .eq("id", documentId)
      .single()
    await supabase.from("audit_events").insert({
      case_id: document?.case_id || null,
      entity_type: "version",
      entity_id: version.id,
      action: "created",
      actor: actor.id,
      meta: {
        document_id: documentId,
        version_no: version.version_no,
        content_type: contentType,
      },
    })

    return noStore(
      createSuccessResponse({ version }, "문서 버전이 생성되었습니다.", 201)
    )
  } catch (error) {
    const supabase = getServiceClient()
    if (versionId) await supabase.from("document_versions").delete().eq("id", versionId)
    if (storagePath) await supabase.storage.from("documents").remove([storagePath])

    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error creating document version", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "문서 버전 생성에 실패했습니다.",
      500
    )
  }
}
