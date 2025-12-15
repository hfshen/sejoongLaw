"use client"

import { useEffect } from "react"
import { useLocale } from "next-intl"

export default function LocaleAttributes() {
  const locale = useLocale()
  const isRTL = locale === "ar"

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute("lang", locale)
    html.setAttribute("dir", isRTL ? "rtl" : "ltr")
    
    if (isRTL) {
      html.classList.add("rtl")
    } else {
      html.classList.remove("rtl")
    }
  }, [locale, isRTL])

  return null
}

