// Audit trail system for comprehensive tracking
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"

export type EntityType = "document" | "version" | "translation" | "approval" | "export" | "case"

export interface AuditEvent {
  id: string
  case_id: string | null
  entity_type: EntityType
  entity_id: string
  action: string
  meta: Record<string, any>
  actor: string | null
  created_at: string
}

export interface LogAuditEventParams {
  caseId?: string | null
  entityType: EntityType
  entityId: string
  action: string
  meta?: Record<string, any>
  actor?: string | null
}

/**
 * Log an audit event (immutable)
 */
export async function logAuditEvent(params: LogAuditEventParams): Promise<AuditEvent> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audit_events")
    .insert({
      case_id: params.caseId || null,
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      meta: params.meta || {},
      actor: params.actor || null,
    })
    .select()
    .single()

  if (error) {
    logger.error("Failed to log audit event", { error, params })
    throw new Error("Failed to log audit event")
  }

  logger.info("Audit event logged", {
    eventId: data.id,
    entityType: params.entityType,
    entityId: params.entityId,
    action: params.action,
  })

  return data
}

/**
 * Get audit trail for a case
 */
export async function getAuditTrail(caseId: string): Promise<AuditEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("Failed to get audit trail", { error, caseId })
    throw new Error("Failed to get audit trail")
  }

  return data || []
}

/**
 * Get audit events for a specific entity
 */
export async function getEntityAuditEvents(
  entityType: EntityType,
  entityId: string
): Promise<AuditEvent[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("audit_events")
    .select("*")
    .eq("entity_type", entityType)
    .eq("entity_id", entityId)
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("Failed to get entity audit events", { error, entityType, entityId })
    throw new Error("Failed to get entity audit events")
  }

  return data || []
}

/**
 * Generate audit report for a case
 */
export async function generateAuditReport(caseId: string): Promise<{
  caseId: string
  totalEvents: number
  events: AuditEvent[]
  summary: {
    byType: Record<EntityType, number>
    byAction: Record<string, number>
    byActor: Record<string, number>
  }
}> {
  const events = await getAuditTrail(caseId)

  const summary = {
    byType: {} as Record<EntityType, number>,
    byAction: {} as Record<string, number>,
    byActor: {} as Record<string, number>,
  }

  for (const event of events) {
    // Count by type
    summary.byType[event.entity_type] = (summary.byType[event.entity_type] || 0) + 1

    // Count by action
    summary.byAction[event.action] = (summary.byAction[event.action] || 0) + 1

    // Count by actor
    const actor = event.actor || "system"
    summary.byActor[actor] = (summary.byActor[actor] || 0) + 1
  }

  return {
    caseId,
    totalEvents: events.length,
    events,
    summary,
  }
}

/**
 * Get audit events filtered by date range
 */
export async function getAuditEventsByDateRange(
  caseId: string | null,
  startDate: Date,
  endDate: Date
): Promise<AuditEvent[]> {
  const supabase = await createClient()

  let query = supabase
    .from("audit_events")
    .select("*")
    .gte("created_at", startDate.toISOString())
    .lte("created_at", endDate.toISOString())
    .order("created_at", { ascending: true })

  if (caseId) {
    query = query.eq("case_id", caseId)
  }

  const { data, error } = await query

  if (error) {
    logger.error("Failed to get audit events by date range", { error, caseId, startDate, endDate })
    throw new Error("Failed to get audit events by date range")
  }

  return data || []
}

/**
 * Helper function to log common actions
 */
export const AuditActions = {
  CASE_CREATED: "case_created",
  CASE_UPDATED: "case_updated",
  DOCUMENT_CREATED: "document_created",
  DOCUMENT_UPDATED: "document_updated",
  VERSION_CREATED: "version_created",
  VERSION_LOCKED: "version_locked",
  SEGMENT_CREATED: "segment_created",
  TRANSLATION_CREATED: "translation_created",
  TRANSLATION_REVIEWED: "translation_reviewed",
  TRANSLATION_APPROVED: "translation_approved",
  APPROVAL_CREATED: "approval_created",
  APPROVAL_REJECTED: "approval_rejected",
  EXPORT_CREATED: "export_created",
  EXPORT_DOWNLOADED: "export_downloaded",
} as const
