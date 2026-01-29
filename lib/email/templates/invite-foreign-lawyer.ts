import { Resend } from "resend"
import * as smtpEmail from "../email-smtp"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@sejoonglaw.kr"
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "smtp"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export interface InviteEmailData {
  email: string
  name: string
  role: "korea_agent" | "translator" | "foreign_lawyer" | "family_viewer" | "admin"
  country?: string
  organization?: string
  inviteToken: string
  invitedBy?: string
}

const roleLabels: Record<string, { ko: string; en: string }> = {
  korea_agent: { ko: "한국 에이전트", en: "Korea Agent" },
  translator: { ko: "번역가", en: "Translator" },
  foreign_lawyer: { ko: "해외 변호사", en: "Foreign Lawyer" },
  family_viewer: { ko: "유가족", en: "Family Viewer" },
  admin: { ko: "관리자", en: "Admin" },
}

/**
 * Send invitation email to foreign lawyer or other user
 */
export async function sendInviteEmail(data: InviteEmailData) {
  // SMTP를 사용하는 경우
  if (EMAIL_PROVIDER === "smtp") {
    // SMTP implementation would go here if needed
    console.warn("SMTP invite email not implemented, using Resend")
  }

  // Resend를 사용하는 경우
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent.")
      return { success: false, error: "Email service not configured" }
    }

    const roleLabel = roleLabels[data.role] || { ko: data.role, en: data.role }
    const inviteUrl = `${APP_URL}/accept-invite/${data.inviteToken}`

    // Determine email language based on role
    const isEnglish = data.role === "foreign_lawyer" || data.country !== "KR"

    const subject = isEnglish
      ? `[Sejoong Law Firm] Account Invitation - ${roleLabel.en}`
      : `[법무법인 세중] 계정 초대 - ${roleLabel.ko}`

    const html = isEnglish
      ? generateEnglishEmail(data, roleLabel.en, inviteUrl)
      : generateKoreanEmail(data, roleLabel.ko, inviteUrl)

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Email sending error:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}

function generateEnglishEmail(
  data: InviteEmailData,
  roleLabel: string,
  inviteUrl: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
        Account Invitation
      </h2>
      
      <p>Dear ${data.name},</p>
      
      <p>You have been invited to join the Sejoong Law Firm cross-border legal document workflow platform.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #333;">Your Account Details</h3>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Role:</strong> ${roleLabel}</p>
        ${data.country ? `<p><strong>Country:</strong> ${data.country}</p>` : ""}
        ${data.organization ? `<p><strong>Organization:</strong> ${data.organization}</p>` : ""}
      </div>
      
      <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 2px solid #bb271a; border-radius: 5px; text-align: center;">
        <p style="margin: 0 0 15px 0;"><strong>Click the button below to accept the invitation and set your password:</strong></p>
        <a href="${inviteUrl}" style="display: inline-block; background-color: #bb271a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          Accept Invitation
        </a>
        <p style="margin-top: 15px; font-size: 12px; color: #666;">
          Or copy and paste this link into your browser:<br/>
          <a href="${inviteUrl}" style="color: #bb271a; word-break: break-all;">${inviteUrl}</a>
        </p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px;">
        <p style="margin: 0;"><strong>⚠️ Important:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>This invitation link will expire in 7 days</li>
          <li>Please set a strong password when accepting the invitation</li>
          <li>If you did not request this invitation, please ignore this email</li>
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p><strong>Sejoong Law Firm</strong></p>
        <p>45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do, South Korea</p>
        <p>Phone: +82-31-8044-8805 | Email: contact@sejoonglaw.kr</p>
        <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
      </div>
    </div>
  `
}

function generateKoreanEmail(
  data: InviteEmailData,
  roleLabel: string,
  inviteUrl: string
): string {
  return `
    <div style="font-family: 'Malgun Gothic', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
        계정 초대
      </h2>
      
      <p>안녕하세요, ${data.name}님</p>
      
      <p>법무법인 세중의 국경 간 법률 문서 워크플로우 플랫폼에 초대되었습니다.</p>
      
      <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #333;">계정 정보</h3>
        <p><strong>이메일:</strong> ${data.email}</p>
        <p><strong>역할:</strong> ${roleLabel}</p>
        ${data.country ? `<p><strong>국가:</strong> ${data.country}</p>` : ""}
        ${data.organization ? `<p><strong>조직:</strong> ${data.organization}</p>` : ""}
      </div>
      
      <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 2px solid #bb271a; border-radius: 5px; text-align: center;">
        <p style="margin: 0 0 15px 0;"><strong>아래 버튼을 클릭하여 초대를 수락하고 비밀번호를 설정하세요:</strong></p>
        <a href="${inviteUrl}" style="display: inline-block; background-color: #bb271a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          초대 수락하기
        </a>
        <p style="margin-top: 15px; font-size: 12px; color: #666;">
          또는 아래 링크를 브라우저에 복사하여 붙여넣으세요:<br/>
          <a href="${inviteUrl}" style="color: #bb271a; word-break: break-all;">${inviteUrl}</a>
        </p>
      </div>
      
      <div style="background-color: #fff3cd; padding: 15px; margin: 20px 0; border-left: 4px solid #ffc107; border-radius: 5px;">
        <p style="margin: 0;"><strong>⚠️ 중요 안내:</strong></p>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>이 초대 링크는 7일 후 만료됩니다</li>
          <li>초대 수락 시 강력한 비밀번호를 설정해주세요</li>
          <li>이 초대를 요청하지 않으셨다면 이 이메일을 무시해주세요</li>
        </ul>
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
        <p><strong>법무법인 세중</strong></p>
        <p>경기도 안산시 단원구 원곡로 45 세중빌딩 2층</p>
        <p>전화: 031-8044-8805 | 이메일: contact@sejoonglaw.kr</p>
        <p style="margin-top: 15px;">이 이메일은 자동으로 발송된 메일입니다. 회신하지 마세요.</p>
      </div>
    </div>
  `
}
