import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import type { UserProfile, UserRole } from "@/lib/auth/role-guard"
import logger from "@/lib/logger"
import { getServiceClient } from "@/lib/supabase/service"

export const DOCUMENT_ROLES: readonly UserRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
  "family_viewer",
]

export const DOCUMENT_OPERATOR_ROLES: readonly UserRole[] = ["admin", "korea_agent"]
export type DocumentPermission = "view" | "translate" | "approve" | "export"

export const DOCUMENT_UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function getDocumentActor(requiredRoles: readonly UserRole[] = DOCUMENT_ROLES) {
  return getAuthenticatedBackofficeProfile(requiredRoles)
}

export function allowedAssignmentPermissions(role: UserRole): DocumentPermission[] {
  switch (role) {
    case "translator":
      return ["view", "translate"]
    case "foreign_lawyer":
      return ["view", "approve"]
    case "family_viewer":
      return ["view"]
    case "admin":
    case "korea_agent":
      return ["view", "translate", "approve", "export"]
    default:
      return []
  }
}

function missingAssignmentTable(error: unknown) {
  if (!error || typeof error !== "object") return false
  const candidate = error as { code?: string; message?: string }
  return (
    candidate.code === "42P01" ||
    candidate.code === "PGRST205" ||
    candidate.message?.includes("document_assignments") === true
  )
}

function allowsPreMigrationDevelopmentFallback(actor: UserProfile) {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.WORKFLOW_DOCUMENT_ASSIGNMENTS_ENFORCED !== "true" &&
    (actor.role === "translator" || actor.role === "foreign_lawyer")
  )
}

function operatorHasGlobalAccess(actor: UserProfile) {
  return actor.role === "admin" || actor.role === "korea_agent"
}

export async function hasDocumentPermission(
  actor: UserProfile,
  documentId: string,
  permission: DocumentPermission = "view"
): Promise<boolean> {
  if (!DOCUMENT_UUID_PATTERN.test(documentId)) return false
  if (operatorHasGlobalAccess(actor)) return true

  const supabase = getServiceClient()
  const { data: document, error: documentError } = await supabase
    .from("documents")
    .select("id, created_by")
    .eq("id", documentId)
    .single()

  if (documentError || !document) return false
  if (document.created_by === actor.id) return true

  const { data: assignment, error: assignmentError } = await supabase
    .from("document_assignments")
    .select("permissions")
    .eq("document_id", documentId)
    .eq("user_id", actor.id)
    .is("revoked_at", null)
    .maybeSingle()

  if (assignmentError) {
    if (missingAssignmentTable(assignmentError)) {
      logger.error("Document assignment migration is missing", {
        actorUserId: actor.id,
        documentId,
      })
      return allowsPreMigrationDevelopmentFallback(actor)
    }
    logger.error("Document assignment lookup failed", {
      error: assignmentError,
      actorUserId: actor.id,
      documentId,
    })
    return false
  }

  if (!assignment) return false
  const permissions = Array.isArray(assignment.permissions)
    ? assignment.permissions
    : []
  return permission === "view" || permissions.includes(permission)
}

/**
 * null means the actor has global document access. An array means document
 * queries must be restricted to exactly those IDs.
 */
export async function accessibleDocumentIds(
  actor: UserProfile,
  permission: DocumentPermission = "view"
): Promise<string[] | null> {
  if (operatorHasGlobalAccess(actor)) return null

  const supabase = getServiceClient()
  const [{ data: created, error: createdError }, { data: assignments, error: assignmentError }] =
    await Promise.all([
      supabase.from("documents").select("id").eq("created_by", actor.id),
      supabase
        .from("document_assignments")
        .select("document_id, permissions")
        .eq("user_id", actor.id)
        .is("revoked_at", null),
    ])

  if (createdError) {
    logger.error("Created document lookup failed", {
      error: createdError,
      actorUserId: actor.id,
    })
    return []
  }

  if (assignmentError) {
    if (missingAssignmentTable(assignmentError)) {
      logger.error("Document assignment migration is missing", {
        actorUserId: actor.id,
      })
      return allowsPreMigrationDevelopmentFallback(actor)
        ? null
        : (created || []).map((item) => item.id)
    }
    logger.error("Assigned document lookup failed", {
      error: assignmentError,
      actorUserId: actor.id,
    })
    return []
  }

  const ids = new Set((created || []).map((item) => item.id))
  for (const assignment of assignments || []) {
    const permissions = Array.isArray(assignment.permissions)
      ? assignment.permissions
      : []
    if (permission === "view" || permissions.includes(permission)) {
      ids.add(assignment.document_id)
    }
  }
  return [...ids]
}
