import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

const VALID_ROLES = ["korea_agent", "translator", "foreign_lawyer", "family_viewer", "admin"] as const
const VALID_STATUSES = ["active", "pending", "suspended"] as const

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from("profiles")
      .select(
        `
        *,
        invited_by_profile:profiles!profiles_invited_by_fkey(id, name, email)
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (role && VALID_ROLES.includes(role as any)) {
      query = query.eq("role", role)
    }

    if (status && VALID_STATUSES.includes(status as any)) {
      query = query.eq("status", status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query

    if (error) {
      logger.error("Failed to fetch users", { error })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Users fetched successfully", {
      count: data?.length || 0,
      total: count || 0,
    })

    return createSuccessResponse({
      users: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    logger.error("Error fetching users", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 목록을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()
    const body = await request.json()

    const { userId, role, status } = body

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID는 필수입니다." },
        { status: 400 }
      )
    }

    const updateData: Partial<{
      role: string
      status: string
    }> = {}

    if (role) {
      if (!VALID_ROLES.includes(role as any)) {
        return NextResponse.json(
          { error: `올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.role = role
    }

    if (status) {
      if (!VALID_STATUSES.includes(status as any)) {
        return NextResponse.json(
          { error: `올바른 상태가 아닙니다. 허용된 상태: ${VALID_STATUSES.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.status = status

      // Set activated_at when status changes to active
      if (status === "active") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("activated_at")
          .eq("id", userId)
          .single()

        if (!(profile as any)?.activated_at) {
          await (supabase as any)
            .from("profiles")
            .update({ activated_at: new Date().toISOString() })
            .eq("id", userId)
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "변경할 필드를 지정해주세요." },
        { status: 400 }
      )
    }

    const { data: user, error } = await (supabase as any)
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update user", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        userId,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 정보 수정에 실패했습니다.",
        500
      )
    }

    logger.info("User updated successfully", { userId, updateData })
    return createSuccessResponse({ user }, "사용자 정보가 수정되었습니다.")
  } catch (error) {
    logger.error("Error updating user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 정보 수정에 실패했습니다.",
      500
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 ID는 필수입니다." },
        { status: 400 }
      )
    }

    // Soft delete: set status to suspended
    const { data: user, error } = await (supabase as any)
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      logger.error("Failed to suspend user", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        userId,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 계정 비활성화에 실패했습니다.",
        500
      )
    }

    logger.info("User suspended successfully", { userId })
    return createSuccessResponse({ user }, "사용자 계정이 비활성화되었습니다.")
  } catch (error) {
    logger.error("Error suspending user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 계정 비활성화에 실패했습니다.",
      500
    )
  }
}
