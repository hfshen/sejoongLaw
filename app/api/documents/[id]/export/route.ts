import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import logger from "@/lib/logger"
import { getVersion } from "@/lib/documents/versioning"
import { generatePDFPackage } from "@/lib/documents/package-generator"
import { isVersionReadyForExport } from "@/lib/workflow/approval"
import { updateVersionStatus } from "@/lib/documents/versioning"
import { logAuditEvent, AuditActions } from "@/lib/audit/events"

interface RouteParams {
  params: Promise<{ id: string }>
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
    const { versionId, targetLangs = ["en"] } = body

    if (!versionId) {
      return NextResponse.json({ error: "versionId is required" }, { status: 400 })
    }

    // Verify version belongs to document
    const version = await getVersion(versionId)
    if (!version || version.document_id !== documentId) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 })
    }

    // Check if version is ready for export
    const ready = await isVersionReadyForExport(versionId, targetLangs)
    if (!ready) {
      return NextResponse.json(
        { error: "Version is not ready for export. All required approvals must be obtained." },
        { status: 400 }
      )
    }

    // Generate PDF package
    const packageResult = await generatePDFPackage(versionId, targetLangs, user.id)

    // Update version status
    await updateVersionStatus(versionId, "exported")

    // Log audit event
    try {
      const { data: document } = await supabase
        .from("documents")
        .select("case_id")
        .eq("id", documentId)
        .single()

      await logAuditEvent({
        caseId: document?.case_id || null,
        entityType: "export",
        entityId: versionId,
        action: AuditActions.EXPORT_CREATED,
        meta: { package_hash: packageResult.hash, target_langs: targetLangs },
        actor: user.id,
      })
    } catch (error) {
      logger.error("Failed to log audit event", { error })
    }

    // Return PDF as response
    return new NextResponse(packageResult.buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document-package-${versionId}.pdf"`,
        "X-Package-Hash": packageResult.hash,
        "X-QR-Code-URL": packageResult.qrCodeUrl,
      },
    })
  } catch (error) {
    logger.error("Error exporting document", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to export document",
      500
    )
  }
}
