import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import { sendInviteEmail } from "@/lib/email/templates/invite-foreign-lawyer"
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
const TOKEN_EXPIRY_DAYS = 7

type ManagedRole = (typeof VALID_ROLES)[number]

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function siteOrigin() {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  try {
    return new URL(configured).origin
  } catch {
    return "http://localhost:3000"
  }
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const admin = await getAuthenticatedBackofficeProfile(["admin"])
    if (!admin) return forbidden()

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 100) : ""
    const role = body.role as ManagedRole | undefined
    const country =
      typeof body.country === "string" ? body.country.trim().slice(0, 100) || null : null
    const organization =
      typeof body.organization === "string"
        ? body.organization.trim().slice(0, 200) || null
        : null

    if (!email || !name || !role) {
      return badRequest("이메일, 이름, 역할은 필수입니다.")
    }
    if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return badRequest("올바른 이메일 형식이 아닙니다.")
    }
    if (!VALID_ROLES.includes(role)) {
      return badRequest(`올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}`)
    }

    const supabase = getServiceClient()
    const { data: existingProfile, error: profileLookupError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle()

    if (profileLookupError) {
      throw profileLookupError
    }
    if (existingProfile) {
      return badRequest("이미 등록된 이메일입니다.")
    }

    const { data: existingInvitation, error: invitationLookupError } = await supabase
      .from("user_invitations")
      .select("id")
      .eq("email", email)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle()

    if (invitationLookupError) {
      throw invitationLookupError
    }
    if (existingInvitation) {
      return badRequest("이미 유효한 초대가 있습니다. 기존 초대를 확인해 주세요.")
    }

    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS)

    const redirectTo = `${siteOrigin()}/accept-invite/${token}`
    const { data: invitedUser, error: inviteError } =
      await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
          name,
          role,
          country,
          organization,
        },
        redirectTo,
      })

    if (inviteError || !invitedUser.user) {
      logger.error("Failed to invite user via Supabase Auth", {
        error: inviteError,
        actorUserId: admin.id,
      })
      return createNextErrorResponse(
        NextResponse,
        inviteError || new Error("Supabase did not return an invited user"),
        "사용자 초대에 실패했습니다.",
        500
      )
    }

    const invitedUserId = invitedUser.user.id
    const rollbackInvitation = async () => {
      await supabase.from("user_invitations").delete().eq("user_id", invitedUserId)
      await supabase.auth.admin.deleteUser(invitedUserId)
    }

    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .insert({
        email,
        token,
        role,
        country,
        organization,
        invited_by: admin.id,
        expires_at: expiresAt.toISOString(),
        user_id: invitedUserId,
      })
      .select()
      .single()

    if (invitationError || !invitation) {
      await rollbackInvitation()
      logger.error("Failed to save invitation record", {
        error: invitationError,
        actorUserId: admin.id,
        invitedUserId,
      })
      return createNextErrorResponse(
        NextResponse,
        invitationError || new Error("Invitation record was not created"),
        "사용자 초대 정보를 저장하지 못했습니다.",
        500
      )
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: invitedUserId,
        email: invitedUser.user.email || email,
        name,
        role,
        country,
        organization,
        status: "pending",
        invited_by: admin.id,
        invited_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    )

    if (profileError) {
      await rollbackInvitation()
      logger.error("Failed to create invited profile", {
        error: profileError,
        actorUserId: admin.id,
        invitedUserId,
      })
      return createNextErrorResponse(
        NextResponse,
        profileError,
        "초대 사용자 프로필을 만들지 못했습니다.",
        500
      )
    }

    try {
      const emailResult = await sendInviteEmail({
        email,
        name,
        role,
        country,
        organization,
        inviteToken: token,
        invitedBy: admin.email || undefined,
      })

      if (!emailResult.success) {
        logger.warn("Custom invitation email delivery failed", {
          error: emailResult.error,
          actorUserId: admin.id,
          invitedUserId,
        })
      }
    } catch (emailError) {
      logger.error("Custom invitation email delivery threw", {
        error: emailError,
        actorUserId: admin.id,
        invitedUserId,
      })
    }

    logger.info("User invited successfully", {
      actorUserId: admin.id,
      invitedUserId,
      role,
    })

    return createSuccessResponse(
      {
        user: invitedUser.user,
        invitation,
      },
      "사용자 초대가 완료되었습니다.",
      201
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error inviting user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 초대에 실패했습니다.",
      500
    )
  }
}
