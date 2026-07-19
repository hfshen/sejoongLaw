import "server-only"

interface TurnstileResponse {
  success: boolean
  "error-codes"?: string[]
  hostname?: string
  action?: string
}

export async function verifyTurnstile(token: string | undefined, remoteIp?: string) {
  const secret = process.env.TURNSTILE_SECRET_KEY

  if (!secret) {
    return {
      success: process.env.NODE_ENV !== "production",
      skipped: true,
      errorCodes: process.env.NODE_ENV === "production" ? ["TURNSTILE_NOT_CONFIGURED"] : [],
    }
  }

  if (!token) {
    return { success: false, skipped: false, errorCodes: ["MISSING_TURNSTILE_TOKEN"] }
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  })
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp)

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  })

  if (!response.ok) {
    return { success: false, skipped: false, errorCodes: [`HTTP_${response.status}`] }
  }

  const result = (await response.json()) as TurnstileResponse
  return {
    success: result.success,
    skipped: false,
    errorCodes: result["error-codes"] || [],
    hostname: result.hostname,
    action: result.action,
  }
}
