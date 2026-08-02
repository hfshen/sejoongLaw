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
  status: z.enum([
    "triaged",
    "assigned",
    "in_progress",
    "waiting",
    "resolved",
    "closed",
  ]),
  priority: z.enum(["P0", "P1", "P2", "P3"]),
  assignedDepartment: z.string().trim().max(120).optional().or(z.literal("")),
  workerVisibleSummary: z.string().trim().max(1500).optional().or(z.literal("")),
  internalNote: z.string().trim().max(2000).optional().or(z.literal("")),
})

const ticketTransitions: Record<string, string[]> = {
  open: ["triaged", "assigned", "in_progress", "waiting", "resolved", "closed"],
  triaged: ["assigned", "in_progress", "waiting", "resolved", "closed"],
  assigned: ["in_progress", "waiting", "resolved", "closed"],
  in_progress: ["waiting", "resolved", "closed"],
  waiting: ["assigned", "in_progress", "resolved", "closed"],
  resolved: ["in_progress", "closed"],
  closed: [],
}

function canTransition(current: string, next: string) {
  return current === next || Boolean(ticketTransitions[current]?.includes(next))
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
      "canManageTickets"
    )
    if (!tenantIds.length) {
      return NextResponse.json(
        { error: "Your role has read-only ticket access" },
        { status: 403 }
      )
    }

    const limited = await rateLimit({
      key: `admin-ticket:${context.user.id}:${getRequestIp(request)}`,
      limit: 180,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Ticket update limit exceeded")
    }

    const body = schema.parse(await request.json())
    if (["resolved", "closed"].includes(body.status) && !body.workerVisibleSummary) {
      return NextResponse.json(
        { error: "A worker-visible resolution summary is required" },
        { status: 400 }
      )
    }

    const { id } = await params
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_tickets")
      .select(
        "id, tenant_id, worker_id, status, priority, ticket_no, first_response_at, worker:staycare_workers(preferred_language)"
      )
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 })
    }
    if (!canTransition(current.status, body.status)) {
      return NextResponse.json(
        { error: `Ticket cannot move from ${current.status} to ${body.status}` },
        { status: 409 }
      )
    }

    const resolved = ["resolved", "closed"].includes(body.status)
    const update: Record<string, unknown> = {
      status: body.status,
      priority: body.priority,
      assigned_department: body.assignedDepartment || null,
      worker_visible_summary: body.workerVisibleSummary || null,
      resolved_at: resolved ? new Date().toISOString() : null,
    }
    if (!current.first_response_at) update.first_response_at = new Date().toISOString()

    const { data, error } = await admin
      .from("staycare_tickets")
      .update(update)
      .eq("id", current.id)
      .eq("status", current.status)
      .select(
        "id, ticket_no, status, priority, assigned_department, worker_visible_summary, first_response_at, resolved_at"
      )
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: "Ticket changed in another session. Refresh and try again." },
        { status: 409 }
      )
    }

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
        language: preferredLanguage(current.worker),
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
      actor_role: actorRoleForTenant(
        context.memberships,
        String(current.tenant_id),
        "canManageTickets"
      ),
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
      return NextResponse.json(
        { error: "Invalid ticket update", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update ticket" }, { status: 500 })
  }
}
