import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { phone, code } = await request.json()

    if (!phone || !code) {
      return NextResponse.json(
        { error: "전화번호와 인증번호가 필요합니다." },
        { status: 400 }
      )
    }

    const cookieStore = cookies()
    const storedCode = cookieStore.get(`sms_code_${phone}`)?.value

    if (!storedCode || storedCode !== code) {
      return NextResponse.json(
        { error: "인증번호가 일치하지 않습니다." },
        { status: 400 }
      )
    }

    // 인증 성공 - 쿠키 삭제
    const response = NextResponse.json({ success: true })
    response.cookies.delete(`sms_code_${phone}`)

    return response
  } catch (error: any) {
    console.error("인증번호 확인 오류:", error)
    return NextResponse.json(
      { error: "인증번호 확인에 실패했습니다." },
      { status: 500 }
    )
  }
}

