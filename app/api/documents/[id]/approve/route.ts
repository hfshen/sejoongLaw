import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import {
  createApproval,
  checkApprovalStatus,
  getApprovalChain,
  canUserApprove,
  isVersionReadyForExport,
} from "@/lib/workflow/approval"
import { getVersion } from "@/lib/documents/versioning"
import { updateVersionStatus } from "@/lib/documents/versioning"
import { logAuditEvent, AuditActions } from "@/lib/audit/events"

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
    const targetLang = searchParams.get("targetLang") || "source"

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 })
    }

    // Verify version belongs to document
    const version = await getVersion(versionId)
    if (!version || version.document_id !== documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    const status = await checkApprovalStatus(versionId, targetLang)
    const chain = await getApprovalChain(versionId)

    return createSuccessResponse({ status, chain })
  } catch (error) {
    logger.error("Error fetching approval status", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to fetch approval status",
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

    // Get user role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    const userRole = (profile?.role || "family_viewer") as
      | "korea_agent"
      | "translator"
      | "foreign_lawyer"
      | "family_viewer"
      | "admin"

    const body = await request.json()
    const { versionId, targetLang = "source", decision, comment } = body

    if (!versionId || !decision) {
      return NextResponse.json(
        { error: "versionId and decision are required" },
        { status: 400 }
      )
    }

    if (decision !== "approved" && decision !== "rejected") {
      return NextResponse.json(
        { error: "decision must be 'approved' or 'rejected'" },
        { status: 400 }
      )
    }

    // Verify version belongs to document
    const version = await getVersion(versionId)
    if (!version || version.document_id !== documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Check if user can approve
    if (!canUserApprove(userRole, targetLang)) {
      return NextResponse.json(
        { error: "User does not have permission to approve this document" },
        { status: 403 }
      )
    }

    // Get IP address and user agent
    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      null
    const userAgent = request.headers.get("user-agent") || null

    // Create approval
    const approval = await createApproval({
      versionId,
      targetLang,
      approvedBy: user.id,
      role: userRole,
      decision,
      comment,
      ipAddress,
      userAgent,
    })

    // Update version status if approved
    if (decision === "approved") {
      // Check if all required approvals are obtained
      // Default target languages: en, si, ta
      const targetLangs = ["en", "si", "ta"]
      const isReadyForExport = await isVersionReadyForExport(versionId, targetLangs)

      if (isReadyForExport) {
        // All approvals received - mark as approved and ready for export
        await updateVersionStatus(versionId, "approved")
        logger.info("Version approved and ready for export", {
          versionId,
          documentId,
        })
      } else {
        // Still waiting for more approvals
        await updateVersionStatus(versionId, "pending_approval")
        logger.info("Version partially approved, waiting for more approvals", {
          versionId,
          documentId,
          targetLang,
        })
      }
    } else {
      // Rejected - keep in pending_approval or revert to draft
      await updateVersionStatus(versionId, "pending_approval")
    }

    // Log audit event
    try {
      const { data: document } = await supabase
        .from("documents")
        .select("case_id")
        .eq("id", documentId)
        .single()

      await logAuditEvent({
        caseId: document?.case_id || null,
        entityType: "approval",
        entityId: approval.id,
        action:
          decision === "approved"
            ? AuditActions.APPROVAL_CREATED
            : AuditActions.APPROVAL_REJECTED,
        meta: { target_lang: targetLang, role: userRole },
        actor: user.id,
      })
    } catch (error) {
      logger.error("Failed to log audit event", { error })
    }

    return createSuccessResponse(
      { approval },
      decision === "approved" ? "Document approved" : "Document rejected",
      201
    )
  } catch (error) {
    logger.error("Error creating approval", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to create approval",
      500
    )
  }
}
