import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getExternalPortalContext } from "@/lib/staycare/auth"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  workerId: z.string().uuid().optional().nullable(),
  title: z.string().trim().min(4).max(160),
  category: z.enum(["coordination", "arrival", "employment", "training", "provider_support", "other"]),
  description: z.string().trim().min(10).max(4000),
})

function ticketNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "")
  return `PT-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getExternalPortalContext()
    if (!context) return NextResponse.json({ error: "Partner access required" }, { status: 403 })

    const body = schema.parse(await request.json())
    const membership = context.memberships[0]
    if (!membership) return NextResponse.json({ error: "Partner membership required" }, { status: 403 })

    if (body.workerId) {
      const { data: visibleWorker, error } = await context.supabase
        .from("staycare_workers")
        .select("id")
        .eq("id", body.workerId)
        .eq("tenant_id", membership.tenant_id)
        .maybeSingle()
      if (error || !visibleWorker) {
        return NextResponse.json({ error: "Worker is outside your authorized scope" }, { status: 403 })
      }
    }

    const admin = getServiceClient()
    const { data: ticket, error } = await admin
      .from("staycare_tickets")
      .insert({
        tenant_id: membership.tenant_id,
        worker_id: body.workerId || null,
        ticket_no: ticketNumber(),
        title: body.title,
        category: body.category,
        priority: "P3",
        status: "open",
        intake_channel: "app",
        description: body.description,
        assigned_department: "Partner Coordination",
        assigned_organization_id: membership.organization_id || null,
        first_response_due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        resolution_due_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        worker_visible_summary: body.workerId ? "A partner coordination request was submitted." : null,
        employer_visible_summary: body.description,
        created_by: context.user.id,
      })
      .select("id, ticket_no, title, category, priority, status, created_at")
      .single()

    if (error || !ticket) throw error || new Error("Unable to create partner request")

    await admin.from("staycare_ticket_events").insert({
      tenant_id: membership.tenant_id,
      ticket_id: ticket.id,
      event_type: "partner_request_created",
      worker_visible: Boolean(body.workerId),
      employer_visible: true,
      body: { message: body.description, role: membership.role },
      created_by: context.user.id,
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: membership.tenant_id,
      actor_user_id: context.user.id,
      actor_role: membership.role,
      action: "partner.ticket_created",
      entity_type: "staycare_tickets",
      entity_id: ticket.id,
      metadata: { ticketNo: ticket.ticket_no, category: body.category, workerId: body.workerId || null },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid partner request", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to create partner request" }, { status: 500 })
  }
}
