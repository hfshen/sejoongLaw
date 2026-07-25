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

async function ensureAdmin() {
  return getAuthenticatedBackofficeProfile(["admin"])
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

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== "string") return undefined
  return value.trim().slice(0, maxLength) || null
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 사용자 ID가 필요합니다.")

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

    if (error || !user) {
      return createNextErrorResponse(
        NextResponse,
        error || new Error("User not found"),
        "사용자를 찾을 수 없습니다.",
        404
      )
    }

    logger.info("User fetched", { actorUserId: admin.id, targetUserId: id })
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
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 사용자 ID가 필요합니다.")

    const body = await request.json()
    const role = body.role as ManagedRole | undefined
    const status = body.status as ManagedStatus | undefined
    const name = optionalText(body.name, 100)
    const email = optionalText(body.email, 320)
    const phone = optionalText(body.phone, 30)
    const country = optionalText(body.country, 100)
    const organization = optionalText(body.organization, 200)

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return badRequest(`올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}`)
    }
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return badRequest(`올바른 상태가 아닙니다. 허용된 상태: ${VALID_STATUSES.join(", ")}`)
    }
    if (email !== undefined && email !== null && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("올바른 이메일 형식이 아닙니다.")
    }

    const supabase = getServiceClient()
    const { data: current, error: currentError } = await supabase
      .from("profiles")
      .select("id, email, role, status, activated_at")
      .eq("id", id)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }

    const removesActiveAdmin =
      current.role === "admin" &&
      current.status === "active" &&
      ((role !== undefined && role !== "admin") ||
        (status !== undefined && status !== "active"))

    if (id === admin.id && removesActiveAdmin) {
      return badRequest("현재 로그인한 관리자 자신의 권한이나 상태는 해제할 수 없습니다.")
    }
    if (removesActiveAdmin && (await activeAdminCount()) <= 1) {
      return badRequest("최소 한 명의 활성 관리자를 유지해야 합니다.")
    }

    const updateData: Partial<{
      name: string | null
      email: string | null
      phone: string | null
      role: ManagedRole
      country: string | null
      organization: string | null
      status: ManagedStatus
      activated_at: string
    }> = {}

    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (role !== undefined) updateData.role = role
    if (country !== undefined) updateData.country = country
    if (organization !== undefined) updateData.organization = organization
    if (status !== undefined) {
      updateData.status = status
      if (status === "active" && !current.activated_at) {
        updateData.activated_at = new Date().toISOString()
      }
    }

    if (Object.keys(updateData).length === 0) {
      return badRequest("변경할 필드를 지정해 주세요.")
    }

    let authEmailUpdated = false
    if (email !== undefined && email !== null && email !== current.email) {
      const { error: authError } = await supabase.auth.admin.updateUserById(id, {
        email,
      })
      if (authError) {
        return createNextErrorResponse(
          NextResponse,
          authError,
          "인증 이메일 변경에 실패했습니다.",
          500
        )
      }
      authEmailUpdated = true
    }

    const { data: user, error } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error || !user) {
      if (authEmailUpdated && current.email) {
        await supabase.auth.admin.updateUserById(id, { email: current.email })
      }
      logger.error("Failed to update user", {
        error,
        actorUserId: admin.id,
        targetUserId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Updated user was not returned"),
        "사용자 정보 수정에 실패했습니다.",
        500
      )
    }

    logger.info("User updated", {
      actorUserId: admin.id,
      targetUserId: id,
      changedFields: Object.keys(updateData),
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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 사용자 ID가 필요합니다.")

    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")
    if (action !== "activate" && action !== "suspend") {
      return badRequest(`알 수 없는 액션: ${action || "없음"}`)
    }
    if (id === admin.id && action === "suspend") {
      return badRequest("현재 로그인한 관리자 자신의 계정은 정지할 수 없습니다.")
    }

    const supabase = getServiceClient()
    const { data: current, error: currentError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", id)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "사용자를 찾을 수 없습니다." }, { status: 404 })
    }
    if (
      action === "suspend" &&
      current.role === "admin" &&
      current.status === "active" &&
      (await activeAdminCount()) <= 1
    ) {
      return badRequest("최소 한 명의 활성 관리자를 유지해야 합니다.")
    }

    const nextStatus: ManagedStatus = action === "activate" ? "active" : "suspended"
    const update =
      action === "activate"
        ? { status: nextStatus, activated_at: new Date().toISOString() }
        : { status: nextStatus }

    const { data: user, error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", id)
      .select()
      .single()

    if (error || !user) {
      logger.error("Failed to change user status", {
        error,
        actorUserId: admin.id,
        targetUserId: id,
        action,
      })
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Updated user was not returned"),
        action === "activate" ? "계정 활성화에 실패했습니다." : "계정 일시 정지에 실패했습니다.",
        500
      )
    }

    logger.info("User status changed", {
      actorUserId: admin.id,
      targetUserId: id,
      action,
    })
    return createSuccessResponse(
      { user },
      action === "activate" ? "계정이 활성화되었습니다." : "계정이 일시 정지되었습니다."
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error performing user action", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "작업 실행에 실패했습니다.",
      500
    )
  }
}
