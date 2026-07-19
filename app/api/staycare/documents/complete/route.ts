import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { requireTrustedOrigin } from "@/lib/security/request"

export const runtime = "nodejs"

const schema = z.object({
  documentId: z.string().uuid(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i).optional(),
})

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) return NextResponse.json({ error: "Worker account required" }, { status: 401 })

    const body = schema.parse(await request.json())
    const admin = getServiceClient()

    const { data: document, error: documentError } = await admin
      .from("staycare_documents")
      .select("id, tenant_id, worker_id, storage_bucket, storage_path, byte_size, mime_type, status")
      .eq("id", body.documentId)
      .eq("worker_id", context.worker.id)
      .eq("tenant_id", context.worker.tenant_id)
      .single()

    if (documentError || !document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

    const pathParts = document.storage_path.split("/")
    const filename = pathParts.pop()
    const folder = pathParts.join("/")
    const { data: files, error: listError } = await admin.storage
      .from(document.storage_bucket)
      .list(folder, { search: filename, limit: 10 })

    if (listError || !files?.some((file) => file.name === filename)) {
      return NextResponse.json({ error: "Uploaded object was not found" }, { status: 409 })
    }

    const { data: updated, error: updateError } = await admin
      .from("staycare_documents")
      .update({
        status: "review_required",
        sha256: body.sha256 || null,
      })
      .eq("id", document.id)
      .select("id, document_type, original_filename, status, expiry_date, created_at")
      .single()

    if (updateError || !updated) throw updateError || new Error("Unable to finalize document")

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "document.upload_completed",
      entity_type: "staycare_documents",
      entity_id: document.id,
      metadata: { sha256Recorded: Boolean(body.sha256) },
    })

    return NextResponse.json({ document: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid completion request", details: error.flatten() }, { status: 400 })
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error("StayCare document completion failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to complete the upload" }, { status: 500 })
  }
}
