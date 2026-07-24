import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

function safeDownloadName(value: string) {
  return value.replace(/[\r\n"\\/]/g, "_").slice(0, 180) || "staycare-document"
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const context = await getAuthenticatedUser()
  if (!context) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 })
  }

  const limited = await rateLimit({
    key: `document-download:${context.user.id}`,
    limit: 60,
    windowSeconds: 3600,
  })
  if (!limited.allowed) {
    return rateLimitFailureResponse(limited, "Download limit exceeded")
  }

  const { id } = await params

  // Query with the authenticated client first. StayCare RLS determines whether
  // the current worker, staff member or assigned provider may read this record.
  const { data: document, error } = await context.supabase
    .from("staycare_documents")
    .select(
      "id, tenant_id, worker_id, storage_bucket, storage_path, original_filename, status"
    )
    .eq("id", id)
    .not("status", "in", "(deletion_pending,deleted)")
    .single()

  if (error || !document) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 })
  }

  if (document.status === "scanning") {
    return NextResponse.json(
      { error: "Document validation is still in progress" },
      { status: 423, headers: { "Retry-After": "5" } }
    )
  }

  const admin = getServiceClient()
  const { data, error: signError } = await admin.storage
    .from(document.storage_bucket)
    .createSignedUrl(document.storage_path, 60, {
      download: safeDownloadName(document.original_filename),
    })

  if (signError || !data?.signedUrl) {
    return NextResponse.json({ error: "Unable to create download link" }, { status: 500 })
  }

  const { data: membership } = await context.supabase
    .from("staycare_memberships")
    .select("role")
    .eq("tenant_id", document.tenant_id)
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle()

  const { data: worker } = await context.supabase
    .from("staycare_workers")
    .select("id")
    .eq("tenant_id", document.tenant_id)
    .eq("auth_user_id", context.user.id)
    .maybeSingle()

  await admin.from("staycare_audit_events").insert({
    tenant_id: document.tenant_id,
    actor_user_id: context.user.id,
    actor_role: worker?.id === document.worker_id ? "worker" : membership?.role || "authenticated",
    action: "document.download_link_issued",
    entity_type: "staycare_documents",
    entity_id: document.id,
    metadata: { expiresInSeconds: 60, documentStatus: document.status },
  })

  if (request.nextUrl.searchParams.get("redirect") === "1") {
    return NextResponse.redirect(data.signedUrl, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    })
  }

  return NextResponse.json(
    { url: data.signedUrl, expiresInSeconds: 60 },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  )
}
