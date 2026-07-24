import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStayCareEnv } from "@/lib/env/staycare"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
])

const schema = z.object({
  documentType: z.string().trim().min(2).max(80),
  filename: z.string().trim().min(1).max(180),
  mimeType: z.string().trim().min(3).max(120),
  size: z.number().int().positive().max(15 * 1024 * 1024),
  issueDate: z.string().date().optional().or(z.literal("")),
  expiryDate: z.string().date().optional().or(z.literal("")),
})

function safeFilename(filename: string) {
  const extension = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase()
    : "bin"
  return `document.${extension?.replace(/[^a-z0-9]/g, "") || "bin"}`
}

function retentionDate(days: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export async function POST(request: NextRequest) {
  let documentId: string | null = null

  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const limited = await rateLimit({
      key: `document-upload:${context.user.id}:${getRequestIp(request)}`,
      limit: 20,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Upload limit exceeded")
    }

    const body = schema.parse(await request.json())
    if (!allowedMimeTypes.has(body.mimeType)) {
      return NextResponse.json(
        { error: "Only PDF, JPEG, PNG and WebP files are allowed" },
        { status: 400 }
      )
    }

    const env = getStayCareEnv()
    const admin = getServiceClient()
    const bucket = env.STAYCARE_STORAGE_BUCKET
    documentId = crypto.randomUUID()
    const path = `${context.worker.tenant_id}/${context.worker.id}/${documentId}/${safeFilename(body.filename)}`
    const retentionUntil = retentionDate(env.STAYCARE_DOCUMENT_RETENTION_DAYS)

    const { error: metadataError } = await admin
      .from("staycare_documents")
      .insert({
        id: documentId,
        tenant_id: context.worker.tenant_id,
        worker_id: context.worker.id,
        document_type: body.documentType,
        storage_bucket: bucket,
        storage_path: path,
        original_filename: body.filename,
        mime_type: body.mimeType,
        byte_size: body.size,
        issue_date: body.issueDate || null,
        expiry_date: body.expiryDate || null,
        retention_until: retentionUntil,
        status: "scanning",
        uploaded_by: context.user.id,
      })
    if (metadataError) throw metadataError

    const { data, error: uploadError } = await admin.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: false })

    if (uploadError || !data) {
      throw uploadError || new Error("Unable to create signed upload URL")
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: context.worker.tenant_id,
      actor_user_id: context.user.id,
      actor_role: "worker",
      action: "document.upload_authorized",
      entity_type: "staycare_documents",
      entity_id: documentId,
      metadata: {
        documentType: body.documentType,
        mimeType: body.mimeType,
        size: body.size,
        retentionUntil,
      },
    })

    return NextResponse.json({
      documentId,
      bucket,
      path,
      token: data.token,
      signedUrl: data.signedUrl,
      expiresInSeconds: 7200,
      retentionUntil,
    })
  } catch (error) {
    if (documentId) {
      await getServiceClient().from("staycare_documents").delete().eq("id", documentId)
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid document metadata", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    console.error(
      "StayCare upload authorization failed",
      error instanceof Error ? error.message : "unknown"
    )
    return NextResponse.json(
      { error: "Unable to authorize the upload" },
      { status: 500 }
    )
  }
}
