import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("StayCare commercial hardening", () => {
  it("does not trust the request host as a production CSRF origin", () => {
    const requestSecurity = source("lib/security/request.ts")
    expect(requestSecurity).toContain("STAYCARE_ALLOWED_ORIGINS")
    expect(requestSecurity).toContain('process.env.NODE_ENV !== "production"')
    expect(requestSecurity).toContain("allowed.add(request.nextUrl.origin)")
    expect(requestSecurity).toContain("sec-fetch-site")
  })

  it("fails closed when distributed rate limiting is unavailable in production", () => {
    const limiter = source("lib/security/rate-limit.ts")
    expect(limiter).toContain("failClosedInProduction")
    expect(limiter).toContain('source: "unavailable"')
    expect(limiter).toContain('reason: "backend_unavailable"')
    expect(limiter).toContain("AbortSignal.timeout")
  })

  it("verifies uploaded bytes instead of trusting client metadata", () => {
    const completion = source("app/api/staycare/documents/complete/route.ts")
    expect(completion).toContain("detectMimeType")
    expect(completion).toContain('createHash("sha256")')
    expect(completion).toContain("bytes.byteLength === Number(document.byte_size)")
    expect(completion).toContain("storage.from(document.storage_bucket).remove")
    expect(completion).toContain("document.upload_validation_failed")
  })

  it("authorizes downloads through authenticated RLS before service-role signing", () => {
    const download = source("app/api/staycare/documents/[id]/download/route.ts")
    expect(download).toContain("getAuthenticatedUser")
    expect(download).toContain("context.supabase")
    expect(download).toContain("getServiceClient")
    expect(download.indexOf("context.supabase")).toBeLessThan(
      download.indexOf("createSignedUrl")
    )
    expect(download).toContain("safeDownloadName")
  })

  it("applies browser hardening headers and rotates auth cookies in middleware", () => {
    const middleware = source("middleware.ts")
    expect(middleware).toContain("applyStayCareSecurityHeaders")
    expect(middleware).toContain("X-Content-Type-Options")
    expect(middleware).toContain("X-Frame-Options")
    expect(middleware).toContain("Permissions-Policy")
    expect(middleware).toContain("Strict-Transport-Security")
    expect(middleware).toContain("createServerClient")
    expect(middleware).toContain("supabase.auth.getUser")
    expect(middleware).toContain("response.cookies.set")
  })

  it("enforces strict environment and dependency release gates in CI", () => {
    const workflow = source(".github/workflows/staycare-ci.yml")
    const environmentCheck = source("scripts/check-staycare-env.mjs")
    expect(workflow).toContain("npm ci")
    expect(workflow).toContain("npm audit --omit=dev --audit-level=critical")
    expect(workflow).toContain("check:staycare-env:strict")
    expect(workflow).toContain("npm run lint")
    expect(environmentCheck).toContain("Public demo login is disabled")
    expect(environmentCheck).toContain("Distributed rate limiting fails closed")
    expect(environmentCheck).toContain("Field encryption key is strong")
  })
})
