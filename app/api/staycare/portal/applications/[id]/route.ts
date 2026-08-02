import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getExternalPortalContext } from "@/lib/staycare/auth"
import {
  canTransitionApplication,
  isStayCareApplicationStatus,
  transitionErrorMessage,
} from "@/lib/staycare/application-status"
import {
  organizationIdsForCapability,
  tenantIdsForCapability,
} from "@/lib/staycare/authorization"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  status: z.enum(["waiting_worker", "approved", "fulfilled", "rejected"]),
  externalReference: z.string().trim().max(200).optional().or(z.literal("")),
  workerVisibleMessage: z.string().trim().max(1000).optional().or(z.literal("")),
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
    const context = await getExternalPortalContext()
    if (!context) {
      return NextResponse.json({ error: "Partner access required" }, { status: 403 })
    }

    const tenantIds = tenantIdsForCapability(
      context.memberships,
      "canRespondAsProvider"
    )
    const organizationIds = organizationIdsForCapability(
      context.memberships,
      "canRespondAsProvider"
    )
    if (!tenantIds.length || !organizationIds.length) {
      return NextResponse.json({ error: "This portal role is read-only" }, { status: 403 })
    }

    const limited = await rateLimit({
      key: `provider-application:${context.user.id}:${getRequestIp(request)}`,
      limit: 120,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Provider update limit exceeded")
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
        { error: "A worker-visible information request is required" },
        { status: 400 }
      )
    }

    const { id } = await params
    const admin = getServiceClient()

    const { data: current, error: currentError } = await admin
      .from("staycare_service_applications")
      .select(
        "id, tenant_id, worker_id, status, application_no, assigned_organization_id, worker:staycare_workers(preferred_language)"
      )
      .eq("id", id)
      .in("tenant_id", tenantIds)
      .in("assigned_organization_id", organizationIds)
      .single()

    if (currentError || !current) {
      return NextResponse.json(
        { error: "Assigned application not found" },
        { status: 404 }
      )
    }
    if (!isStayCareApplicationStatus(current.status)) {
      return NextResponse.json(
        { error: "Application has an unsupported current status" },
        { status: 409 }
      )
    }
    if (!canTransitionApplication("provider", current.status, body.status)) {
      return NextResponse.json(
        { error: transitionErrorMessage(current.status, body.status) },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from("staycare_service_applications")
      .update({
        status: body.status,
        external_reference: body.externalReference || null,
        rejected_reason:
          body.status === "rejected" ? body.rejectionReason : null,
        fulfilled_at:
          body.status === "fulfilled" ? new Date().toISOString() : null,
      })
      .eq("id", current.id)
      .eq("status", current.status)
      .eq("assigned_organization_id", current.assigned_organization_id)
      .select(
        "id, application_no, status, external_reference, rejected_reason, fulfilled_at"
      )
      .maybeSingle()

    if (error) throw error
    if (!data) {
      return NextResponse.json(
        { error: "Application changed in another session. Refresh and try again." },
        { status: 409 }
      )
    }

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
        language: preferredLanguage(current.worker),
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
      metadata: {
        previousStatus: current.status,
        status: body.status,
        applicationNo: current.application_no,
        organizationId: current.assigned_organization_id,
      },
    })

    return NextResponse.json({ application: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid provider response", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json(
      { error: "Unable to update assigned application" },
      { status: 500 }
    )
  }
}
