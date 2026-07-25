import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import { DOCUMENT_TYPES, UUID_PATTERN } from "@/lib/admin/case-validation"
import { mapCaseToDocument } from "@/lib/documents/case-mapper"
import type { DocumentType } from "@/lib/documents/templates"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const CASE_ROLES = ["admin", "korea_agent"] as const
const requestSchema = z
  .object({
    document_types: z.array(z.enum(DOCUMENT_TYPES)).min(1).max(DOCUMENT_TYPES.length),
  })
  .superRefine((value, context) => {
    if (new Set(value.document_types).size !== value.document_types.length) {
      context.addIssue({
        code: "custom",
        path: ["document_types"],
        message: "중복된 서류 유형이 있습니다.",
      })
    }
  })

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const actor = await getAuthenticatedBackofficeProfile(CASE_ROLES)
    if (!actor) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 케이스 ID가 필요합니다." }, { status: 400 })
    }

    const parsed = requestSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "서류 유형을 확인해 주세요." },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const [{ data: caseRecord, error: caseError }, { data: existing, error: existingError }] =
      await Promise.all([
        supabase.from("cases").select("id, case_name, case_data").eq("id", id).single(),
        supabase
          .from("documents")
          .select("document_type")
          .eq("case_id", id)
          .in("document_type", parsed.data.document_types),
      ])

    if (caseError || !caseRecord) {
      return NextResponse.json({ error: "케이스를 찾을 수 없습니다." }, { status: 404 })
    }
    if (existingError) {
      return createNextErrorResponse(
        NextResponse,
        existingError,
        "기존 서류를 확인하지 못했습니다.",
        500
      )
    }

    const existingTypes = new Set((existing || []).map((item) => item.document_type))
    const duplicateTypes = parsed.data.document_types.filter((type) => existingTypes.has(type))
    if (duplicateTypes.length) {
      return NextResponse.json(
        {
          error: "이미 생성된 서류 유형이 포함되어 있습니다.",
          documentTypes: duplicateTypes,
        },
        { status: 409 }
      )
    }

    const documentsToInsert = parsed.data.document_types.map((documentType) => ({
      document_type: documentType,
      name: caseRecord.case_name,
      date: new Date().toISOString().split("T")[0],
      data: mapCaseToDocument(
        caseRecord.case_data,
        documentType as DocumentType,
        caseRecord.case_data
      ),
      locale: "ko",
      case_id: caseRecord.id,
      is_case_linked: true,
    }))

    const { data: createdDocuments, error: documentsError } = await supabase
      .from("documents")
      .insert(documentsToInsert)
      .select()

    if (documentsError) {
      logger.error("Failed to create case documents", {
        error: documentsError,
        actorUserId: actor.id,
        caseId: id,
        documentCount: documentsToInsert.length,
      })
      return createNextErrorResponse(
        NextResponse,
        documentsError,
        "서류 생성에 실패했습니다.",
        500
      )
    }

    logger.info("Case documents created", {
      actorUserId: actor.id,
      caseId: id,
      documentCount: createdDocuments?.length || 0,
    })
    return createSuccessResponse(
      { documents: createdDocuments || [] },
      "서류가 생성되었습니다.",
      201
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Case document generation failed", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 생성에 실패했습니다.",
      500
    )
  }
}
