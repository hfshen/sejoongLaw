import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

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

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류를 찾을 수 없습니다.",
        404
      )
    }

    logger.info("Document fetched", { documentId: id })
    return createSuccessResponse({ document: data })
  } catch (error) {
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
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { document_type, name, date, data, locale } = body

    // 케이스 연결 문서는 name을 케이스명으로 강제 (클라이언트에서 잘못 보내도 서버가 보정)
    let forcedCaseName: string | null = null
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("id, case_id, is_case_linked")
      .eq("id", id)
      .single()

    if (existingDoc?.is_case_linked && existingDoc?.case_id) {
      const { data: caseRecord } = await supabase
        .from("cases")
        .select("case_name")
        .eq("id", existingDoc.case_id)
        .single()
      forcedCaseName = caseRecord?.case_name || null
    }

    const updateData: Partial<{
      document_type: string
      name: string
      date: string
      data: Record<string, any>
      locale: string
    }> = {}
    if (document_type) updateData.document_type = document_type
    if (forcedCaseName) updateData.name = forcedCaseName
    else if (name) updateData.name = name
    if (date) updateData.date = date
    if (data !== undefined) updateData.data = data
    if (locale) updateData.locale = locale

    const { data: document, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 수정에 실패했습니다.",
        500
      )
    }

    logger.info("Document updated", { documentId: id })
    return createSuccessResponse({ document }, "서류가 수정되었습니다.")
  } catch (error) {
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
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 삭제에 실패했습니다.",
        500
      )
    }

    logger.info("Document deleted", { documentId: id })
    return createSuccessResponse({ success: true }, "서류가 삭제되었습니다.")
  } catch (error) {
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 삭제에 실패했습니다.",
      500
    )
  }
}

