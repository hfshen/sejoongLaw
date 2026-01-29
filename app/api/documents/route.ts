import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    // 관리자 인증 확인
    let isAdmin = false
    try {
      isAdmin = await isAdminAuthenticated()
    } catch (authError) {
      logger.error("Admin authentication check failed", { error: authError })
      // 인증 확인 실패 시에도 401 반환
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service role client to bypass RLS
    let supabase
    try {
      supabase = getServiceClient()
    } catch (serviceError) {
      logger.warn("Failed to get service client, using regular client", { error: serviceError })
      supabase = await createClient()
    }
    
    const { searchParams } = new URL(request.url)
    
    const documentType = searchParams.get("type")
    const name = searchParams.get("name")
    const date = searchParams.get("date")
    const locale = searchParams.get("locale") || "ko"
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const search = searchParams.get("search")
    const caseLinked = searchParams.get("case_linked")

    // sortBy 유효성 검사 (SQL injection 방지)
    const validSortColumns = ["created_at", "updated_at", "name", "date", "document_type", "locale"]
    const safeSortBy = validSortColumns.includes(sortBy) ? sortBy : "created_at"
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc"

    let query = supabase
      .from("documents")
      .select("*")
      .eq("locale", locale)

    // 필터 적용
    if (documentType) {
      query = query.eq("document_type", documentType)
    }
    if (name) {
      query = query.ilike("name", `%${name}%`)
    }
    if (date) {
      query = query.eq("date", date)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,data::text.ilike.%${search}%`)
    }
    if (caseLinked !== null && caseLinked !== "") {
      query = query.eq("is_case_linked", caseLinked === "true")
    }

    // 정렬
    query = query.order(safeSortBy, { ascending: safeSortOrder === "asc" })

    const { data, error } = await query

    if (error) {
      logger.error("Failed to fetch documents", { error, filters: { documentType, name, date, locale } })
      return createNextErrorResponse(
        NextResponse,
        error,
        "서류 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Documents fetched successfully", { count: data?.length || 0 })
    return createSuccessResponse({ documents: data || [] })
  } catch (error) {
    logger.error("Error fetching documents", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "서류 목록을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      logger.warn("Admin authentication failed", {
        hasCookie: !!request.cookies.get("admin_session"),
      })
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Always use service role client to bypass RLS
    // We've already verified admin_session cookie, so this is safe
    // This ensures documents can be created even without Supabase auth session
    let supabase
    let user = null
    
    try {
      supabase = getServiceClient()
      logger.info("Using service role client for document creation")
      
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
      return NextResponse.json(
        { error: "서버 설정 오류", details: "Service Role Key가 설정되지 않았습니다." },
        { status: 500 }
      )
    }
    
    const body = await request.json()

    const { document_type, name, date, data, locale = "ko" } = body

    if (!document_type || !name || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const { data: document, error } = await supabase
      .from("documents")
      .insert([
        {
          document_type,
          name,
          date,
          data: data || {},
          locale,
          created_by: user?.id || null,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create document", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        errorDetails: error.details,
        errorHint: error.hint,
        document_type,
        name,
        userId: user?.id,
      })
      
      // RLS 정책 위반 에러인 경우 더 자세한 메시지
      if (error.code === "42501") {
        logger.error("RLS policy violation", {
          errorCode: error.code,
          errorMessage: error.message,
          errorDetails: error.details,
          errorHint: error.hint,
          userId: user?.id,
          document_type,
          name,
        })
        return NextResponse.json(
          {
            error: "권한이 없습니다. RLS 정책을 확인하세요.",
            details: error.message,
            hint: error.hint || "사용자 역할이 올바르게 설정되었는지 확인하세요. 015_fix_rls_permissive.sql 마이그레이션을 실행하세요.",
            code: error.code,
          },
          { status: 403 }
        )
      }
      
      return createNextErrorResponse(
        NextResponse,
        error,
        error.message || "서류 생성에 실패했습니다.",
        500
      )
    }

    // Create initial version (version 1) - always create version
    try {
      const { createDocumentVersion } = await import("@/lib/documents/versioning")
      const { createVersionSegments } = await import("@/lib/documents/segmentation")
      const { logAuditEvent, AuditActions } = await import("@/lib/audit/events")

      // Create text representation of document data
      const documentText = JSON.stringify(
        {
          document_type,
          name,
          date,
          data: data || {},
          locale,
        },
        null,
        2
      )

      const fileContent = Buffer.from(documentText, "utf-8")
      const storagePath = `documents/${document.id}/v1_${Date.now()}.txt`

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
            documentId: document.id,
          })
          // Continue without storage upload
        }
      } catch (storageError) {
        logger.warn("Storage upload error", {
          error: storageError,
          storagePath,
          documentId: document.id,
        })
        // Continue without storage upload
      }

      // Create version (user can be null, created_by will be null)
      const version = await createDocumentVersion({
        documentId: document.id,
        storagePath,
        fileContent,
        createdBy: user?.id || null,
      })

      // Update document's current_version_id to the new version
      await supabase
        .from("documents")
        .update({ current_version_id: version.id })
        .eq("id", document.id)

      // Create segments from readable document text
      try {
        // Extract readable text from document data instead of raw JSON
        const { extractReadableText } = await import("@/lib/documents/text-extractor")
        const readableText = extractReadableText(
          document_type as any,
          data || {},
          (locale as "ko" | "en" | "zh-CN" | "si" | "ta") || "ko"
        )
        
        const createdSegments = await createVersionSegments(version.id, readableText)
        logger.info("Segments created successfully", {
          versionId: version.id,
          documentId: document.id,
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

              // Get foreign lawyers (all active foreign lawyers for now)
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
                      documentName: name,
                      documentId: document.id,
                      versionId: version.id,
                      languages: successfulLangs,
                    })
                    logger.info("Translation ready email sent to lawyer", {
                      lawyerEmail: lawyer.email,
                      documentId: document.id,
                    })
                  }
                }
              }
            } catch (notifyError: any) {
              logger.error("Failed to notify lawyers", {
                error: notifyError,
                documentId: document.id,
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
          documentId: document.id,
        })
        // Don't fail if segments creation fails, but log the error
      }

      // Log audit event (only if user exists)
      if (user) {
        try {
          await logAuditEvent({
            caseId: null,
            entityType: "document",
            entityId: document.id,
            action: AuditActions.DOCUMENT_CREATED,
            meta: { document_type, name },
            actor: user.id,
          })
        } catch (auditError) {
          logger.error("Failed to log audit event", {
            error: auditError,
            documentId: document.id,
          })
          // Don't fail if audit logging fails
        }
      }

      logger.info("Document version created automatically", {
        documentId: document.id,
        versionId: version.id,
        versionNo: version.version_no,
      })
    } catch (versionError: any) {
      // Don't fail document creation if version creation fails, but log the error
      logger.error("Failed to create initial version", {
        error: versionError,
        errorMessage: versionError?.message,
        errorStack: versionError?.stack,
        documentId: document.id,
      })
      // Continue - document is already created
    }

    logger.info("Document created successfully", { documentId: document.id, document_type, name })
    return createSuccessResponse({ document }, "서류가 생성되었습니다.", 201)
  } catch (error: any) {
    logger.error("Error creating document", {
      error,
      errorMessage: error?.message,
      errorStack: error?.stack,
      errorCode: error?.code,
    })
    return createNextErrorResponse(
      NextResponse,
      error,
      error?.message || "서류 생성에 실패했습니다.",
      500
    )
  }
}

