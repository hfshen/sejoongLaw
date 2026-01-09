import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") // recovery, signup 등
  const next = requestUrl.searchParams.get("next") ?? "/"

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error("Session exchange error:", error)
    }
  }

  // 비밀번호 재설정 타입인 경우 재설정 페이지로 리다이렉트
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/admin/reset-password", requestUrl.origin))
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin))
}

