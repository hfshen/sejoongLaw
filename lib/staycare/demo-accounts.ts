import accountConfig from "@/config/staycare-demo-accounts.json"
import type { StayCarePreferredLanguage } from "@/lib/staycare/language"

export type StayCareDemoTarget = "app" | "admin" | "portal"
export type StayCareDemoGroup = "worker" | "sejoong" | "operator" | "external" | "audit"

export interface StayCareDemoAccount {
  id: string
  role: string
  email: string
  target: StayCareDemoTarget
  group: StayCareDemoGroup
  label: Record<StayCarePreferredLanguage, string>
  description: Record<StayCarePreferredLanguage, string>
}

export const stayCareDemoTenantSlug = accountConfig.tenantSlug
export const stayCareDemoPassword = accountConfig.sharedPassword
export const stayCareDemoAccounts = accountConfig.accounts as StayCareDemoAccount[]

export function isStayCareDemoLoginEnabled() {
  return process.env.NEXT_PUBLIC_STAYCARE_DEMO_LOGIN_ENABLED !== "false"
}

export function getStayCareDemoTargetPath(
  account: Pick<StayCareDemoAccount, "target">,
  locale: string,
  language: StayCarePreferredLanguage
) {
  return `/${locale}/staycare/${account.target}?lang=${language}`
}

export function getStayCareDemoAccount(id: string) {
  return stayCareDemoAccounts.find((account) => account.id === id) || null
}
