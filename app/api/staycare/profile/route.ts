import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"

const schema = z.object({
  preferredLanguage: z.enum(["ko", "en", "si", "ta"]),
  phoneNumber: z.string().trim().max(40).optional().or(z.literal("")),
  accommodationSummary: z.string().trim().max(500).optional().or(z.literal("")),
})

export async function PATCH(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const body = schema.parse(await request.json())
    const admin = getServiceClient()
    const { data, error } = await admin
      .from("staycare_workers")
      .update({
        preferred_language: body.preferredLanguage,
        phone_number: body.phoneNumber || null,
        accommodation_summary: body.accommodationSummary || null,
      })
      .eq("id", context.worker.id)
      .eq("tenant_id", context.worker.tenant_id)
      .select("id, preferred_language, phone_number, accommodation_summary, profile_completion")
      .single()

    if (error || !data) throw error || new Error("Unable to update worker profile")

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "worker.profile_updated",
      entity_type: "staycare_workers",
      entity_id: context.worker.id,
      metadata: { preferredLanguage: body.preferredLanguage },
    })

    return NextResponse.json({ worker: data })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid profile update", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 })
  }
}
