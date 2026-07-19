import "server-only"
import type {
  ProviderApplicationCommand,
  ProviderDispatchResult,
  ProviderKind,
  ProviderMode,
  StayCareProviderAdapter,
} from "@/lib/staycare/providers/types"

interface ProviderConfig {
  kind: ProviderKind
  mode: ProviderMode
  baseUrl?: string
  apiKey?: string
}

function configuration(kind: ProviderKind): ProviderConfig {
  const prefix = kind.toUpperCase()
  const mode = (process.env[`${prefix}_PROVIDER_MODE`] || "manual") as ProviderMode
  return {
    kind,
    mode,
    baseUrl: process.env[`${prefix}_PROVIDER_BASE_URL`] || undefined,
    apiKey: process.env[`${prefix}_PROVIDER_API_KEY`] || undefined,
  }
}

class ManualProviderAdapter implements StayCareProviderAdapter {
  readonly kind: ProviderKind
  readonly mode = "manual" as const

  constructor(kind: ProviderKind) {
    this.kind = kind
  }

  async dispatch(): Promise<ProviderDispatchResult> {
    return {
      accepted: true,
      mode: "manual",
      status: "reviewing",
      message: "Queued for Sejoong manual processing.",
    }
  }
}

class HttpProviderAdapter implements StayCareProviderAdapter {
  readonly kind: ProviderKind
  readonly mode: ProviderMode
  private readonly baseUrl: string
  private readonly apiKey: string

  constructor(config: ProviderConfig) {
    if (!config.baseUrl || !config.apiKey) {
      throw new Error(`${config.kind} provider requires BASE_URL and API_KEY in ${config.mode} mode`)
    }
    this.kind = config.kind
    this.mode = config.mode
    this.baseUrl = config.baseUrl.replace(/\/$/, "")
    this.apiKey = config.apiKey
  }

  async dispatch(command: ProviderApplicationCommand): Promise<ProviderDispatchResult> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 12_000)

    try {
      const response = await fetch(`${this.baseUrl}/applications`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "X-Idempotency-Key": command.idempotencyKey,
          "X-StayCare-Provider": this.kind,
        },
        body: JSON.stringify(command),
        signal: controller.signal,
        cache: "no-store",
      })

      const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>
      if (!response.ok) {
        throw new Error(
          typeof payload.message === "string"
            ? payload.message
            : `${this.kind} provider returned HTTP ${response.status}`
        )
      }

      const externalReference =
        typeof payload.externalReference === "string"
          ? payload.externalReference
          : typeof payload.reference === "string"
            ? payload.reference
            : undefined

      return {
        accepted: true,
        mode: this.mode,
        status: payload.status === "fulfilled" ? "fulfilled" : "waiting_provider",
        externalReference,
        rawStatus: typeof payload.status === "string" ? payload.status : undefined,
        message: typeof payload.message === "string" ? payload.message : undefined,
      }
    } finally {
      clearTimeout(timeout)
    }
  }
}

export function providerKindForCategory(category: string): ProviderKind | null {
  if (category === "telecom") return "telecom"
  if (category === "finance" || category === "bank") return "bank"
  if (category === "remittance") return "remittance"
  if (category === "delivery") return "delivery"
  return null
}

export function getProviderAdapter(kind: ProviderKind): StayCareProviderAdapter {
  const config = configuration(kind)
  if (config.mode === "manual") return new ManualProviderAdapter(kind)
  return new HttpProviderAdapter(config)
}

export function providerReadiness(kind: ProviderKind) {
  const config = configuration(kind)
  return {
    kind,
    mode: config.mode,
    configured:
      config.mode === "manual" || Boolean(config.baseUrl && config.apiKey),
  }
}
