import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      )
    }

    // 환경 변수에서 관리자 이메일/비밀번호 확인
    // .env.local의 13-14번째 줄: GMAIL_USER와 GMAIL_APP_PASSWORD 사용
    const adminEmail = process.env.GMAIL_USER
    const adminPassword = process.env.GMAIL_APP_PASSWORD

    // 환경 변수가 설정되어 있으면 직접 인증 사용
    if (adminEmail && adminPassword) {
      const trimmedEmail = email.trim()
      const emailMatch = trimmedEmail === adminEmail || trimmedEmail.toLowerCase() === adminEmail.toLowerCase()
      const passwordMatch = password === adminPassword
      
      // 디버깅을 위한 로그 (개발 환경에서만)
      if (process.env.NODE_ENV === "development") {
        console.log("Login attempt:", {
          providedEmail: trimmedEmail,
          expectedEmail: adminEmail,
          emailMatch,
          passwordMatch: passwordMatch ? "matched" : "not matched",
          hasAdminEmail: !!adminEmail,
          hasAdminPassword: !!adminPassword,
        })
      }
      
      if (emailMatch && passwordMatch) {
        // 로그인 성공 - 세션 쿠키 설정
        const cookieStore = await cookies()
        cookieStore.set("admin_session", "authenticated", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7일
          path: "/",
        })

        return NextResponse.json({ 
          success: true, 
          user: {
            email: adminEmail,
          }
        })
      } else {
        return NextResponse.json(
          { error: "Invalid login credentials" },
          { status: 401 }
        )
      }
    } else {
      // 환경 변수가 없으면 콘솔에 경고
      if (process.env.NODE_ENV === "development") {
        console.warn("Admin login: GMAIL_USER or GMAIL_APP_PASSWORD not set, falling back to Supabase auth")
      }
    }

    // Supabase 인증 확인 (환경 변수가 없을 경우)
    const supabase = await createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      // 에러 메시지를 더 자세히 반환
      let errorMessage = "로그인에 실패했습니다."
      
      if (signInError.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid login credentials"
      } else if (signInError.message.includes("Email not confirmed")) {
        errorMessage = "Email not confirmed"
      } else if (signInError.message.includes("User not found")) {
        errorMessage = "User not found"
      } else {
        errorMessage = signInError.message
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "사용자 정보를 찾을 수 없습니다." },
        { status: 401 }
      )
    }

    // 로그인 성공 - 세션 쿠키 설정
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    })

    return NextResponse.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
      }
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    )
  }
}

