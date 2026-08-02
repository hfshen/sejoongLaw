import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const requestSchema = z.object({
  text: z.string().trim().min(1).max(3000),
  sourceLanguage: z.enum(["ko", "en", "si", "ta"]).default("si"),
  targetLanguage: z.enum(["ko", "en", "si", "ta"]).default("ko"),
  mode: z.enum(["translate", "guide"]).default("translate"),
  context: z
    .enum([
      "general",
      "airport",
      "workplace",
      "hospital",
      "bank",
      "immigration",
      "housing",
      "remittance",
    ])
    .default("general"),
})

const languageName = {
  ko: "Korean",
  en: "English",
  si: "Sinhala",
  ta: "Tamil",
} as const

function containsLikelySensitiveIdentifier(text: string) {
  const passportLike = /\b[A-Z]{1,2}\d{6,9}\b/i
  const koreanRegistrationLike = /\b\d{6}-?\d{7}\b/
  const cardLike = /\b(?:\d[ -]*?){13,19}\b/
  const accountLike = /\b\d{2,6}[- ]\d{2,6}[- ]\d{2,8}\b/
  return (
    passportLike.test(text) ||
    koreanRegistrationLike.test(text) ||
    cardLike.test(text) ||
    accountLike.test(text)
  )
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const limited = await rateLimit({
      key: `ai:${context.user.id}:${getRequestIp(request)}`,
      limit: 60,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(
        limited,
        "AI request limit exceeded. Please try again later."
      )
    }

    const body = requestSchema.parse(await request.json())
    if (containsLikelySensitiveIdentifier(body.text)) {
      return NextResponse.json(
        {
          error:
            "Please remove passport, foreigner-registration, bank-account, card or other identification numbers before using AI.",
          code: "SENSITIVE_IDENTIFIER_DETECTED",
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "AI language support is not configured.",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 503 }
      )
    }

    const client = new OpenAI({ apiKey, timeout: 15_000, maxRetries: 1 })
    const model = process.env.OPENAI_TRANSLATION_MODEL || "gpt-5"
    const source = languageName[body.sourceLanguage]
    const target = languageName[body.targetLanguage]

    const instructions =
      body.mode === "translate"
        ? `You are a careful interpreter for Sri Lankan workers in Korea. Translate from ${source} to ${target}. Preserve names, dates and non-sensitive numbers exactly. Use natural, respectful language for this context: ${body.context}. Return only the translation. Never add legal, medical, immigration, employment, banking or remittance conclusions.`
        : `You are the multilingual life-navigation assistant inside Sejoong StayCare. Answer in ${target}. Give concise practical next steps for this context: ${body.context}. Clearly separate: (1) what the worker can do, (2) what a government or public authority controls, (3) what Sejoong can review or coordinate, and (4) what a licensed provider must perform. Never promise visa approval, employment, legal outcome, diagnosis, exchange rate, telecom activation, banking approval or provider availability. For immediate danger, direct the user to 112 or 119. For important legal, medical, immigration, labor, banking or remittance decisions, instruct the user to request human confirmation.`

    const response = await client.responses.create({
      model,
      instructions,
      input: body.text,
      max_output_tokens: 900,
      store: false,
    })

    const result = response.output_text.trim()
    if (!result) throw new Error("AI returned an empty result")

    await getServiceClient().from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "ai.request_completed",
      entity_type: "staycare_workers",
      entity_id: context.worker.id,
      metadata: {
        mode: body.mode,
        context: body.context,
        sourceLanguage: body.sourceLanguage,
        targetLanguage: body.targetLanguage,
        model,
        inputCharacters: body.text.length,
        outputCharacters: result.length,
        rateLimitSource: limited.source,
      },
    })

    return NextResponse.json({
      result,
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
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error(
      "StayCare AI error",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Unable to process the AI request right now." },
      { status: 502 }
    )
  }
}
