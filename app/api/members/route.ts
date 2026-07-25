import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import {
  firstZodMessage,
  MEMBER_ORDER_COLUMNS,
  memberPayloadSchema,
  type MemberOrderColumn,
} from "@/lib/admin/member-validation"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

async function ensureAdmin() {
  return getAuthenticatedBackofficeProfile(["admin"])
}

export async function GET(request: NextRequest) {
  try {
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const requestedOrderBy = searchParams.get("orderBy")
    const orderBy: MemberOrderColumn = MEMBER_ORDER_COLUMNS.includes(
      requestedOrderBy as MemberOrderColumn
    )
      ? (requestedOrderBy as MemberOrderColumn)
      : "order_index"
    const ascending = searchParams.get("order") !== "desc"

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order(orderBy, { ascending })

    if (error) {
      logger.error("Failed to fetch members", {
        error,
        actorUserId: admin.id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Members fetched successfully", {
      actorUserId: admin.id,
      count: data?.length || 0,
    })
    return createSuccessResponse({ members: data || [] })
  } catch (error) {
    logger.error("Error fetching members", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 목록을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const parsed = memberPayloadSchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json(
        { error: firstZodMessage(parsed.error) },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const { data: member, error } = await supabase
      .from("members")
      .insert(parsed.data)
      .select()
      .single()

    if (error || !member) {
      logger.error("Failed to create member", {
        error,
        actorUserId: admin.id,
      })
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Created member was not returned"),
        "구성원 추가에 실패했습니다.",
        500
      )
    }

    logger.info("Member created successfully", {
      actorUserId: admin.id,
      memberId: member.id,
    })
    return createSuccessResponse({ member }, "구성원이 추가되었습니다.", 201)
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error creating member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 추가에 실패했습니다.",
      500
    )
  }
}
