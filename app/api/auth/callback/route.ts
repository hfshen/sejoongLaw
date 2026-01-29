import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getCurrentUserProfile, getDashboardUrl } from "@/lib/auth/role-guard"
import logger from "@/lib/logger"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const type = requestUrl.searchParams.get("type") // recovery, signup 등
  const next = requestUrl.searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      logger.error("Session exchange error", { error })
      return NextResponse.redirect(
        new URL("/auth/login?error=session_error", requestUrl.origin)
      )
    }

    // Get user profile to determine redirect
    try {
      const profile = await getCurrentUserProfile()
      
      if (profile) {
        // If next is specified and user is admin, use it
        if (next && profile.role === "admin") {
          return NextResponse.redirect(new URL(next, requestUrl.origin))
        }
        
        // Otherwise redirect to role-based dashboard
        const dashboardUrl = getDashboardUrl(profile.role)
        return NextResponse.redirect(new URL(dashboardUrl, requestUrl.origin))
      }
    } catch (profileError) {
      logger.error("Error getting user profile after login", { error: profileError })
      // Fall through to default redirect
    }
  }

  // 비밀번호 재설정 타입인 경우 재설정 페이지로 리다이렉트
  if (type === "recovery") {
    return NextResponse.redirect(new URL("/admin/reset-password", requestUrl.origin))
  }

  // Default redirect
  const redirectUrl = next || "/auth/login"
  return NextResponse.redirect(new URL(redirectUrl, requestUrl.origin))
}

