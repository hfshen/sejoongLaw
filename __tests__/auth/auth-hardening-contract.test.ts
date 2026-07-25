import fs from "fs"
import path from "path"

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

describe("authentication hardening contracts", () => {
  test("admin login never reuses mail credentials", () => {
    const loginRoute = source("app/api/admin/login/route.ts")

    expect(loginRoute).not.toContain("GMAIL_APP_PASSWORD")
    expect(loginRoute).not.toContain("GMAIL_USER")
    expect(loginRoute).toContain("signInWithPassword")
    expect(loginRoute).toContain("requireTrustedOrigin")
  })

  test("fixed-value admin cookies no longer grant access", () => {
    const adminAuth = source("lib/admin/auth.ts")
    const checkAuth = source("app/api/admin/check-auth/route.ts")

    expect(adminAuth).not.toContain('session?.value === "authenticated"')
    expect(checkAuth).not.toContain('session?.value === "authenticated"')
    expect(checkAuth).toContain("getAuthenticatedBackofficeProfile")
  })

  test("browser login delegates authorization to the server route", () => {
    const loginPage = source("app/auth/login/page.tsx")

    expect(loginPage).toContain('fetch("/api/admin/login"')
    expect(loginPage).not.toContain('.from("profiles")')
    expect(loginPage).not.toContain("signInWithPassword")
  })

  test("middleware only recovers errors on StayCare-owned paths", () => {
    const middleware = source("middleware.ts")

    expect(middleware).toContain("shouldRecoverStayCareAuthFailure")
    expect(middleware).not.toContain("authFailure && !pathname.includes")
  })

  test("legacy callback delegates to the unified callback", () => {
    const legacyCallback = source("app/api/auth/callback/route.ts")
    expect(legacyCallback).toContain('new URL("/auth/callback"')
  })
})
