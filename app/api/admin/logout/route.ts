import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { requireTrustedOrigin } from "@/lib/security/request"
import { createClient } from "@/lib/supabase/server"

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)

    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    // Remove the legacy cookie during the migration window. It is no longer
    // accepted by any authentication guard.
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")

    return jsonNoStore({ success: true })
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return jsonNoStore({ error: "허용되지 않은 요청입니다." }, { status: 403 })
    }

    return jsonNoStore(
      { error: "로그아웃 처리에 실패했습니다." },
      { status: 500 }
    )
  }
}
