import { z } from "zod"

const nullableText = (max: number) =>
  z
    .union([z.string().trim().max(max), z.null()])
    .transform((value) => (value === "" ? null : value))

const textList = (itemMax: number) =>
  z.array(z.string().trim().min(1).max(itemMax)).max(50)

const memberFields = {
  name: z.string().trim().min(1, "이름은 필수입니다.").max(100),
  position: nullableText(100),
  profile_image_url: z.union([z.string().trim().url().max(2048), z.null()]),
  introduction: nullableText(5000),
  specialties: textList(100),
  education: textList(300),
  career: textList(300),
  order_index: z.coerce.number().int().min(0).max(10000),
}

export const memberCreateSchema = z.object({
  name: memberFields.name,
  position: memberFields.position.optional().default(null),
  profile_image_url: memberFields.profile_image_url.optional().default(null),
  introduction: memberFields.introduction.optional().default(null),
  specialties: memberFields.specialties.optional().default([]),
  education: memberFields.education.optional().default([]),
  career: memberFields.career.optional().default([]),
  order_index: memberFields.order_index.optional().default(0),
})

export const memberUpdateSchema = z
  .object({
    name: memberFields.name.optional(),
    position: memberFields.position.optional(),
    profile_image_url: memberFields.profile_image_url.optional(),
    introduction: memberFields.introduction.optional(),
    specialties: memberFields.specialties.optional(),
    education: memberFields.education.optional(),
    career: memberFields.career.optional(),
    order_index: memberFields.order_index.optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "변경할 필드를 지정해 주세요.",
  })

export const MEMBER_ORDER_COLUMNS = ["order_index", "name", "position"] as const
export type MemberOrderColumn = (typeof MEMBER_ORDER_COLUMNS)[number]

export const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function firstZodMessage(error: z.ZodError) {
  return error.issues[0]?.message || "입력값을 확인해 주세요."
}
