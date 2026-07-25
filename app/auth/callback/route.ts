import { NextRequest, NextResponse } from "next/server"
import { getDashboardUrl, type UserRole } from "@/lib/auth/role-guard"
import {
  classifyAuthFailure,
  safeInternalPath,
  stayCareLoginRecoveryPath,
} from "@/lib/auth/redirects"
import logger from "@/lib/logger"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"

function redirectNoStore(url: URL) {
  const response = NextResponse.redirect(url)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}

function localeFromDestination(destination: string) {
  const locale = destination.split("/").filter(Boolean)[0]
  return locale === "en" ? "en" : "ko"
}

function failureDestination({
  request,
  flow,
  next,
  reason,
}: {
  request: NextRequest
  flow: string | null
  next: string
  reason: "otp_expired" | "auth_callback_failed"
}) {
  if (flow === "recovery") {
    const url = new URL("/admin/reset-password", request.url)
    url.searchParams.set("error", reason)
    url.searchParams.set("reason", reason)
    return url
  }

  if (next.includes("/staycare/")) {
    const locale = localeFromDestination(next)
    return new URL(
      stayCareLoginRecoveryPath({ locale, reason, next }),
      request.url
    )
  }

  const url = new URL("/auth/login", request.url)
  url.searchParams.set("error", "session_error")
  if (next) url.searchParams.set("next", next)
  return url
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const code = params.get("code")
  const flow = params.get("flow") || params.get("type")
  const next = safeInternalPath(params.get("next"), "")
  const callbackFailure = classifyAuthFailure({
    error: params.get("error"),
    code: params.get("error_code"),
    description: params.get("error_description"),
  })

  if (callbackFailure) {
    return redirectNoStore(
      failureDestination({
        request,
        flow,
        next,
        reason: callbackFailure,
      })
    )
  }

  if (!code) {
    return redirectNoStore(
      failureDestination({
        request,
        flow,
        next,
        reason: "auth_callback_failed",
      })
    )
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    logger.warn("Auth callback session exchange failed", {
      message: error?.message,
      flow,
      next,
    })
    return redirectNoStore(
      failureDestination({
        request,
        flow,
        next,
        reason: classifyAuthFailure({
          error: error ? "access_denied" : null,
          description: error?.message,
        }) || "auth_callback_failed",
      })
    )
  }

  if (flow === "recovery") {
    return redirectNoStore(new URL("/admin/reset-password?ready=1", request.url))
  }

  if (next) {
    return redirectNoStore(new URL(next, request.url))
  }

  try {
    const serviceClient = getServiceClient()
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile) {
      logger.warn("Auth callback profile was not found", {
        userId: data.user.id,
        message: profileError?.message,
      })
      return redirectNoStore(
        new URL("/auth/login?error=profile_missing", request.url)
      )
    }

    if (profile.status !== "active") {
      await supabase.auth.signOut()
      return redirectNoStore(
        new URL("/auth/login?error=account_inactive", request.url)
      )
    }

    return redirectNoStore(
      new URL(getDashboardUrl(profile.role as UserRole), request.url)
    )
  } catch (profileError) {
    logger.error("Auth callback profile resolution failed", {
      error: profileError,
      userId: data.user.id,
    })
    return redirectNoStore(new URL("/auth/login?error=session_error", request.url))
  }
}
