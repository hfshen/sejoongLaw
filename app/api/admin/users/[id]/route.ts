import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

const VALID_ROLES = ["korea_agent", "translator", "foreign_lawyer", "family_viewer", "admin"] as const
const VALID_STATUSES = ["active", "pending", "suspended"] as const

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
    const supabase = getServiceClient()

    const { data: user, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        invited_by_profile:profiles!profiles_invited_by_fkey(id, name, email)
      `
      )
      .eq("id", id)
      .single()

    if (error) {
      logger.error("Failed to fetch user", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        userId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자를 찾을 수 없습니다.",
        404
      )
    }

    logger.info("User fetched", { userId: id })
    return createSuccessResponse({ user })
  } catch (error) {
    logger.error("Error fetching user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자를 불러오는데 실패했습니다.",
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
    const supabase = getServiceClient()
    const body = await request.json()

    const { name, email, phone, role, country, organization, status } = body

    const updateData: Partial<{
      name: string | null
      email: string | null
      phone: string | null
      role: string
      country: string | null
      organization: string | null
      status: string
    }> = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role as any)) {
        return NextResponse.json(
          { error: `올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}` },
          { status: 400 }
        )
      }
      updateData.role = role
    }
    if (country !== undefined) updateData.country = country
    if (organization !== undefined) updateData.organization = organization
    if (status !== undefined) {
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
          .eq("id", id)
          .single()

        if (!profile?.activated_at) {
          await supabase
            .from("profiles")
            .update({ activated_at: new Date().toISOString() })
            .eq("id", id)
        }
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "변경할 필드를 지정해주세요." },
        { status: 400 }
      )
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update user", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        userId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 정보 수정에 실패했습니다.",
        500
      )
    }

    logger.info("User updated", { userId: id })
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
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    const supabase = getServiceClient()

    if (action === "activate") {
      const { data: user, error } = await supabase
        .from("profiles")
        .update({
          status: "active",
          activated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        logger.error("Failed to activate user", {
          error,
          userId: id,
        })
        return createNextErrorResponse(
          NextResponse,
          error,
          "계정 활성화에 실패했습니다.",
          500
        )
      }

      logger.info("User activated", { userId: id })
      return createSuccessResponse({ user }, "계정이 활성화되었습니다.")
    }

    if (action === "suspend") {
      const { data: user, error } = await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", id)
        .select()
        .single()

      if (error) {
        logger.error("Failed to suspend user", {
          error,
          userId: id,
        })
        return createNextErrorResponse(
          NextResponse,
          error,
          "계정 일시 정지에 실패했습니다.",
          500
        )
      }

      logger.info("User suspended", { userId: id })
      return createSuccessResponse({ user }, "계정이 일시 정지되었습니다.")
    }

    return NextResponse.json(
      { error: `알 수 없는 액션: ${action}` },
      { status: 400 }
    )
  } catch (error) {
    logger.error("Error performing user action", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "작업 실행에 실패했습니다.",
      500
    )
  }
}
