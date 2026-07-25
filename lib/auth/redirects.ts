export type AuthFailureReason = "otp_expired" | "auth_callback_failed"
export type StayCareLocale = "ko" | "en" | "si"

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/

export function normalizeStayCareLocale(value: string | null | undefined): StayCareLocale {
  return value === "en" || value === "si" ? value : "ko"
}

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
  const normalizedError = (error || "").toLowerCase()
  const normalizedCode = (code || "").toLowerCase()
  const normalizedDescription = (description || "").toLowerCase()

  if (!normalizedError && !normalizedCode && !normalizedDescription) return null
  if (
    normalizedError === "otp_expired" ||
    normalizedCode === "otp_expired" ||
    normalizedCode === "link_expired" ||
    normalizedDescription.includes("expired") ||
    normalizedDescription.includes("invalid") ||
    normalizedDescription.includes("already been used")
  ) {
    return "otp_expired"
  }

  return normalizedError === "access_denied" || normalizedError === "auth_callback_failed"
    ? "auth_callback_failed"
    : null
}

export function isStayCareDestination(value: string | null | undefined): boolean {
  const destination = safeInternalPath(value, "")
  return /^\/(ko|en|si)\/staycare\/(app|admin|portal)(?:[/?#]|$)/.test(destination)
}

export function shouldRecoverStayCareAuthFailure(
  pathname: string,
  locale: string
): boolean {
  const normalizedLocale = normalizeStayCareLocale(locale)
  const localeRoot = pathname === "/" || pathname === `/${normalizedLocale}`
  const stayCarePath = pathname === `/${normalizedLocale}/staycare` ||
    pathname.startsWith(`/${normalizedLocale}/staycare/`)

  return localeRoot || stayCarePath
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
  const normalizedLocale = normalizeStayCareLocale(locale)
  const fallback = `/${normalizedLocale}/staycare/app`
  const destination = isStayCareDestination(next)
    ? safeInternalPath(next, fallback)
    : fallback
  const params = new URLSearchParams({
    error: reason,
    reason,
    next: destination,
  })

  return `/${normalizedLocale}/staycare/login?${params.toString()}#auth-recovery`
}
