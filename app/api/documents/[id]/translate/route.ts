import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import { getVersion } from "@/lib/documents/versioning"
import { translateVersion, getVersionTranslations } from "@/lib/documents/translation"
import { updateVersionStatus } from "@/lib/documents/versioning"
import { logAuditEvent, AuditActions } from "@/lib/audit/events"
import type { TargetLanguage } from "@/lib/documents/translation"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: documentId } = await params
    const { searchParams } = new URL(request.url)
    const versionId = searchParams.get("versionId")
    const targetLang = searchParams.get("targetLang") as TargetLanguage | null

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 })
    }

    if (!targetLang) {
      return NextResponse.json({ error: "targetLang is required" }, { status: 400 })
    }

    const translations = await getVersionTranslations(versionId, targetLang)

    return createSuccessResponse({ translations })
  } catch (error) {
    logger.error("Error fetching translations", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to fetch translations",
      500
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: documentId } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { versionId, targetLang, sourceLang = "ko" } = body

    if (!versionId || !targetLang) {
      return NextResponse.json(
        { error: "versionId and targetLang are required" },
        { status: 400 }
      )
    }

    // Verify version belongs to document
    const version = await getVersion(versionId)
    if (!version || version.document_id !== documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Update version status
    await updateVersionStatus(versionId, "pending_translation")

    // Translate version
    const translations = await translateVersion(
      versionId,
      sourceLang,
      targetLang as TargetLanguage,
      user.id
    )

    // Log audit event
    try {
      const { data: document } = await supabase
        .from("documents")
        .select("case_id")
        .eq("id", documentId)
        .single()

      await logAuditEvent({
        caseId: document?.case_id || null,
        entityType: "translation",
        entityId: versionId,
        action: AuditActions.TRANSLATION_CREATED,
        meta: { target_lang: targetLang, segment_count: translations.length },
        actor: user.id,
      })
    } catch (error) {
      logger.error("Failed to log audit event", { error })
    }

    return createSuccessResponse(
      { translations, count: translations.length },
      "Translation completed",
      201
    )
  } catch (error) {
    logger.error("Error translating document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to translate document",
      500
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { translationId, approved } = body

    if (!translationId || typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "translationId and approved are required" },
        { status: 400 }
      )
    }

    const { reviewTranslation } = await import("@/lib/documents/translation")
    await reviewTranslation(translationId, user.id, approved)

    // Log audit event
    await logAuditEvent({
      entityType: "translation",
      entityId: translationId,
      action: approved ? AuditActions.TRANSLATION_APPROVED : AuditActions.TRANSLATION_REVIEWED,
      meta: { approved },
      actor: user.id,
    })

    return createSuccessResponse(
      { translationId, approved },
      approved ? "Translation approved" : "Translation reviewed",
      200
    )
  } catch (error) {
    logger.error("Error reviewing translation", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to review translation",
      500
    )
  }
}
