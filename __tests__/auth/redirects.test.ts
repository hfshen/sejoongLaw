import {
  classifyAuthFailure,
  isStayCareDestination,
  normalizeStayCareLocale,
  safeInternalPath,
  shouldRecoverStayCareAuthFailure,
  stayCareLoginRecoveryPath,
} from "@/lib/auth/redirects"

describe("auth redirect safety", () => {
  test("accepts only same-origin relative paths", () => {
    expect(safeInternalPath("/admin/cases?tab=open", "/fallback")).toBe(
      "/admin/cases?tab=open"
    )
    expect(safeInternalPath("https://evil.example/path", "/fallback")).toBe(
      "/fallback"
    )
    expect(safeInternalPath("//evil.example/path", "/fallback")).toBe(
      "/fallback"
    )
    expect(safeInternalPath("/admin\\evil", "/fallback")).toBe("/fallback")
    expect(safeInternalPath("/admin\nset-cookie:x", "/fallback")).toBe(
      "/fallback"
    )
  })

  test("classifies expired and denied auth callbacks", () => {
    expect(classifyAuthFailure({ code: "otp_expired" })).toBe("otp_expired")
    expect(
      classifyAuthFailure({
        error: "access_denied",
        description: "Email link is invalid or has expired",
      })
    ).toBe("otp_expired")
    expect(classifyAuthFailure({ error: "access_denied" })).toBe(
      "auth_callback_failed"
    )
    expect(classifyAuthFailure({})).toBeNull()
  })

  test("normalizes StayCare languages", () => {
    expect(normalizeStayCareLocale("ko")).toBe("ko")
    expect(normalizeStayCareLocale("en")).toBe("en")
    expect(normalizeStayCareLocale("si")).toBe("si")
    expect(normalizeStayCareLocale("zh")).toBe("ko")
  })

  test("recognizes only protected StayCare destinations", () => {
    expect(isStayCareDestination("/ko/staycare/app")).toBe(true)
    expect(isStayCareDestination("/en/staycare/admin?tab=queue")).toBe(true)
    expect(isStayCareDestination("/si/staycare/portal")).toBe(true)
    expect(isStayCareDestination("/ko/staycare/login")).toBe(false)
    expect(isStayCareDestination("/admin/dashboard")).toBe(false)
    expect(isStayCareDestination("https://evil.example/ko/staycare/app")).toBe(false)
  })

  test("scopes automatic auth recovery to locale roots and StayCare", () => {
    expect(shouldRecoverStayCareAuthFailure("/ko", "ko")).toBe(true)
    expect(shouldRecoverStayCareAuthFailure("/en/staycare", "en")).toBe(true)
    expect(shouldRecoverStayCareAuthFailure("/si/staycare/app", "si")).toBe(true)
    expect(shouldRecoverStayCareAuthFailure("/auth/callback", "ko")).toBe(false)
    expect(shouldRecoverStayCareAuthFailure("/admin/reset-password", "ko")).toBe(
      false
    )
  })

  test("builds a localized recovery URL and rejects unsafe next values", () => {
    expect(
      stayCareLoginRecoveryPath({
        locale: "si",
        reason: "otp_expired",
        next: "/si/staycare/app?lang=si",
      })
    ).toBe(
      "/si/staycare/login?error=otp_expired&reason=otp_expired&next=%2Fsi%2Fstaycare%2Fapp%3Flang%3Dsi#auth-recovery"
    )

    expect(
      stayCareLoginRecoveryPath({
        locale: "en",
        reason: "auth_callback_failed",
        next: "https://evil.example",
      })
    ).toContain("next=%2Fen%2Fstaycare%2Fapp")
  })
})
