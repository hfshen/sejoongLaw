import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { generatePDF, type DocumentType } from "@/lib/documents/pdf-generator"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const locale = (searchParams.get("locale") || "ko") as "ko" | "en" | "zh-CN"

    const supabase = await createClient()

    const { data: document, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      )
    }

    // PDF 생성
    const pdfDoc = generatePDF(
      document.document_type as DocumentType,
      document.data || {},
      locale
    )

    // PDF를 버퍼로 변환
    const pdfBuffer = Buffer.from(pdfDoc.output("arraybuffer"))

    // 파일명 생성
    const documentTypeNames: Record<DocumentType, string> = {
      agreement: "합의서",
      power_of_attorney: "위임장",
      attorney_appointment: "변호인선임서",
      litigation_power: "소송위임장",
      insurance_consent: "사망보험금지급동의",
    }

    const fileName = `${documentTypeNames[document.document_type as DocumentType]}_${document.name}_${document.date}.pdf`

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      },
    })
  } catch (error: any) {
    console.error("PDF generation error:", error)
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}

