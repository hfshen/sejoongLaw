jest.mock("server-only", () => ({}))

describe("StayCare environment readiness", () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      NEXT_PUBLIC_SITE_URL: "https://sejoonglaw.kr",
      STAYCARE_TENANT_SLUG: "sejoong-staycare",
      STAYCARE_SUPPORT_EMAIL: "staycare@sejoonglaw.kr",
      NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED: "false",
      STAYCARE_ALLOW_PRODUCTION_DEMO_LOGIN: "false",
      STAYCARE_RATE_LIMIT_FAIL_CLOSED: "true",
      STAYCARE_DOCUMENT_RETENTION_DAYS: "1095",
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
      EMAIL_PROVIDER: "resend",
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
    const { getStayCareEnvironmentReport } = await import(
      "@/lib/env/staycare-status"
    )
    const report = getStayCareEnvironmentReport()

    expect(report.summary.coreConfigured).toBe(report.summary.coreTotal)
    expect(report.summary.productionConfigured).toBe(
      report.summary.productionTotal
    )
    expect(
      report.items.find((item) => item.id === "supabase-service-key")
        ?.publicValue
    ).toBeUndefined()
    expect(
      report.items.find((item) => item.id === "site-url")?.publicValue
    ).toBe("sejoonglaw.kr")
    expect(
      report.items.find((item) => item.id === "retention-policy")?.state
    ).toBe("configured")
  })

  it("classifies manual provider operations as limited production", async () => {
    const { getStayCareEnvironmentReport } = await import(
      "@/lib/env/staycare-status"
    )
    const report = getStayCareEnvironmentReport()
    const providers = report.items.filter((item) => item.group === "provider")

    expect(providers).toHaveLength(4)
    expect(providers.every((item) => item.state === "manual")).toBe(true)
    expect(report.summary.releaseState).toBe("limited-production")
  })

  it("accepts SMTP as the application notification provider", async () => {
    process.env.EMAIL_PROVIDER = "smtp"
    process.env.SMTP_HOST = "smtp.improvmx.com"
    process.env.SMTP_PORT = "587"
    process.env.SMTP_USER = "staycare@sejoonglaw.kr"
    process.env.SMTP_PASSWORD = "smtp-password"
    process.env.SMTP_FROM_EMAIL = "Sejoong StayCare <staycare@sejoonglaw.kr>"
    delete process.env.RESEND_API_KEY
    delete process.env.RESEND_FROM_EMAIL

    const { getStayCareEnvironmentReport } = await import(
      "@/lib/env/staycare-status"
    )
    const email = getStayCareEnvironmentReport().items.find(
      (item) => item.id === "email"
    )

    expect(email?.label).toBe("SMTP 이메일")
    expect(email?.state).toBe("configured")
    expect(email?.publicValue).toBe("Sejoong StayCare <staycare@sejoonglaw.kr>")
  })

  it("blocks production readiness when public demo access is enabled", async () => {
    process.env.NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED = "true"
    const { getStayCareEnvironmentReport } = await import(
      "@/lib/env/staycare-status"
    )
    const report = getStayCareEnvironmentReport()

    expect(report.items.find((item) => item.id === "demo-disabled")?.state).toBe(
      "missing"
    )
    expect(report.summary.releaseState).toBe("internal-pilot")
  })
})
