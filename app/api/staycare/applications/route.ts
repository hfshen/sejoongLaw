import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import {
  getRequestIp,
  requireIdempotencyKey,
  requireTrustedOrigin,
} from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"
import {
  getProviderAdapter,
  providerKindForCategory,
} from "@/lib/staycare/providers/registry"

export const runtime = "nodejs"

const submittedDataSchema = z.record(
  z.string().max(100),
  z.union([
    z.string().max(2000),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(z.string().max(500)).max(30),
  ])
)

const createSchema = z.object({
  serviceCode: z.string().trim().min(2).max(80),
  language: z.enum(["ko", "en", "si", "ta"]).default("si"),
  submittedData: submittedDataSchema.default({}),
  sharedDocumentIds: z.array(z.string().uuid()).max(20).default([]),
})

const telecomSchema = z.object({
  simType: z.enum(["esim", "physical_sim", "resident_plan"]),
  deviceModel: z.string().max(120).optional(),
  imeiLast6: z.string().regex(/^\d{6}$/).optional(),
  deliveryMethod: z.enum(["digital", "airport", "accommodation", "branch"]),
  arrivalAirport: z.string().max(80).optional(),
  arrivalTerminal: z.string().max(40).optional(),
  deliveryAddressSummary: z.string().max(300).optional(),
})

const immigrationSchema = z.object({
  caseType: z.enum([
    "foreigner_registration",
    "stay_extension",
    "address_change",
    "workplace_change",
    "visa_change",
    "departure",
    "certificate",
    "other",
  ]),
  deadlineAt: z.string().max(40).optional(),
  description: z.string().max(2000).optional(),
})

type TelecomPayload = z.infer<typeof telecomSchema>
type ImmigrationPayload = z.infer<typeof immigrationSchema>

function applicationNumber() {
  return `APP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

function normalizeOptionalDateTime(value?: string) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) throw new Error("Invalid deadline date")
  return parsed.toISOString()
}

async function compensateApplication(applicationId: string) {
  const admin = getServiceClient()
  await Promise.all([
    admin.from("staycare_telecom_orders").delete().eq("application_id", applicationId),
    admin.from("staycare_delivery_orders").delete().eq("application_id", applicationId),
    admin.from("staycare_remittance_intents").delete().eq("application_id", applicationId),
    admin.from("staycare_immigration_cases").delete().eq("application_id", applicationId),
  ])
  await admin.from("staycare_service_applications").delete().eq("id", applicationId)
}

async function existingApplication(
  tenantId: string,
  workerId: string,
  idempotencyKey: string
) {
  const { data } = await getServiceClient()
    .from("staycare_service_applications")
    .select("id, application_no, status, external_reference, created_at")
    .eq("tenant_id", tenantId)
    .eq("worker_id", workerId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle()
  return data
}

export async function GET() {
  const context = await getWorkerContext()
  if (!context?.worker) {
    return NextResponse.json({ error: "Worker account required" }, { status: 401 })
  }

  const { data, error } = await context.supabase
    .from("staycare_service_applications")
    .select(
      "id, application_no, status, language, submitted_at, fulfilled_at, external_reference, created_at, service:staycare_service_catalog(code, category, name)"
    )
    .eq("worker_id", context.worker.id)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: "Unable to load applications" }, { status: 500 })
  }
  return NextResponse.json({ applications: data || [] })
}

export async function POST(request: NextRequest) {
  let createdApplicationId: string | null = null

  try {
    requireTrustedOrigin(request)
    const idempotencyKey = requireIdempotencyKey(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const limited = await rateLimit({
      key: `application:${context.user.id}:${getRequestIp(request)}`,
      limit: 30,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Too many service applications")
    }

    const body = createSchema.parse(await request.json())
    const admin = getServiceClient()

    const existing = await existingApplication(
      context.worker.tenant_id,
      context.worker.id,
      idempotencyKey
    )
    if (existing) {
      return NextResponse.json({ application: existing, idempotent: true })
    }

    const { data: service, error: serviceError } = await admin
      .from("staycare_service_catalog")
      .select("id, code, category, integration_mode, status")
      .eq("tenant_id", context.worker.tenant_id)
      .eq("code", body.serviceCode)
      .eq("status", "active")
      .single()

    if (serviceError || !service) {
      return NextResponse.json({ error: "Service is unavailable" }, { status: 404 })
    }

    let telecom: TelecomPayload | null = null
    let immigration: ImmigrationPayload | null = null
    if (service.category === "telecom") {
      telecom = telecomSchema.parse(body.submittedData)
    }
    if (service.category === "immigration") {
      immigration = immigrationSchema.parse(body.submittedData)
    }

    if (body.sharedDocumentIds.length) {
      const { count, error: documentError } = await admin
        .from("staycare_documents")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", context.worker.tenant_id)
        .eq("worker_id", context.worker.id)
        .in("id", body.sharedDocumentIds)
        .in("status", ["review_required", "approved"])

      if (documentError || count !== body.sharedDocumentIds.length) {
        return NextResponse.json(
          { error: "One or more documents cannot be shared" },
          { status: 400 }
        )
      }
    }

    const applicationNo = applicationNumber()
    const { data: application, error: applicationError } = await admin
      .from("staycare_service_applications")
      .insert({
        tenant_id: context.worker.tenant_id,
        worker_id: context.worker.id,
        service_id: service.id,
        application_no: applicationNo,
        status: "submitted",
        language: body.language,
        submitted_data: body.submittedData,
        shared_document_ids: body.sharedDocumentIds,
        submitted_at: new Date().toISOString(),
        idempotency_key: idempotencyKey,
      })
      .select("id, application_no, status, external_reference, created_at")
      .single()

    if (applicationError || !application) {
      const duplicate = await existingApplication(
        context.worker.tenant_id,
        context.worker.id,
        idempotencyKey
      )
      if (duplicate) {
        return NextResponse.json({ application: duplicate, idempotent: true })
      }
      throw applicationError || new Error("Unable to create application")
    }
    createdApplicationId = application.id

    if (telecom) {
      const { error } = await admin.from("staycare_telecom_orders").insert({
        tenant_id: context.worker.tenant_id,
        application_id: application.id,
        worker_id: context.worker.id,
        sim_type: telecom.simType,
        device_model: telecom.deviceModel || null,
        imei_last6: telecom.imeiLast6 || null,
        delivery_method: telecom.deliveryMethod,
        arrival_airport: telecom.arrivalAirport || null,
        arrival_terminal: telecom.arrivalTerminal || null,
        delivery_address_summary: telecom.deliveryAddressSummary || null,
        order_status: "identity_required",
      })
      if (error) throw error
    }

    if (immigration) {
      const { error } = await admin.from("staycare_immigration_cases").insert({
        tenant_id: context.worker.tenant_id,
        application_id: application.id,
        worker_id: context.worker.id,
        case_type: immigration.caseType,
        deadline_at: normalizeOptionalDateTime(immigration.deadlineAt),
        status: "submitted",
        required_documents: [],
        decision_summary: null,
      })
      if (error) throw error
    }

    await admin.from("staycare_application_events").insert({
      tenant_id: context.worker.tenant_id,
      application_id: application.id,
      event_type: "submitted",
      visible_to_worker: true,
      body: {
        status: "submitted",
        integrationMode: service.integration_mode,
      },
      created_by: context.user.id,
    })

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "service_application.submitted",
      entity_type: "staycare_service_applications",
      entity_id: application.id,
      metadata: {
        applicationNo,
        serviceCode: service.code,
        sharedDocumentCount: body.sharedDocumentIds.length,
      },
    })

    // The core request is durable. Provider failure falls back to the manual queue.
    createdApplicationId = null
    let responseApplication = application
    const providerKind = providerKindForCategory(service.category)

    if (providerKind) {
      try {
        const adapter = getProviderAdapter(providerKind)
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin
        const dispatch = await adapter.dispatch({
          idempotencyKey,
          applicationId: application.id,
          applicationNo,
          tenantId: context.worker.tenant_id,
          workerId: context.worker.id,
          serviceCode: service.code,
          language: body.language,
          submittedData: body.submittedData,
          callbackUrl: `${siteUrl}/api/staycare/providers/${providerKind}/webhook`,
        })

        const { data: updated, error: updateError } = await admin
          .from("staycare_service_applications")
          .update({
            status: dispatch.status,
            external_reference: dispatch.externalReference || null,
          })
          .eq("id", application.id)
          .eq("status", "submitted")
          .select("id, application_no, status, external_reference, created_at")
          .maybeSingle()

        if (updateError || !updated) {
          throw updateError || new Error("Unable to save provider state")
        }
        responseApplication = updated

        await admin.from("staycare_application_events").insert({
          tenant_id: context.worker.tenant_id,
          application_id: application.id,
          event_type:
            adapter.mode === "manual"
              ? "manual_queue_created"
              : "provider_dispatched",
          visible_to_worker: true,
          body: {
            status: dispatch.status,
            providerKind,
            providerMode: adapter.mode,
            externalReference: dispatch.externalReference || null,
            message: dispatch.message || null,
            rawStatus: dispatch.rawStatus || null,
          },
          created_by: context.user.id,
        })
      } catch (providerError) {
        const fallbackMessage =
          providerError instanceof Error
            ? providerError.message
            : "Provider dispatch failed"

        const { data: fallback } = await admin
          .from("staycare_service_applications")
          .update({ status: "reviewing" })
          .eq("id", application.id)
          .eq("status", "submitted")
          .select("id, application_no, status, external_reference, created_at")
          .maybeSingle()

        if (fallback) responseApplication = fallback

        await admin.from("staycare_application_events").insert({
          tenant_id: context.worker.tenant_id,
          application_id: application.id,
          event_type: "provider_dispatch_failed_manual_fallback",
          visible_to_worker: true,
          body: {
            status: fallback?.status || responseApplication.status,
            providerKind,
            message: "The request is being handled manually by Sejoong.",
          },
          created_by: context.user.id,
        })

        await admin.from("staycare_audit_events").insert({
          tenant_id: context.worker.tenant_id,
          actor_user_id: context.user.id,
          actor_role: "system",
          action: "provider.dispatch_failed",
          entity_type: "staycare_service_applications",
          entity_id: application.id,
          severity: "warning",
          metadata: {
            providerKind,
            error: fallbackMessage.slice(0, 500),
          },
        })
      }
    }

    return NextResponse.json({ application: responseApplication }, { status: 201 })
  } catch (error) {
    if (createdApplicationId) {
      await compensateApplication(createdApplicationId)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid service application", details: error.flatten() },
        { status: 400 }
      )
    }
    if (
      error instanceof Error &&
      ["UntrustedOriginError", "IdempotencyKeyError"].includes(error.name)
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: error.name === "UntrustedOriginError" ? 403 : 400 }
      )
    }

    console.error(
      "StayCare application failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Unable to submit the service application" },
      { status: 500 }
    )
  }
}
