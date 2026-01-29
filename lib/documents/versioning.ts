// Document versioning system (append-only)
import { createClient } from "@/lib/supabase/server"
import crypto from "crypto"
import logger from "@/lib/logger"

export interface DocumentVersion {
  id: string
  document_id: string
  version_no: number
  storage_path: string
  sha256: string
  status: "draft" | "pending_translation" | "pending_approval" | "approved" | "exported"
  created_by: string
  created_at: string
}

export interface CreateVersionParams {
  documentId: string
  storagePath: string
  fileContent: Buffer | string
  createdBy: string
}

/**
 * Calculate SHA256 hash of file content
 */
export function calculateSHA256(content: Buffer | string): string {
  const buffer = typeof content === "string" ? Buffer.from(content, "utf-8") : content
  return crypto.createHash("sha256").update(buffer).digest("hex")
}

/**
 * Create a new document version (append-only)
 */
export async function createDocumentVersion(
  params: CreateVersionParams
): Promise<DocumentVersion> {
  const { documentId, storagePath, fileContent, createdBy } = params

  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  // Calculate hash
  const sha256 = calculateSHA256(fileContent)

  // Get current max version number
  const { data: maxVersion, error: maxError } = await supabase
    .from("document_versions")
    .select("version_no")
    .eq("document_id", documentId)
    .order("version_no", { ascending: false })
    .limit(1)
    .single()

  if (maxError && maxError.code !== "PGRST116") {
    // PGRST116 is "not found" which is OK for first version
    logger.error("Failed to get max version", { error: maxError })
    throw new Error("Failed to get version number")
  }

  const versionNo = maxVersion ? maxVersion.version_no + 1 : 1

  // Create new version
  // Note: created_by can be null if user is not authenticated
  const insertData: {
    document_id: string
    version_no: number
    storage_path: string
    sha256: string
    status: string
    created_by: string | null
  } = {
    document_id: documentId,
    version_no: versionNo,
    storage_path: storagePath,
    sha256,
    status: "draft",
    created_by: createdBy,
  }

  const { data: version, error } = await supabase
    .from("document_versions")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    logger.error("Failed to create document version", {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      errorDetails: error.details,
      errorHint: error.hint,
      documentId,
      versionNo,
      createdBy,
    })
    throw new Error(`Failed to create document version: ${error.message}`)
  }

  // Update document's current_version_id to the latest version
  // Always update to the newest version
  await supabase
    .from("documents")
    .update({ current_version_id: version.id })
    .eq("id", documentId)

  logger.info("Document version created", {
    documentId,
    versionId: version.id,
    versionNo,
    sha256,
  })

  return version
}

/**
 * Get version history for a document
 */
export async function getVersionHistory(documentId: string): Promise<DocumentVersion[]> {
  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("document_id", documentId)
    .order("version_no", { ascending: false })

  if (error) {
    logger.error("Failed to get version history", { error, documentId })
    throw new Error("Failed to get version history")
  }

  return data || []
}

/**
 * Get a specific version
 */
export async function getVersion(versionId: string): Promise<DocumentVersion | null> {
  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  const { data, error } = await supabase
    .from("document_versions")
    .select("*")
    .eq("id", versionId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    logger.error("Failed to get version", { error, versionId })
    throw new Error("Failed to get version")
  }

  return data
}

/**
 * Lock a version (prevent modifications)
 * This is done by setting status to 'approved' or 'exported'
 */
export async function lockVersion(
  versionId: string,
  status: "approved" | "exported"
): Promise<void> {
  const supabase = await createClient()

  // Check current status
  const { data: version, error: fetchError } = await supabase
    .from("document_versions")
    .select("status")
    .eq("id", versionId)
    .single()

  if (fetchError) {
    logger.error("Failed to fetch version for locking", { error: fetchError, versionId })
    throw new Error("Failed to fetch version")
  }

  if (!version) {
    throw new Error("Version not found")
  }

  // Prevent locking if already exported
  if (version.status === "exported") {
    throw new Error("Version is already exported and cannot be modified")
  }

  const { error } = await supabase
    .from("document_versions")
    .update({ status })
    .eq("id", versionId)

  if (error) {
    logger.error("Failed to lock version", { error, versionId, status })
    throw new Error("Failed to lock version")
  }

  logger.info("Version locked", { versionId, status })
}

/**
 * Update version status
 */
export async function updateVersionStatus(
  versionId: string,
  status: DocumentVersion["status"]
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("document_versions")
    .update({ status })
    .eq("id", versionId)

  if (error) {
    logger.error("Failed to update version status", { error, versionId, status })
    throw new Error("Failed to update version status")
  }

  logger.info("Version status updated", { versionId, status })
}

/**
 * Verify version integrity by comparing hash
 */
export async function verifyVersionIntegrity(
  versionId: string,
  fileContent: Buffer | string
): Promise<boolean> {
  const version = await getVersion(versionId)
  if (!version) {
    return false
  }

  const calculatedHash = calculateSHA256(fileContent)
  return calculatedHash === version.sha256
}
