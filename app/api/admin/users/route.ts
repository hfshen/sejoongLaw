import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"

const VALID_ROLES = [
  "korea_agent",
  "translator",
  "foreign_lawyer",
  "family_viewer",
  "admin",
] as const
const VALID_STATUSES = ["active", "pending", "suspended"] as const
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

type ManagedRole = (typeof VALID_ROLES)[number]
type ManagedStatus = (typeof VALID_STATUSES)[number]

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function normalizeSearch(value: string | null) {
  return (value || "")
    .replace(/[,%()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100)
}

async function activeAdminCount() {
  const supabase = getServiceClient()
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin")
    .eq("status", "active")

  if (error) throw error
  return count || 0
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
    const role = searchParams.get("role")
    const status = searchParams.get("status")
    const search = normalizeSearch(searchParams.get("search"))
    const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10)
    const requestedLimit = Number.parseInt(searchParams.get("limit") || "50", 10)
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(100, Math.max(1, requestedLimit))
      : 50
    const offset = (page - 1) * limit

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

    if (role && VALID_ROLES.includes(role as ManagedRole)) {
      query = query.eq("role", role)
    }

    if (status && VALID_STATUSES.includes(status as ManagedStatus)) {
      query = query.eq("status", status)
    }

    if (search) {
      const pattern = `%${search}%`
      query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`)
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
      actorUserId: admin.id,
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
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const body = await request.json()
    const userId = typeof body.userId === "string" ? body.userId : ""
    const role = body.role as ManagedRole | undefined
    const status = body.status as ManagedStatus | undefined

    if (!UUID_PATTERN.test(userId)) {
      return badRequest("올바른 사용자 ID가 필요합니다.")
    }
    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return badRequest(`올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}`)
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return badRequest(`올바른 상태가 아닙니다. 허용된 상태: ${VALID_STATUSES.join(", ")}`)
    }
    if (role === undefined && status === undefined) {
      return badRequest("변경할 필드를 지정해 주세요.")
    }

    const supabase = getServiceClient()
    const { data: current, error: currentError } = await supabase
      .from("profiles")
      .select("id, role, status, activated_at")
      .eq("id", userId)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    const removesActiveAdmin =
      current.role === "admin" &&
      current.status === "active" &&
      ((role !== undefined && role !== "admin") ||
        (status !== undefined && status !== "active"))

    if (userId === admin.id && removesActiveAdmin) {
      return badRequest("현재 로그인한 관리자 자신의 권한이나 상태는 해제할 수 없습니다.")
    }
    if (removesActiveAdmin && (await activeAdminCount()) <= 1) {
      return badRequest("최소 한 명의 활성 관리자를 유지해야 합니다.")
    }

    const updateData: Partial<{
      role: ManagedRole
      status: ManagedStatus
      activated_at: string
    }> = {}
    if (role !== undefined) updateData.role = role
    if (status !== undefined) {
      updateData.status = status
      if (status === "active" && !current.activated_at) {
        updateData.activated_at = new Date().toISOString()
      }
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update user", {
        error,
        actorUserId: admin.id,
        targetUserId: userId,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 정보 수정에 실패했습니다.",
        500
      )
    }

    logger.info("User updated successfully", {
      actorUserId: admin.id,
      targetUserId: userId,
      updateData,
    })
    return createSuccessResponse({ user }, "사용자 정보가 수정되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
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
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || ""
    if (!UUID_PATTERN.test(userId)) {
      return badRequest("올바른 사용자 ID가 필요합니다.")
    }
    if (userId === admin.id) {
      return badRequest("현재 로그인한 관리자 자신의 계정은 정지할 수 없습니다.")
    }

    const supabase = getServiceClient()
    const { data: current, error: currentError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", userId)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }
    if (
      current.role === "admin" &&
      current.status === "active" &&
      (await activeAdminCount()) <= 1
    ) {
      return badRequest("최소 한 명의 활성 관리자를 유지해야 합니다.")
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .update({ status: "suspended" })
      .eq("id", userId)
      .select()
      .single()

    if (error) {
      logger.error("Failed to suspend user", {
        error,
        actorUserId: admin.id,
        targetUserId: userId,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "사용자 계정 비활성화에 실패했습니다.",
        500
      )
    }

    logger.info("User suspended successfully", {
      actorUserId: admin.id,
      targetUserId: userId,
    })
    return createSuccessResponse({ user }, "사용자 계정이 비활성화되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error suspending user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 계정 비활성화에 실패했습니다.",
      500
    )
  }
}
