import { z } from "zod"

const optionalText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value))

const textList = (itemMax: number) =>
  z
    .array(z.string().trim().min(1).max(itemMax))
    .max(50)
    .optional()
    .default([])

export const memberPayloadSchema = z.object({
  name: z.string().trim().min(1, "이름은 필수입니다.").max(100),
  position: optionalText(100),
  profile_image_url: z
    .union([z.string().trim().url().max(2048), z.null()])
    .optional(),
  introduction: optionalText(5000),
  specialties: textList(100),
  education: textList(300),
  career: textList(300),
  order_index: z.coerce.number().int().min(0).max(10000).optional().default(0),
})

export const MEMBER_ORDER_COLUMNS = ["order_index", "name", "position"] as const
export type MemberOrderColumn = (typeof MEMBER_ORDER_COLUMNS)[number]

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function firstZodMessage(error: z.ZodError) {
  return error.issues[0]?.message || "입력값을 확인해 주세요."
}
