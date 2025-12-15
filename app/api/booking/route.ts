import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const data = await request.json()

    // 날짜 형식 변환
    const bookingDate = data.date.includes("T") 
      ? data.date.split("T")[0] 
      : data.date

    const booking = {
      date: bookingDate,
      time: data.time,
      service: data.service,
      name: data.name,
      phone: data.phone,
      email: data.email,
      consultation_type: data.consultationType,
      message: data.message || null,
      status: "pending",
      created_at: new Date().toISOString(),
    }

    // Save to Supabase
    const { data: bookingData, error } = await supabase
      .from("bookings")
      .insert([booking])
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to save booking" },
        { status: 500 }
      )
    }

    // Send confirmation email (implement with your email service)
    // await sendBookingConfirmationEmail(booking)

    // Send SMS notification (optional)
    // await sendSMSNotification(booking.phone, `예약이 완료되었습니다: ${data.date} ${data.time}`)

    return NextResponse.json(
      { success: true, id: bookingData.id },
      { status: 200 }
    )
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required" },
        { status: 400 }
      )
    }

    // Get bookings for the date (confirmed or pending)
    const { data, error } = await supabase
      .from("bookings")
      .select("time")
      .eq("date", date)
      .in("status", ["confirmed", "pending"])

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { error: "Failed to fetch bookings" },
        { status: 500 }
      )
    }

    const bookedTimes = data?.map((b) => b.time) || []

    return NextResponse.json({ bookedTimes }, { status: 200 })
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

