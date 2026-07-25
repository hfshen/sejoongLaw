import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import {
  CASE_SORT_COLUMNS,
  caseCreateSchema,
  firstCaseValidationMessage,
  normalizeCaseSearch,
  type CaseSortColumn,
} from "@/lib/admin/case-validation"
import type { DocumentType } from "@/lib/documents/templates"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { createNextErrorResponse } from "@/lib/utils/error-handler"

const CASE_ROLES = ["admin", "korea_agent"] as const

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

async function ensureCaseOperator() {
  return getAuthenticatedBackofficeProfile(CASE_ROLES)
}

function isConnectionError(error: unknown) {
  if (!(error instanceof Error)) return false
  const message = error.message.toLowerCase()
  return (
    message.includes("timeout") ||
    message.includes("connecttimeouterror") ||
    message.includes("fetch failed")
  )
}

export async function GET(request: NextRequest) {
  try {
    const actor = await ensureCaseOperator()
    if (!actor) return forbidden()

    const { searchParams } = new URL(request.url)
    const caseNumber = normalizeCaseSearch(searchParams.get("case_number"), 100)
    const caseName = normalizeCaseSearch(searchParams.get("case_name"), 200)
    const search = normalizeCaseSearch(searchParams.get("search"))
    const requestedSort = searchParams.get("sortBy")
    const sortBy: CaseSortColumn = CASE_SORT_COLUMNS.includes(
      requestedSort as CaseSortColumn
    )
      ? (requestedSort as CaseSortColumn)
      : "created_at"
    const ascending = searchParams.get("sortOrder") === "asc"

    const supabase = getServiceClient()
    let query = supabase.from("cases").select("*").limit(500)

    if (caseNumber) query = query.ilike("case_number", `%${caseNumber}%`)
    if (caseName) query = query.ilike("case_name", `%${caseName}%`)
    if (search) {
      const pattern = `%${search}%`
      query = query.or(`case_name.ilike.${pattern},case_number.ilike.${pattern}`)
    }

    const { data, error } = await query.order(sortBy, { ascending })
    if (error) {
      logger.error("Failed to fetch cases", {
        error,
        actorUserId: actor.id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        isConnectionError(error)
          ? "데이터베이스 연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
          : "케이스 목록을 불러오는데 실패했습니다.",
        isConnectionError(error) ? 503 : 500
      )
    }

    logger.info("Cases fetched successfully", {
      actorUserId: actor.id,
      count: data?.length || 0,
    })
    return createSuccessResponse({ cases: data || [] })
  } catch (error) {
    logger.error("Error fetching cases", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      isConnectionError(error)
        ? "데이터베이스 연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
        : "케이스 목록을 불러오는데 실패했습니다.",
      isConnectionError(error) ? 503 : 500
    )
  }
}

export async function POST(request: NextRequest) {
  let createdCaseId: string | null = null

  try {
    requireTrustedOrigin(request)
    const actor = await ensureCaseOperator()
    if (!actor) return forbidden()

    const parsed = caseCreateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstCaseValidationMessage(parsed.error) },
        { status: 400 }
      )
    }

    const { case_number, case_name, case_data, document_types } = parsed.data
    const supabase = getServiceClient()
    const { data: caseRecord, error: caseError } = await supabase
      .from("cases")
      .insert({
        case_number,
        case_name,
        case_data,
        created_by: actor.id,
      })
      .select()
      .single()

    if (caseError || !caseRecord) {
      logger.error("Failed to create case", {
        error: caseError,
        actorUserId: actor.id,
      })
      return createNextErrorResponse(
        NextResponse,
        caseError || new Error("Created case was not returned"),
        "케이스 생성에 실패했습니다.",
        500
      )
    }
    createdCaseId = caseRecord.id

    if (document_types.length === 0) {
      logger.info("Case created successfully", {
        actorUserId: actor.id,
        caseId: caseRecord.id,
      })
      return createSuccessResponse(
        { case: caseRecord },
        "케이스가 생성되었습니다.",
        201
      )
    }

    const { mapCaseToDocument } = await import("@/lib/documents/case-mapper")
    const documentsToInsert = document_types.map((documentType) => {
      const mappedData = mapCaseToDocument(
        case_data,
        documentType as DocumentType,
        case_data
      )

      return {
        document_type: documentType,
        name: case_name,
        date: new Date().toISOString().split("T")[0],
        data: { ...mappedData, ...case_data },
        locale: "ko",
        case_id: caseRecord.id,
        is_case_linked: true,
      }
    })

    const { data: createdDocuments, error: documentsError } = await supabase
      .from("documents")
      .insert(documentsToInsert)
      .select()

    if (documentsError) {
      await supabase.from("cases").delete().eq("id", caseRecord.id)
      createdCaseId = null
      logger.error("Rolled back case after document creation failed", {
        error: documentsError,
        actorUserId: actor.id,
        caseId: caseRecord.id,
        documentCount: documentsToInsert.length,
      })
      return createNextErrorResponse(
        NextResponse,
        documentsError,
        "서류 생성에 실패하여 케이스 생성도 취소되었습니다.",
        500
      )
    }

    logger.info("Case and documents created successfully", {
      actorUserId: actor.id,
      caseId: caseRecord.id,
      documentCount: createdDocuments?.length || 0,
    })
    return createSuccessResponse(
      {
        case: caseRecord,
        documents: createdDocuments || [],
      },
      `케이스와 ${createdDocuments?.length || 0}개의 서류가 생성되었습니다.`,
      201
    )
  } catch (error) {
    if (createdCaseId) {
      try {
        await getServiceClient().from("cases").delete().eq("id", createdCaseId)
      } catch (rollbackError) {
        logger.error("Failed to roll back case after unexpected error", {
          error: rollbackError,
          caseId: createdCaseId,
        })
      }
    }

    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error creating case", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      isConnectionError(error)
        ? "데이터베이스 연결 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
        : "케이스 생성에 실패했습니다.",
      isConnectionError(error) ? 503 : 500
    )
  }
}
