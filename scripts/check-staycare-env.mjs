#!/usr/bin/env node

const strict = process.argv.includes("--strict")

const has = (name) => Boolean(process.env[name]?.trim())
const hasEither = (...names) => names.some(has)

const core = [
  ["NEXT_PUBLIC_SITE_URL", has("NEXT_PUBLIC_SITE_URL")],
  ["STAYCARE_SUPPORT_EMAIL", has("STAYCARE_SUPPORT_EMAIL")],
  ["NEXT_PUBLIC_SUPABASE_URL", has("NEXT_PUBLIC_SUPABASE_URL")],
  [
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    hasEither("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  ],
  ["SUPABASE_SERVICE_ROLE_KEY", has("SUPABASE_SERVICE_ROLE_KEY")],
  ["STAYCARE_STORAGE_BUCKET", has("STAYCARE_STORAGE_BUCKET")],
  ["STAYCARE_WEBHOOK_SECRET", has("STAYCARE_WEBHOOK_SECRET")],
  ["STAYCARE_CRON_SECRET or CRON_SECRET", hasEither("STAYCARE_CRON_SECRET", "CRON_SECRET")],
]

const recommended = [
  ["OPENAI_API_KEY", has("OPENAI_API_KEY")],
  ["UPSTASH_REDIS_REST_URL", has("UPSTASH_REDIS_REST_URL")],
  ["UPSTASH_REDIS_REST_TOKEN", has("UPSTASH_REDIS_REST_TOKEN")],
  ["RESEND_API_KEY", has("RESEND_API_KEY")],
  ["RESEND_FROM_EMAIL", has("RESEND_FROM_EMAIL")],
  ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", has("NEXT_PUBLIC_TURNSTILE_SITE_KEY")],
  ["TURNSTILE_SECRET_KEY", has("TURNSTILE_SECRET_KEY")],
  ["NEXT_PUBLIC_SENTRY_DSN", has("NEXT_PUBLIC_SENTRY_DSN")],
  ["STAYCARE_FIELD_ENCRYPTION_KEY", has("STAYCARE_FIELD_ENCRYPTION_KEY")],
]

const optional = [
  ["COOLSMS_API_KEY / SECRET / SENDER", has("COOLSMS_API_KEY") && has("COOLSMS_API_SECRET") && has("COOLSMS_SENDER_PHONE")],
  ["Kakao map keys", has("KAKAO_REST_API_KEY") && has("NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY")],
  ["Firebase push keys", has("NEXT_PUBLIC_FIREBASE_PROJECT_ID") && has("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64")],
  ["Toss Payments keys", has("NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY") && has("TOSS_PAYMENTS_SECRET_KEY")],
]

const providerKinds = ["TELECOM", "BANK", "REMITTANCE", "DELIVERY"]
const providerChecks = providerKinds.map((kind) => {
  const mode = process.env[`${kind}_PROVIDER_MODE`] || "manual"
  const configured = mode === "manual" || (
    has(`${kind}_PROVIDER_BASE_URL`) &&
    has(`${kind}_PROVIDER_API_KEY`) &&
    has(`${kind}_PROVIDER_WEBHOOK_SECRET`)
  )
  return [`${kind}_PROVIDER (${mode})`, configured]
})

function printGroup(title, rows) {
  console.log(`\n${title}`)
  for (const [name, ok] of rows) {
    console.log(`${ok ? "✓" : "✗"} ${name}`)
  }
}

printGroup("CORE", core)
printGroup("RECOMMENDED", recommended)
printGroup("PROVIDERS", providerChecks)
printGroup("OPTIONAL", optional)

const missingCore = core.filter(([, ok]) => !ok).map(([name]) => name)
const missingRecommended = recommended.filter(([, ok]) => !ok).map(([name]) => name)
const invalidProviders = providerChecks.filter(([, ok]) => !ok).map(([name]) => name)

if (missingCore.length || invalidProviders.length || (strict && missingRecommended.length)) {
  console.error("\nStayCare environment is NOT ready.")
  if (missingCore.length) console.error(`Missing core: ${missingCore.join(", ")}`)
  if (invalidProviders.length) console.error(`Invalid provider configuration: ${invalidProviders.join(", ")}`)
  if (strict && missingRecommended.length) {
    console.error(`Missing recommended in strict mode: ${missingRecommended.join(", ")}`)
  }
  process.exit(1)
}

console.log(
  strict
    ? "\nStayCare environment passed strict production checks."
    : "\nStayCare environment passed core checks."
)
