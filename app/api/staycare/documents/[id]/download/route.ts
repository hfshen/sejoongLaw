import { NextRequest, NextResponse } from "next/server"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { rateLimit } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getWorkerContext()
  if (!context?.worker) return NextResponse.json({ error: "Worker account required" }, { status: 401 })

  const limited = await rateLimit({
    key: `document-download:${context.user.id}`,
    limit: 60,
    windowSeconds: 3600,
  })
  if (!limited.allowed) return NextResponse.json({ error: "Download limit exceeded" }, { status: 429 })

  const { id } = await params
  const admin = getServiceClient()
  const { data: document, error } = await admin
    .from("staycare_documents")
    .select("id, tenant_id, worker_id, storage_bucket, storage_path, original_filename, status")
    .eq("id", id)
    .eq("tenant_id", context.worker.tenant_id)
    .eq("worker_id", context.worker.id)
    .neq("status", "deleted")
    .single()

  if (error || !document) return NextResponse.json({ error: "Document not found" }, { status: 404 })

  const { data, error: signError } = await admin.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 60, { download: document.original_filename })

  if (signError || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to create download link" }, { status: 500 })
  }

  await admin.from("staycare_audit_events").insert({
    tenant_id: context.worker.tenant_id,
    actor_user_id: context.user.id,
    actor_role: "worker",
    action: "document.download_link_issued",
    entity_type: "staycare_documents",
    entity_id: document.id,
    metadata: { expiresInSeconds: 60 },
  })

  if (request.nextUrl.searchParams.get("redirect") === "1") {
    return NextResponse.redirect(data.signedUrl)
  }

  return NextResponse.json({ url: data.signedUrl, expiresInSeconds: 60 })
}
