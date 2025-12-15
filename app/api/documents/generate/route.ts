import { NextRequest, NextResponse } from "next/server"
import { jsPDF } from "jspdf"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { templateId, name, email, phone, details } = data

    // PDF 생성
    const doc = new jsPDF()

    // 헤더
    doc.setFontSize(20)
    doc.text("법무법인 세중", 105, 20, { align: "center" })
    doc.setFontSize(16)
    doc.text("법률 문서", 105, 30, { align: "center" })

    // 구분선
    doc.line(20, 35, 190, 35)

    // 기본 정보
    let yPos = 45
    doc.setFontSize(12)
    doc.text(`이름: ${name}`, 20, yPos)
    yPos += 10
    doc.text(`이메일: ${email}`, 20, yPos)
    yPos += 10
    doc.text(`연락처: ${phone}`, 20, yPos)
    yPos += 15

    // 상세 정보
    if (details) {
      Object.entries(details).forEach(([key, value]) => {
        if (value) {
          doc.text(`${key}: ${value}`, 20, yPos)
          yPos += 10
        }
      })
    }

    // 푸터
    yPos = 280
    doc.line(20, yPos, 190, yPos)
    yPos += 10
    doc.setFontSize(10)
    doc.text("법무법인 세중 | 서울시 서초구 서초대로 272, 10층", 105, yPos, {
      align: "center",
    })
    yPos += 5
    doc.text("전화: 02) 591-0372 | 이메일: info@sejoonglaw.com", 105, yPos, {
      align: "center",
    })

    // PDF를 버퍼로 변환
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // 이메일 발송 (실제로는 이메일 서비스 사용)
    // await sendDocumentEmail(email, pdfBuffer, templateId)

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="document.pdf"`,
      },
    })
  } catch (error) {
    console.error("Document generation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

