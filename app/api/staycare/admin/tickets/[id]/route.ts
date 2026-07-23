import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import { getStayCareRoleCapabilities } from "@/lib/staycare/role-capabilities"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum(["triaged", "assigned", "in_progress", "waiting", "resolved", "closed"]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  assignedDepartment: z.string().trim().max(120).optional().or(z.literal("")),
  workerVisibleSummary: z.string().trim().max(1500).optional().or(z.literal("")),
  internalNote: z.string().trim().max(2000).optional().or(z.literal("")),
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
      getStayCareRoleCapabilities(membership.role).canManageTickets
    )
    if (!canManage) {
      return NextResponse.json({ error: "Your role has read-only ticket access" }, { status: 403 })
    }

    const body = schema.parse(await request.json())
    const { id } = await params
    const tenantIds = Array.from(new Set(context.memberships.map((membership) => String(membership.tenant_id))))
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_tickets")
      .select("id, tenant_id, worker_id, status, priority, ticket_no")
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }

    const resolved = ["resolved", "closed"].includes(body.status)
    const { data, error } = await admin
      .from("staycare_tickets")
      .update({
        status: body.status,
        priority: body.priority,
        assigned_department: body.assignedDepartment || null,
        worker_visible_summary: body.workerVisibleSummary || null,
        first_response_at: current.status === "open" ? new Date().toISOString() : undefined,
        resolved_at: resolved ? new Date().toISOString() : null,
      })
      .eq("id", current.id)
      .select("id, ticket_no, status, priority, assigned_department, worker_visible_summary, resolved_at")
      .single()

    if (error || !data) throw error || new Error("Unable to update ticket")

    await admin.from("staycare_ticket_events").insert({
      tenant_id: current.tenant_id,
      ticket_id: current.id,
      event_type: "status_changed",
      worker_visible: Boolean(body.workerVisibleSummary),
      employer_visible: false,
      body: {
        previousStatus: current.status,
        status: body.status,
        priority: body.priority,
        message: body.workerVisibleSummary || null,
        internalNote: body.internalNote || null,
      },
      created_by: context.user.id,
    })

    if (current.worker_id && body.workerVisibleSummary) {
      await admin.from("staycare_notifications").insert({
        tenant_id: current.tenant_id,
        worker_id: current.worker_id,
        channel: "in_app",
        language: "en",
        template_code: "ticket_updated",
        subject: `Support request ${current.ticket_no}`,
        body: body.workerVisibleSummary,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: { ticketId: current.id, status: body.status },
      })
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: context.memberships[0]?.role || "staff",
      action: "ticket.status_changed",
      entity_type: "staycare_tickets",
      entity_id: current.id,
      metadata: {
        ticketNo: current.ticket_no,
        previousStatus: current.status,
        status: body.status,
        previousPriority: current.priority,
        priority: body.priority,
      },
    })

    return NextResponse.json({ ticket: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid ticket update", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update ticket" }, { status: 500 })
  }
}
