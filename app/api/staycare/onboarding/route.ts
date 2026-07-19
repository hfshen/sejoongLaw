import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { journeySteps } from "@/lib/staycare/lifecycle-model"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const schema = z.object({
  fullName: z.string().trim().min(2).max(120),
  fullNameEn: z.string().trim().max(120).optional().or(z.literal("")),
  preferredLanguage: z.enum(["ko", "en", "si"]).default("si"),
  nationalityCode: z.string().trim().length(2).default("LK"),
  visaType: z.string().trim().max(30).optional().or(z.literal("")),
  occupation: z.string().trim().max(120).optional().or(z.literal("")),
  expectedArrivalDate: z.string().date().optional().or(z.literal("")),
})

function dbPhase(phase: string) {
  return phase === "preDeparture" ? "pre_departure" : phase
}

function memberNumber() {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()
  return `SC-${new Date().getUTCFullYear()}-${random}`
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const ip = getRequestIp(request)
    const limited = await rateLimit({ key: `onboarding:${ip}`, limit: 8, windowSeconds: 3600 })
    if (!limited.allowed) {
      return NextResponse.json({ error: "Too many onboarding attempts" }, { status: 429 })
    }

    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const body = schema.parse(await request.json())
    const admin = getServiceClient()
    const tenantSlug = process.env.STAYCARE_TENANT_SLUG || "sejoong-staycare"

    const { data: tenant, error: tenantError } = await admin
      .from("staycare_tenants")
      .select("id")
      .eq("slug", tenantSlug)
      .single()

    if (tenantError || !tenant) throw tenantError || new Error("StayCare tenant not found")

    const { data: existing } = await admin
      .from("staycare_workers")
      .select("id, member_no")
      .eq("auth_user_id", user.id)
      .maybeSingle()

    if (existing) return NextResponse.json({ worker: existing, existing: true })

    const { data: worker, error: workerError } = await admin
      .from("staycare_workers")
      .insert({
        tenant_id: tenant.id,
        auth_user_id: user.id,
        member_no: memberNumber(),
        full_name: body.fullName,
        full_name_en: body.fullNameEn || null,
        nationality_code: body.nationalityCode.toUpperCase(),
        preferred_language: body.preferredLanguage,
        visa_type: body.visaType || null,
        occupation: body.occupation || null,
        expected_arrival_date: body.expectedArrivalDate || null,
        status: body.visaType ? "pre_departure" : "preparing",
        current_phase: body.visaType ? "pre_departure" : "prepare",
        profile_completion: body.visaType ? 50 : 30,
        next_action: body.visaType ? "Complete the pre-departure profile" : "Confirm the official recruitment and visa stage",
      })
      .select("id, tenant_id, member_no")
      .single()

    if (workerError || !worker) throw workerError || new Error("Unable to create worker")

    const { error: membershipError } = await admin.from("staycare_memberships").insert({
      tenant_id: tenant.id,
      organization_id: null,
      user_id: user.id,
      role: "worker",
      status: "active",
      activated_at: new Date().toISOString(),
    })
    if (membershipError) throw membershipError

    const { data: journey, error: journeyError } = await admin
      .from("staycare_journey_instances")
      .insert({
        tenant_id: tenant.id,
        worker_id: worker.id,
        current_phase: body.visaType ? "pre_departure" : "prepare",
        status: "active",
      })
      .select("id")
      .single()

    if (journeyError || !journey) throw journeyError || new Error("Unable to create journey")

    const stepRows = journeySteps.map((step) => ({
      tenant_id: tenant.id,
      journey_id: journey.id,
      worker_id: worker.id,
      step_code: step.id,
      phase: dbPhase(step.phaseId),
      title: step.title,
      description: step.description,
      responsibility: step.responsibility,
      official_process: Boolean(step.official),
      required: Boolean(step.required),
      status:
        body.visaType && ["prepare", "official"].includes(step.phaseId)
          ? "completed"
          : step.phaseId === (body.visaType ? "preDeparture" : "prepare")
            ? "ready"
            : "not_started",
      official_reference_url: step.officialReference?.url || null,
      data: {
        actions: step.actions || [],
        serviceCategory: step.serviceCategory || null,
        documents: step.documents || [],
      },
    }))

    const { error: stepsError } = await admin.from("staycare_journey_steps").insert(stepRows)
    if (stepsError) throw stepsError

    await admin.from("staycare_audit_events").insert({
      tenant_id: tenant.id,
      actor_user_id: user.id,
      actor_role: "worker",
      action: "worker.onboarded",
      entity_type: "staycare_workers",
      entity_id: worker.id,
      metadata: { memberNo: worker.member_no, source: "self_service" },
    })

    return NextResponse.json({ worker }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid onboarding data", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error("StayCare onboarding failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to complete onboarding" }, { status: 500 })
  }
}
