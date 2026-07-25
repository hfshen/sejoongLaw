import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    const cookieStore = await cookies()
    cookieStore.delete("admin_session")

    const response = NextResponse.json({ success: true })
    response.headers.set("Cache-Control", "private, no-store, max-age=0")
    return response
  } catch {
    return NextResponse.json(
      { error: "로그아웃 처리에 실패했습니다." },
      { status: 500 }
    )
  }
}
