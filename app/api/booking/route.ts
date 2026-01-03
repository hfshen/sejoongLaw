import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  sendBookingNotificationEmail,
  sendBookingConfirmationEmail,
} from "@/lib/email/email"

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not set")
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const data = await request.json()

    // 필수 필드 검증
    if (!data.date || !data.time || !data.service || !data.name || !data.phone || !data.email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

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
      consultation_type: data.consultationType || "in-person",
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
      // 중복 예약 에러 처리
      if (error.code === "23505" || error.message?.includes("unique") || error.message?.includes("duplicate")) {
        return NextResponse.json(
          { error: "이미 예약된 시간입니다. 다른 시간을 선택해주세요." },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: error.message || "Failed to save booking" },
        { status: 500 }
      )
    }

    // Send email notifications
    try {
      // 법무법인으로 알림 이메일 전송
      await sendBookingNotificationEmail({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: bookingDate,
        time: booking.time,
        service: booking.service,
        consultationType: booking.consultation_type,
        message: booking.message || undefined,
      })

      // 고객에게 확인 이메일 전송
      await sendBookingConfirmationEmail({
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        date: bookingDate,
        time: booking.time,
        service: booking.service,
        consultationType: booking.consultation_type,
        message: booking.message || undefined,
      })
    } catch (emailError) {
      // 이메일 전송 실패해도 예약은 저장되도록 함
      console.error("Email sending error:", emailError)
    }

    // Send SMS notification (optional)
    // await sendSMSNotification(booking.phone, `예약이 완료되었습니다: ${data.date} ${data.time}`)

    return NextResponse.json(
      { success: true, id: bookingData.id },
      { status: 200 }
    )
  } catch (error: any) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error("Supabase environment variables not set")
      return NextResponse.json(
        { error: "Server configuration error", bookedTimes: [] },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    if (!date) {
      return NextResponse.json(
        { error: "Date parameter is required", bookedTimes: [] },
        { status: 400 }
      )
    }

    // Get bookings for the date (confirmed or pending)
    // RLS 정책으로 인해 공개 조회가 안 될 수 있으므로 에러 처리
    const { data, error } = await supabase
      .from("bookings")
      .select("time")
      .eq("date", date)
      .in("status", ["confirmed", "pending"])

    if (error) {
      console.error("Supabase error:", error)
      // RLS 에러인 경우 빈 배열 반환 (예약된 시간이 없는 것으로 처리)
      if (error.code === "42501" || error.message?.includes("permission") || error.message?.includes("policy")) {
        console.warn("RLS policy error, returning empty booked times")
        return NextResponse.json({ bookedTimes: [] }, { status: 200 })
      }
      return NextResponse.json(
        { error: "Failed to fetch bookings", bookedTimes: [] },
        { status: 500 }
      )
    }

    const bookedTimes = data?.map((b) => b.time) || []

    return NextResponse.json({ bookedTimes }, { status: 200 })
  } catch (error: any) {
    console.error("Booking API error:", error)
    // 에러가 발생해도 빈 배열 반환하여 캘린더가 작동하도록 함
    return NextResponse.json(
      { error: "Internal server error", bookedTimes: [] },
      { status: 200 }
    )
  }
}

