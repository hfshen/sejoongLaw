import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const getOpenAIClient = () => {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

const SYSTEM_PROMPT = `당신은 법무법인 세중의 전문 법률 상담 AI 어시스턴트입니다.

주요 정보:
- 법무법인 세중은 부동산 분쟁, 이혼 소송, 상속 분쟁, 비자 신청, 기업 자문 등 다양한 법률 서비스를 제공합니다.
- 상담 신청: 웹사이트의 '무료 상담 신청' 페이지 또는 전화(031-8044-8805)
- 온라인 예약: 24시간 언제든지 온라인 예약 가능
- 상담 시간: 평일 오전 9시부터 오후 6시까지
- 주소: 경기 안산시 단원구 원곡로 45 세중빌딩 2층

주의사항:
- 법률적 조언을 제공하지 말고, 일반적인 정보만 제공하세요.
- 구체적인 법률 문제는 반드시 전문 변호사와 상담하도록 안내하세요.
- 친절하고 전문적인 톤으로 답변하세요.
- 한국어로 답변하세요.`

export async function POST(request: NextRequest) {
  try {
    const { message, locale, conversationHistory = [] } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      // OpenAI API 키가 없을 경우 기본 응답
      return NextResponse.json({
        response:
          "죄송합니다. 현재 AI 상담 서비스를 이용할 수 없습니다. 전화(031-8044-8805)로 문의해주시거나 온라인 상담을 신청해주세요.",
      })
    }

    // 대화 기록 구성
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...conversationHistory
        .slice(-10) // 최근 10개 메시지만 사용
        .map((msg: any) => ({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.content,
        })),
      {
        role: "user",
        content: message,
      },
    ]

    // OpenAI API 호출
    const openai = getOpenAIClient()
    if (!openai) {
      return NextResponse.json({
        response:
          "죄송합니다. 현재 AI 상담 서비스를 이용할 수 없습니다. 전화(031-8044-8805)로 문의해주시거나 온라인 상담을 신청해주세요.",
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 비용 효율적인 모델 사용
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const response = completion.choices[0]?.message?.content || 
      "죄송합니다. 응답을 생성하는데 문제가 발생했습니다. 다시 시도해주세요."

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error("AI Chat API error:", error)
    
    // 에러 타입에 따른 처리
    if (error.status === 429) {
      return NextResponse.json(
        { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      )
    }

    return NextResponse.json(
      { 
        error: "AI 상담 서비스에 일시적인 문제가 발생했습니다. 전화(031-8044-8805)로 문의해주시거나 온라인 상담을 신청해주세요.",
        fallback: true
      },
      { status: 500 }
    )
  }
}

