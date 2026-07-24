#!/usr/bin/env node

const strict = process.argv.includes("--strict")

const value = (name) => process.env[name]?.trim() || ""
const has = (name) => Boolean(value(name))
const hasEither = (...names) => names.some(has)
const lengthAtLeast = (name, length) => value(name).length >= length
const integerInRange = (name, minimum, maximum) => {
  const number = Number(value(name))
  return Number.isInteger(number) && number >= minimum && number <= maximum
}

function validUrl(name, { https = false } = {}) {
  try {
    const parsed = new URL(value(name))
    return !https || parsed.protocol === "https:"
  } catch {
    return false
  }
}

const core = [
  ["NEXT_PUBLIC_SITE_URL", validUrl("NEXT_PUBLIC_SITE_URL")],
  ["STAYCARE_SUPPORT_EMAIL", has("STAYCARE_SUPPORT_EMAIL")],
  ["NEXT_PUBLIC_SUPABASE_URL", validUrl("NEXT_PUBLIC_SUPABASE_URL")],
  [
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    hasEither("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  ],
  ["SUPABASE_SERVICE_ROLE_KEY", lengthAtLeast("SUPABASE_SERVICE_ROLE_KEY", 20)],
  ["STAYCARE_STORAGE_BUCKET", has("STAYCARE_STORAGE_BUCKET")],
  ["STAYCARE_WEBHOOK_SECRET", lengthAtLeast("STAYCARE_WEBHOOK_SECRET", 24)],
  [
    "STAYCARE_CRON_SECRET or CRON_SECRET",
    lengthAtLeast("STAYCARE_CRON_SECRET", 24) || lengthAtLeast("CRON_SECRET", 24),
  ],
]

const productionSafety = [
  ["Production site URL uses HTTPS", validUrl("NEXT_PUBLIC_SITE_URL", { https: true })],
  [
    "Production tenant is not a demo tenant",
    !value("STAYCARE_TENANT_SLUG").toLowerCase().includes("demo"),
  ],
  [
    "Public demo login is disabled",
    value("NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED") !== "true",
  ],
  [
    "Production demo override is disabled",
    value("STAYCARE_ALLOW_PRODUCTION_DEMO_LOGIN") !== "true",
  ],
  [
    "Distributed rate limiting fails closed",
    value("STAYCARE_RATE_LIMIT_FAIL_CLOSED") !== "false",
  ],
  [
    "Document retention policy is explicit (30-3650 days)",
    integerInRange("STAYCARE_DOCUMENT_RETENTION_DAYS", 30, 3650),
  ],
  ["Field encryption key is strong", lengthAtLeast("STAYCARE_FIELD_ENCRYPTION_KEY", 32)],
]

const recommended = [
  ["OPENAI_API_KEY", has("OPENAI_API_KEY")],
  ["UPSTASH_REDIS_REST_URL", validUrl("UPSTASH_REDIS_REST_URL", { https: true })],
  ["UPSTASH_REDIS_REST_TOKEN", has("UPSTASH_REDIS_REST_TOKEN")],
  ["RESEND_API_KEY", has("RESEND_API_KEY")],
  ["RESEND_FROM_EMAIL", has("RESEND_FROM_EMAIL")],
  ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", has("NEXT_PUBLIC_TURNSTILE_SITE_KEY")],
  ["TURNSTILE_SECRET_KEY", has("TURNSTILE_SECRET_KEY")],
  ["NEXT_PUBLIC_SENTRY_DSN", validUrl("NEXT_PUBLIC_SENTRY_DSN", { https: true })],
]

const optional = [
  [
    "COOLSMS_API_KEY / SECRET / SENDER",
    has("COOLSMS_API_KEY") && has("COOLSMS_API_SECRET") && has("COOLSMS_SENDER_PHONE"),
  ],
  [
    "Kakao map keys",
    has("KAKAO_REST_API_KEY") && has("NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY"),
  ],
  [
    "Firebase push keys",
    has("NEXT_PUBLIC_FIREBASE_PROJECT_ID") && has("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64"),
  ],
  [
    "Toss Payments keys",
    has("NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY") && has("TOSS_PAYMENTS_SECRET_KEY"),
  ],
]

const providerKinds = ["TELECOM", "BANK", "REMITTANCE", "DELIVERY"]
const providerChecks = providerKinds.map((kind) => {
  const mode = value(`${kind}_PROVIDER_MODE`) || "manual"
  const configured =
    mode === "manual" ||
    ((mode === "sandbox" || mode === "api") &&
      validUrl(`${kind}_PROVIDER_BASE_URL`, { https: true }) &&
      has(`${kind}_PROVIDER_API_KEY`) &&
      has(`${kind}_PROVIDER_WEBHOOK_SECRET`))
  return [`${kind}_PROVIDER (${mode})`, configured]
})

function printGroup(title, rows) {
  console.log(`\n${title}`)
  for (const [name, ok] of rows) {
    console.log(`${ok ? "✓" : "✗"} ${name}`)
  }
}

printGroup("CORE", core)
printGroup("PRODUCTION SAFETY", productionSafety)
printGroup("RECOMMENDED", recommended)
printGroup("PROVIDERS", providerChecks)
printGroup("OPTIONAL", optional)

const missingCore = core.filter(([, ok]) => !ok).map(([name]) => name)
const unsafeProduction = productionSafety.filter(([, ok]) => !ok).map(([name]) => name)
const missingRecommended = recommended.filter(([, ok]) => !ok).map(([name]) => name)
const invalidProviders = providerChecks.filter(([, ok]) => !ok).map(([name]) => name)

if (
  missingCore.length ||
  invalidProviders.length ||
  (strict && (unsafeProduction.length || missingRecommended.length))
) {
  console.error("\nStayCare environment is NOT ready.")
  if (missingCore.length) console.error(`Missing core: ${missingCore.join(", ")}`)
  if (invalidProviders.length) {
    console.error(`Invalid provider configuration: ${invalidProviders.join(", ")}`)
  }
  if (strict && unsafeProduction.length) {
    console.error(`Unsafe production settings: ${unsafeProduction.join(", ")}`)
  }
  if (strict && missingRecommended.length) {
    console.error(`Missing production services: ${missingRecommended.join(", ")}`)
  }
  process.exit(1)
}

console.log(
  strict
    ? "\nStayCare environment passed strict commercial release checks."
    : "\nStayCare environment passed core checks."
)
