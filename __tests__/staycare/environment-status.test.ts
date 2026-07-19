jest.mock("server-only", () => ({}))

describe("StayCare environment readiness", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SITE_URL: "https://sejoonglaw.kr",
      STAYCARE_SUPPORT_EMAIL: "staycare@sejoonglaw.kr",
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable",
      SUPABASE_SERVICE_ROLE_KEY: "service-role",
      STAYCARE_STORAGE_BUCKET: "staycare-private",
      STAYCARE_WEBHOOK_SECRET: "webhook-secret",
      STAYCARE_CRON_SECRET: "cron-secret",
      STAYCARE_FIELD_ENCRYPTION_KEY: "field-key",
      OPENAI_API_KEY: "openai-key",
      UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
      UPSTASH_REDIS_REST_TOKEN: "redis-token",
      RESEND_API_KEY: "resend-key",
      RESEND_FROM_EMAIL: "staycare@sejoonglaw.kr",
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: "site-key",
      TURNSTILE_SECRET_KEY: "secret-key",
      NEXT_PUBLIC_SENTRY_DSN: "https://public@example.ingest.sentry.io/1",
      TELECOM_PROVIDER_MODE: "manual",
      BANK_PROVIDER_MODE: "manual",
      REMITTANCE_PROVIDER_MODE: "manual",
      DELIVERY_PROVIDER_MODE: "manual",
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it("marks core and production services as configured without exposing secrets", async () => {
    const { getStayCareEnvironmentReport } = await import("@/lib/env/staycare-status")
    const report = getStayCareEnvironmentReport()

    expect(report.summary.coreConfigured).toBe(report.summary.coreTotal)
    expect(report.summary.productionConfigured).toBe(report.summary.productionTotal)
    expect(report.items.find((item) => item.id === "supabase-service-key")?.publicValue).toBeUndefined()
    expect(report.items.find((item) => item.id === "site-url")?.publicValue).toBe("sejoonglaw.kr")
  })

  it("accepts manual provider operations without API credentials", async () => {
    const { getStayCareEnvironmentReport } = await import("@/lib/env/staycare-status")
    const report = getStayCareEnvironmentReport()
    const providers = report.items.filter((item) => item.group === "provider")

    expect(providers).toHaveLength(4)
    expect(providers.every((item) => item.state === "manual")).toBe(true)
  })
})
