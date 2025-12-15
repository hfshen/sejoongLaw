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

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  }
})
