import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getServiceClient } from "@/lib/supabase/service"
import type { ProviderKind } from "@/lib/staycare/providers/types"
import {
  normalizeProviderApplicationStatus,
  parseProviderWebhook,
  providerPayloadHash,
  verifyProviderSignature,
} from "@/lib/staycare/providers/webhook"

export const runtime = "nodejs"

const providerSchema = z.enum(["telecom", "bank", "remittance", "delivery"])

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider: providerValue } = await params
  const parsedProvider = providerSchema.safeParse(providerValue)
  if (!parsedProvider.success) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 })
  }

  const provider = parsedProvider.data as ProviderKind
  const rawBody = await request.text()
  const timestamp =
    request.headers.get("x-staycare-timestamp") ||
    request.headers.get("x-provider-timestamp")
  const signature =
    request.headers.get("x-staycare-signature") ||
    request.headers.get("x-provider-signature")

  if (!verifyProviderSignature({ provider: undefined as never, kind: provider, rawBody, timestamp, signature })) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  let payload
  try {
    payload = parseProviderWebhook(rawBody)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid webhook payload",
        details: error instanceof Error ? error.message : "unknown",
      },
      { status: 400 }
    )
  }

  const admin = getServiceClient()
  const tenantSlug = process.env.STAYCARE_TENANT_SLUG || "sejoong-staycare"
  const { data: tenant, error: tenantError } = await admin
    .from("staycare_tenants")
    .select("id")
    .eq("slug", tenantSlug)
    .single()

  if (tenantError || !tenant) {
    return NextResponse.json({ error: "StayCare tenant not found" }, { status: 503 })
  }

  const { data: existingEvent } = await admin
    .from("staycare_webhook_events")
    .select("id, processing_status")
    .eq("tenant_id", tenant.id)
    .eq("provider_code", provider)
    .eq("external_event_id", payload.eventId)
    .maybeSingle()

  if (existingEvent) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const { data: providerConnection } = await admin
    .from("staycare_provider_connections")
    .select("id")
    .eq("tenant_id", tenant.id)
    .eq("kind", provider)
    .in("status", ["sandbox", "connected"])
    .limit(1)
    .maybeSingle()

  const { data: webhookEvent, error: webhookError } = await admin
    .from("staycare_webhook_events")
    .insert({
      tenant_id: tenant.id,
      provider_connection_id: providerConnection?.id || null,
      provider_code: provider,
      external_event_id: payload.eventId,
      event_type: payload.eventType,
      signature_verified: true,
      processing_status: "processing",
      payload_hash: providerPayloadHash(rawBody),
      metadata: {
        applicationNo: payload.applicationNo,
        occurredAt: payload.occurredAt || null,
      },
    })
    .select("id")
    .single()

  if (webhookError || !webhookEvent) {
    if (webhookError?.code === "23505") {
      return NextResponse.json({ received: true, duplicate: true })
    }
    return NextResponse.json({ error: "Unable to record webhook" }, { status: 500 })
  }

  try {
    const { data: application, error: applicationError } = await admin
      .from("staycare_service_applications")
      .select("id, tenant_id, worker_id, status, application_no, external_reference")
      .eq("tenant_id", tenant.id)
      .eq("application_no", payload.applicationNo)
      .single()

    if (applicationError || !application) {
      await admin
        .from("staycare_webhook_events")
        .update({
          processing_status: "ignored",
          processed_at: new Date().toISOString(),
          error_message: "Application not found",
        })
        .eq("id", webhookEvent.id)
      return NextResponse.json({ received: true, ignored: true })
    }

    const nextStatus = normalizeProviderApplicationStatus(payload.status)
    const update: Record<string, unknown> = {
      external_reference: payload.externalReference || application.external_reference,
    }

    if (nextStatus && nextStatus !== application.status) {
      update.status = nextStatus
      if (nextStatus === "fulfilled") update.fulfilled_at = new Date().toISOString()
      if (nextStatus === "rejected") {
        update.rejected_reason = payload.message || "Provider rejected the request"
      }
    }

    const { data: updated, error: updateError } = await admin
      .from("staycare_service_applications")
      .update(update)
      .eq("id", application.id)
      .select("id, status, external_reference, fulfilled_at")
      .single()

    if (updateError || !updated) throw updateError || new Error("Unable to update application")

    await admin.from("staycare_application_events").insert({
      tenant_id: tenant.id,
      application_id: application.id,
      event_type: `provider.${payload.eventType}`,
      visible_to_worker: true,
      body: {
        previousStatus: application.status,
        status: updated.status,
        provider,
        externalReference: updated.external_reference,
        message: payload.message || null,
        occurredAt: payload.occurredAt || null,
      },
    })

    await admin.from("staycare_notifications").insert({
      tenant_id: tenant.id,
      worker_id: application.worker_id,
      channel: "in_app",
      language: "si",
      template_code: "service_application_status",
      subject: `StayCare ${payload.applicationNo}`,
      body: payload.message || `Your service request status is now ${updated.status}.`,
      status: "queued",
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: tenant.id,
      actor_role: "provider_webhook",
      action: "provider.webhook_processed",
      entity_type: "staycare_service_applications",
      entity_id: application.id,
      metadata: {
        provider,
        eventId: payload.eventId,
        eventType: payload.eventType,
        previousStatus: application.status,
        nextStatus: updated.status,
      },
    })

    await admin
      .from("staycare_webhook_events")
      .update({
        processing_status: "processed",
        processed_at: new Date().toISOString(),
      })
      .eq("id", webhookEvent.id)

    return NextResponse.json({ received: true, application: updated })
  } catch (error) {
    await admin
      .from("staycare_webhook_events")
      .update({
        processing_status: "failed",
        processed_at: new Date().toISOString(),
        error_message: error instanceof Error ? error.message.slice(0, 1000) : "unknown",
      })
      .eq("id", webhookEvent.id)

    console.error(
      "StayCare provider webhook failed",
      provider,
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
