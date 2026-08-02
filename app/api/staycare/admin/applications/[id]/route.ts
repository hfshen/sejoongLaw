import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import {
  canTransitionApplication,
  isStayCareApplicationStatus,
  transitionErrorMessage,
} from "@/lib/staycare/application-status"
import {
  actorRoleForTenant,
  tenantIdsForCapability,
} from "@/lib/staycare/authorization"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"
import { getServiceClient } from "@/lib/supabase/service"

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
      "canManageApplications"
    )
    if (!tenantIds.length) {
      return NextResponse.json(
        { error: "Your role has read-only application access" },
        { status: 403 }
      )
    }

    const limited = await rateLimit({
      key: `admin-application:${context.user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Application update limit exceeded")
    }

    const body = schema.parse(await request.json())
    if (body.status === "rejected" && !body.rejectionReason) {
      return NextResponse.json(
        { error: "A rejection reason is required" },
        { status: 400 }
      )
    }
    if (body.status === "waiting_worker" && !body.workerVisibleMessage) {
      return NextResponse.json(
        { error: "A worker-visible request is required when waiting for the worker" },
        { status: 400 }
      )
    }

    const { id } = await params
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_service_applications")
      .select(
        "id, tenant_id, worker_id, status, application_no, worker:staycare_workers(preferred_language)"
      )
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }
    if (!isStayCareApplicationStatus(current.status)) {
      return NextResponse.json(
        { error: "Application has an unsupported current status" },
        { status: 409 }
      )
    }
    if (!canTransitionApplication("staff", current.status, body.status)) {
      return NextResponse.json(
        { error: transitionErrorMessage(current.status, body.status) },
        { status: 409 }
      )
    }

    const { data: updated, error } = await admin
      .from("staycare_service_applications")
      .update({
        status: body.status,
        external_reference: body.externalReference || null,
        rejected_reason:
          body.status === "rejected"
            ? body.rejectionReason || "Not approved"
            : null,
        fulfilled_at:
          body.status === "fulfilled" ? new Date().toISOString() : null,
        assigned_user_id: context.user.id,
      })
      .eq("id", current.id)
      .eq("status", current.status)
      .select(
        "id, application_no, status, external_reference, rejected_reason, fulfilled_at, assigned_user_id"
      )
      .maybeSingle()

    if (error) throw error
    if (!updated) {
      return NextResponse.json(
        { error: "Application changed in another session. Refresh and try again." },
        { status: 409 }
      )
    }

    await admin.from("staycare_application_events").insert({
      tenant_id: current.tenant_id,
      application_id: current.id,
      event_type: "status_changed",
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
        language: preferredLanguage(current.worker),
        template_code: "application_updated",
        subject: `Application ${current.application_no}`,
        body: body.workerVisibleMessage,
        status: "sent",
        sent_at: new Date().toISOString(),
        metadata: { applicationId: current.id, status: body.status },
      })
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: current.tenant_id,
      actor_user_id: context.user.id,
      actor_role: actorRoleForTenant(
        context.memberships,
        String(current.tenant_id),
        "canManageApplications"
      ),
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
      return NextResponse.json(
        { error: "Invalid application update", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error(
      "StayCare admin update failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Unable to update the application" },
      { status: 500 }
    )
  }
}
