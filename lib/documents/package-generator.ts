// PDF package generator with audit trail and QR verification
import { jsPDF } from "jspdf"
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"
import { getVersion, type DocumentVersion } from "./versioning"
import { getVersionSegments } from "./segmentation"
import { getTranslatedText } from "./translation"
import { getApprovalChain } from "@/lib/workflow/approval"
import { getAuditTrail } from "@/lib/audit/events"
import { calculateSHA256 } from "./versioning"
import type { TargetLanguage } from "./translation"

export interface PDFPackage {
  buffer: Buffer
  hash: string
  qrCodeUrl: string
}

/**
 * Generate QR code data URL (simple implementation)
 * In production, use a proper QR code library like 'qrcode'
 */
function generateQRCodeDataURL(text: string): string {
  // For now, return a placeholder. In production, use:
  // import QRCode from 'qrcode'
  // return await QRCode.toDataURL(text)
  
  // Placeholder: return a simple text representation
  // This should be replaced with actual QR code generation
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><text x="10" y="100">${text}</text></svg>`
  ).toString("base64")}`
}

/**
 * Generate verification URL for a version
 */
export function generateVerificationUrl(versionId: string, hash: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  return `${baseUrl}/verify/${versionId}?hash=${hash}`
}

/**
 * Generate audit trail page for PDF
 */
function generateAuditTrailPage(
  doc: jsPDF,
  approvals: any[],
  auditEvents: any[],
  yStart: number
): number {
  let yPos = yStart

  doc.setFontSize(16)
  doc.text("Audit Trail / 감사 추적", 105, yPos, { align: "center" })
  yPos += 15

  // Approvals section
  doc.setFontSize(12)
  doc.text("Approvals / 승인 이력", 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  if (approvals.length === 0) {
    doc.text("No approvals recorded.", 20, yPos)
    yPos += 7
  } else {
    for (const approval of approvals) {
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      const decisionText = approval.decision === "approved" ? "Approved" : "Rejected"
      const date = new Date(approval.created_at).toLocaleString()
      doc.text(
        `${decisionText} by ${approval.role} on ${date}`,
        20,
        yPos
      )
      yPos += 7

      if (approval.comment) {
        doc.setFontSize(8)
        doc.text(`Comment: ${approval.comment}`, 25, yPos, { maxWidth: 165 })
        yPos += 10
        doc.setFontSize(10)
      }
    }
  }

  yPos += 5

  // Audit events section
  doc.setFontSize(12)
  doc.text("Activity Log / 활동 로그", 20, yPos)
  yPos += 10

  doc.setFontSize(10)
  if (auditEvents.length === 0) {
    doc.text("No audit events recorded.", 20, yPos)
    yPos += 7
  } else {
    for (const event of auditEvents.slice(-20)) {
      // Show last 20 events
      if (yPos > 250) {
        doc.addPage()
        yPos = 20
      }

      const date = new Date(event.created_at).toLocaleString()
      doc.text(`${event.action} - ${date}`, 20, yPos, { maxWidth: 170 })
      yPos += 7
    }
  }

  return yPos
}

/**
 * Generate PDF package with source, translations, and audit trail
 */
export async function generatePDFPackage(
  versionId: string,
  targetLangs: TargetLanguage[] = ["en"],
  exportedBy: string
): Promise<PDFPackage> {
  const supabase = await createClient()

  // Get version
  const version = await getVersion(versionId)
  if (!version) {
    throw new Error("Version not found")
  }

  // Get document
  const { data: document, error: docError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", version.document_id)
    .single()

  if (docError || !document) {
    throw new Error("Document not found")
  }

  // Get case
  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", document.case_id)
    .single()

  // Get segments
  const segments = await getVersionSegments(versionId)

  // Get approvals
  const approvals = await getApprovalChain(versionId)

  // Get audit trail
  const auditEvents = caseData
    ? await getAuditTrail(caseData.id)
    : []

  // Create PDF
  const doc = new jsPDF()
  let yPos = 20

  // Title page
  doc.setFontSize(18)
  doc.text("Legal Document Package", 105, yPos, { align: "center" })
  yPos += 10

  doc.setFontSize(12)
  doc.text(`Document: ${document.name}`, 105, yPos, { align: "center" })
  yPos += 10

  doc.setFontSize(10)
  doc.text(`Version: ${version.version_no}`, 105, yPos, { align: "center" })
  yPos += 10
  doc.text(`Hash: ${version.sha256.substring(0, 32)}...`, 105, yPos, { align: "center" })
  yPos += 20

  // Source document (Korean)
  doc.addPage()
  yPos = 20
  doc.setFontSize(16)
  doc.text("Source Document (Korean) / 원본 문서", 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  for (const segment of segments) {
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    doc.text(segment.source_text, 20, yPos, { maxWidth: 170 })
    yPos += doc.getTextDimensions(segment.source_text, { maxWidth: 170 }).h + 5
  }

  // Translation pages
  for (const lang of targetLangs) {
    try {
      const translatedText = await getTranslatedText(versionId, lang)

      doc.addPage()
      yPos = 20
      doc.setFontSize(16)
      const langLabel = lang === "en" ? "English Translation" : `Translation (${lang})`
      doc.text(langLabel, 105, yPos, { align: "center" })
      yPos += 15

      doc.setFontSize(10)
      const lines = translatedText.split("\n")
      for (const line of lines) {
        if (yPos > 250) {
          doc.addPage()
          yPos = 20
        }
        doc.text(line, 20, yPos, { maxWidth: 170 })
        yPos += 7
      }
    } catch (error) {
      logger.error("Failed to add translation page", { error, versionId, lang })
      // Continue with other languages
    }
  }

  // Audit trail page
  doc.addPage()
  yPos = generateAuditTrailPage(doc, approvals, auditEvents, 20)

  // QR code page
  doc.addPage()
  yPos = 20
  doc.setFontSize(16)
  doc.text("Verification / 검증", 105, yPos, { align: "center" })
  yPos += 15

  doc.setFontSize(10)
  const verificationUrl = generateVerificationUrl(versionId, version.sha256)
  doc.text("Scan QR code or visit URL to verify:", 20, yPos)
  yPos += 10

  // Generate QR code (placeholder for now)
  const qrDataUrl = generateQRCodeDataURL(verificationUrl)
  
  // Add QR code image (if we had a proper QR library)
  // For now, just add the URL as text
  doc.setFontSize(8)
  doc.text(verificationUrl, 20, yPos, { maxWidth: 170 })
  yPos += 20

  doc.setFontSize(10)
  doc.text(`Version Hash: ${version.sha256}`, 20, yPos)
  yPos += 10
  doc.text(`Created: ${new Date(version.created_at).toLocaleString()}`, 20, yPos)

  // Generate PDF buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

  // Calculate package hash
  const packageHash = calculateSHA256(pdfBuffer)

  // Save to Supabase Storage
  const storagePath = `exports/${versionId}/${packageHash}.pdf`
  const { error: uploadError } = await supabase.storage
    .from("exports")
    .upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: false,
    })

  if (uploadError) {
    logger.error("Failed to upload PDF package", { error: uploadError, versionId })
    throw new Error("Failed to upload PDF package")
  }

  // Save export package metadata
  const { error: exportError } = await supabase.from("export_packages").insert({
    version_id: versionId,
    package_hash: packageHash,
    qr_code_url: verificationUrl,
    storage_path: storagePath,
    exported_by: exportedBy,
  })

  if (exportError) {
    logger.error("Failed to save export package metadata", { error: exportError, versionId })
    // Don't throw - PDF is already generated
  }

  logger.info("PDF package generated", {
    versionId,
    packageHash,
    storagePath,
    exportedBy,
  })

  return {
    buffer: pdfBuffer,
    hash: packageHash,
    qrCodeUrl: verificationUrl,
  }
}
