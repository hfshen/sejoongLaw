// Document segmentation for translation
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"
import crypto from "crypto"

export interface DocumentSegment {
  id: string
  version_id: string
  seq: number
  key: string
  source_text: string
}

/**
 * Generate a stable key for a segment
 * Uses hash-based key for consistency
 */
function generateSegmentKey(text: string, seq: number): string {
  // Use hash of first 50 chars + sequence for stable key
  const hash = crypto.createHash("md5").update(text.substring(0, 50)).digest("hex").substring(0, 8)
  return `seg_${seq}_${hash}`
}

/**
 * Segment document text into logical units
 * For now, splits by paragraphs and preserves formatting
 */
export function segmentDocument(text: string): Array<{ seq: number; key: string; text: string }> {
  if (!text || text.trim().length === 0) {
    // Return a single empty segment if text is empty
    return [{ seq: 1, key: generateSegmentKey("", 1), text: "" }]
  }

  // Split by double newlines (paragraphs) or single newline if double doesn't exist
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 0)

  // If no paragraphs found, split by single newlines
  let segments =
    paragraphs.length > 1
      ? paragraphs
      : text.split(/\n/).filter((p) => p.trim().length > 0)

  // If still no segments, use the entire text as one segment
  if (segments.length === 0) {
    segments = [text]
  }

  return segments.map((text, index) => {
    const seq = index + 1
    const key = generateSegmentKey(text, seq)
    return { seq, key, text: text.trim() }
  })
}

/**
 * Create segments for a document version
 */
export async function createVersionSegments(
  versionId: string,
  sourceText: string
): Promise<DocumentSegment[]> {
  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  // Segment the document
  const segments = segmentDocument(sourceText)

  // Insert segments into database
  const segmentsToInsert = segments.map((seg) => ({
    version_id: versionId,
    seq: seg.seq,
    key: seg.key,
    source_text: seg.text,
  }))

  const { data, error } = await supabase
    .from("version_segments")
    .insert(segmentsToInsert)
    .select()

  if (error) {
    logger.error("Failed to create version segments", { error, versionId })
    throw new Error("Failed to create version segments")
  }

  logger.info("Version segments created", {
    versionId,
    segmentCount: segments.length,
  })

  return data || []
}

/**
 * Get segments for a version
 */
export async function getVersionSegments(versionId: string): Promise<DocumentSegment[]> {
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
    .from("version_segments")
    .select("*")
    .eq("version_id", versionId)
    .order("seq", { ascending: true })

  if (error) {
    logger.error("Failed to get version segments", {
      error,
      errorCode: error.code,
      errorMessage: error.message,
      versionId,
    })
    throw new Error(`Failed to get version segments: ${error.message}`)
  }

  return data || []
}

/**
 * Get a specific segment
 */
export async function getSegment(segmentId: string): Promise<DocumentSegment | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("version_segments")
    .select("*")
    .eq("id", segmentId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null
    }
    logger.error("Failed to get segment", { error, segmentId })
    throw new Error("Failed to get segment")
  }

  return data
}
