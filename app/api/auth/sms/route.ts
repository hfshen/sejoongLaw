import { NextRequest, NextResponse } from "next/server"
import coolsms from "coolsms-node-sdk"

const messageService = new coolsms(
  process.env.COOLSMS_API_KEY!,
  process.env.COOLSMS_API_SECRET!
)

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { error: "전화번호가 필요합니다." },
        { status: 400 }
      )
    }

    // 6자리 인증번호 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // 인증번호를 세션에 저장 (실제로는 Redis나 DB에 저장해야 함)
    // 여기서는 간단히 쿠키에 저장
    const response = NextResponse.json({ success: true })
    response.cookies.set(`sms_code_${phone}`, code, {
      httpOnly: true,
      maxAge: 300, // 5분
    })

    // SMS 발송
    await messageService.sendOne({
      to: phone,
      from: process.env.COOLSMS_SENDER_PHONE!,
      text: `[법무법인 세중] 인증번호는 ${code}입니다.`,
      autoTypeDetect: true,
    })

    return response
  } catch (error: any) {
    console.error("SMS 발송 오류:", error)
    return NextResponse.json(
      { error: "SMS 발송에 실패했습니다." },
      { status: 500 }
    )
  }
}

