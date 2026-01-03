import nodemailer from "nodemailer"

const RECIPIENT_EMAIL = "sejoonglaw@gmail.com"

// Gmail SMTP 설정
const createTransporter = () => {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return null
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER, // Gmail 주소 (예: sejoonglaw@gmail.com)
      pass: process.env.GMAIL_APP_PASSWORD, // Gmail 앱 비밀번호
    },
  })
}

export interface ConsultationEmailData {
  name: string
  email: string
  phone: string
  service: string
  subject: string
  message: string
}

export interface BookingEmailData {
  name: string
  email: string
  phone: string
  date: string
  time: string
  service: string
  consultationType: string
  message?: string
}

/**
 * 상담 요청 알림 이메일 전송 (법무법인으로)
 */
export async function sendConsultationNotificationEmail(data: ConsultationEmailData) {
  try {
    const transporter = createTransporter()
    if (!transporter) {
      console.warn("Gmail SMTP is not configured. Email will not be sent.")
      return { success: false, error: "Email service not configured" }
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: RECIPIENT_EMAIL,
      subject: `[상담 요청] ${data.subject || data.service}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
            새로운 상담 요청이 접수되었습니다
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">상담자 정보</h3>
            <p><strong>이름:</strong> ${data.name}</p>
            <p><strong>이메일:</strong> ${data.email}</p>
            <p><strong>전화번호:</strong> ${data.phone}</p>
            <p><strong>서비스:</strong> ${data.service}</p>
            ${data.subject ? `<p><strong>제목:</strong> ${data.subject}</p>` : ""}
          </div>
          
          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">상담 내용</h3>
            <p style="white-space: pre-wrap; line-height: 1.6;">${data.message || "내용 없음"}</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>법무법인 세중 | 전화: 031-8044-8805</p>
            <p>이 이메일은 자동으로 발송된 메일입니다.</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

/**
 * 상담 요청 확인 이메일 전송 (고객에게)
 */
export async function sendConsultationConfirmationEmail(data: ConsultationEmailData) {
  try {
    const transporter = createTransporter()
    if (!transporter) {
      return { success: false, error: "Email service not configured" }
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: data.email,
      subject: "[법무법인 세중] 상담 요청이 접수되었습니다",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
            상담 요청 접수 완료
          </h2>
          
          <p>안녕하세요, ${data.name}님</p>
          
          <p>법무법인 세중에 상담 요청이 정상적으로 접수되었습니다.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">접수 정보</h3>
            <p><strong>서비스:</strong> ${data.service}</p>
            ${data.subject ? `<p><strong>제목:</strong> ${data.subject}</p>` : ""}
            <p><strong>접수일시:</strong> ${new Date().toLocaleString("ko-KR")}</p>
          </div>
          
          <p>담당자가 검토 후 빠른 시일 내에 연락드리겠습니다.</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="margin: 0;"><strong>문의사항이 있으시면 아래로 연락주세요:</strong></p>
            <p style="margin: 5px 0;">전화: 031-8044-8805</p>
            <p style="margin: 5px 0;">이메일: sejoonglaw@gmail.com</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>법무법인 세중</p>
            <p>경기도 안산시 단원구 원곡로 45 세중빌딩 2층</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

/**
 * 예약 알림 이메일 전송 (법무법인으로)
 */
export async function sendBookingNotificationEmail(data: BookingEmailData) {
  try {
    const transporter = createTransporter()
    if (!transporter) {
      console.warn("Gmail SMTP is not configured. Email will not be sent.")
      return { success: false, error: "Email service not configured" }
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: RECIPIENT_EMAIL,
      subject: `[예약 요청] ${data.name}님 - ${data.date} ${data.time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
            새로운 예약 요청이 접수되었습니다
          </h2>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">예약자 정보</h3>
            <p><strong>이름:</strong> ${data.name}</p>
            <p><strong>이메일:</strong> ${data.email}</p>
            <p><strong>전화번호:</strong> ${data.phone}</p>
          </div>
          
          <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">예약 정보</h3>
            <p><strong>날짜:</strong> ${data.date}</p>
            <p><strong>시간:</strong> ${data.time}</p>
            <p><strong>서비스:</strong> ${data.service}</p>
            <p><strong>상담 유형:</strong> ${data.consultationType === "in-person" ? "방문 상담" : "온라인 상담"}</p>
            ${data.message ? `<p><strong>메시지:</strong> ${data.message}</p>` : ""}
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>법무법인 세중 | 전화: 031-8044-8805</p>
            <p>이 이메일은 자동으로 발송된 메일입니다.</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

/**
 * 예약 확인 이메일 전송 (고객에게)
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  try {
    const transporter = createTransporter()
    if (!transporter) {
      return { success: false, error: "Email service not configured" }
    }

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: data.email,
      subject: "[법무법인 세중] 예약이 접수되었습니다",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
            예약 접수 완료
          </h2>
          
          <p>안녕하세요, ${data.name}님</p>
          
          <p>법무법인 세중에 예약이 정상적으로 접수되었습니다.</p>
          
          <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #333;">예약 정보</h3>
            <p><strong>날짜:</strong> ${data.date}</p>
            <p><strong>시간:</strong> ${data.time}</p>
            <p><strong>서비스:</strong> ${data.service}</p>
            <p><strong>상담 유형:</strong> ${data.consultationType === "in-person" ? "방문 상담" : "온라인 상담"}</p>
          </div>
          
          ${data.consultationType === "in-person" ? `
            <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px;">
              <p style="margin: 0;"><strong>📍 방문 안내</strong></p>
              <p style="margin: 5px 0;">주소: 경기도 안산시 단원구 원곡로 45 세중빌딩 2층</p>
              <p style="margin: 5px 0;">전화: 031-8044-8805</p>
            </div>
          ` : ""}
          
          <p>담당자가 확인 후 예약 확정 여부를 안내드리겠습니다.</p>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
            <p style="margin: 0;"><strong>문의사항이 있으시면 아래로 연락주세요:</strong></p>
            <p style="margin: 5px 0;">전화: 031-8044-8805</p>
            <p style="margin: 5px 0;">이메일: sejoonglaw@gmail.com</p>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
            <p>법무법인 세중</p>
            <p>경기도 안산시 단원구 원곡로 45 세중빌딩 2층</p>
          </div>
        </div>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

