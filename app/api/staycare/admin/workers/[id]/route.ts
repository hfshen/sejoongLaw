import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import { getStayCareRoleCapabilities } from "@/lib/staycare/role-capabilities"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum([
    "invited",
    "preparing",
    "official_process",
    "pre_departure",
    "arrived",
    "settling",
    "active",
    "renewal",
    "returning",
    "returned",
    "closed",
  ]),
  currentPhase: z.enum([
    "prepare",
    "official",
    "pre_departure",
    "arrival",
    "settlement",
    "living",
    "renewal",
    "return",
  ]),
  nextAction: z.string().trim().max(1000).optional().or(z.literal("")),
  nextActionDueAt: z.string().datetime().optional().nullable().or(z.literal("")),
  visaExpiresAt: z.string().date().optional().nullable().or(z.literal("")),
  passportExpiresAt: z.string().date().optional().nullable().or(z.literal("")),
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
      getStayCareRoleCapabilities(membership.role).canManageWorkers
    )
    if (!canManage) {
      return NextResponse.json({ error: "Your role cannot edit worker lifecycle data" }, { status: 403 })
    }

    const body = schema.parse(await request.json())
    const { id } = await params
    const tenantIds = Array.from(new Set(context.memberships.map((membership) => String(membership.tenant_id))))
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_workers")
      .select("id, tenant_id, status, current_phase, member_no, auth_user_id")
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 })
    }

    const { data, error } = await admin
      .from("staycare_workers")
      .update({
        status: body.status,
        current_phase: body.currentPhase,
        next_action: body.nextAction || null,
        next_action_due_at: body.nextActionDueAt || null,
        visa_expires_at: body.visaExpiresAt || null,
        passport_expires_at: body.passportExpiresAt || null,
      })
      .eq("id", current.id)
      .select("id, status, current_phase, next_action, next_action_due_at, visa_expires_at, passport_expires_at")
      .single()

    if (error || !data) throw error || new Error("Unable to update worker")

    if (current.auth_user_id && body.nextAction) {
      await admin.from("staycare_notifications").insert({
        tenant_id: current.tenant_id,
        worker_id: current.id,
        user_id: current.auth_user_id,
        channel: "in_app",
        language: "en",
        template_code: "worker_next_action_updated",
        subject: "Your next StayCare action",
        body: body.nextAction,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: { workerId: current.id, dueAt: body.nextActionDueAt || null },
      })
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: context.memberships[0]?.role || "staff",
      action: "worker.lifecycle_updated",
      entity_type: "staycare_workers",
      entity_id: current.id,
      metadata: {
        memberNo: current.member_no,
        previousStatus: current.status,
        status: body.status,
        previousPhase: current.current_phase,
        phase: body.currentPhase,
      },
    })

    return NextResponse.json({ worker: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid worker update", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update worker" }, { status: 500 })
  }
}
