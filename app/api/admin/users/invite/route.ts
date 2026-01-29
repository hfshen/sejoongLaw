import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import { sendInviteEmail } from "@/lib/email/templates/invite-foreign-lawyer"
import logger from "@/lib/logger"
import crypto from "crypto"

const VALID_ROLES = ["korea_agent", "translator", "foreign_lawyer", "family_viewer", "admin"] as const
const TOKEN_EXPIRY_DAYS = 7

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get admin user ID
    const { createClient } = await import("@/lib/supabase/server")
    const regularClient = await createClient()
    const {
      data: { user: adminUser },
    } = await regularClient.auth.getUser()

    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 401 })
    }

    const supabase = getServiceClient()
    const body = await request.json()

    const { email, name, role, country, organization } = body

    // Validation
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: "이메일, 이름, 역할은 필수입니다." },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      )
    }

    // Validate role
    if (!VALID_ROLES.includes(role as any)) {
      return NextResponse.json(
        { error: `올바른 역할이 아닙니다. 허용된 역할: ${VALID_ROLES.join(", ")}` },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email)
    if (existingUser?.user) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      )
    }

    // Check if invitation already exists and is not expired
    const { data: existingInvitation } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("email", email)
      .eq("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: "이미 발송된 초대가 있습니다. 만료 후 다시 시도해주세요." },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS)

    // Invite user via Supabase Auth
    const { data: invitedUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          role,
          country: country || null,
          organization: organization || null,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/accept-invite/${token}`,
      }
    )

    if (inviteError) {
      logger.error("Failed to invite user via Supabase Auth", {
        error: inviteError,
        email,
      })
      return createNextErrorResponse(
        NextResponse,
        inviteError,
        "사용자 초대에 실패했습니다.",
        500
      )
    }

    // Save invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from("user_invitations")
      .insert([
        {
          email,
          token,
          role,
          country: country || null,
          organization: organization || null,
          invited_by: adminUser.id,
          expires_at: expiresAt.toISOString(),
          user_id: invitedUser?.user?.id || null,
        },
      ])
      .select()
      .single()

    if (invitationError) {
      logger.error("Failed to save invitation record", {
        error: invitationError,
        email,
      })
      // Don't fail the request - user is already invited
    }

    // Update profile if user was created
    if (invitedUser?.user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: invitedUser.user.id,
          email: invitedUser.user.email || email,
          name,
          role,
          country: country || null,
          organization: organization || null,
          status: "pending",
          invited_by: adminUser.id,
          invited_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        }
      )

      if (profileError) {
        logger.error("Failed to update profile", {
          error: profileError,
          userId: invitedUser.user.id,
        })
        // Don't fail the request
      }
    }

    // Send invitation email
    try {
      const emailResult = await sendInviteEmail({
        email,
        name,
        role,
        country: country || null,
        organization: organization || null,
        inviteToken: token,
        invitedBy: adminUser.email || undefined,
      })

      if (!emailResult.success) {
        logger.warn("Failed to send invitation email", {
          error: emailResult.error,
          email,
        })
        // Don't fail the request - user is already invited
      }
    } catch (emailError) {
      logger.error("Error sending invitation email", {
        error: emailError,
        email,
      })
      // Don't fail the request
    }

    logger.info("User invited successfully", {
      email,
      role,
      invitedBy: adminUser.id,
    })

    return createSuccessResponse(
      {
        user: invitedUser?.user || null,
        invitation: invitation || null,
      },
      "사용자 초대가 완료되었습니다.",
      201
    )
  } catch (error) {
    logger.error("Error inviting user", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "사용자 초대에 실패했습니다.",
      500
    )
  }
}
