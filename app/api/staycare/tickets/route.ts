import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const createSchema = z.object({
  title: z.string().trim().min(4).max(160),
  category: z.enum([
    "general",
    "immigration",
    "labor",
    "housing",
    "health",
    "telecom",
    "finance",
    "remittance",
    "emergency_followup",
    "return",
  ]),
  priority: z.enum(["P1", "P2", "P3", "P4"]).default("P3"),
  description: z.string().trim().min(10).max(4000),
})

function ticketNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "")
  return `SC-${date}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
}

export async function GET() {
  const context = await getWorkerContext()
  if (!context?.worker) {
    return NextResponse.json({ error: "Worker account required" }, { status: 401 })
  }

  const { data, error } = await context.supabase
    .from("staycare_tickets")
    .select(
      "id, ticket_no, title, category, priority, status, description, first_response_due_at, first_response_at, resolution_due_at, resolved_at, worker_visible_summary, created_at, events:staycare_ticket_events(id, event_type, worker_visible, body, created_at)"
    )
    .eq("worker_id", context.worker.id)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: "Unable to load support requests" }, { status: 500 })
  }

  return NextResponse.json({ tickets: data || [] })
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const body = createSchema.parse(await request.json())
    // The current database enum supports P0-P3. A worker-facing P4 information
    // request is normalized to the standard P3 queue while the requested level
    // is retained in the event and audit metadata.
    const priority = body.priority === "P4" ? "P3" : body.priority
    const admin = getServiceClient()
    const now = Date.now()
    const firstResponseHours = priority === "P1" ? 2 : priority === "P2" ? 8 : 24
    const resolutionHours = priority === "P1" ? 24 : priority === "P2" ? 72 : 120

    const { data: ticket, error } = await admin
      .from("staycare_tickets")
      .insert({
        tenant_id: context.worker.tenant_id,
        worker_id: context.worker.id,
        ticket_no: ticketNumber(),
        title: body.title,
        category: body.category,
        priority,
        status: "open",
        intake_channel: "app",
        description: body.description,
        first_response_due_at: new Date(now + firstResponseHours * 60 * 60 * 1000).toISOString(),
        resolution_due_at: new Date(now + resolutionHours * 60 * 60 * 1000).toISOString(),
        worker_visible_summary: "Your request was received and is waiting for assignment.",
        created_by: context.user.id,
      })
      .select("id, ticket_no, title, category, priority, status, worker_visible_summary, created_at")
      .single()

    if (error || !ticket) throw error || new Error("Unable to create ticket")

    await admin.from("staycare_ticket_events").insert({
      tenant_id: context.worker.tenant_id,
      ticket_id: ticket.id,
      event_type: "ticket_created",
      worker_visible: true,
      employer_visible: false,
      body: {
        message: "Support request submitted",
        priority,
        requestedPriority: body.priority,
      },
      created_by: context.user.id,
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "ticket.created",
      entity_type: "staycare_tickets",
      entity_id: ticket.id,
      metadata: {
        category: body.category,
        priority,
        requestedPriority: body.priority,
        ticketNo: ticket.ticket_no,
      },
    })

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid support request", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("StayCare ticket creation failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to create support request" }, { status: 500 })
  }
}
