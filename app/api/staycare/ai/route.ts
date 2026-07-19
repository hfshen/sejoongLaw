import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

export const runtime = "nodejs"

const requestSchema = z.object({
  text: z.string().trim().min(1).max(3000),
  sourceLanguage: z.enum(["ko", "en", "si"]).default("si"),
  targetLanguage: z.enum(["ko", "en", "si"]).default("ko"),
  mode: z.enum(["translate", "guide"]).default("translate"),
  context: z.enum(["general", "airport", "workplace", "hospital", "bank", "immigration", "housing", "remittance"]).default("general"),
})

const languageName = {
  ko: "Korean",
  en: "English",
  si: "Sinhala",
} as const

function containsLikelySensitiveIdentifier(text: string) {
  const passportLike = /\b[A-Z]{1,2}\d{6,9}\b/i
  const koreanRegistrationLike = /\b\d{6}-?\d{7}\b/
  const cardLike = /\b(?:\d[ -]*?){13,19}\b/
  return passportLike.test(text) || koreanRegistrationLike.test(text) || cardLike.test(text)
}

export async function POST(request: NextRequest) {
  try {
    const body = requestSchema.parse(await request.json())

    if (containsLikelySensitiveIdentifier(body.text)) {
      return NextResponse.json(
        {
          error: "Please remove passport, foreigner-registration, bank-card or other identification numbers before using AI translation.",
          code: "SENSITIVE_IDENTIFIER_DETECTED",
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI translation is not configured yet. Set OPENAI_API_KEY in the server environment.",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 503 }
      )
    }

    const client = new OpenAI({ apiKey })
    const model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5"
    const source = languageName[body.sourceLanguage]
    const target = languageName[body.targetLanguage]

    const instructions = body.mode === "translate"
      ? `You are a careful interpreter for Sri Lankan workers living in Korea. Translate from ${source} to ${target}. Preserve names, dates and numbers exactly. Use natural, respectful language suitable for the selected context: ${body.context}. Return only the translated text. Do not add legal or medical conclusions.`
      : `You are a multilingual Korea-life guide for Sri Lankan workers. Answer in ${target}. Explain the practical next steps for the selected context: ${body.context}. Clearly separate (1) what the worker can do, (2) what a Korean government/public authority controls, and (3) what Sejoong or a licensed provider can assist with. Do not promise visa approval, employment outcomes, legal results, exchange rates or provider availability. Keep the response concise and actionable.`

    const response = await client.responses.create({
      model,
      instructions,
      input: body.text,
      store: false,
    })

    return NextResponse.json({
      result: response.output_text,
      sourceLanguage: body.sourceLanguage,
      targetLanguage: body.targetLanguage,
      mode: body.mode,
      context: body.context,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid AI request", details: error.flatten() },
        { status: 400 }
      )
    }

    console.error("StayCare AI error", error)
    return NextResponse.json(
      { error: "Unable to process the AI request right now." },
      { status: 500 }
    )
  }
}
