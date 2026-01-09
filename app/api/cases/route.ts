import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const caseNumber = searchParams.get("case_number")
    const caseName = searchParams.get("case_name")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search")

    let query = supabase.from("cases").select("*")

    // 필터 적용
    if (caseNumber) {
      query = query.ilike("case_number", `%${caseNumber}%`)
    }
    if (caseName) {
      query = query.ilike("case_name", `%${caseName}%`)
    }
    if (search) {
      query = query.or(`case_name.ilike.%${search}%,case_number.ilike.%${search}%,case_data::text.ilike.%${search}%`)
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to fetch cases" },
        { status: 500 }
      )
    }

    return NextResponse.json({ cases: data || [] }, { status: 200 })
  } catch (error: any) {
    console.error("Cases API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const body = await request.json()

    const { case_number, case_name, case_data, document_types } = body

    if (!case_name || !case_data) {
      return NextResponse.json(
        { error: "Missing required fields: case_name, case_data" },
        { status: 400 }
      )
    }

    // 케이스 생성
    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .insert([
        {
          case_number: case_number || null,
          case_name,
          case_data: case_data || {},
        },
      ])
      .select()
      .single()

    if (caseError) {
      console.error("Supabase error:", caseError)
      return NextResponse.json(
        { error: "Failed to create case" },
        { status: 500 }
      )
    }

    // 선택된 서류 타입이 있으면 자동 생성
    if (document_types && Array.isArray(document_types) && document_types.length > 0) {
      const { mapCaseToDocument } = await import("@/lib/documents/case-mapper")
      
      console.log("[Case Creation] Case data received:", JSON.stringify(case_data, null, 2))
      console.log("[Case Creation] Document types to create:", document_types)
      
      const documentsToInsert = document_types.map((docType: string) => {
        // 통합 폼에서 받은 데이터를 그대로 사용하되, mapCaseToDocument로 매핑 보완
        // 통합 폼 데이터에는 이미 모든 필드가 포함되어 있으므로, 매핑은 추가 필드(날짜 등)만 보완
        const mappedData = mapCaseToDocument(case_data, docType as any, case_data)
        
        // 통합 폼 데이터와 매핑된 데이터 병합 (통합 폼 데이터 우선)
        const documentData = {
          ...mappedData,
          ...case_data, // 통합 폼 데이터로 덮어쓰기
        }
        
        console.log(`[Case Creation] Mapped data for ${docType}:`, JSON.stringify(documentData, null, 2))
        
        return {
          document_type: docType,
          name: case_name,
          date: new Date().toISOString().split("T")[0],
          data: documentData,
          locale: "ko",
          case_id: caseRecord.id,
          is_case_linked: true,
        }
      })

      console.log("[Case Creation] Documents to insert:", JSON.stringify(documentsToInsert.map(d => ({ 
        document_type: d.document_type, 
        name: d.name,
        data_keys: Object.keys(d.data)
      })), null, 2))

      const { data: createdDocuments, error: docsError } = await supabase
        .from("documents")
        .insert(documentsToInsert)
        .select()

      if (docsError) {
        console.error("[Case Creation] Failed to create documents:", docsError)
        console.error("[Case Creation] Error details:", JSON.stringify(docsError, null, 2))
        // 케이스는 생성되었지만 서류 생성 실패 - 케이스는 반환하되 경고 포함
        return NextResponse.json(
          { 
            case: caseRecord,
            warning: "Case created but some documents failed to create",
            error: docsError.message,
            details: docsError
          },
          { status: 201 }
        )
      }

      console.log("[Case Creation] Successfully created documents:", createdDocuments?.length || 0)
    }

    return NextResponse.json({ case: caseRecord }, { status: 201 })
  } catch (error: any) {
    console.error("Cases API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

