import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"
import {
  createDocumentVersion,
  getVersionHistory,
  calculateSHA256,
} from "@/lib/documents/versioning"
import { createVersionSegments } from "@/lib/documents/segmentation"
import { logAuditEvent, AuditActions } from "@/lib/audit/events"

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const versionId = searchParams.get("versionId")

    // Use service role client to bypass RLS
    let supabase
    try {
      supabase = getServiceClient()
    } catch (serviceError) {
      logger.warn("Failed to get service client, using regular client", { error: serviceError })
      supabase = await createClient()
    }

    if (versionId) {
      // Get segments for specific version
      const { getVersionSegments } = await import("@/lib/documents/segmentation")
      try {
        const segments = await getVersionSegments(versionId)
        logger.info("Fetched segments for version", {
          versionId,
          segmentCount: segments.length,
        })
        return createSuccessResponse({ segments })
      } catch (error: any) {
        logger.error("Failed to fetch segments", {
          error,
          errorMessage: error?.message,
          versionId,
        })
        // Return empty array instead of failing
        return createSuccessResponse({ segments: [] })
      }
    } else {
      // Get all versions
      const versions = await getVersionHistory(id)
      return createSuccessResponse({ versions })
    }
  } catch (error) {
    logger.error("Error fetching document versions", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to fetch document versions",
      500
    )
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id: documentId } = await params
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse form data (file upload)
    const formData = await request.formData()
    const file = formData.get("file") as File
    const sourceText = formData.get("sourceText") as string | null

    if (!file && !sourceText) {
      return NextResponse.json(
        { error: "File or sourceText is required" },
        { status: 400 }
      )
    }

    let fileContent: Buffer
    let storagePath: string

    if (file) {
      // Upload file to Supabase Storage
      const fileBuffer = Buffer.from(await file.arrayBuffer())
      const fileName = `${Date.now()}_${file.name}`
      storagePath = `documents/${documentId}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

      if (uploadError) {
        logger.error("Failed to upload file", { error: uploadError })
        return createNextErrorResponse(
          NextResponse,
          uploadError,
          "Failed to upload file",
          500
        )
      }

      fileContent = fileBuffer
    } else {
      // Use sourceText
      fileContent = Buffer.from(sourceText!, "utf-8")
      storagePath = `documents/${documentId}/${Date.now()}_text.txt`
    }

    // Create version
    const version = await createDocumentVersion({
      documentId,
      storagePath,
      fileContent,
      createdBy: user.id,
    })

    // Create segments if sourceText is provided
    if (sourceText) {
      try {
        await createVersionSegments(version.id, sourceText)
      } catch (error) {
        logger.error("Failed to create segments", { error, versionId: version.id })
        // Don't fail the request if segmentation fails
      }
    }

    // Log audit event
    try {
      const { data: document } = await supabase
        .from("documents")
        .select("case_id")
        .eq("id", documentId)
        .single()

      await logAuditEvent({
        caseId: document?.case_id || null,
        entityType: "version",
        entityId: version.id,
        action: AuditActions.VERSION_CREATED,
        meta: { version_no: version.version_no, storage_path: storagePath },
        actor: user.id,
      })
    } catch (error) {
      logger.error("Failed to log audit event", { error })
      // Don't fail the request
    }

    return createSuccessResponse({ version }, "Version created successfully", 201)
  } catch (error) {
    logger.error("Error creating document version", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "Failed to create document version",
      500
    )
  }
}
