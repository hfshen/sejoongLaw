import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { requireTrustedOrigin } from "@/lib/security/request"

const schema = z.object({
  status: z.enum(["in_progress", "completed", "attention"]),
  evidence: z.record(z.string(), z.string().max(500)).optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) return NextResponse.json({ error: "Worker account required" }, { status: 401 })

    const { id } = await params
    const body = schema.parse(await request.json())
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_journey_steps")
      .select("id, tenant_id, worker_id, official_process, status")
      .eq("id", id)
      .eq("tenant_id", context.worker.tenant_id)
      .eq("worker_id", context.worker.id)
      .single()

    if (currentError || !current) return NextResponse.json({ error: "Journey step not found" }, { status: 404 })

    if (current.official_process && body.status === "completed") {
      return NextResponse.json(
        { error: "Official steps require confirmation by Sejoong or the responsible institution" },
        { status: 409 }
      )
    }

    const { data: updated, error } = await admin
      .from("staycare_journey_steps")
      .update({
        status: body.status,
        evidence: body.evidence || {},
        completed_at: body.status === "completed" ? new Date().toISOString() : null,
        completed_by: body.status === "completed" ? context.user.id : null,
      })
      .eq("id", current.id)
      .select("id, status, completed_at")
      .single()

    if (error || !updated) throw error || new Error("Unable to update journey step")

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "journey_step.worker_status_changed",
      entity_type: "staycare_journey_steps",
      entity_id: current.id,
      metadata: { previousStatus: current.status, nextStatus: body.status },
    })

    return NextResponse.json({ step: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid status update", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("StayCare journey update failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to update the journey step" }, { status: 500 })
  }
}
