import "server-only"
import { createHash, createHmac, randomBytes } from "node:crypto"

const INVITE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

function secret() {
  const value =
    process.env.STAYCARE_FIELD_ENCRYPTION_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  if (!value) throw new Error("StayCare identity hashing secret is not configured")
  return value
}

export function normalizeInviteCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export function normalizeRosterName(value: string) {
  return value.normalize("NFKC").toUpperCase().replace(/[^A-Z0-9]/g, "")
}

export function normalizeContactIdentity(value: string) {
  const trimmed = value.trim()
  if (trimmed.includes("@")) return trimmed.toLowerCase()
  return trimmed.replace(/[\s()-]/g, "")
}

export function secureIdentityHash(value: string) {
  return createHmac("sha256", secret())
    .update(normalizeContactIdentity(value))
    .digest("hex")
}

export function inviteTokenHash(value: string) {
  return createHmac("sha256", secret())
    .update(normalizeInviteCode(value))
    .digest("hex")
}

export function rosterRowHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex")
}

export function generateInviteCode(length = 12) {
  const bytes = randomBytes(length)
  let result = ""
  for (let index = 0; index < length; index += 1) {
    result += INVITE_ALPHABET[bytes[index] % INVITE_ALPHABET.length]
  }
  return `${result.slice(0, 4)}-${result.slice(4, 8)}-${result.slice(8)}`
}

export function maskedIdentity(value: string) {
  const normalized = normalizeContactIdentity(value)
  if (normalized.includes("@")) {
    const [name, domain] = normalized.split("@")
    return `${name.slice(0, 2)}***@${domain}`
  }
  return normalized.length <= 6
    ? `***${normalized.slice(-2)}`
    : `${normalized.slice(0, 3)}***${normalized.slice(-4)}`
}
