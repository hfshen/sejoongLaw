import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { getRequestIp, requireIdempotencyKey, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit } from "@/lib/security/rate-limit"

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
  language: z.enum(["ko", "en", "si"]).default("si"),
  submittedData: submittedDataSchema.default({}),
  sharedDocumentIds: z.array(z.string().uuid()).max(20).default([]),
})

function applicationNumber() {
  return `APP-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
}

export async function GET() {
  const context = await getWorkerContext()
  if (!context?.worker) return NextResponse.json({ error: "Worker account required" }, { status: 401 })

  const { data, error } = await context.supabase
    .from("staycare_service_applications")
    .select(
      "id, application_no, status, language, submitted_at, fulfilled_at, external_reference, created_at, service:staycare_service_catalog(code, category, name)"
    )
    .eq("worker_id", context.worker.id)
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: "Unable to load applications" }, { status: 500 })
  return NextResponse.json({ applications: data || [] })
}

export async function POST(request: NextRequest) {
  let createdApplicationId: string | null = null

  try {
    requireTrustedOrigin(request)
    const idempotencyKey = requireIdempotencyKey(request)
    const context = await getWorkerContext()
    if (!context?.worker) return NextResponse.json({ error: "Worker account required" }, { status: 401 })

    const ip = getRequestIp(request)
    const limited = await rateLimit({
      key: `application:${context.user.id}:${ip}`,
      limit: 30,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return NextResponse.json({ error: "Too many service applications" }, { status: 429 })
    }

    const body = createSchema.parse(await request.json())
    const admin = getServiceClient()

    const { data: existing } = await admin
      .from("staycare_service_applications")
      .select("id, application_no, status")
      .eq("tenant_id", context.worker.tenant_id)
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle()

    if (existing) return NextResponse.json({ application: existing, idempotent: true })

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

    if (body.sharedDocumentIds.length) {
      const { count, error: documentError } = await admin
        .from("staycare_documents")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", context.worker.tenant_id)
        .eq("worker_id", context.worker.id)
        .in("id", body.sharedDocumentIds)

      if (documentError || count !== body.sharedDocumentIds.length) {
        return NextResponse.json({ error: "One or more documents cannot be shared" }, { status: 400 })
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
      .select("id, application_no, status, created_at")
      .single()

    if (applicationError || !application) throw applicationError || new Error("Unable to create application")
    createdApplicationId = application.id

    if (service.category === "telecom") {
      const telecom = z.object({
        simType: z.enum(["esim", "physical_sim", "resident_plan"]),
        deviceModel: z.string().max(120).optional(),
        imeiLast6: z.string().regex(/^\d{6}$/).optional(),
        deliveryMethod: z.enum(["digital", "airport", "accommodation", "branch"]),
        arrivalAirport: z.string().max(80).optional(),
        arrivalTerminal: z.string().max(40).optional(),
        deliveryAddressSummary: z.string().max(300).optional(),
      }).parse(body.submittedData)

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

    if (service.category === "immigration") {
      const immigration = z.object({
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
        deadlineAt: z.string().datetime().optional(),
        description: z.string().max(2000).optional(),
      }).parse(body.submittedData)

      const { error } = await admin.from("staycare_immigration_cases").insert({
        tenant_id: context.worker.tenant_id,
        application_id: application.id,
        worker_id: context.worker.id,
        case_type: immigration.caseType,
        deadline_at: immigration.deadlineAt || null,
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

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    if (createdApplicationId) {
      await getServiceClient().from("staycare_service_applications").delete().eq("id", createdApplicationId)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid service application", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && ["UntrustedOriginError", "IdempotencyKeyError"].includes(error.name)) {
      return NextResponse.json({ error: error.message }, { status: error.name === "UntrustedOriginError" ? 403 : 400 })
    }

    console.error("StayCare application failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to submit the service application" }, { status: 500 })
  }
}
