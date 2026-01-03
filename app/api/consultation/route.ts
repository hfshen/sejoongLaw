import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  sendConsultationNotificationEmail,
  sendConsultationConfirmationEmail,
} from "@/lib/email/email"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const supabase = await createClient()
    
    const consultation = {
      service: formData.get("service") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Save to Supabase
    const { data, error } = await supabase
      .from("consultations")
      .insert([consultation])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save consultation" },
        { status: 500 }
      )
    }

    // Handle file uploads if any
    const files = formData.getAll("files")
    if (files.length > 0) {
      // Upload files to Supabase Storage
      // Implementation depends on your storage setup
    }

    // Send email notifications
    try {
      // 법무법인으로 알림 이메일 전송
      await sendConsultationNotificationEmail({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        service: consultation.service,
        subject: consultation.subject,
        message: consultation.message,
      })

      // 고객에게 확인 이메일 전송
      await sendConsultationConfirmationEmail({
        name: consultation.name,
        email: consultation.email,
        phone: consultation.phone,
        service: consultation.service,
        subject: consultation.subject,
        message: consultation.message,
      })
    } catch (emailError) {
      // 이메일 전송 실패해도 상담 요청은 저장되도록 함
      console.error("Email sending error:", emailError)
    }

    return NextResponse.json(
      { success: true, id: data.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Consultation API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

