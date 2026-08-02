"use client"

import { useMemo } from "react"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const localeByLanguage: Record<StayCarePreferredLanguage, string> = {
  ko: "ko-KR",
  en: "en-US",
  si: "si-LK",
  ta: "ta-LK",
}

export default function StayCareLocalizedDate({
  value,
  initialLanguage = "ko",
  dateOnly = false,
}: {
  value: string | Date | null | undefined
  initialLanguage?: StayCarePreferredLanguage
  dateOnly?: boolean
}) {
  const { language } = useStayCareLanguage(initialLanguage)
  const formatted = useMemo(() => {
    if (!value) return "—"
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) return "—"
    return new Intl.DateTimeFormat(localeByLanguage[language],
      dateOnly
        ? { year: "numeric", month: "short", day: "numeric" }
        : { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    ).format(date)
  }, [dateOnly, language, value])

  return <>{formatted}</>
}
