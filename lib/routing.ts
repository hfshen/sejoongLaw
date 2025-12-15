import { defineRouting } from "next-intl/routing"
import { createNavigation } from "next-intl/navigation"

export const routing = defineRouting({
  locales: [
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
  ],
  defaultLocale: "ko",
  localePrefix: "always",
})

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing)

