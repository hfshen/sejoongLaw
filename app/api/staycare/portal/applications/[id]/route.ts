import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getExternalPortalContext } from "@/lib/staycare/auth"
import { getStayCareRoleCapabilities } from "@/lib/staycare/role-capabilities"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum(["waiting_worker", "approved", "fulfilled", "rejected"]),
  externalReference: z.string().trim().max(200).optional().or(z.literal("")),
  workerVisibleMessage: z.string().trim().max(1000).optional().or(z.literal("")),
  rejectionReason: z.string().trim().max(1000).optional().or(z.literal("")),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const context = await getExternalPortalContext()
    if (!context) return NextResponse.json({ error: "Partner access required" }, { status: 403 })

    const providerMemberships = context.memberships.filter(
      (membership) => getStayCareRoleCapabilities(membership.role).canRespondAsProvider
    )
    if (!providerMemberships.length) {
      return NextResponse.json({ error: "This portal role is read-only" }, { status: 403 })
    }

    const body = schema.parse(await request.json())
    if (body.status === "rejected" && !body.rejectionReason) {
      return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 })
    }

    const { id } = await params
    const organizationIds = providerMemberships
      .map((membership) => membership.organization_id)
      .filter(Boolean)
      .map(String)
    const tenantIds = providerMemberships.map((membership) => String(membership.tenant_id))
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_service_applications")
      .select("id, tenant_id, worker_id, status, application_no, assigned_organization_id")
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .in("assigned_organization_id", organizationIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Assigned application not found" }, { status: 404 })
    }

    const { data, error } = await admin
      .from("staycare_service_applications")
      .update({
        status: body.status,
        external_reference: body.externalReference || null,
        rejected_reason: body.status === "rejected" ? body.rejectionReason : null,
        fulfilled_at: body.status === "fulfilled" ? new Date().toISOString() : null,
      })
      .eq("id", current.id)
      .select("id, application_no, status, external_reference, rejected_reason, fulfilled_at")
      .single()

    if (error || !data) throw error || new Error("Unable to update application")

    await admin.from("staycare_application_events").insert({
      tenant_id: current.tenant_id,
      application_id: current.id,
      event_type: "provider_response",
      visible_to_worker: true,
      body: {
        previousStatus: current.status,
        status: body.status,
        message: body.workerVisibleMessage || null,
        externalReference: body.externalReference || null,
      },
      created_by: context.user.id,
    })

    if (body.workerVisibleMessage) {
      await admin.from("staycare_notifications").insert({
        tenant_id: current.tenant_id,
        worker_id: current.worker_id,
        channel: "in_app",
        language: "en",
        template_code: "provider_application_updated",
        subject: `Service request ${current.application_no}`,
        body: body.workerVisibleMessage,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: { applicationId: current.id, status: body.status },
      })
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "provider_agent",
      action: "provider.application_responded",
      entity_type: "staycare_service_applications",
      entity_id: current.id,
      metadata: { previousStatus: current.status, status: body.status, applicationNo: current.application_no },
    })

    return NextResponse.json({ application: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid provider response", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update assigned application" }, { status: 500 })
  }
}
