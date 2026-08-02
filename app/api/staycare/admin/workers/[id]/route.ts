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

const transitions: Record<string, string[]> = {
  invited: ["preparing", "closed"],
  preparing: ["official_process", "pre_departure", "closed"],
  official_process: ["preparing", "pre_departure", "closed"],
  pre_departure: ["official_process", "arrived", "closed"],
  arrived: ["settling", "active", "returning", "closed"],
  settling: ["active", "renewal", "returning", "closed"],
  active: ["renewal", "returning", "closed"],
  renewal: ["active", "returning", "closed"],
  returning: ["active", "returned", "closed"],
  returned: ["closed"],
  closed: [],
}

const phaseForStatus: Record<string, string> = {
  invited: "prepare",
  preparing: "prepare",
  official_process: "official",
  pre_departure: "pre_departure",
  arrived: "arrival",
  settling: "settlement",
  active: "living",
  renewal: "renewal",
  returning: "return",
  returned: "return",
}

function preferredLanguage(value: unknown): "ko" | "en" | "si" | "ta" {
  return value === "ko" || value === "en" || value === "si" || value === "ta" ? value : "en"
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

    const tenantIds = tenantIdsForCapability(context.memberships, "canManageWorkers")
    if (!tenantIds.length) {
      return NextResponse.json(
        { error: "Your role cannot edit worker lifecycle data" },
        { status: 403 }
      )
    }

    const limited = await rateLimit({
      key: `admin-worker:${context.user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Worker update limit exceeded")
    }

    const body = schema.parse(await request.json())
    const expectedPhase = phaseForStatus[body.status]
    if (expectedPhase && body.currentPhase !== expectedPhase) {
      return NextResponse.json(
        {
          error: `Worker status ${body.status} must use the ${expectedPhase} phase`,
        },
        { status: 400 }
      )
    }
    if (body.status !== "closed" && !body.nextAction && body.status !== "returned") {
      return NextResponse.json(
        { error: "An active worker must have a next action" },
        { status: 400 }
      )
    }

    const { id } = await params
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_workers")
      .select(
        "id, tenant_id, status, current_phase, member_no, auth_user_id, preferred_language"
      )
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 })
    }
    if (
      current.status !== body.status &&
      !transitions[current.status]?.includes(body.status)
    ) {
      return NextResponse.json(
        { error: `Worker cannot move from ${current.status} to ${body.status}` },
        { status: 409 }
      )
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
      .eq("status", current.status)
      .eq("current_phase", current.current_phase)
      .select(
        "id, status, current_phase, next_action, next_action_due_at, visa_expires_at, passport_expires_at"
      )
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: "Worker changed in another session. Refresh and try again." },
        { status: 409 }
      )
    }

    if (current.auth_user_id && body.nextAction) {
      await admin.from("staycare_notifications").insert({
        tenant_id: current.tenant_id,
        worker_id: current.id,
        user_id: current.auth_user_id,
        channel: "in_app",
        language: preferredLanguage(current.preferred_language),
        template_code: "worker_next_action_updated",
        subject: "Your next StayCare action",
        body: body.nextAction,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: {
          workerId: current.id,
          dueAt: body.nextActionDueAt || null,
        },
      })
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: actorRoleForTenant(
        context.memberships,
        String(current.tenant_id),
        "canManageWorkers"
      ),
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
      return NextResponse.json(
        { error: "Invalid worker update", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update worker" }, { status: 500 })
  }
}
