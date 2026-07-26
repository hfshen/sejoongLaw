import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { journeySteps } from "@/lib/staycare/lifecycle-model"
import {
  inviteTokenHash,
  maskedIdentity,
  secureIdentityHash,
} from "@/lib/staycare/identity"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const schema = z.object({
  inviteCode: z.string().trim().min(8).max(64),
  fullNameEn: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().date(),
  preferredLanguage: z.enum(["ko", "en", "si", "ta"]).default("si"),
})

function dbPhase(phase: string) {
  return phase === "preDeparture" ? "pre_departure" : phase
}

async function ensureJourney(tenantId: string, workerId: string) {
  const admin = getServiceClient()
  const { data: existing, error: existingError } = await admin
    .from("staycare_journey_instances")
    .select("id")
    .eq("worker_id", workerId)
    .eq("status", "active")
    .maybeSingle()
  if (existingError) throw existingError

  let journeyId = existing?.id as string | undefined
  if (!journeyId) {
    const { data: journey, error } = await admin
      .from("staycare_journey_instances")
      .insert({
        tenant_id: tenantId,
        worker_id: workerId,
        current_phase: "prepare",
        status: "active",
        metadata: { source: "roster_claim" },
      })
      .select("id")
      .single()
    if (error || !journey) throw error || new Error("Unable to create worker journey")
    journeyId = journey.id
  }

  const stepRows = journeySteps.map((step) => ({
    tenant_id: tenantId,
    journey_id: journeyId,
    worker_id: workerId,
    step_code: step.id,
    phase: dbPhase(step.phaseId),
    title: step.title,
    description: step.description,
    responsibility: step.responsibility,
    official_process: Boolean(step.official),
    required: Boolean(step.required),
    status: step.phaseId === "prepare" ? "ready" : "not_started",
    official_reference_url: step.officialReference?.url || null,
    data: {
      actions: step.actions || [],
      serviceCategory: step.serviceCategory || null,
      documents: step.documents || [],
    },
  }))

  const { error: stepsError } = await admin
    .from("staycare_journey_steps")
    .upsert(stepRows, { onConflict: "journey_id,step_code", ignoreDuplicates: true })
  if (stepsError) throw stepsError
}

async function registerAuthenticatedIdentities({
  tenantId,
  workerId,
  user,
}: {
  tenantId: string
  workerId: string
  user: { id: string; email?: string | null; phone?: string | null }
}) {
  const admin = getServiceClient()
  const identities = [
    user.phone
      ? {
          provider: "phone",
          raw: user.phone,
          countryCode: user.phone.startsWith("+94")
            ? "LK"
            : user.phone.startsWith("+82")
              ? "KR"
              : null,
          purpose: user.phone.startsWith("+82") ? "korea_active" : "predeparture",
        }
      : null,
    user.email
      ? {
          provider: "email",
          raw: user.email,
          countryCode: null,
          purpose: "recovery",
        }
      : null,
  ].filter(Boolean) as Array<{
    provider: "phone" | "email"
    raw: string
    countryCode: string | null
    purpose: string
  }>

  for (const [index, identity] of identities.entries()) {
    const identityHash = secureIdentityHash(identity.raw)
    const { error } = await admin.from("staycare_worker_identities").upsert(
      {
        tenant_id: tenantId,
        worker_id: workerId,
        auth_user_id: user.id,
        provider: identity.provider,
        identity_hash: identityHash,
        display_hint: maskedIdentity(identity.raw),
        country_code: identity.countryCode,
        purpose: identity.purpose,
        verified_at: new Date().toISOString(),
        is_primary: index === 0,
        status: "active",
        linked_by: user.id,
        evidence: { source: "supabase_auth_claim" },
      },
      { onConflict: "tenant_id,provider,identity_hash" }
    )
    if (error) throw error

    const contactPurpose =
      identity.provider === "email"
        ? "recovery"
        : identity.countryCode === "KR"
          ? "korea_active"
          : "sri_lanka_predeparture"
    const { error: contactError } = await admin.from("staycare_worker_contacts").upsert(
      {
        tenant_id: tenantId,
        worker_id: workerId,
        contact_type: identity.provider,
        purpose: contactPurpose,
        value_hash: identityHash,
        value_hint: maskedIdentity(identity.raw),
        country_code: identity.countryCode,
        verified_at: new Date().toISOString(),
        status: "active",
        created_by: user.id,
      },
      { onConflict: "tenant_id,worker_id,contact_type,purpose,value_hash" }
    )
    if (contactError) throw contactError
  }
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const limited = await rateLimit({
      key: `worker-claim:${user.id}:${getRequestIp(request)}`,
      limit: 8,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Too many worker claim attempts")
    }

    const body = schema.parse(await request.json())
    const tokenHash = inviteTokenHash(body.inviteCode)
    const { data, error } = await supabase.rpc("staycare_claim_worker_invite", {
      invite_token_hash: tokenHash,
      claimant_name_en: body.fullNameEn,
      claimant_date_of_birth: body.dateOfBirth,
      claimant_language: body.preferredLanguage,
    })

    if (error || !Array.isArray(data) || !data[0]) {
      const admin = getServiceClient()
      const { data: invite } = await admin
        .from("staycare_worker_invites")
        .select("id, failed_attempts")
        .eq("token_hash", tokenHash)
        .maybeSingle()
      if (invite) {
        const failedAttempts = Number(invite.failed_attempts || 0) + 1
        await admin
          .from("staycare_worker_invites")
          .update({
            failed_attempts: failedAttempts,
            last_failed_at: new Date().toISOString(),
            status: failedAttempts >= 8 ? "locked" : "active",
          })
          .eq("id", invite.id)
      }
      return NextResponse.json(
        { error: "The invitation or roster identity could not be verified." },
        { status: 400 }
      )
    }

    const claimed = data[0] as {
      worker_id: string
      tenant_id: string
      member_no: string
    }
    await ensureJourney(claimed.tenant_id, claimed.worker_id)
    await registerAuthenticatedIdentities({
      tenantId: claimed.tenant_id,
      workerId: claimed.worker_id,
      user,
    })

    return NextResponse.json({ worker: claimed, claimed: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid claim data", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error(
      "StayCare worker claim failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json({ error: "Unable to claim the worker account" }, { status: 500 })
  }
}
