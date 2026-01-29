// Approval workflow for document versions
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"
import type { TargetLanguage } from "@/lib/documents/translation"

export type UserRole = "korea_agent" | "translator" | "foreign_lawyer" | "family_viewer" | "admin"

export interface Approval {
  id: string
  version_id: string
  target_lang: string
  approved_by: string
  role: UserRole
  decision: "approved" | "rejected"
  comment: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export interface CreateApprovalParams {
  versionId: string
  targetLang: string | "source"
  approvedBy: string
  role: UserRole
  decision: "approved" | "rejected"
  comment?: string
  ipAddress?: string | null
  userAgent?: string | null
}

/**
 * Create an approval event (immutable)
 */
export async function createApproval(params: CreateApprovalParams): Promise<Approval> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("approvals")
    .insert({
      version_id: params.versionId,
      target_lang: params.targetLang,
      approved_by: params.approvedBy,
      role: params.role,
      decision: params.decision,
      comment: params.comment || null,
      ip_address: params.ipAddress || null,
      user_agent: params.userAgent || null,
    })
    .select()
    .single()

  if (error) {
    logger.error("Failed to create approval", { error, params })
    throw new Error("Failed to create approval")
  }

  logger.info("Approval created", {
    approvalId: data.id,
    versionId: params.versionId,
    targetLang: params.targetLang,
    role: params.role,
    decision: params.decision,
  })

  return data
}

/**
 * Check approval status for a version and target language
 */
export async function checkApprovalStatus(
  versionId: string,
  targetLang: string | "source"
): Promise<{
  approved: boolean
  rejected: boolean
  pending: boolean
  approvals: Approval[]
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("version_id", versionId)
    .eq("target_lang", targetLang)
    .order("created_at", { ascending: false })

  if (error) {
    logger.error("Failed to check approval status", { error, versionId, targetLang })
    throw new Error("Failed to check approval status")
  }

  const approvals = data || []

  // Check if there's a rejection (rejections take precedence)
  const hasRejection = approvals.some((a) => a.decision === "rejected")
  const hasApproval = approvals.some((a) => a.decision === "approved")

  return {
    approved: hasApproval && !hasRejection,
    rejected: hasRejection,
    pending: !hasApproval && !hasRejection,
    approvals,
  }
}

/**
 * Get approval chain for a version
 */
export async function getApprovalChain(versionId: string): Promise<Approval[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("approvals")
    .select("*")
    .eq("version_id", versionId)
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("Failed to get approval chain", { error, versionId })
    throw new Error("Failed to get approval chain")
  }

  return data || []
}

/**
 * Check if a user can approve based on their role
 */
export function canUserApprove(
  userRole: UserRole,
  targetLang: string | "source"
): boolean {
  // Role-based approval rules
  switch (userRole) {
    case "korea_agent":
      // Can approve source documents
      return targetLang === "source"
    case "translator":
      // Can approve translations (English)
      return targetLang === "en"
    case "foreign_lawyer":
      // Can approve local language translations (Sinhala, Tamil)
      return targetLang === "si" || targetLang === "ta"
    case "admin":
      // Admin can approve anything
      return true
    case "family_viewer":
      // Family viewers can only view, not approve
      return false
    default:
      return false
  }
}

/**
 * Get required approvals for a version
 */
export async function getRequiredApprovals(
  versionId: string,
  targetLangs: string[]
): Promise<{
  source: { required: boolean; approved: boolean; rejected: boolean }
  translations: Record<string, { required: boolean; approved: boolean; rejected: boolean }>
}> {
  const sourceStatus = await checkApprovalStatus(versionId, "source")

  const translations: Record<string, { required: boolean; approved: boolean; rejected: boolean }> =
    {}

  for (const lang of targetLangs) {
    const status = await checkApprovalStatus(versionId, lang)
    translations[lang] = {
      required: true,
      approved: status.approved,
      rejected: status.rejected,
    }
  }

  return {
    source: {
      required: true,
      approved: sourceStatus.approved,
      rejected: sourceStatus.rejected,
    },
    translations,
  }
}

/**
 * Check if version is ready for export (all required approvals obtained)
 */
export async function isVersionReadyForExport(
  versionId: string,
  targetLangs: string[]
): Promise<boolean> {
  const requiredApprovals = await getRequiredApprovals(versionId, targetLangs)

  // Source must be approved
  if (!requiredApprovals.source.approved || requiredApprovals.source.rejected) {
    return false
  }

  // All translations must be approved
  for (const lang of targetLangs) {
    const status = requiredApprovals.translations[lang]
    if (!status.approved || status.rejected) {
      return false
    }
  }

  return true
}
