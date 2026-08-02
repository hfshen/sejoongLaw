export type ProviderKind = "telecom" | "bank" | "remittance" | "delivery"
export type ProviderMode = "manual" | "sandbox" | "api"

export interface ProviderApplicationCommand {
  idempotencyKey: string
  applicationId: string
  applicationNo: string
  tenantId: string
  workerId: string
  serviceCode: string
  language: "ko" | "en" | "si" | "ta"
  submittedData: Record<string, unknown>
  callbackUrl: string
}

export interface ProviderDispatchResult {
  accepted: boolean
  mode: ProviderMode
  status: "waiting_provider" | "reviewing" | "approved" | "fulfilled"
  externalReference?: string
  message?: string
  rawStatus?: string
}

export interface ProviderWebhookPayload {
  eventId: string
  eventType: string
  applicationNo: string
  externalReference?: string
  status?: string
  occurredAt?: string
  message?: string
  metadata?: Record<string, unknown>
}

export interface StayCareProviderAdapter {
  kind: ProviderKind
  mode: ProviderMode
  dispatch(command: ProviderApplicationCommand): Promise<ProviderDispatchResult>
}
