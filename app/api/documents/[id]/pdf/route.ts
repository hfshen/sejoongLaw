import { NextRequest, NextResponse } from "next/server"
import { DOCUMENT_LOCALES } from "@/lib/admin/document-validation"
import {
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  hasDocumentPermission,
} from "@/lib/documents/access"
import { generatePDF } from "@/lib/documents/pdf-generator"
import { type DocumentType } from "@/lib/documents/templates"
import logger from "@/lib/logger"
import { getServiceClient } from "@/lib/supabase/service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getDocumentActor()
    if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const { id } = await params
    if (!DOCUMENT_UUID_PATTERN.test(id)) {
      return NextResponse.json({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await hasDocumentPermission(actor, id, "view"))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const requestedLocale = request.nextUrl.searchParams.get("locale")
    const locale = DOCUMENT_LOCALES.includes(
      requestedLocale as (typeof DOCUMENT_LOCALES)[number]
    )
      ? (requestedLocale as (typeof DOCUMENT_LOCALES)[number])
      : "ko"

    const supabase = getServiceClient()
    const { data: document, error } = await supabase
      .from("documents")
      .select("document_type, data, name, date")
      .eq("id", id)
      .single()

    if (error || !document) {
      return NextResponse.json({ error: "문서를 찾을 수 없습니다." }, { status: 404 })
    }

    const pdfDoc = generatePDF(
      document.document_type as DocumentType,
      document.data || {},
      locale
    )
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"))

    const documentTypeNames: Record<DocumentType, string> = {
      agreement: "합의서",
      power_of_attorney: "위임장",
      attorney_appointment: "변호인선임서",
      litigation_power: "소송위임장",
      insurance_consent: "사망보험금지급동의",
      agreement_old: "합의서-SEJOONG",
      power_of_attorney_old: "위임장-SEJOONG",
      attorney_appointment_old: "변호인선임서-SEJOONG",
      litigation_power_old: "소송위임장-SEJOONG",
      insurance_consent_old: "사망보험금지급동의-SEJOONG",
    }
    const rawName = `${documentTypeNames[document.document_type as DocumentType]}_${document.name}_${document.date}.pdf`
    const asciiName = `document-${id}.pdf`

    logger.info("Document PDF generated", {
      actorUserId: actor.id,
      documentId: id,
      locale,
    })
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(rawName)}`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    logger.error("PDF generation failed", { error })
    return NextResponse.json({ error: "PDF 생성에 실패했습니다." }, { status: 500 })
  }
}
