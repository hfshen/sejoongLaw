import { Resend } from "resend"
import * as smtpEmail from "../email-smtp"

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@sejoonglaw.kr"
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "smtp"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export interface TranslationReadyEmailData {
  lawyerEmail: string
  lawyerName: string
  documentName: string
  documentId: string
  versionId: string
  languages: string[]
  caseName?: string
}

/**
 * Send notification email to foreign lawyer when translations are ready for review
 */
export async function sendTranslationReadyEmail(data: TranslationReadyEmailData) {
  try {
    if (!resend || !process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email will not be sent.")
      return { success: false, error: "Email service not configured" }
    }

    const reviewUrl = `${APP_URL}/admin/documents/${data.documentId}?tab=workflow&versionId=${data.versionId}`
    const languagesList = data.languages.join(", ")

    const subject = `[Sejoong Law Firm] Document Translation Ready for Review - ${data.documentName}`

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #bb271a; border-bottom: 2px solid #bb271a; padding-bottom: 10px;">
          Document Translation Ready for Review
        </h2>
        
        <p>Dear ${data.lawyerName},</p>
        
        <p>A legal document has been translated and is ready for your review and approval.</p>
        
        <div style="background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #333;">Document Details</h3>
          <p><strong>Document Name:</strong> ${data.documentName}</p>
          ${data.caseName ? `<p><strong>Case:</strong> ${data.caseName}</p>` : ""}
          <p><strong>Translated Languages:</strong> ${languagesList}</p>
        </div>
        
        <div style="background-color: #fff; padding: 20px; margin: 20px 0; border: 2px solid #bb271a; border-radius: 5px; text-align: center;">
          <p style="margin: 0 0 15px 0;"><strong>Please review and approve the translations:</strong></p>
          <a href="${reviewUrl}" style="display: inline-block; background-color: #bb271a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Review Document
          </a>
          <p style="margin-top: 15px; font-size: 12px; color: #666;">
            Or copy and paste this link into your browser:<br/>
            <a href="${reviewUrl}" style="color: #bb271a; word-break: break-all;">${reviewUrl}</a>
          </p>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 15px; margin: 20px 0; border-left: 4px solid #2196F3; border-radius: 5px;">
          <p style="margin: 0;"><strong>📋 Review Process:</strong></p>
          <ol style="margin: 10px 0; padding-left: 20px;">
            <li>Review each translated segment</li>
            <li>Approve or request changes</li>
            <li>Add comments if needed</li>
            <li>Submit your approval</li>
          </ol>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
          <p><strong>Sejoong Law Firm</strong></p>
          <p>45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do, South Korea</p>
          <p>Phone: +82-31-8044-8805 | Email: contact@sejoonglaw.kr</p>
          <p style="margin-top: 15px;">This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    `

    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.lawyerEmail,
      subject,
      html,
    })

    if (error) {
      console.error("Resend error sending translation ready email:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Error sending translation ready email:", error)
    return { success: false, error: error.message || "Unknown error" }
  }
}
