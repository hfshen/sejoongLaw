"use client"

import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"
import { translateStayCareTamil } from "@/lib/staycare/tamil-translations"

export type StayCareTextValue =
  | string
  | Partial<Record<StayCarePreferredLanguage, string>>

function resolveText(value: StayCareTextValue, language: StayCarePreferredLanguage) {
  if (typeof value === "string") return value
  if (language === "ta") return value.ta || translateStayCareTamil(value.en || value.ko || "")
  return value[language] || value.en || value.ko || value.si || ""
}

export default function StayCareText({
  value,
  initialLanguage = "ko",
}: {
  value: StayCareTextValue
  initialLanguage?: StayCarePreferredLanguage
}) {
  const { language } = useStayCareLanguage(initialLanguage)
  return <>{resolveText(value, language)}</>
}
