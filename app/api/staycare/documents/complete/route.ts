import { createHash, timingSafeEqual } from "node:crypto"
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

function detectMimeType(buffer: Buffer) {
  if (buffer.subarray(0, 5).toString("ascii") === "%PDF-") return "application/pdf"
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg"
  }
  if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png"
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp"
  }
  return null
}

function secureHexEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex")
  const rightBuffer = Buffer.from(right, "hex")
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const body = schema.parse(await request.json())
    const admin = getServiceClient()

    const { data: document, error: documentError } = await admin
      .from("staycare_documents")
      .select(
        "id, tenant_id, worker_id, document_type, original_filename, storage_bucket, storage_path, byte_size, mime_type, status, expiry_date, created_at"
      )
      .eq("id", body.documentId)
      .eq("worker_id", context.worker.id)
      .eq("tenant_id", context.worker.tenant_id)
      .single()

    if (documentError || !document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    if (["review_required", "approved"].includes(document.status)) {
      return NextResponse.json({
        document: {
          id: document.id,
          document_type: document.document_type,
          original_filename: document.original_filename,
          status: document.status,
          expiry_date: document.expiry_date,
          created_at: document.created_at,
        },
        idempotent: true,
      })
    }

    if (document.status !== "scanning") {
      return NextResponse.json(
        { error: "Document is not in an upload-completion state" },
        { status: 409 }
      )
    }

    const { data: object, error: downloadError } = await admin.storage
      .from(document.storage_bucket)
      .download(document.storage_path)

    if (downloadError || !object) {
      return NextResponse.json({ error: "Uploaded object was not found" }, { status: 409 })
    }

    const bytes = Buffer.from(await object.arrayBuffer())
    const actualMimeType = detectMimeType(bytes)
    const actualSha256 = createHash("sha256").update(bytes).digest("hex")
    const matchesSize = bytes.byteLength === Number(document.byte_size)
    const matchesMime = actualMimeType === document.mime_type
    const matchesClientHash = !body.sha256 || secureHexEquals(actualSha256, body.sha256.toLowerCase())

    if (!matchesSize || !matchesMime || !matchesClientHash) {
      await admin.storage.from(document.storage_bucket).remove([document.storage_path])
      await admin
        .from("staycare_documents")
        .update({
          status: "rejected",
          rejection_reason: "Uploaded file validation failed. Please upload the original PDF or image again.",
          sha256: actualSha256,
        })
        .eq("id", document.id)

      await admin.from("staycare_audit_events").insert({
        tenant_id: context.worker.tenant_id,
        actor_user_id: context.user.id,
        actor_role: "worker",
        action: "document.upload_validation_failed",
        entity_type: "staycare_documents",
        entity_id: document.id,
        severity: "warning",
        metadata: {
          matchesSize,
          matchesMime,
          matchesClientHash,
          declaredMimeType: document.mime_type,
          detectedMimeType: actualMimeType,
        },
      })

      return NextResponse.json(
        { error: "Uploaded file validation failed. The object was removed." },
        { status: 409 }
      )
    }

    const { data: updated, error: updateError } = await admin
      .from("staycare_documents")
      .update({
        status: "review_required",
        sha256: actualSha256,
        rejection_reason: null,
      })
      .eq("id", document.id)
      .select("id, document_type, original_filename, status, expiry_date, created_at")
      .single()

    if (updateError || !updated) {
      throw updateError || new Error("Unable to finalize document")
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "document.upload_completed",
      entity_type: "staycare_documents",
      entity_id: document.id,
      metadata: {
        sha256Recorded: true,
        byteSizeVerified: bytes.byteLength,
        mimeTypeVerified: actualMimeType,
      },
    })

    return NextResponse.json({ document: updated })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid completion request", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error(
      "StayCare document completion failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json({ error: "Unable to complete the upload" }, { status: 500 })
  }
}
