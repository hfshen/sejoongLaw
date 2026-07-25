import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import {
  caseUpdateSchema,
  firstCaseValidationMessage,
  UUID_PATTERN,
} from "@/lib/admin/case-validation"
import { updateDocumentFromCase } from "@/lib/documents/case-mapper"
import type { DocumentType } from "@/lib/documents/templates"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import type { CaseData } from "@/lib/types/admin"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const CASE_ROLES = ["admin", "korea_agent"] as const

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getAuthenticatedBackofficeProfile(CASE_ROLES)
    if (!actor) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 케이스 ID가 필요합니다.")

    const supabase = getServiceClient()
    const [{ data: caseRecord, error }, { data: documents, error: documentsError }] =
      await Promise.all([
        supabase.from("cases").select("*").eq("id", id).single(),
        supabase
          .from("documents")
          .select("*")
          .eq("case_id", id)
          .order("created_at", { ascending: false }),
      ])

    if (error || !caseRecord) {
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Case not found"),
        "케이스를 찾을 수 없습니다.",
        404
      )
    }
    if (documentsError) {
      return createNextErrorResponse(
        NextResponse,
        documentsError,
        "연결된 서류를 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Case fetched", {
      actorUserId: actor.id,
      caseId: id,
      documentCount: documents?.length || 0,
    })
    return createSuccessResponse({
      case: caseRecord,
      documents: documents || [],
    })
  } catch (error) {
    logger.error("Error fetching case", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스를 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const actor = await getAuthenticatedBackofficeProfile(CASE_ROLES)
    if (!actor) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 케이스 ID가 필요합니다.")

    const parsed = caseUpdateSchema.safeParse(await request.json())
    if (!parsed.success) return badRequest(firstCaseValidationMessage(parsed.error))

    const { update_linked_documents, ...updateData } = parsed.data
    const supabase = getServiceClient()
    const { data: previousCase, error: previousCaseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single()

    if (previousCaseError || !previousCase) {
      return NextResponse.json({ error: "케이스를 찾을 수 없습니다." }, { status: 404 })
    }

    const { data: linkedDocuments, error: linkedDocumentsError } = await supabase
      .from("documents")
      .select("id, data, document_type")
      .eq("case_id", id)
      .eq("is_case_linked", true)

    if (linkedDocumentsError) {
      return createNextErrorResponse(
        NextResponse,
        linkedDocumentsError,
        "연결된 서류를 확인하지 못했습니다.",
        500
      )
    }

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError || !updatedCase) {
      return createNextErrorResponse(
        NextResponse,
        updateError || new Error("Updated case was not returned"),
        "케이스 수정에 실패했습니다.",
        500
      )
    }

    if (update_linked_documents && parsed.data.case_data && linkedDocuments?.length) {
      const results = await Promise.all(
        linkedDocuments.map((document) => {
          const updatedData = updateDocumentFromCase(
            document.data,
            parsed.data.case_data as CaseData,
            document.document_type as DocumentType
          )
          return supabase
            .from("documents")
            .update({ data: updatedData })
            .eq("id", document.id)
        })
      )

      if (results.some((result) => result.error)) {
        await Promise.all([
          supabase
            .from("cases")
            .update({
              case_number: previousCase.case_number,
              case_name: previousCase.case_name,
              case_data: previousCase.case_data,
            })
            .eq("id", id),
          ...linkedDocuments.map((document) =>
            supabase
              .from("documents")
              .update({ data: document.data })
              .eq("id", document.id)
          ),
        ])

        logger.error("Rolled back case after linked document update failed", {
          actorUserId: actor.id,
          caseId: id,
        })
        return NextResponse.json(
          { error: "연결 서류 동기화에 실패하여 케이스 수정을 취소했습니다." },
          { status: 500 }
        )
      }
    }

    logger.info("Case updated", {
      actorUserId: actor.id,
      caseId: id,
      changedFields: Object.keys(updateData),
    })
    return createSuccessResponse({ case: updatedCase }, "케이스가 수정되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error updating case", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스 수정에 실패했습니다.",
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
    const admin = await getAuthenticatedBackofficeProfile(["admin"])
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 케이스 ID가 필요합니다.")

    const supabase = getServiceClient()
    const { data: existing, error: lookupError } = await supabase
      .from("cases")
      .select("id")
      .eq("id", id)
      .single()

    if (lookupError || !existing) {
      return NextResponse.json({ error: "케이스를 찾을 수 없습니다." }, { status: 404 })
    }

    const { error } = await supabase.from("cases").delete().eq("id", id)
    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "케이스 삭제에 실패했습니다.",
        500
      )
    }

    logger.info("Case deleted", {
      actorUserId: admin.id,
      caseId: id,
    })
    return createSuccessResponse({ success: true }, "케이스가 삭제되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error deleting case", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스 삭제에 실패했습니다.",
      500
    )
  }
}
