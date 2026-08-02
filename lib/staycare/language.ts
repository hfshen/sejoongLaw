export type StayCarePreferredLanguage = "ko" | "en" | "si" | "ta"

export const STAYCARE_LANGUAGE_STORAGE_KEY = "staycare-language"
export const STAYCARE_LANGUAGE_COOKIE = "staycare_language"

export const stayCareLanguageLabels: Record<StayCarePreferredLanguage, string> = {
  ko: "한국어",
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
}

export function normalizeStayCareLanguage(value: unknown): StayCarePreferredLanguage | null {
  return value === "ko" || value === "en" || value === "si" || value === "ta" ? value : null
}
