import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { mapCaseToDocument } from "@/lib/documents/case-mapper"

export async function POST(
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

    const { document_types } = body

    if (!document_types || !Array.isArray(document_types) || document_types.length === 0) {
      return NextResponse.json(
        { error: "document_types array is required" },
        { status: 400 }
      )
    }

    // 케이스 정보 조회
    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single()

    if (caseError || !caseRecord) {
      return NextResponse.json(
        { error: "Case not found" },
        { status: 404 }
      )
    }

    const caseData = caseRecord.case_data as any

    // 선택된 서류 타입들 생성
    const documentsToInsert = document_types.map((docType: string) => {
      const documentData = mapCaseToDocument(caseData, docType as any)
      return {
        document_type: docType,
        name: caseRecord.case_name,
        date: new Date().toISOString().split("T")[0],
        data: documentData,
        locale: "ko",
        case_id: caseRecord.id,
        is_case_linked: true,
      }
    })

    const { data: createdDocuments, error: docsError } = await supabase
      .from("documents")
      .insert(documentsToInsert)
      .select()

    if (docsError) {
      console.error("Failed to create documents:", docsError)
      return NextResponse.json(
        { error: "Failed to create documents" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { documents: createdDocuments || [] },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Cases documents API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

