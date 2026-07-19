import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { requireTrustedOrigin } from "@/lib/security/request"

const schema = z.object({
  status: z.enum([
    "reviewing",
    "waiting_worker",
    "waiting_authority",
    "waiting_provider",
    "approved",
    "fulfilled",
    "rejected",
    "cancelled",
  ]),
  workerVisibleMessage: z.string().trim().max(1000).optional().or(z.literal("")),
  externalReference: z.string().trim().max(200).optional().or(z.literal("")),
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

    const body = schema.parse(await request.json())
    const { id } = await params
    const tenantIds = [...new Set(context.memberships.map((membership) => membership.tenant_id))]
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_service_applications")
      .select("id, tenant_id, worker_id, status, application_no")
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) return NextResponse.json({ error: "Application not found" }, { status: 404 })

    const { data: updated, error } = await admin
      .from("staycare_service_applications")
      .update({
        status: body.status,
        external_reference: body.externalReference || null,
        rejected_reason: body.status === "rejected" ? body.rejectionReason || "Not approved" : null,
        fulfilled_at: body.status === "fulfilled" ? new Date().toISOString() : null,
      })
      .eq("id", current.id)
      .select("id, application_no, status, external_reference, fulfilled_at")
      .single()

    if (error || !updated) throw error || new Error("Unable to update application")

    await admin.from("staycare_application_events").insert({
      tenant_id: current.tenant_id,
      application_id: current.id,
      event_type: "status_changed",
      visible_to_worker: true,
      body: {
        previousStatus: current.status,
        status: body.status,
        message: body.workerVisibleMessage || null,
      },
      created_by: context.user.id,
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: context.memberships[0]?.role || "staff",
      action: "service_application.status_changed",
      entity_type: "staycare_service_applications",
      entity_id: current.id,
      metadata: {
        previousStatus: current.status,
        nextStatus: body.status,
        applicationNo: current.application_no,
      },
    })

    return NextResponse.json({ application: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid application update", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("StayCare admin update failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to update the application" }, { status: 500 })
  }
}
