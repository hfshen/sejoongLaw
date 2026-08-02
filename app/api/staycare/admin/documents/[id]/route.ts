import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import {
  actorRoleForTenant,
  tenantIdsForCapability,
} from "@/lib/staycare/authorization"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum(["approved", "rejected", "review_required"]),
  rejectionReason: z.string().trim().max(1000).optional().or(z.literal("")),
})

function canReviewDocument(current: string, next: string) {
  if (current === next) return true
  if (current === "review_required") return ["approved", "rejected"].includes(next)
  if (current === "rejected") return next === "review_required"
  return false
}

function preferredLanguage(value: unknown): "ko" | "en" | "si" | "ta" {
  if (value && typeof value === "object") {
    const language = (value as { preferred_language?: unknown }).preferred_language
    if (language === "ko" || language === "en" || language === "si") return language
  }
  return "en"
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const context = await getStaffContext()
    if (!context) {
      return NextResponse.json({ error: "Staff access required" }, { status: 403 })
    }

    const tenantIds = tenantIdsForCapability(
      context.memberships,
      "canManageDocuments"
    )
    if (!tenantIds.length) {
      return NextResponse.json(
        { error: "Your role has read-only document access" },
        { status: 403 }
      )
    }

    const limited = await rateLimit({
      key: `admin-document:${context.user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Document review limit exceeded")
    }

    const body = schema.parse(await request.json())
    if (body.status === "rejected" && !body.rejectionReason) {
      return NextResponse.json(
        { error: "A rejection reason is required" },
        { status: 400 }
      )
    }

    const { id } = await params
    const admin = getServiceClient()
    const { data: current, error: currentError } = await admin
      .from("staycare_documents")
      .select(
        "id, tenant_id, worker_id, status, document_type, original_filename, worker:staycare_workers(preferred_language)"
      )
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }
    if (!canReviewDocument(current.status, body.status)) {
      return NextResponse.json(
        { error: `Document cannot move from ${current.status} to ${body.status}` },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from("staycare_documents")
      .update({
        status: body.status,
        rejection_reason:
          body.status === "rejected" ? body.rejectionReason : null,
        reviewed_by: context.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .eq("status", current.status)
      .select("id, status, rejection_reason, reviewed_at")
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: "Document changed in another session. Refresh and try again." },
        { status: 409 }
      )
    }

    await admin.from("staycare_notifications").insert({
      tenant_id: current.tenant_id,
      worker_id: current.worker_id,
      channel: "in_app",
      language: preferredLanguage(current.worker),
      template_code: "document_reviewed",
      subject:
        body.status === "approved"
          ? "Document approved"
          : "Document needs attention",
      body:
        body.status === "approved"
          ? `${current.original_filename} was approved.`
          : `${current.original_filename} requires correction. ${body.rejectionReason || "Please contact StayCare."}`,
      status: "sent",
      sent_at: new Date().toISOString(),
      metadata: { documentId: current.id, status: body.status },
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: actorRoleForTenant(
        context.memberships,
        String(current.tenant_id),
        "canManageDocuments"
      ),
      action: "document.reviewed",
      entity_type: "staycare_documents",
      entity_id: current.id,
      metadata: {
        previousStatus: current.status,
        status: body.status,
        documentType: current.document_type,
      },
    })

    return NextResponse.json({ document: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document review", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Unable to review document" },
      { status: 500 }
    )
  }
}
