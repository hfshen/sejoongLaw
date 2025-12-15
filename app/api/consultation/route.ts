import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    // Send email notification (implement with your email service)
    // await sendEmailNotification(consultation)

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

