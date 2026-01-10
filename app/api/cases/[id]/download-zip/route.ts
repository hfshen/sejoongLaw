import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import JSZip from "jszip"

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

    // 케이스 정보 가져오기
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

    // 연결된 서류들 가져오기
    const { data: documents, error: docsError } = await supabase
      .from("documents")
      .select("*")
      .eq("case_id", id)
      .eq("is_case_linked", true)
      .order("created_at", { ascending: false })

    if (docsError) {
      return NextResponse.json(
        { error: "Failed to fetch documents" },
        { status: 500 }
      )
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: "No documents found" },
        { status: 404 }
      )
    }

    // 클라이언트 사이드에서 이미지 생성이 필요하므로
    // 여기서는 문서 정보만 반환하고, 실제 ZIP 생성은 클라이언트에서 처리
    // 또는 서버 사이드에서 Puppeteer 등을 사용하여 이미지 생성 가능
    // 현재는 클라이언트 사이드에서 처리하는 것이 더 간단

    return NextResponse.json(
      { 
        case: caseRecord,
        documents: documents,
        message: "Use client-side ZIP generation"
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Download ZIP API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

