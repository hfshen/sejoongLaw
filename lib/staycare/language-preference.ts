"use client"

import { useCallback, useEffect, useState } from "react"

export type StayCarePreferredLanguage = "ko" | "en" | "si"

export const STAYCARE_LANGUAGE_STORAGE_KEY = "staycare-language"
export const STAYCARE_LANGUAGE_COOKIE = "staycare_language"

export const stayCareLanguageLabels: Record<StayCarePreferredLanguage, string> = {
  ko: "한국어",
  en: "English",
  si: "සිංහල",
}

export function normalizeStayCareLanguage(value: unknown): StayCarePreferredLanguage | null {
  return value === "ko" || value === "en" || value === "si" ? value : null
}

function readCookieLanguage() {
  if (typeof document === "undefined") return null
  const pair = document.cookie
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${STAYCARE_LANGUAGE_COOKIE}=`))
  return normalizeStayCareLanguage(pair?.split("=")[1])
}

export function readStayCareLanguage() {
  if (typeof window === "undefined") return null

  const queryLanguage = normalizeStayCareLanguage(
    new URLSearchParams(window.location.search).get("lang")
  )
  if (queryLanguage) return queryLanguage

  try {
    const storedLanguage = normalizeStayCareLanguage(
      window.localStorage.getItem(STAYCARE_LANGUAGE_STORAGE_KEY)
    )
    if (storedLanguage) return storedLanguage
  } catch {
    // Storage may be blocked by browser privacy settings.
  }

  return readCookieLanguage()
}

export function persistStayCareLanguage(language: StayCarePreferredLanguage) {
  if (typeof window === "undefined") return

  try {
    window.localStorage.setItem(STAYCARE_LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Cookie remains as the server-readable fallback.
  }

  const secure = window.location.protocol === "https:" ? "; Secure" : ""
  document.cookie = `${STAYCARE_LANGUAGE_COOKIE}=${language}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`
  window.dispatchEvent(new CustomEvent("staycare-language-change", { detail: language }))
}

export function useStayCareLanguage(initialLanguage: StayCarePreferredLanguage) {
  const [language, setLanguageState] = useState<StayCarePreferredLanguage>(initialLanguage)

  useEffect(() => {
    const stored = readStayCareLanguage()
    if (stored) setLanguageState(stored)
  }, [])

  useEffect(() => {
    const listener = (event: Event) => {
      const next = normalizeStayCareLanguage((event as CustomEvent).detail)
      if (next) setLanguageState(next)
    }
    window.addEventListener("staycare-language-change", listener)
    return () => window.removeEventListener("staycare-language-change", listener)
  }, [])

  const setLanguage = useCallback((next: StayCarePreferredLanguage) => {
    setLanguageState(next)
    persistStayCareLanguage(next)
  }, [])

  return { language, setLanguage }
}
