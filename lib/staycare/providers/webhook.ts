import "server-only"
import { createHmac, createHash, timingSafeEqual } from "node:crypto"
import { z } from "zod"
import type { ProviderKind, ProviderWebhookPayload } from "@/lib/staycare/providers/types"

export const providerWebhookSchema = z.object({
  eventId: z.string().trim().min(1).max(200),
  eventType: z.string().trim().min(1).max(120),
  applicationNo: z.string().trim().min(3).max(120),
  externalReference: z.string().trim().max(200).optional(),
  status: z.string().trim().max(100).optional(),
  occurredAt: z.string().datetime().optional(),
  message: z.string().trim().max(1000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
})

function webhookSecret(kind: ProviderKind) {
  return process.env[`${kind.toUpperCase()}_PROVIDER_WEBHOOK_SECRET`] || ""
}

function normalizeSignature(value: string | null) {
  if (!value) return ""
  return value.startsWith("sha256=") ? value.slice(7) : value
}

export function verifyProviderSignature({
  kind,
  rawBody,
  timestamp,
  signature,
}: {
  kind: ProviderKind
  rawBody: string
  timestamp: string | null
  signature: string | null
}) {
  const secret = webhookSecret(kind)
  if (!secret || !timestamp || !signature) return false

  const timestampMs = Number(timestamp) > 10_000_000_000
    ? Number(timestamp)
    : Number(timestamp) * 1000
  if (!Number.isFinite(timestampMs)) return false
  if (Math.abs(Date.now() - timestampMs) > 5 * 60 * 1000) return false

  const expected = createHmac("sha256", secret)
    .update(`${timestamp}.${rawBody}`, "utf8")
    .digest("hex")
  const received = normalizeSignature(signature).toLowerCase()

  if (!/^[a-f0-9]{64}$/.test(received)) return false
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(received, "hex"))
}

export function parseProviderWebhook(rawBody: string): ProviderWebhookPayload {
  return providerWebhookSchema.parse(JSON.parse(rawBody))
}

export function providerPayloadHash(rawBody: string) {
  return createHash("sha256").update(rawBody, "utf8").digest("hex")
}

export function normalizeProviderApplicationStatus(status?: string) {
  const normalized = status?.trim().toLowerCase().replace(/[ -]+/g, "_")
  if (!normalized) return null

  if (["received", "pending", "processing", "in_progress", "waiting"].includes(normalized)) {
    return "waiting_provider" as const
  }
  if (["reviewing", "identity_required", "verification_required"].includes(normalized)) {
    return "reviewing" as const
  }
  if (["approved", "authorized", "ready_for_pickup", "scheduled"].includes(normalized)) {
    return "approved" as const
  }
  if (["fulfilled", "completed", "activated", "delivered", "paid_out", "success"].includes(normalized)) {
    return "fulfilled" as const
  }
  if (["rejected", "failed", "declined", "invalid"].includes(normalized)) {
    return "rejected" as const
  }
  if (["cancelled", "canceled"].includes(normalized)) {
    return "cancelled" as const
  }
  return null
}
