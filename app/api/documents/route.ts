import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const documentType = searchParams.get("type")
    const name = searchParams.get("name")
    const date = searchParams.get("date")
    const locale = searchParams.get("locale") || "ko"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search")
    const caseLinked = searchParams.get("case_linked")

    let query = supabase
      .from("documents")
      .select("*")
      .eq("locale", locale)

    // 필터 적용
    if (documentType) {
      query = query.eq("document_type", documentType)
    }
    if (name) {
      query = query.ilike("name", `%${name}%`)
    }
    if (date) {
      query = query.eq("date", date)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,data::text.ilike.%${search}%`)
    }
    if (caseLinked !== null) {
      query = query.eq("is_case_linked", caseLinked === "true")
    }

    // 정렬
    query = query.order(sortBy, { ascending: sortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      logger.error("Failed to fetch documents", { error, filters: { documentType, name, date, locale } })
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Documents fetched successfully", { count: data?.length || 0 })
    return createSuccessResponse({ documents: data || [] })
  } catch (error) {
    logger.error("Error fetching documents", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 목록을 불러오는데 실패했습니다.",
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

    const { document_type, name, date, data, locale = "ko" } = body

    if (!document_type || !name || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from("documents")
      .insert([
        {
          document_type,
          name,
          date,
          data: data || {},
          locale,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create document", { error, document_type, name })
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 생성에 실패했습니다.",
        500
      )
    }

    logger.info("Document created successfully", { documentId: document.id, document_type, name })
    return createSuccessResponse({ document }, "서류가 생성되었습니다.", 201)
  } catch (error) {
    logger.error("Error creating document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 생성에 실패했습니다.",
      500
    )
  }
}

