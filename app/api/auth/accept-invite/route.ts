import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const supabase = getServiceClient()
    const body = await request.json()

    const { token, password, name, phone } = body

    if (!token || !password) {
      return NextResponse.json(
        { error: "토큰과 비밀번호는 필수입니다." },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "비밀번호는 최소 8자 이상이어야 합니다." },
        { status: 400 }
      )
    }

    // Find invitation by token
    const { data: invitation, error: invitationError } = await (supabase as any)
      .from("user_invitations")
      .select("*")
      .eq("token", token)
      .is("accepted_at", null)
      .single()

    if (invitationError || !invitation) {
      logger.error("Invalid or expired invitation token", {
        error: invitationError,
        token,
      })
      return NextResponse.json(
        { error: "유효하지 않거나 만료된 초대 링크입니다." },
        { status: 400 }
      )
    }

    // Check if invitation is expired
    const inv = invitation as any
    if (new Date(inv.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "초대 링크가 만료되었습니다. 관리자에게 다시 요청해주세요." },
        { status: 400 }
      )
    }

    // Get user by email
    const { data: userData, error: userError } = await (supabase.auth.admin as any).getUserByEmail(
      inv.email
    )

    if (userError || !userData?.user) {
      logger.error("User not found for invitation", {
        error: userError,
        email: inv.email,
      })
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      )
    }

    const userId = userData.user.id

    // Update user password via Supabase Auth Admin API
    const { error: passwordError } = await supabase.auth.admin.updateUserById(userId, {
      password: password,
      email_confirm: true, // Confirm email
    })

    if (passwordError) {
      logger.error("Failed to update password", {
        error: passwordError,
        userId,
      })
      return createNextErrorResponse(
        NextResponse,
        passwordError,
        "비밀번호 설정에 실패했습니다.",
        500
      )
    }

    // Update profile
    const profileUpdate: Partial<{
      name: string | null
      phone: string | null
      status: string
      activated_at: string
    }> = {
      status: "active",
      activated_at: new Date().toISOString(),
    }

    if (name) {
      profileUpdate.name = name
    }
    if (phone) {
      profileUpdate.phone = phone
    }

    // If profile doesn't exist, create it
    const { error: profileError } = await (supabase as any).from("profiles").upsert(
      {
        id: userId,
        email: inv.email,
        name: name || inv.email.split("@")[0],
        phone: phone || null,
        role: inv.role,
        country: inv.country || null,
        organization: inv.organization || null,
        status: "active",
        invited_by: inv.invited_by,
        invited_at: inv.invited_at,
        activated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    )

    if (profileError) {
      logger.error("Failed to update profile", {
        error: profileError,
        userId,
      })
      // Don't fail - password is already set
    }

    // Mark invitation as accepted
    const { error: acceptError } = await (supabase as any)
      .from("user_invitations")
      .update({
        accepted_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq("id", inv.id)

    if (acceptError) {
      logger.error("Failed to mark invitation as accepted", {
        error: acceptError,
        invitationId: inv.id,
      })
      // Don't fail - user is already activated
    }

    logger.info("Invitation accepted successfully", {
      userId,
      email: inv.email,
      role: inv.role,
    })

    return createSuccessResponse(
      {
        userId,
        email: invitation.email,
        role: invitation.role,
      },
      "초대가 수락되었습니다. 로그인해주세요."
    )
  } catch (error) {
    logger.error("Error accepting invitation", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "초대 수락에 실패했습니다.",
      500
    )
  }
}
