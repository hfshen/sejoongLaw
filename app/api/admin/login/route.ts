import { NextRequest, NextResponse } from "next/server"
import { BACKOFFICE_ROLES } from "@/lib/admin/auth"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해 주세요." },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError || !data.user) {
      const message = signInError?.message.toLowerCase() || ""
      return NextResponse.json(
        {
          error: message.includes("email not confirmed")
            ? "Email not confirmed"
            : "Invalid login credentials",
        },
        { status: 401 }
      )
    }

    const serviceClient = getServiceClient()
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, email, name, role, status")
      .eq("id", data.user.id)
      .single()

    if (
      profileError ||
      !profile ||
      profile.status !== "active" ||
      !BACKOFFICE_ROLES.includes(profile.role as (typeof BACKOFFICE_ROLES)[number])
    ) {
      await supabase.auth.signOut()
      return NextResponse.json(
        {
          error:
            profile?.status === "suspended"
              ? "Account suspended"
              : "Insufficient permissions",
        },
        { status: 403 }
      )
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
      },
    })
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
    return response
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
