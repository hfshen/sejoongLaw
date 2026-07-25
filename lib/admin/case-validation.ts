import { z } from "zod"
import type { DocumentType } from "@/lib/documents/templates"

export const DOCUMENT_TYPES = [
  "agreement",
  "power_of_attorney",
  "attorney_appointment",
  "litigation_power",
  "insurance_consent",
  "agreement_old",
  "power_of_attorney_old",
  "attorney_appointment_old",
  "litigation_power_old",
  "insurance_consent_old",
] as const satisfies readonly DocumentType[]

export const caseCreateSchema = z
  .object({
    case_number: z
      .union([z.string().trim().max(100), z.null()])
      .optional()
      .transform((value) => (value === "" ? null : value)),
    case_name: z.string().trim().min(1, "케이스명은 필수입니다.").max(200),
    case_data: z.record(z.string(), z.unknown()),
    document_types: z
      .array(z.enum(DOCUMENT_TYPES))
      .max(DOCUMENT_TYPES.length)
      .optional()
      .default([]),
  })
  .superRefine((value, context) => {
    if (new Set(value.document_types).size !== value.document_types.length) {
      context.addIssue({
        code: "custom",
        path: ["document_types"],
        message: "중복된 서류 유형이 있습니다.",
      })
    }

    const serialized = JSON.stringify(value.case_data)
    if (serialized.length > 1_000_000) {
      context.addIssue({
        code: "custom",
        path: ["case_data"],
        message: "케이스 데이터가 너무 큽니다.",
      })
    }
  })

export const CASE_SORT_COLUMNS = [
  "created_at",
  "updated_at",
  "case_name",
  "case_number",
] as const
export type CaseSortColumn = (typeof CASE_SORT_COLUMNS)[number]

export function normalizeCaseSearch(value: string | null, maxLength = 120) {
  return (value || "")
    .replace(/[,%()\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength)
}

export function firstCaseValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message || "케이스 입력값을 확인해 주세요."
}
