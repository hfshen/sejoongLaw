import "server-only"
import CoolSMS from "coolsms-node-sdk"
import nodemailer from "nodemailer"
import { getServiceClient } from "@/lib/supabase/service"

interface NotificationRow {
  id: string
  tenant_id: string
  worker_id: string | null
  user_id: string | null
  channel: "in_app" | "sms" | "email" | "push"
  language: "ko" | "en" | "si" | "ta"
  template_code: string
  subject: string | null
  body: string
  delivery_attempts: number
  metadata: Record<string, unknown> | null
}

interface Recipient {
  userId?: string
  email?: string
  phone?: string
}

async function resolveRecipient(notification: NotificationRow): Promise<Recipient> {
  const admin = getServiceClient()
  let userId = notification.user_id || undefined
  let phone: string | undefined

  if (notification.worker_id) {
    const { data: worker } = await admin
      .from("staycare_workers")
      .select("auth_user_id, phone_number")
      .eq("id", notification.worker_id)
      .maybeSingle()
    userId = userId || worker?.auth_user_id || undefined
    phone = worker?.phone_number || undefined
  }

  let email: string | undefined
  if (userId) {
    const { data, error } = await admin.auth.admin.getUserById(userId)
    if (!error) {
      email = data.user?.email || undefined
      phone = phone || data.user?.phone || undefined
    }
  }

  return { userId, email, phone }
}

async function sendEmail(notification: NotificationRow, email: string) {
  const provider = process.env.EMAIL_PROVIDER || "resend"
  const subject = notification.subject || "Sejoong StayCare"

  if (provider === "disabled") {
    throw new Error("EMAIL_PROVIDER is disabled")
  }

  if (provider === "smtp") {
    const host = process.env.SMTP_HOST
    const port = Number(process.env.SMTP_PORT || "587")
    const secure = process.env.SMTP_SECURE === "true"
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASSWORD
    const from = process.env.SMTP_FROM_EMAIL
    if (!host || !user || !pass || !from) {
      throw new Error("SMTP_HOST, SMTP_USER, SMTP_PASSWORD or SMTP_FROM_EMAIL is missing")
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      requireTLS: !secure,
    })
    const result = await transporter.sendMail({
      from,
      to: email,
      subject,
      text: notification.body,
      headers: { "X-StayCare-Notification-Id": notification.id },
    })
    return result.messageId || `smtp-${notification.id}`
  }

  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM_EMAIL
  if (!apiKey || !from) throw new Error("RESEND_API_KEY or RESEND_FROM_EMAIL is missing")

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `staycare-${notification.id}`,
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject,
      text: notification.body,
    }),
    cache: "no-store",
  })

  const payload = (await response.json().catch(() => ({}))) as {
    id?: string
    message?: string
    name?: string
  }

  if (!response.ok || !payload.id) {
    throw new Error(payload.message || payload.name || `Resend returned HTTP ${response.status}`)
  }

  return payload.id
}

async function sendSms(notification: NotificationRow, phone: string) {
  const apiKey = process.env.COOLSMS_API_KEY
  const apiSecret = process.env.COOLSMS_API_SECRET
  const sender = process.env.COOLSMS_SENDER_PHONE
  if (!apiKey || !apiSecret || !sender) {
    throw new Error("CoolSMS credentials or registered sender number are missing")
  }

  const messageService = new CoolSMS(apiKey, apiSecret)
  const result = await messageService.sendOne({
    to: phone.replace(/[\s-]/g, ""),
    from: sender.replace(/[\s-]/g, ""),
    text: notification.body,
    autoTypeDetect: true,
  })

  const value = result as unknown as Record<string, unknown>
  return String(value.groupId || value.messageId || value.statusCode || `sms-${notification.id}`)
}

async function dispatch(notification: NotificationRow) {
  if (notification.channel === "in_app") return `in-app-${notification.id}`

  const recipient = await resolveRecipient(notification)
  if (notification.channel === "email") {
    if (!recipient.email) throw new Error("Recipient email is unavailable")
    return sendEmail(notification, recipient.email)
  }

  if (notification.channel === "sms") {
    if (!recipient.phone) throw new Error("Recipient phone number is unavailable")
    return sendSms(notification, recipient.phone)
  }

  throw new Error("Push notification delivery is not enabled yet")
}

export async function processDueStayCareNotifications(batchSize = 50) {
  const admin = getServiceClient()
  const { data, error } = await admin.rpc("staycare_claim_notifications", {
    batch_size: Math.max(1, Math.min(batchSize, 100)),
  })

  if (error) throw error
  const claimed = (data || []) as NotificationRow[]
  const results: Array<{ id: string; status: "sent" | "failed"; error?: string }> = []

  for (const notification of claimed) {
    try {
      const providerReference = await dispatch(notification)
      await admin
        .from("staycare_notifications")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          locked_at: null,
          provider_reference: providerReference,
          error_message: null,
        })
        .eq("id", notification.id)

      results.push({ id: notification.id, status: "sent" })
    } catch (caught) {
      const message = caught instanceof Error ? caught.message.slice(0, 1000) : "Unknown delivery error"
      const terminal = notification.delivery_attempts >= 5
      await admin
        .from("staycare_notifications")
        .update({
          status: terminal ? "cancelled" : "failed",
          locked_at: null,
          error_message: message,
          scheduled_at: terminal
            ? new Date().toISOString()
            : new Date(Date.now() + Math.min(60, 2 ** notification.delivery_attempts) * 60_000).toISOString(),
        })
        .eq("id", notification.id)

      results.push({ id: notification.id, status: "failed", error: message })
    }
  }

  return {
    claimed: claimed.length,
    sent: results.filter((result) => result.status === "sent").length,
    failed: results.filter((result) => result.status === "failed").length,
    results,
  }
}
