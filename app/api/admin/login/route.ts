import { NextRequest, NextResponse } from "next/server"
import { BACKOFFICE_ROLES } from "@/lib/admin/auth"
import { getDashboardUrl, type UserRole } from "@/lib/auth/role-guard"
import { safeInternalPath } from "@/lib/auth/redirects"
import { requireTrustedOrigin } from "@/lib/security/request"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function allowedDestination(role: UserRole, requestedNext: string) {
  const fallback = getDashboardUrl(role)
  if (!requestedNext || !requestedNext.startsWith("/admin")) return fallback
  if (role === "admin") return requestedNext

  if (role === "korea_agent") {
    return requestedNext === "/admin/cases" || requestedNext.startsWith("/admin/cases/")
      ? requestedNext
      : fallback
  }

  if (["translator", "foreign_lawyer", "family_viewer"].includes(role)) {
    return requestedNext === "/admin/documents" || requestedNext.startsWith("/admin/documents/")
      ? requestedNext
      : fallback
  }

  return fallback
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)

    const body = await request.json()
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
    const password = typeof body.password === "string" ? body.password : ""
    const requestedNext = safeInternalPath(
      typeof body.next === "string" ? body.next : null,
      ""
    )

    if (
      !email ||
      !password ||
      email.length > 320 ||
      password.length > 200 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return jsonNoStore(
        { error: "이메일과 비밀번호를 올바르게 입력해 주세요." },
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
      return jsonNoStore(
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

    const role = profile?.role as UserRole | undefined
    if (
      profileError ||
      !profile ||
      profile.status !== "active" ||
      !role ||
      !BACKOFFICE_ROLES.includes(role)
    ) {
      await supabase.auth.signOut()
      return jsonNoStore(
        {
          error:
            profile?.status === "suspended"
              ? "Account suspended"
              : profile?.status === "pending"
                ? "Account inactive"
                : "Insufficient permissions",
        },
        { status: 403 }
      )
    }

    return jsonNoStore({
      success: true,
      redirectTo: allowedDestination(role, requestedNext),
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return jsonNoStore({ error: "허용되지 않은 요청입니다." }, { status: 403 })
    }

    return jsonNoStore(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}
