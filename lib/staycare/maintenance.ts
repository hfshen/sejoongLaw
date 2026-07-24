import "server-only"
import { getServiceClient } from "@/lib/supabase/service"

interface CleanupDocument {
  id: string
  tenant_id: string
  worker_id: string
  storage_bucket: string
  storage_path: string
  status: string
  retention_until: string | null
  created_at: string
}

interface CleanupResult {
  id: string
  reason: "retention_expired" | "stale_upload"
  status: "deleted" | "failed" | "skipped"
  error?: string
}

async function cleanDocument(
  document: CleanupDocument,
  reason: CleanupResult["reason"]
): Promise<CleanupResult> {
  const admin = getServiceClient()

  const { data: claimed, error: claimError } = await admin
    .from("staycare_documents")
    .update({ status: "deletion_pending" })
    .eq("id", document.id)
    .eq("status", document.status)
    .eq("legal_hold", false)
    .select("id")
    .maybeSingle()

  if (claimError) {
    return {
      id: document.id,
      reason,
      status: "failed",
      error: claimError.message,
    }
  }
  if (!claimed) {
    return { id: document.id, reason, status: "skipped" }
  }

  const { error: storageError } = await admin.storage
    .from(document.storage_bucket)
    .remove([document.storage_path])

  if (storageError) {
    await admin
      .from("staycare_documents")
      .update({ status: document.status })
      .eq("id", document.id)
      .eq("status", "deletion_pending")

    await admin.from("staycare_audit_events").insert({
      tenant_id: document.tenant_id,
      actor_role: "system",
      action: "document.retention_cleanup_failed",
      entity_type: "staycare_documents",
      entity_id: document.id,
      severity: "warning",
      metadata: {
        reason,
        storageError: storageError.message.slice(0, 500),
      },
    })

    return {
      id: document.id,
      reason,
      status: "failed",
      error: storageError.message,
    }
  }

  const { error: updateError } = await admin
    .from("staycare_documents")
    .update({
      status: "deleted",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", document.id)
    .eq("status", "deletion_pending")

  if (updateError) {
    return {
      id: document.id,
      reason,
      status: "failed",
      error: updateError.message,
    }
  }

  await admin.from("staycare_audit_events").insert({
    tenant_id: document.tenant_id,
    actor_role: "system",
    action: "document.retention_deleted",
    entity_type: "staycare_documents",
    entity_id: document.id,
    metadata: {
      reason,
      workerId: document.worker_id,
      retentionUntil: document.retention_until,
      originalStatus: document.status,
    },
  })

  return { id: document.id, reason, status: "deleted" }
}

export async function runStayCareMaintenance(batchSize = 100) {
  const admin = getServiceClient()
  const limit = Math.max(1, Math.min(batchSize, 200))
  const today = new Date().toISOString().slice(0, 10)
  const staleBefore = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()

  const [retentionResult, staleResult] = await Promise.all([
    admin
      .from("staycare_documents")
      .select(
        "id, tenant_id, worker_id, storage_bucket, storage_path, status, retention_until, created_at"
      )
      .eq("legal_hold", false)
      .lte("retention_until", today)
      .not("status", "in", "(deletion_pending,deleted)")
      .order("retention_until", { ascending: true })
      .limit(limit),
    admin
      .from("staycare_documents")
      .select(
        "id, tenant_id, worker_id, storage_bucket, storage_path, status, retention_until, created_at"
      )
      .eq("legal_hold", false)
      .eq("status", "scanning")
      .lt("created_at", staleBefore)
      .order("created_at", { ascending: true })
      .limit(limit),
  ])

  if (retentionResult.error) throw retentionResult.error
  if (staleResult.error) throw staleResult.error

  const queued = new Map<
    string,
    { document: CleanupDocument; reason: CleanupResult["reason"] }
  >()
  for (const document of (retentionResult.data || []) as CleanupDocument[]) {
    queued.set(document.id, { document, reason: "retention_expired" })
  }
  for (const document of (staleResult.data || []) as CleanupDocument[]) {
    if (!queued.has(document.id)) {
      queued.set(document.id, { document, reason: "stale_upload" })
    }
  }

  const results: CleanupResult[] = []
  for (const { document, reason } of queued.values()) {
    results.push(await cleanDocument(document, reason))
  }

  return {
    considered: results.length,
    deleted: results.filter((result) => result.status === "deleted").length,
    failed: results.filter((result) => result.status === "failed").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    results,
  }
}
