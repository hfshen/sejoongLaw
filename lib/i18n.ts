import { getRequestConfig } from "next-intl/server"
import { routing } from "./routing"

export const locales = [
  "ko",
  "en",
  "zh-CN",
  "zh-TW",
  "ja",
  "vi",
  "th",
  "id",
  "tl",
  "ru",
  "mn",
  "es",
  "fr",
  "de",
  "ar",
] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "ko"

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale
  }

  const messages = (await import(`../messages/${locale}.json`)).default
  let ansanMessages = {}
  
  try {
    ansanMessages = (await import(`../messages/${locale}/ansan.json`)).default
  } catch {
    // ansan.json이 없으면 한국어 버전을 fallback으로 사용
    try {
      ansanMessages = (await import(`../messages/${defaultLocale}/ansan.json`)).default
    } catch {
      // 한국어도 없으면 빈 객체
      ansanMessages = {}
    }
  }

  return {
    locale,
    messages: { ...messages, ansan: ansanMessages },
  }
})
