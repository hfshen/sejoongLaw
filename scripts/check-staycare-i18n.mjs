#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"

const root = process.cwd()
const read = (file) => fs.readFileSync(path.join(root, file), "utf8")
const failures = []
const check = (condition, message) => {
  if (!condition) failures.push(message)
}

const requiredLocales = ["ko", "en", "si", "ta"]
const languageFile = read("lib/staycare/language.ts")
for (const locale of requiredLocales) {
  check(languageFile.includes(`"${locale}"`), `language.ts is missing ${locale}`)
}
check(languageFile.includes('ta: "தமிழ்"'), "Tamil language label is missing")

const coreFiles = [
  "components/staycare/StayCareLanding.tsx",
  "components/staycare/StayCareLogin.tsx",
  "components/staycare/StayCareOnboarding.tsx",
  "components/staycare/StayCareWorkerClaim.tsx",
  "components/staycare/StayCareWorkerWorkspace.tsx",
  "components/staycare/StayCarePartnerWorkspace.tsx",
  "components/staycare/StayCareIdentityCenter.tsx",
  "components/staycare/StayCareRosterImport.tsx",
]
for (const file of coreFiles) {
  const source = read(file)
  check(/\bta\s*:/.test(source), `${file} has no Tamil copy block`)
}

const sourceFiles = [
  ...coreFiles,
  "lib/auth/redirects.ts",
  "lib/env/staycare.ts",
  "lib/staycare/language.ts",
  "lib/staycare/notifications.ts",
  "lib/staycare/providers/types.ts",
  "lib/staycare/role-capabilities.ts",
  "app/api/staycare/onboarding/route.ts",
  "app/api/staycare/profile/route.ts",
  "app/api/staycare/applications/route.ts",
  "app/api/staycare/ai/route.ts",
]
const forbidden = [
  /z\.enum\(\[\s*["']ko["']\s*,\s*["']en["']\s*,\s*["']si["']\s*\]\)/,
  /["']ko["']\s*\|\s*["']en["']\s*\|\s*["']si["'](?!\s*\|\s*["']ta["'])/,
  /\[\s*["']ko["']\s*,\s*["']en["']\s*,\s*["']si["']\s*\]/,
  /\^\\\/\(ko\|en\|si\)\\\//,
]
for (const file of sourceFiles) {
  const source = read(file)
  for (const pattern of forbidden) {
    check(!pattern.test(source), `${file} still contains a three-language-only contract: ${pattern}`)
  }
}

const oldWording = [
  /한국어[·, ]+영어[·, ]+싱할라어(?![·, ]+타밀어)/,
  /Korean, English and Sinhala(?! and Tamil)/,
  /Korean · English · Sinhala(?! · Tamil)/,
]
for (const file of [...sourceFiles, "lib/staycare/lifecycle-model.ts"]) {
  const source = read(file)
  for (const pattern of oldWording) {
    check(!pattern.test(source), `${file} still describes only three languages`)
  }
}

const lifecycle = read("lib/staycare/lifecycle-model.ts")
const tamilCatalogue = read("lib/staycare/tamil-translations.ts")
const englishPhrases = new Set(
  Array.from(lifecycle.matchAll(/\ben:\s*"((?:[^"\\]|\\.)*)"/g), (match) => match[1])
)
const tamilKeys = new Set(
  Array.from(tamilCatalogue.matchAll(/^\s*(?:"((?:[^"\\]|\\.)*)"|([A-Za-z][A-Za-z0-9 ]*)):\s*/gm), (match) => match[1] || match[2])
)
for (const phrase of englishPhrases) {
  const escaped = phrase.replaceAll('\\"', '"')
  const nearbyExplicitTamil = lifecycle.includes(`en: "${phrase}"`) && new RegExp(`en:\\s*"${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^}]*\\bta\\s*:`, "s").test(lifecycle)
  check(tamilKeys.has(phrase) || tamilKeys.has(escaped) || nearbyExplicitTamil, `Lifecycle Tamil translation missing: ${escaped}`)
}

const interfaceCatalogue = read("lib/staycare/interface-translations.ts")
const interfaceEntries = Array.from(
  interfaceCatalogue.matchAll(/^\s*"((?:[^"\\]|\\.)*)":\s*\{([^\n]+)\},?$/gm)
)
check(interfaceEntries.length >= 100, "Interface translation catalogue is unexpectedly small")
for (const [, key, body] of interfaceEntries) {
  for (const locale of requiredLocales) {
    check(new RegExp(`\\b${locale}\\s*:`).test(body), `Interface phrase '${key}' is missing ${locale}`)
  }
}

const runtime = read("components/staycare/StayCareRuntimeTranslator.tsx")
check(runtime.includes("MutationObserver"), "Runtime translation guard is missing")
check(runtime.includes("translateStayCareInterface"), "Runtime translator is not connected to the interface catalogue")
const layout = read("app/[locale]/staycare/layout.tsx")
check(layout.includes("<StayCareRuntimeTranslator"), "StayCare layout does not apply the runtime translation guard")

const demoConfig = JSON.parse(read("config/staycare-demo-accounts.json"))
for (const account of demoConfig.accounts || []) {
  for (const locale of requiredLocales) {
    check(Boolean(account.label?.[locale]), `Demo account ${account.role} label is missing ${locale}`)
    check(Boolean(account.description?.[locale]), `Demo account ${account.role} description is missing ${locale}`)
  }
}

const migration = read("supabase/migrations/019_staycare_four_language_completion.sql")
for (const table of [
  "staycare_tenants",
  "staycare_workers",
  "staycare_consents",
  "staycare_service_applications",
  "staycare_push_devices",
  "staycare_ai_sessions",
  "staycare_notifications",
]) {
  check(migration.includes(table), `Migration 019 does not cover ${table}`)
}
check((migration.match(/'ta'/g) || []).length >= 8, "Migration 019 does not add Tamil to all language constraints")

if (failures.length) {
  console.error("StayCare four-language validation failed:\n")
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`StayCare i18n passed: ${requiredLocales.join(", ")} · ${englishPhrases.size} lifecycle phrases · ${interfaceEntries.length} interface phrases.`)
