import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { maskedIdentity, secureIdentityHash } from "@/lib/staycare/identity"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const schema = z.object({
  purpose: z.enum(["sri_lanka_predeparture", "korea_temporary", "korea_active", "recovery"]),
})

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker || !context.user.phone) {
      return NextResponse.json({ error: "Verified worker phone is required" }, { status: 401 })
    }

    const limited = await rateLimit({
      key: `identity-sync:${context.user.id}:${getRequestIp(request)}`,
      limit: 12,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Too many identity updates")
    }

    const body = schema.parse(await request.json())
    const phone = context.user.phone.replace(/[\s()-]/g, "")
    const expectedCountry = body.purpose.startsWith("korea") ? "+82" : "+94"
    if (!phone.startsWith(expectedCountry)) {
      return NextResponse.json(
        { error: `The verified phone must use ${expectedCountry} for this purpose.` },
        { status: 400 }
      )
    }

    const admin = getServiceClient()
    const hash = secureIdentityHash(phone)
    const now = new Date().toISOString()
    const countryCode = phone.startsWith("+82") ? "KR" : "LK"

    if (body.purpose === "korea_active") {
      // The permanent worker ID survives authentication changes. Clear the prior
      // primary flag regardless of provider, while preserving email/Google as
      // active recovery identities. Only obsolete phone rows are superseded.
      const { error: primaryError } = await admin
        .from("staycare_worker_identities")
        .update({ is_primary: false, updated_at: now })
        .eq("worker_id", context.worker.id)
        .eq("is_primary", true)
        .neq("identity_hash", hash)
      if (primaryError) throw primaryError

      const { error: previousPhoneError } = await admin
        .from("staycare_worker_identities")
        .update({ status: "superseded", updated_at: now })
        .eq("worker_id", context.worker.id)
        .eq("provider", "phone")
        .eq("status", "active")
        .neq("identity_hash", hash)
      if (previousPhoneError) throw previousPhoneError

      const { error: previousContactError } = await admin
        .from("staycare_worker_contacts")
        .update({ status: "superseded", valid_until: now, updated_at: now })
        .eq("worker_id", context.worker.id)
        .eq("contact_type", "phone")
        .eq("purpose", "korea_active")
        .eq("status", "active")
        .neq("value_hash", hash)
      if (previousContactError) throw previousContactError
    }

    const { error: identityError } = await admin.from("staycare_worker_identities").upsert(
      {
        tenant_id: context.worker.tenant_id,
        worker_id: context.worker.id,
        auth_user_id: context.user.id,
        provider: "phone",
        identity_hash: hash,
        display_hint: maskedIdentity(phone),
        country_code: countryCode,
        purpose:
          body.purpose === "recovery"
            ? "recovery"
            : body.purpose === "korea_active"
              ? "korea_active"
              : "predeparture",
        verified_at: now,
        is_primary: body.purpose === "korea_active",
        status: "active",
        linked_by: context.user.id,
        evidence: { source: "supabase_phone_change" },
      },
      { onConflict: "tenant_id,provider,identity_hash" }
    )
    if (identityError) throw identityError

    const { error: contactError } = await admin.from("staycare_worker_contacts").upsert(
      {
        tenant_id: context.worker.tenant_id,
        worker_id: context.worker.id,
        contact_type: "phone",
        purpose: body.purpose,
        value_hash: hash,
        value_hint: maskedIdentity(phone),
        country_code: countryCode,
        verified_at: now,
        valid_from: now,
        status: "active",
        created_by: context.user.id,
      },
      { onConflict: "tenant_id,worker_id,contact_type,purpose,value_hash" }
    )
    if (contactError) throw contactError

    const workerUpdate: Record<string, unknown> = { phone_number: phone }
    if (body.purpose === "korea_active") workerUpdate.korea_phone_verified_at = now
    const { error: workerError } = await admin
      .from("staycare_workers")
      .update(workerUpdate)
      .eq("id", context.worker.id)
    if (workerError) throw workerError

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "worker.contact_verified",
      entity_type: "staycare_workers",
      entity_id: context.worker.id,
      metadata: { purpose: body.purpose, countryCode, displayHint: maskedIdentity(phone) },
    })

    return NextResponse.json({ phone: maskedIdentity(phone), purpose: body.purpose })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid identity update" }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("StayCare identity sync failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to synchronize the verified phone" }, { status: 500 })
  }
}
