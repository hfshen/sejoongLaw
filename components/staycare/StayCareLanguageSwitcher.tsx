"use client"

import { Languages } from "lucide-react"
import {
  stayCareLanguageLabels,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

export default function StayCareLanguageSwitcher({
  value,
  onChange,
  inverted = false,
  compact = false,
}: {
  value: StayCarePreferredLanguage
  onChange: (language: StayCarePreferredLanguage) => void
  inverted?: boolean
  compact?: boolean
}) {
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold ${
        inverted
          ? "border-white/15 bg-white/5 text-white"
          : "border-slate-200 bg-white text-slate-700 shadow-sm"
      }`}
    >
      <Languages className="h-4 w-4 shrink-0" />
      {!compact ? <span className="hidden sm:inline">Language</span> : null}
      <select
        aria-label="StayCare language"
        value={value}
        onChange={(event) =>
          onChange(event.target.value as StayCarePreferredLanguage)
        }
        className={`cursor-pointer bg-transparent text-sm font-black outline-none ${
          inverted ? "text-white" : "text-slate-900"
        }`}
      >
        {Object.entries(stayCareLanguageLabels).map(([key, label]) => (
          <option key={key} value={key} className="text-slate-950">
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
