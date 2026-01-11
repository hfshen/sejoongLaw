import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse, handleApiError } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import type { DocumentType } from "@/lib/documents/templates"

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
      logger.error("Failed to fetch cases", { error })
      return createNextErrorResponse(
        NextResponse,
        error,
        "케이스 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Cases fetched successfully", { count: data?.length || 0 })
    return createSuccessResponse({ cases: data || [] })
  } catch (error) {
    logger.error("Error fetching cases", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스 목록을 불러오는데 실패했습니다.",
      500
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
      logger.error("Failed to create case", { error: caseError, case_name: body.case_name })
      return createNextErrorResponse(
        NextResponse,
        caseError,
        "케이스 생성에 실패했습니다.",
        500
      )
    }

    // 선택된 서류 타입이 있으면 자동 생성
    if (document_types && Array.isArray(document_types) && document_types.length > 0) {
      const { mapCaseToDocument } = await import("@/lib/documents/case-mapper")
      
      logger.info("Creating documents for case", { caseId: caseRecord.id, documentTypes: document_types })
      
      const documentsToInsert = document_types.map((docType: string) => {
        // 통합 폼에서 받은 데이터를 그대로 사용하되, mapCaseToDocument로 매핑 보완
        // 통합 폼 데이터에는 이미 모든 필드가 포함되어 있으므로, 매핑은 추가 필드(날짜 등)만 보완
        const mappedData = mapCaseToDocument(case_data, docType as DocumentType, case_data)
        
        // 통합 폼 데이터와 매핑된 데이터 병합 (통합 폼 데이터 우선)
        const documentData = {
          ...mappedData,
          ...case_data, // 통합 폼 데이터로 덮어쓰기
        }
        
        logger.debug(`Mapped data for ${docType}`, { docType, dataKeys: Object.keys(documentData) })
        
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

      logger.debug("Documents to insert", { 
        count: documentsToInsert.length,
        documentTypes: documentsToInsert.map(d => d.document_type)
      })

      const { data: createdDocuments, error: docsError } = await supabase
        .from("documents")
        .insert(documentsToInsert)
        .select()

      if (docsError) {
        logger.warn("Case created but some documents failed", { 
          caseId: caseRecord.id, 
          error: docsError,
          document_types 
        })
        // 케이스는 생성되었지만 서류 생성 실패 - 케이스는 반환하되 경고 포함
        return NextResponse.json(
          { 
            case: caseRecord,
            warning: "케이스는 생성되었지만 일부 서류 생성에 실패했습니다.",
            error: handleApiError(docsError)
          },
          { status: 201 }
        )
      }

      logger.info("Case and documents created successfully", { 
        caseId: caseRecord.id, 
        documentCount: createdDocuments?.length || 0 
      })
      
      return createSuccessResponse(
        { 
          case: caseRecord,
          documents: createdDocuments 
        }, 
        `케이스와 ${createdDocuments?.length || 0}개의 서류가 생성되었습니다.`, 
        201
      )
    }

    logger.info("Case created successfully", { caseId: caseRecord.id, case_name })
    return createSuccessResponse({ case: caseRecord }, "케이스가 생성되었습니다.", 201)
  } catch (error) {
    logger.error("Error creating case", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "케이스 생성에 실패했습니다.",
      500
    )
  }
}

