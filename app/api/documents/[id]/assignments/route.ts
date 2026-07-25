import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import {
  allowedAssignmentPermissions,
  DOCUMENT_OPERATOR_ROLES,
  DOCUMENT_UUID_PATTERN,
  getDocumentActor,
  type DocumentPermission,
} from "@/lib/documents/access"
import type { UserRole } from "@/lib/auth/role-guard"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const assignableRoles: readonly UserRole[] = [
  "translator",
  "foreign_lawyer",
  "family_viewer",
]

const assignmentSchema = z.object({
  user_id: z.string().uuid(),
  permissions: z
    .array(z.enum(["view", "translate", "approve", "export"]))
    .min(1)
    .max(4),
})

function jsonNoStore(body: unknown, init?: ResponseInit) {
  const response = NextResponse.json(body, init)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function normalizePermissions(
  role: UserRole,
  requested: DocumentPermission[]
): DocumentPermission[] | null {
  const allowed = new Set(allowedAssignmentPermissions(role))
  const unique = [...new Set<DocumentPermission>(["view", ...requested])]
  if (unique.some((permission) => !allowed.has(permission))) return null
  return unique
}

async function assertDocumentExists(documentId: string) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from("documents")
    .select("id, case_id, name")
    .eq("id", documentId)
    .single()
  return error || !data ? null : data
}

async function writeAssignmentAudit({
  documentId,
  caseId,
  actorId,
  targetUserId,
  action,
  permissions,
}: {
  documentId: string
  caseId: string | null
  actorId: string
  targetUserId: string
  action: "assignment_created" | "assignment_updated" | "assignment_revoked"
  permissions?: DocumentPermission[]
}) {
  const supabase = getServiceClient()
  const { error } = await supabase.from("audit_events").insert({
    case_id: caseId,
    entity_type: "document",
    entity_id: documentId,
    action,
    actor: actorId,
    meta: {
      target_user_id: targetUserId,
      permissions: permissions || [],
    },
  })
  if (error) {
    logger.error("Document assignment audit failed", {
      error,
      documentId,
      actorUserId: actorId,
      targetUserId,
      action,
    })
  }
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return jsonNoStore({ error: "Forbidden" }, { status: 403 })

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return jsonNoStore({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }
    if (!(await assertDocumentExists(documentId))) {
      return jsonNoStore({ error: "문서를 찾을 수 없습니다." }, { status: 404 })
    }

    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from("document_assignments")
      .select(
        "id, document_id, user_id, permissions, assigned_by, assigned_at, revoked_at, profile:profiles!document_assignments_user_id_fkey(id, email, name, role, status, country, organization)"
      )
      .eq("document_id", documentId)
      .is("revoked_at", null)
      .order("assigned_at", { ascending: false })

    if (error) throw error
    return jsonNoStore({ assignments: data || [] })
  } catch (error) {
    logger.error("Failed to list document assignments", { error })
    return jsonNoStore(
      { error: "문서 배정 목록을 불러오지 못했습니다." },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return jsonNoStore({ error: "Forbidden" }, { status: 403 })

    const { id: documentId } = await params
    if (!DOCUMENT_UUID_PATTERN.test(documentId)) {
      return jsonNoStore({ error: "올바른 문서 ID가 필요합니다." }, { status: 400 })
    }

    const parsed = assignmentSchema.safeParse(await request.json())
    if (!parsed.success) {
      return jsonNoStore(
        { error: parsed.error.issues[0]?.message || "배정 정보를 확인해 주세요." },
        { status: 400 }
      )
    }

    const document = await assertDocumentExists(documentId)
    if (!document) {
      return jsonNoStore({ error: "문서를 찾을 수 없습니다." }, { status: 404 })
    }

    const supabase = getServiceClient()
    const { data: target, error: targetError } = await supabase
      .from("profiles")
      .select("id, role, status")
      .eq("id", parsed.data.user_id)
      .single()

    const targetRole = target?.role as UserRole | undefined
    if (
      targetError ||
      !target ||
      target.status !== "active" ||
      !targetRole ||
      !assignableRoles.includes(targetRole)
    ) {
      return jsonNoStore(
        { error: "활성 번역가, 해외변호사 또는 공유 열람자만 배정할 수 있습니다." },
        { status: 400 }
      )
    }

    const permissions = normalizePermissions(
      targetRole,
      parsed.data.permissions as DocumentPermission[]
    )
    if (!permissions) {
      return jsonNoStore(
        { error: "해당 역할에 허용되지 않은 문서 권한이 포함되어 있습니다." },
        { status: 400 }
      )
    }

    const { data: existing, error: existingError } = await supabase
      .from("document_assignments")
      .select("id")
      .eq("document_id", documentId)
      .eq("user_id", target.id)
      .is("revoked_at", null)
      .maybeSingle()
    if (existingError) throw existingError

    const mutation = existing
      ? supabase
          .from("document_assignments")
          .update({ permissions, assigned_by: actor.id, assigned_at: new Date().toISOString() })
          .eq("id", existing.id)
      : supabase.from("document_assignments").insert({
          document_id: documentId,
          user_id: target.id,
          permissions,
          assigned_by: actor.id,
        })

    const { data: assignment, error: mutationError } = await mutation
      .select()
      .single()
    if (mutationError || !assignment) throw mutationError || new Error("Assignment missing")

    await writeAssignmentAudit({
      documentId,
      caseId: document.case_id,
      actorId: actor.id,
      targetUserId: target.id,
      action: existing ? "assignment_updated" : "assignment_created",
      permissions,
    })

    return jsonNoStore(
      { assignment },
      { status: existing ? 200 : 201 }
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return jsonNoStore({ error: "Forbidden" }, { status: 403 })
    }
    logger.error("Failed to assign document", { error })
    return jsonNoStore({ error: "문서 배정에 실패했습니다." }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const actor = await getDocumentActor(DOCUMENT_OPERATOR_ROLES)
    if (!actor) return jsonNoStore({ error: "Forbidden" }, { status: 403 })

    const { id: documentId } = await params
    const userId = request.nextUrl.searchParams.get("user_id") || ""
    if (!DOCUMENT_UUID_PATTERN.test(documentId) || !DOCUMENT_UUID_PATTERN.test(userId)) {
      return jsonNoStore({ error: "올바른 문서와 사용자 ID가 필요합니다." }, { status: 400 })
    }

    const document = await assertDocumentExists(documentId)
    if (!document) return jsonNoStore({ error: "문서를 찾을 수 없습니다." }, { status: 404 })

    const supabase = getServiceClient()
    const { data: assignment, error } = await supabase
      .from("document_assignments")
      .update({ revoked_at: new Date().toISOString() })
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .is("revoked_at", null)
      .select("id")
      .maybeSingle()

    if (error) throw error
    if (!assignment) {
      return jsonNoStore({ error: "활성 배정을 찾을 수 없습니다." }, { status: 404 })
    }

    await writeAssignmentAudit({
      documentId,
      caseId: document.case_id,
      actorId: actor.id,
      targetUserId: userId,
      action: "assignment_revoked",
    })

    return jsonNoStore({ success: true })
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return jsonNoStore({ error: "Forbidden" }, { status: 403 })
    }
    logger.error("Failed to revoke document assignment", { error })
    return jsonNoStore({ error: "문서 배정 해제에 실패했습니다." }, { status: 500 })
  }
}
