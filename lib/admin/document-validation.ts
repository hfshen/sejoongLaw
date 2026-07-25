import { z } from "zod"
import { DOCUMENT_TYPES } from "@/lib/admin/case-validation"

export const DOCUMENT_LOCALES = ["ko", "en", "zh-CN", "si", "ta"] as const
export type DocumentLocale = (typeof DOCUMENT_LOCALES)[number]

export const documentCreateSchema = z.object({
  document_type: z.enum(DOCUMENT_TYPES),
  name: z.string().trim().min(1, "문서명은 필수입니다.").max(200),
  date: z.string().date("올바른 날짜가 필요합니다."),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  locale: z.enum(DOCUMENT_LOCALES).optional().default("ko"),
})

export const documentUpdateSchema = z
  .object({
    document_type: z.enum(DOCUMENT_TYPES).optional(),
    name: z.string().trim().min(1).max(200).optional(),
    date: z.string().date().optional(),
    data: z.record(z.string(), z.unknown()).optional(),
    locale: z.enum(DOCUMENT_LOCALES).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "변경할 문서 필드를 지정해 주세요.",
  })
  .superRefine((value, context) => {
    if (value.data && JSON.stringify(value.data).length > 1_000_000) {
      context.addIssue({
        code: "custom",
        path: ["data"],
        message: "문서 데이터가 너무 큽니다.",
      })
    }
  })

export const DOCUMENT_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "name",
  "date",
  "document_type",
  "locale",
] as const
export type DocumentSortColumn = (typeof DOCUMENT_SORT_COLUMNS)[number]

export function normalizeDocumentSearch(value: string | null, maxLength = 120) {
  return (value || "")
    .replace(/[,%()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

export function firstDocumentValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message || "문서 입력값을 확인해 주세요."
}
