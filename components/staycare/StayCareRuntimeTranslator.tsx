"use client"

import type { ReactNode } from "react"
import { useEffect, useRef } from "react"
import { translateStayCareInterface } from "@/lib/staycare/interface-translations"
import { translateStayCareTamil } from "@/lib/staycare/tamil-translations"
import type { StayCarePreferredLanguage } from "@/lib/staycare/language"

const SKIP_SELECTOR =
  "[data-staycare-no-translate],script,style,code,pre,textarea,[contenteditable='true']"
const ATTRIBUTES = ["placeholder", "title", "aria-label"] as const

const prefixLabels: Record<
  string,
  Record<StayCarePreferredLanguage, string>
> = {
  "Expiry:": { ko: "만료일:", en: "Expiry:", si: "කල් ඉකුත්වීම:", ta: "காலாவதி:" },
  "Created:": { ko: "생성일:", en: "Created:", si: "නිර්මාණය කළේ:", ta: "உருவாக்கப்பட்டது:" },
  "Created ": { ko: "생성일 ", en: "Created ", si: "නිර්මාණය කළේ ", ta: "உருவாக்கப்பட்டது " },
  "Due:": { ko: "기한:", en: "Due:", si: "කාලසීමාව:", ta: "காலக்கெடு:" },
  "Reference:": { ko: "참조번호:", en: "Reference:", si: "යොමුව:", ta: "குறிப்பு:" },
}

function skip(node: Node) {
  const element =
    node.nodeType === Node.ELEMENT_NODE
      ? (node as Element)
      : node.parentElement
  return Boolean(element?.closest(SKIP_SELECTOR))
}

function preserveWhitespace(original: string, translated: string) {
  const leading = original.match(/^\s*/)?.[0] || ""
  const trailing = original.match(/\s*$/)?.[0] || ""
  return `${leading}${translated}${trailing}`
}

function translateValue(value: string, language: StayCarePreferredLanguage) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized || !/[A-Za-z가-힣\u0D80-\u0DFF\u0B80-\u0BFF]/.test(normalized)) {
    return undefined
  }

  const exact = translateStayCareInterface(normalized, language)
  if (exact) return exact

  for (const [prefix, labels] of Object.entries(prefixLabels)) {
    if (normalized.startsWith(prefix)) {
      return `${labels[language]}${normalized.slice(prefix.length)}`
    }
  }

  if (language === "ta") {
    const tamil = translateStayCareTamil(normalized)
    if (tamil && tamil !== normalized) return tamil
  }

  return undefined
}

function translateTextNode(node: Text, language: StayCarePreferredLanguage) {
  if (skip(node)) return
  const original = node.nodeValue || ""
  const translated = translateValue(original, language)
  if (!translated) return
  const next = preserveWhitespace(original, translated)
  if (next !== original) node.nodeValue = next
}

function translateElement(element: Element, language: StayCarePreferredLanguage) {
  if (skip(element)) return

  for (const attribute of ATTRIBUTES) {
    const original = element.getAttribute(attribute)
    if (!original) continue
    const translated = translateValue(original, language)
    if (translated && translated !== original) {
      element.setAttribute(attribute, translated)
    }
  }

  for (const child of Array.from(element.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      translateTextNode(child as Text, language)
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      translateElement(child as Element, language)
    }
  }
}

export default function StayCareRuntimeTranslator({
  language,
  children,
}: {
  language: StayCarePreferredLanguage
  children: ReactNode
}) {
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    let frame = 0
    const apply = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => translateElement(root, language))
    }

    apply()
    const observer = new MutationObserver(apply)
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTES],
    })

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [language])

  return (
    <div ref={rootRef} data-staycare-runtime-language={language} className="contents">
      {children}
    </div>
  )
}
