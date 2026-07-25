export type AuthFailureReason = "otp_expired" | "auth_callback_failed"

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/

export function safeInternalPath(
  value: string | null | undefined,
  fallback: string
): string {
  if (!value) return fallback

  const candidate = value.trim()
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    CONTROL_CHARACTERS.test(candidate)
  ) {
    return fallback
  }

  try {
    const resolved = new URL(candidate, "https://internal.local")
    if (resolved.origin !== "https://internal.local") return fallback
    return `${resolved.pathname}${resolved.search}${resolved.hash}`
  } catch {
    return fallback
  }
}

export function classifyAuthFailure({
  error,
  code,
  description,
}: {
  error?: string | null
  code?: string | null
  description?: string | null
}): AuthFailureReason | null {
  const normalizedDescription = (description || "").toLowerCase()

  if (!error && !code && !normalizedDescription) return null
  if (
    code === "otp_expired" ||
    normalizedDescription.includes("expired") ||
    normalizedDescription.includes("invalid")
  ) {
    return "otp_expired"
  }

  return error === "access_denied" ? "auth_callback_failed" : null
}

export function stayCareLoginRecoveryPath({
  locale,
  reason,
  next,
}: {
  locale: string
  reason: AuthFailureReason
  next?: string | null
}) {
  const fallback = `/${locale}/staycare/app`
  const destination = safeInternalPath(next, fallback)
  const params = new URLSearchParams({
    error: reason,
    reason,
    next: destination,
  })

  return `/${locale}/staycare/login?${params.toString()}#auth-recovery`
}
