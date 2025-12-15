"use client"

import { useState, useRef, useEffect } from "react"
import { useLocale } from "next-intl"
import { useRouter, usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Globe, Check } from "lucide-react"
import { locales, type Locale } from "@/lib/i18n"

const languageNames: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  vi: "Tiếng Việt",
  th: "ไทย",
  id: "Bahasa Indonesia",
  tl: "Filipino",
  ru: "Русский",
  mn: "Монгол",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية",
}

export default function LanguageSelector() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLanguageChange = (newLocale: Locale) => {
    setIsOpen(false)
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`)
    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-5 h-5 text-secondary" />
        <span className="text-sm font-medium text-secondary">
          {languageNames[locale]}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-sm rounded-xl shadow-premium border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto"
          >
            {locales.map((loc) => (
              <button
                key={loc}
                onClick={() => handleLanguageChange(loc)}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition-all duration-200 ${
                  locale === loc
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-secondary hover:bg-gray-50 hover:text-primary"
                }`}
              >
                <span className="text-sm">{languageNames[loc]}</span>
                {locale === loc && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

