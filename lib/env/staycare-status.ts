import "server-only"

export type EnvironmentItemState = "configured" | "missing" | "manual" | "partial"

export interface StayCareEnvironmentItem {
  id: string
  label: string
  keys: string[]
  group: "core" | "production" | "optional" | "provider"
  required: boolean
  state: EnvironmentItemState
  detail: string
  publicValue?: string
}

export interface StayCareEnvironmentReport {
  environment: string
  commitSha: string | null
  generatedAt: string
  items: StayCareEnvironmentItem[]
  summary: {
    coreConfigured: number
    coreTotal: number
    productionConfigured: number
    productionTotal: number
    overallConfigured: number
    overallTotal: number
    percentage: number
    releaseState: "blocked" | "internal-pilot" | "limited-production" | "production-ready"
  }
}

const has = (key: string) => Boolean(process.env[key]?.trim())
const hasAll = (keys: string[]) => keys.every(has)
const hasAny = (keys: string[]) => keys.some(has)

function safePublicValue(key: string) {
  const value = process.env[key]?.trim()
  if (!value) return undefined

  if (key.includes("URL") || key.includes("DSN")) {
    try {
      return new URL(value).host
    } catch {
      return "형식 확인 필요"
    }
  }

  if (key.includes("EMAIL")) return value
  if (key.endsWith("_MODE")) return value
  if (key === "STAYCARE_STORAGE_BUCKET" || key === "STAYCARE_TENANT_SLUG") return value
  return undefined
}

function row(input: {
  id: string
  label: string
  keys: string[]
  group: StayCareEnvironmentItem["group"]
  required: boolean
  mode?: "all" | "any"
  detail: string
  publicKey?: string
}): StayCareEnvironmentItem {
  const configured = (input.mode || "all") === "all" ? hasAll(input.keys) : hasAny(input.keys)
  return {
    ...input,
    state: configured ? "configured" : "missing",
    publicValue: input.publicKey ? safePublicValue(input.publicKey) : undefined,
  }
}

function providerRow(kind: "TELECOM" | "BANK" | "REMITTANCE" | "DELIVERY", label: string): StayCareEnvironmentItem {
  const modeKey = `${kind}_PROVIDER_MODE`
  const mode = process.env[modeKey]?.trim() || "manual"
  const apiKeys = [
    `${kind}_PROVIDER_BASE_URL`,
    `${kind}_PROVIDER_API_KEY`,
    `${kind}_PROVIDER_WEBHOOK_SECRET`,
  ]
  const configuredCount = apiKeys.filter(has).length
  const apiReady = configuredCount === apiKeys.length

  if (mode === "manual") {
    return {
      id: `provider-${kind.toLowerCase()}`,
      label,
      keys: [modeKey, ...apiKeys],
      group: "provider",
      required: false,
      state: "manual",
      detail: "수동 운영 가능 · 제휴 API 연결 전 관리자 포털에서 처리",
      publicValue: "manual",
    }
  }

  return {
    id: `provider-${kind.toLowerCase()}`,
    label,
    keys: [modeKey, ...apiKeys],
    group: "provider",
    required: false,
    state: apiReady ? "configured" : configuredCount ? "partial" : "missing",
    detail: apiReady
      ? `${mode} API 연결값 설정됨`
      : `${mode} 모드에는 Base URL·API Key·Webhook Secret이 모두 필요`,
    publicValue: mode,
  }
}

export function getStayCareEnvironmentReport(): StayCareEnvironmentReport {
  const items: StayCareEnvironmentItem[] = [
    row({
      id: "site-url",
      label: "서비스 URL",
      keys: ["NEXT_PUBLIC_SITE_URL"],
      group: "core",
      required: true,
      detail: "운영 도메인과 인증 리다이렉트 기준 URL",
      publicKey: "NEXT_PUBLIC_SITE_URL",
    }),
    row({
      id: "support",
      label: "세중 지원 연락처",
      keys: ["STAYCARE_SUPPORT_EMAIL"],
      group: "core",
      required: true,
      detail: "회원 안내·장애·개인정보 문의 수신처",
      publicKey: "STAYCARE_SUPPORT_EMAIL",
    }),
    row({
      id: "supabase-url",
      label: "Supabase 프로젝트",
      keys: ["NEXT_PUBLIC_SUPABASE_URL"],
      group: "core",
      required: true,
      detail: "인증·DB·Storage 운영 프로젝트",
      publicKey: "NEXT_PUBLIC_SUPABASE_URL",
    }),
    row({
      id: "supabase-public-key",
      label: "Supabase 공개키",
      keys: ["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      mode: "any",
      group: "core",
      required: true,
      detail: "Publishable key 또는 기존 anon key",
    }),
    row({
      id: "supabase-service-key",
      label: "Supabase 서버 비밀키",
      keys: ["SUPABASE_SERVICE_ROLE_KEY"],
      group: "core",
      required: true,
      detail: "서버 전용 · 브라우저에 절대 노출 금지",
    }),
    row({
      id: "storage",
      label: "비공개 문서 버킷",
      keys: ["STAYCARE_STORAGE_BUCKET"],
      group: "core",
      required: true,
      detail: "여권·비자·계약서 private Storage bucket",
      publicKey: "STAYCARE_STORAGE_BUCKET",
    }),
    row({
      id: "webhook-secret",
      label: "내부 Webhook Secret",
      keys: ["STAYCARE_WEBHOOK_SECRET"],
      group: "core",
      required: true,
      detail: "공급자·내부 이벤트 서명검증",
    }),
    row({
      id: "cron-secret",
      label: "Cron Secret",
      keys: ["STAYCARE_CRON_SECRET", "CRON_SECRET"],
      mode: "any",
      group: "core",
      required: true,
      detail: "만료알림·재시도·정기점검 작업 보호",
    }),
    row({
      id: "field-encryption",
      label: "민감 필드 암호화키",
      keys: ["STAYCARE_FIELD_ENCRYPTION_KEY"],
      group: "core",
      required: true,
      detail: "계좌·수취인 등 추가 애플리케이션 암호화",
    }),
    row({
      id: "openai",
      label: "OpenAI AI 통역·생활지원",
      keys: ["OPENAI_API_KEY"],
      group: "production",
      required: true,
      detail: "한국어·영어·싱할라어 AI 지원",
    }),
    row({
      id: "rate-limit",
      label: "Upstash 분산 Rate Limit",
      keys: ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN"],
      group: "production",
      required: true,
      detail: "로그인·AI·업로드·신청 API 남용 방지",
      publicKey: "UPSTASH_REDIS_REST_URL",
    }),
    row({
      id: "email",
      label: "Resend 이메일",
      keys: ["RESEND_API_KEY", "RESEND_FROM_EMAIL"],
      group: "production",
      required: true,
      detail: "로그인·신청·보완·완료 알림",
      publicKey: "RESEND_FROM_EMAIL",
    }),
    row({
      id: "turnstile",
      label: "Cloudflare Turnstile",
      keys: ["NEXT_PUBLIC_TURNSTILE_SITE_KEY", "TURNSTILE_SECRET_KEY"],
      group: "production",
      required: true,
      detail: "로그인과 공개 폼 봇 방지",
    }),
    row({
      id: "sentry",
      label: "Sentry 모니터링",
      keys: ["NEXT_PUBLIC_SENTRY_DSN"],
      group: "production",
      required: true,
      detail: "운영 오류·성능·배포 추적",
      publicKey: "NEXT_PUBLIC_SENTRY_DSN",
    }),
    row({
      id: "sms",
      label: "CoolSMS 문자",
      keys: ["COOLSMS_API_KEY", "COOLSMS_API_SECRET", "COOLSMS_SENDER_PHONE"],
      group: "optional",
      required: false,
      detail: "한국 번호 SMS와 운영 알림",
    }),
    row({
      id: "kakao-map",
      label: "Kakao 지도",
      keys: ["KAKAO_REST_API_KEY", "NEXT_PUBLIC_KAKAO_MAP_JAVASCRIPT_KEY"],
      group: "optional",
      required: false,
      detail: "병원·은행·출입국·노동기관 위치",
    }),
    row({
      id: "firebase",
      label: "Firebase Push",
      keys: ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", "FIREBASE_SERVICE_ACCOUNT_JSON_BASE64"],
      group: "optional",
      required: false,
      detail: "웹·모바일 푸시 알림",
    }),
    row({
      id: "payments",
      label: "Toss Payments",
      keys: ["NEXT_PUBLIC_TOSS_PAYMENTS_CLIENT_KEY", "TOSS_PAYMENTS_SECRET_KEY"],
      group: "optional",
      required: false,
      detail: "앱 내 결제를 사용할 때만 활성화",
    }),
    providerRow("TELECOM", "통신·eSIM 공급자"),
    providerRow("BANK", "은행·급여계좌 공급자"),
    providerRow("REMITTANCE", "스리랑카 송금 공급자"),
    providerRow("DELIVERY", "공항·숙소 배송 공급자"),
  ]

  const isReady = (item: StayCareEnvironmentItem) => item.state === "configured" || item.state === "manual"
  const core = items.filter((item) => item.group === "core")
  const production = items.filter((item) => item.group === "production")
  const configured = items.filter(isReady).length
  const coreReady = core.every(isReady)
  const productionReady = production.every(isReady)
  const providersValid = items
    .filter((item) => item.group === "provider")
    .every((item) => item.state === "configured" || item.state === "manual")

  const releaseState: StayCareEnvironmentReport["summary"]["releaseState"] = !coreReady
    ? "blocked"
    : !productionReady
      ? "internal-pilot"
      : !providersValid
        ? "limited-production"
        : "production-ready"

  return {
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || null,
    generatedAt: new Date().toISOString(),
    items,
    summary: {
      coreConfigured: core.filter(isReady).length,
      coreTotal: core.length,
      productionConfigured: production.filter(isReady).length,
      productionTotal: production.length,
      overallConfigured: configured,
      overallTotal: items.length,
      percentage: Math.round((configured / items.length) * 100),
      releaseState,
    },
  }
}
