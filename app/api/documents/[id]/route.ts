import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Use service role client to bypass RLS
    let supabase
    try {
      supabase = getServiceClient()
    } catch (serviceError) {
      logger.error("Failed to get service client", { error: serviceError })
      // Fallback to regular client
      supabase = await createClient()
    }

    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류를 찾을 수 없습니다.",
        404
      )
    }

    logger.info("Document fetched", { documentId: id })
    return createSuccessResponse({ document: data })
  } catch (error) {
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류를 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Use service role client to bypass RLS
    let supabase
    let user = null
    
    try {
      supabase = getServiceClient()
      logger.info("Using service role client for document update")
      
      // Try to get user from regular client for created_by field
      try {
        const regularClient = await createClient()
        const { data: { user: authUser } } = await regularClient.auth.getUser()
        user = authUser
      } catch {
        // No Supabase session, user will be null (created_by will be null)
        logger.info("No Supabase auth session, created_by will be null")
      }
    } catch (serviceError) {
      logger.error("Failed to get service client", { error: serviceError })
      // Fallback to regular client
      supabase = await createClient()
      try {
        const { data: { user: authUser } } = await supabase.auth.getUser()
        user = authUser
      } catch {
        // Ignore auth error
      }
    }
    
    const body = await request.json()

    const { document_type, name, date, data, locale } = body

    // 케이스 연결 문서는 name을 케이스명으로 강제 (클라이언트에서 잘못 보내도 서버가 보정)
    let forcedCaseName: string | null = null
    const { data: existingDoc } = await supabase
      .from("documents")
      .select("id, case_id, is_case_linked")
      .eq("id", id)
      .single()

    if (existingDoc?.is_case_linked && existingDoc?.case_id) {
      const { data: caseRecord } = await supabase
        .from("cases")
        .select("case_name")
        .eq("id", existingDoc.case_id)
        .single()
      forcedCaseName = caseRecord?.case_name || null
    }

    const updateData: Partial<{
      document_type: string
      name: string
      date: string
      data: Record<string, any>
      locale: string
    }> = {}
    if (document_type) updateData.document_type = document_type
    if (forcedCaseName) updateData.name = forcedCaseName
    else if (name) updateData.name = name
    if (date) updateData.date = date
    if (data !== undefined) updateData.data = data
    if (locale) updateData.locale = locale

    const { data: document, error } = await supabase
      .from("documents")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 수정에 실패했습니다.",
        500
      )
    }

    // Create new version when document is updated
    // For now, create a text-based version from the document data
    try {
      const { createDocumentVersion } = await import("@/lib/documents/versioning")
      const { createVersionSegments } = await import("@/lib/documents/segmentation")
      const { logAuditEvent, AuditActions } = await import("@/lib/audit/events")

      // Create text representation of document data
      const documentText = JSON.stringify(
        {
          document_type: document.document_type,
          name: document.name,
          date: document.date,
          data: document.data,
          locale: document.locale,
        },
        null,
        2
      )

      const fileContent = Buffer.from(documentText, "utf-8")
      const storagePath = `documents/${id}/${Date.now()}_v${Date.now()}.txt`

      // Upload file to storage first (optional, can fail)
      try {
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(storagePath, fileContent, {
            contentType: "text/plain",
            upsert: false,
          })

        if (uploadError) {
          logger.warn("Failed to upload document to storage", {
            error: uploadError,
            storagePath,
            documentId: id,
          })
          // Continue without storage upload
        }
      } catch (storageError) {
        logger.warn("Storage upload error", {
          error: storageError,
          storagePath,
          documentId: id,
        })
        // Continue without storage upload
      }

      // Create version (user can be null, created_by will be null)
      const version = await createDocumentVersion({
        documentId: id,
        storagePath,
        fileContent,
        createdBy: user?.id || null,
      })

      // Update document's current_version_id to the new version
      await supabase
        .from("documents")
        .update({ current_version_id: version.id })
        .eq("id", id)

      // Create segments from readable document text
      try {
        // Extract readable text from document data instead of raw JSON
        const { extractReadableText } = await import("@/lib/documents/text-extractor")
        const readableText = extractReadableText(
          document.document_type as any,
          data || {},
          (document.locale as "ko" | "en" | "zh-CN" | "si" | "ta") || "ko"
        )
        
        const createdSegments = await createVersionSegments(version.id, readableText)
        logger.info("Segments created successfully", {
          versionId: version.id,
          documentId: id,
          segmentCount: createdSegments.length,
        })

        // Auto-translate to target languages (en, si, ta)
        if (createdSegments.length > 0) {
          const targetLangs: Array<"en" | "si" | "ta"> = ["en", "si", "ta"]
          const translationResults: Array<{ lang: string; success: boolean }> = []

          for (const targetLang of targetLangs) {
            try {
              const { translateVersion } = await import("@/lib/documents/translation")
              await translateVersion(version.id, "ko", targetLang, user?.id)
              translationResults.push({ lang: targetLang, success: true })
              logger.info("Auto-translation completed", {
                versionId: version.id,
                targetLang,
              })
            } catch (transError: any) {
              logger.error("Auto-translation failed", {
                error: transError,
                versionId: version.id,
                targetLang,
              })
              translationResults.push({ lang: targetLang, success: false })
            }
          }

          // Notify foreign lawyers if translations were successful
          if (translationResults.some((r) => r.success)) {
            try {
              const { getServiceClient } = await import("@/lib/supabase/service")
              const serviceSupabase = getServiceClient()

              // Get foreign lawyers associated with the case (if case exists)
              if (document.case_id) {
                const { data: foreignLawyers } = await serviceSupabase
                  .from("profiles")
                  .select("id, email, name, country")
                  .eq("role", "foreign_lawyer")
                  .eq("status", "active")

                if (foreignLawyers && foreignLawyers.length > 0) {
                  const { sendTranslationReadyEmail } = await import(
                    "@/lib/email/templates/translation-ready"
                  )

                  const successfulLangs = translationResults
                    .filter((r) => r.success)
                    .map((r) => r.lang.toUpperCase())

                  for (const lawyer of foreignLawyers) {
                    if (lawyer.email) {
                      await sendTranslationReadyEmail({
                        lawyerEmail: lawyer.email,
                        lawyerName: lawyer.name || "Lawyer",
                        documentName: document.name,
                        documentId: id,
                        versionId: version.id,
                        languages: successfulLangs,
                        caseName: document.case_id ? undefined : undefined, // TODO: Get case name
                      })
                      logger.info("Translation ready email sent to lawyer", {
                        lawyerEmail: lawyer.email,
                        documentId: id,
                      })
                    }
                  }
                }
              }
            } catch (notifyError: any) {
              logger.error("Failed to notify lawyers", {
                error: notifyError,
                documentId: id,
              })
              // Don't fail the request if notification fails
            }
          }
        }
      } catch (segError: any) {
        logger.error("Failed to create segments", {
          error: segError,
          errorMessage: segError?.message,
          errorStack: segError?.stack,
          versionId: version.id,
          documentId: id,
        })
        // Don't fail if segments creation fails, but log the error
      }

      // Log audit event
      if (user) {
        try {
          await logAuditEvent({
            caseId: document.case_id || null,
            entityType: "version",
            entityId: version.id,
            action: AuditActions.VERSION_CREATED,
            meta: { version_no: version.version_no, auto_created: true },
            actor: user.id,
          })
        } catch (auditError) {
          logger.error("Failed to log audit event", {
            error: auditError,
            documentId: id,
          })
        }
      }

      logger.info("Document version created automatically", {
        documentId: id,
        versionId: version.id,
        versionNo: version.version_no,
      })
    } catch (versionError: any) {
      // Don't fail the update if version creation fails, but log the error
      logger.error("Failed to create document version", {
        error: versionError,
        errorMessage: versionError?.message,
        errorStack: versionError?.stack,
        documentId: id,
      })
      // Continue - document update was successful
    }

    logger.info("Document updated", { documentId: id })
    return createSuccessResponse({ document }, "서류가 수정되었습니다.")
  } catch (error) {
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 수정에 실패했습니다.",
      500
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const supabase = await createClient()

    const { error } = await supabase
      .from("documents")
      .delete()
      .eq("id", id)

    if (error) {
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 삭제에 실패했습니다.",
        500
      )
    }

    logger.info("Document deleted", { documentId: id })
    return createSuccessResponse({ success: true }, "서류가 삭제되었습니다.")
  } catch (error) {
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 삭제에 실패했습니다.",
      500
    )
  }
}

