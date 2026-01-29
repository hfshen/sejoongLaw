// Translation engine for legal documents
import { createClient } from "@/lib/supabase/server"
import logger from "@/lib/logger"
import { getTranslationSystemPrompt } from "./prompts"
import { getOpenAIClient } from "@/lib/openai"

export interface SegmentTranslation {
  id: string
  segment_id: string
  target_lang: string
  translated_text: string
  engine: "ai" | "human" | "hybrid"
  status: "draft" | "reviewed" | "approved"
  created_by: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export type TargetLanguage = "en" | "si" | "ta" | "zh-CN" | "ja" | "vi" | "th" | "id" | "tl" | "ru" | "mn" | "es" | "fr" | "de" | "ar"

/**
 * Translate a single segment
 * For Korean to English: Template-based (data mapping)
 * For English to Sinhala/Tamil: AI translation (placeholder for now)
 */
export async function translateSegment(
  segmentId: string,
  sourceText: string,
  sourceLang: string,
  targetLang: TargetLanguage,
  createdBy?: string
): Promise<string> {
  // Korean to English: Template-based translation (data mapping)
  // This is handled by the template system, so we just return the source text
  // The actual translation happens when rendering the template with different locale
  if (sourceLang === "ko" && targetLang === "en") {
    // Template-based: Just return source for now
    // Actual translation will be done by template rendering with locale="en"
    logger.info("Template-based translation (ko->en)", { segmentId })
    return sourceText // Will be translated by template system
  }

  // English to Sinhala/Tamil: Professional AI translation
  if (sourceLang === "en" && (targetLang === "si" || targetLang === "ta")) {
    const openai = getOpenAIClient()
    if (!openai) {
      logger.warn("OpenAI client not available, returning placeholder", { segmentId, targetLang })
      return `[Translation to ${targetLang.toUpperCase()} pending] ${sourceText}`
    }

    const systemPrompt = getTranslationSystemPrompt(sourceLang, targetLang)

    try {
      // Use GPT-4 for better quality legal translations
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Use GPT-4o for professional legal translations
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: sourceText },
        ],
        temperature: 0.1, // Lower temperature for more consistent, accurate translations
        max_tokens: 2000, // Increased for longer legal documents
        top_p: 0.95,
        frequency_penalty: 0.1, // Encourage diverse but accurate terminology
        presence_penalty: 0.1,
      })

      const translatedText = completion.choices[0]?.message?.content?.trim() || sourceText

      // Remove any potential explanatory text that might be added
      const cleanText = translatedText
        .replace(/^\[.*?\]\s*/g, "") // Remove [notes] at start
        .replace(/\s*\[.*?\]$/g, "") // Remove [notes] at end
        .trim()

      logger.info("Segment translated (Professional AI)", {
        segmentId,
        sourceLang,
        targetLang,
        sourceLength: sourceText.length,
        targetLength: cleanText.length,
        model: "gpt-4o",
      })

      return cleanText
    } catch (error) {
      logger.error("Failed to translate segment", { error, segmentId, sourceLang, targetLang })
      // Return placeholder instead of throwing
      return `[Translation to ${targetLang.toUpperCase()} failed] ${sourceText}`
    }
  }

  // Other language pairs: Return source text
  logger.info("Translation not needed or not implemented", { sourceLang, targetLang })
  return sourceText
}

/**
 * Create or update segment translation
 */
export async function saveSegmentTranslation(
  segmentId: string,
  targetLang: TargetLanguage,
  translatedText: string,
  engine: "ai" | "human" | "hybrid" = "ai",
  createdBy?: string
): Promise<SegmentTranslation> {
  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  // Check if translation already exists
  const { data: existing } = await supabase
    .from("segment_translations")
    .select("*")
    .eq("segment_id", segmentId)
    .eq("target_lang", targetLang)
    .single()

  if (existing) {
    // Update existing translation
    const { data, error } = await supabase
      .from("segment_translations")
      .update({
        translated_text: translatedText,
        engine,
        status: "draft",
        updated_at: new Date().toISOString(),
        ...(createdBy && { created_by: createdBy }),
      })
      .eq("id", existing.id)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update segment translation", { error, segmentId, targetLang })
      throw new Error("Failed to update segment translation")
    }

    return data
  } else {
    // Create new translation
    const { data, error } = await supabase
      .from("segment_translations")
      .insert({
        segment_id: segmentId,
        target_lang: targetLang,
        translated_text: translatedText,
        engine,
        status: "draft",
        ...(createdBy && { created_by: createdBy }),
      })
      .select()
      .single()

    if (error) {
      logger.error("Failed to create segment translation", { error, segmentId, targetLang })
      throw new Error("Failed to create segment translation")
    }

    return data
  }
}

/**
 * Translate all segments for a version
 */
export async function translateVersion(
  versionId: string,
  sourceLang: string,
  targetLang: TargetLanguage,
  createdBy?: string
): Promise<SegmentTranslation[]> {
  // Use service role client to bypass RLS
  const { getServiceClient } = await import("@/lib/supabase/service")
  let supabase
  try {
    supabase = getServiceClient()
  } catch {
    // Fallback to regular client
    supabase = await createClient()
  }

  // Get all segments for the version
  const { data: segments, error: segmentsError } = await supabase
    .from("version_segments")
    .select("*")
    .eq("version_id", versionId)
    .order("seq", { ascending: true })

  if (segmentsError) {
    logger.error("Failed to get version segments", { error: segmentsError, versionId })
    throw new Error("Failed to get version segments")
  }

  if (!segments || segments.length === 0) {
    throw new Error("No segments found for version")
  }

  const translations: SegmentTranslation[] = []

  // Translate each segment
  for (const segment of segments) {
    try {
      // Check if translation already exists
      const { data: existing } = await supabase
        .from("segment_translations")
        .select("*")
        .eq("segment_id", segment.id)
        .eq("target_lang", targetLang)
        .single()

      if (existing && existing.status === "approved") {
        // Skip already approved translations
        translations.push(existing)
        continue
      }

      // Translate segment
      const translatedText = await translateSegment(
        segment.id,
        segment.source_text,
        sourceLang,
        targetLang,
        createdBy
      )

      // Save translation
      const translation = await saveSegmentTranslation(
        segment.id,
        targetLang,
        translatedText,
        "ai",
        createdBy
      )

      translations.push(translation)
    } catch (error) {
      logger.error("Failed to translate segment", {
        error,
        segmentId: segment.id,
        versionId,
        targetLang,
      })
      // Continue with other segments even if one fails
    }
  }

  logger.info("Version translation completed", {
    versionId,
    targetLang,
    totalSegments: segments.length,
    translatedCount: translations.length,
  })

  return translations
}

/**
 * Review a translation (mark as reviewed)
 */
export async function reviewTranslation(
  translationId: string,
  reviewedBy: string,
  approved: boolean = false
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from("segment_translations")
    .update({
      reviewed_by: reviewedBy,
      status: approved ? "approved" : "reviewed",
      updated_at: new Date().toISOString(),
    })
    .eq("id", translationId)

  if (error) {
    logger.error("Failed to review translation", { error, translationId })
    throw new Error("Failed to review translation")
  }

  logger.info("Translation reviewed", { translationId, reviewedBy, approved })
}

/**
 * Get translations for a version
 */
export async function getVersionTranslations(
  versionId: string,
  targetLang: TargetLanguage
): Promise<SegmentTranslation[]> {
  const supabase = await createClient()

  // First get segments for the version
  const { data: segments, error: segmentsError } = await supabase
    .from("version_segments")
    .select("id")
    .eq("version_id", versionId)
    .order("seq", { ascending: true })

  if (segmentsError) {
    logger.error("Failed to get version segments", { error: segmentsError, versionId })
    throw new Error("Failed to get version segments")
  }

  if (!segments || segments.length === 0) {
    return []
  }

  const segmentIds = segments.map((s) => s.id)

  // Then get translations for those segments
  const { data, error } = await supabase
    .from("segment_translations")
    .select("*")
    .in("segment_id", segmentIds)
    .eq("target_lang", targetLang)
    .order("created_at", { ascending: true })

  if (error) {
    logger.error("Failed to get version translations", { error, versionId, targetLang })
    throw new Error("Failed to get version translations")
  }

  // Sort by segment sequence
  const translationsMap = new Map((data || []).map((t) => [t.segment_id, t]))
  const sortedTranslations: SegmentTranslation[] = []

  for (const segment of segments) {
    const translation = translationsMap.get(segment.id)
    if (translation) {
      sortedTranslations.push(translation)
    }
  }

  return sortedTranslations
}

/**
 * Get full translated text for a version
 */
export async function getTranslatedText(
  versionId: string,
  targetLang: TargetLanguage
): Promise<string> {
  const translations = await getVersionTranslations(versionId, targetLang)

  // Sort by segment sequence and join
  return translations
    .map((t) => t.translated_text)
    .join("\n\n")
}
