import { z } from "zod"

const optionalUrl = z.string().url().optional().or(z.literal(""))
const optionalString = z.string().trim().optional().or(z.literal(""))
const booleanString = z.enum(["true", "false"])

const serverSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  STAYCARE_TENANT_SLUG: z.string().min(2).default("sejoong-staycare"),
  STAYCARE_DEFAULT_LOCALE: z.enum(["ko", "en", "si"]).default("ko"),
  STAYCARE_SUPPORT_EMAIL: z.string().email(),
  STAYCARE_SUPPORT_PHONE: optionalString,
  STAYCARE_ALLOWED_ORIGINS: optionalString,
  NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED: booleanString.default("false"),
  STAYCARE_ALLOW_PRODUCTION_DEMO_LOGIN: booleanString.default("false"),
  STAYCARE_RATE_LIMIT_FAIL_CLOSED: booleanString.default("true"),
  STAYCARE_DOCUMENT_RETENTION_DAYS: z.coerce
    .number()
    .int()
    .min(30)
    .max(3650)
    .default(1095),

  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalString,
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  STAYCARE_STORAGE_BUCKET: z.string().min(3).default("staycare-private"),

  OPENAI_API_KEY: optionalString,
  OPENAI_TRANSLATION_MODEL: z.string().min(1).default("gpt-5"),

  UPSTASH_REDIS_REST_URL: optionalUrl,
  UPSTASH_REDIS_REST_TOKEN: optionalString,

  EMAIL_PROVIDER: z.enum(["resend", "smtp", "disabled"]).default("resend"),
  RESEND_API_KEY: optionalString,
  RESEND_FROM_EMAIL: optionalString,

  COOLSMS_API_KEY: optionalString,
  COOLSMS_API_SECRET: optionalString,
  COOLSMS_SENDER_PHONE: optionalString,

  TURNSTILE_SECRET_KEY: optionalString,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,

  NEXT_PUBLIC_SENTRY_DSN: optionalUrl,
  SENTRY_ENVIRONMENT: optionalString,
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).default(0.05),

  KAKAO_REST_API_KEY: optionalString,
  NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY: optionalString,

  STAYCARE_FIELD_ENCRYPTION_KEY: optionalString,
  STAYCARE_WEBHOOK_SECRET: optionalString,
  STAYCARE_CRON_SECRET: optionalString,

  TELECOM_PROVIDER_MODE: z.enum(["manual", "sandbox", "api"]).default("manual"),
  TELECOM_PROVIDER_BASE_URL: optionalUrl,
  TELECOM_PROVIDER_API_KEY: optionalString,
  TELECOM_PROVIDER_WEBHOOK_SECRET: optionalString,

  BANK_PROVIDER_MODE: z.enum(["manual", "sandbox", "api"]).default("manual"),
  BANK_PROVIDER_BASE_URL: optionalUrl,
  BANK_PROVIDER_API_KEY: optionalString,
  BANK_PROVIDER_WEBHOOK_SECRET: optionalString,

  REMITTANCE_PROVIDER_MODE: z.enum(["manual", "sandbox", "api"]).default("manual"),
  REMITTANCE_PROVIDER_BASE_URL: optionalUrl,
  REMITTANCE_PROVIDER_API_KEY: optionalString,
  REMITTANCE_PROVIDER_WEBHOOK_SECRET: optionalString,

  DELIVERY_PROVIDER_MODE: z.enum(["manual", "sandbox", "api"]).default("manual"),
  DELIVERY_PROVIDER_BASE_URL: optionalUrl,
  DELIVERY_PROVIDER_API_KEY: optionalString,
  DELIVERY_PROVIDER_WEBHOOK_SECRET: optionalString,
})

export type StayCareServerEnv = z.infer<typeof serverSchema>

let cached: StayCareServerEnv | null = null

export function getStayCareEnv(): StayCareServerEnv {
  if (cached) return cached

  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""

  const parsed = serverSchema.safeParse({
    ...process.env,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  })

  if (!parsed.success) {
    const problems = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ")
    throw new Error(`Invalid StayCare environment: ${problems}`)
  }

  if (!publishableKey) {
    throw new Error(
      "Invalid StayCare environment: set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    )
  }

  cached = parsed.data
  return cached
}

export function productionReadiness() {
  const env = getStayCareEnv()
  const production = process.env.NODE_ENV === "production"
  const siteUrl = new URL(env.NEXT_PUBLIC_SITE_URL)
  const demoEnabled = env.NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED === "true"

  const checks = {
    secureSiteUrl: !production || siteUrl.protocol === "https:",
    productionTenant:
      !production || !env.STAYCARE_TENANT_SLUG.toLowerCase().includes("demo"),
    demoAccessDisabled: !production || !demoEnabled,
    database: Boolean(
      env.NEXT_PUBLIC_SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY
    ),
    auth: Boolean(env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    ai: Boolean(env.OPENAI_API_KEY),
    distributedRateLimit: Boolean(
      env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
    ),
    rateLimitFailClosed:
      !production || env.STAYCARE_RATE_LIMIT_FAIL_CLOSED === "true",
    documentRetention:
      env.STAYCARE_DOCUMENT_RETENTION_DAYS >= 30 &&
      env.STAYCARE_DOCUMENT_RETENTION_DAYS <= 3650,
    email: Boolean(env.RESEND_API_KEY && env.RESEND_FROM_EMAIL),
    botProtection: Boolean(
      env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY
    ),
    monitoring: Boolean(env.NEXT_PUBLIC_SENTRY_DSN),
    fieldEncryption: Boolean(env.STAYCARE_FIELD_ENCRYPTION_KEY),
    internalSecrets: Boolean(
      env.STAYCARE_WEBHOOK_SECRET && env.STAYCARE_CRON_SECRET
    ),
  }

  return {
    checks,
    ready: Object.values(checks).every(Boolean),
  }
}
