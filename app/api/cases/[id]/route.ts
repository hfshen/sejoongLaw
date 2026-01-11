import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { updateDocumentFromCase } from "@/lib/documents/case-mapper"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import type { CaseData } from "@/lib/types/admin"
import type { DocumentType } from "@/lib/documents/templates"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { data: caseRecord, error } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "케이스를 찾을 수 없습니다.",
        404
      )
    }

    // 연결된 서류들도 함께 조회
    const { data: documents } = await supabase
      .from("documents")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false })

    logger.info("Case fetched", { caseId: id, documentCount: documents?.length || 0 })
    return createSuccessResponse({ case: caseRecord, documents: documents || [] })
  } catch (error) {
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
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { case_number, case_name, case_data, update_linked_documents = true } = body

    // 케이스 업데이트
    const updateData: Partial<{
      case_number: string | null
      case_name: string
      case_data: CaseData
    }> = {}
    if (case_number !== undefined) updateData.case_number = case_number
    if (case_name !== undefined) updateData.case_name = case_name
    if (case_data !== undefined) updateData.case_data = case_data as CaseData

    const { data: updatedCase, error: updateError } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      return createNextErrorResponse(
        NextResponse,
        updateError,
        "케이스 수정에 실패했습니다.",
        500
      )
    }

    // 연결된 서류들도 업데이트 (옵션)
    if (update_linked_documents && case_data) {
      const { data: linkedDocuments } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", id)
        .eq("is_case_linked", true)

      if (linkedDocuments && linkedDocuments.length > 0) {
        const updatePromises = linkedDocuments.map(async (doc) => {
          const updatedData = updateDocumentFromCase(
            doc.data,
            case_data as CaseData,
            doc.document_type as DocumentType
          )

          return supabase
            .from("documents")
            .update({ data: updatedData })
            .eq("id", doc.id)
        })

        const results = await Promise.all(updatePromises)
        const errors = results.filter(r => r.error)
        
        if (errors.length > 0) {
          // 일부 서류 업데이트 실패는 경고로 처리 (케이스 업데이트는 성공)
        }
      }
    }

    logger.info("Case updated", { caseId: id })
    return createSuccessResponse({ case: updatedCase }, "케이스가 수정되었습니다.")
  } catch (error) {
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
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    // 케이스 삭제 (연결된 서류들의 case_id는 NULL로 설정됨 - ON DELETE SET NULL)
    const { error } = await supabase.from("cases").delete().eq("id", id)

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "케이스 삭제에 실패했습니다.",
        500
      )
    }

    logger.info("Case deleted", { caseId: id })
    return createSuccessResponse({ success: true }, "케이스가 삭제되었습니다.")
  } catch (error) {
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스 삭제에 실패했습니다.",
      500
    )
  }
}

