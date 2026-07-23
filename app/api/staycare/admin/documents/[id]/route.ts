import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import { getStayCareRoleCapabilities } from "@/lib/staycare/role-capabilities"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum(["approved", "rejected", "review_required"]),
  rejectionReason: z.string().trim().max(1000).optional().or(z.literal("")),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const context = await getStaffContext()
    if (!context) return NextResponse.json({ error: "Staff access required" }, { status: 403 })

    const canManage = context.memberships.some((membership) =>
      getStayCareRoleCapabilities(membership.role).canManageDocuments
    )
    if (!canManage) {
      return NextResponse.json({ error: "Your role has read-only document access" }, { status: 403 })
    }

    const body = schema.parse(await request.json())
    if (body.status === "rejected" && !body.rejectionReason) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 })
    }

    const { id } = await params
    const tenantIds = Array.from(new Set(context.memberships.map((membership) => String(membership.tenant_id))))
    const admin = getServiceClient()
    const { data: current, error: currentError } = await admin
      .from("staycare_documents")
      .select("id, tenant_id, worker_id, status, document_type, original_filename")
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const { data, error } = await admin
      .from("staycare_documents")
      .update({
        status: body.status,
        rejection_reason: body.status === "rejected" ? body.rejectionReason : null,
        reviewed_by: context.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", current.id)
      .select("id, status, rejection_reason, reviewed_at")
      .single()

    if (error || !data) throw error || new Error("Unable to review document")

    await admin.from("staycare_notifications").insert({
      tenant_id: current.tenant_id,
      worker_id: current.worker_id,
      channel: "in_app",
      language: "en",
      template_code: "document_reviewed",
      subject: body.status === "approved" ? "Document approved" : "Document needs attention",
      body: body.status === "approved"
        ? `${current.original_filename} was approved.`
        : `${current.original_filename} requires correction. ${body.rejectionReason || "Please contact StayCare."}`,
      status: "sent",
      sent_at: new Date().toISOString(),
      metadata: { documentId: current.id, status: body.status },
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: context.memberships[0]?.role || "staff",
      action: "document.reviewed",
      entity_type: "staycare_documents",
      entity_id: current.id,
      metadata: { previousStatus: current.status, status: body.status, documentType: current.document_type },
    })

    return NextResponse.json({ document: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid document review", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to review document" }, { status: 500 })
  }
}
