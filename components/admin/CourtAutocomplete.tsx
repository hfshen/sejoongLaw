"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { getCourtSuggestions, type CourtLocale } from "@/lib/constants/courts"

type Props = {
  label: string
  required?: boolean
  locale?: CourtLocale
  value: unknown
  placeholder?: string
  errorText?: string
  onChange: (next: string) => void
}

export function CourtAutocomplete({ label, required, locale = "ko", value, placeholder, errorText, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [showAllWhenEmpty, setShowAllWhenEmpty] = useState(false)
  const blurTimer = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null)

  const inputValue = useMemo(() => {
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    return ""
  }, [value])

  const suggestions = useMemo(() => {
    const q = inputValue.trim()
    // 기본 동작: "검색에 맞는 것만" → 입력이 비어 있으면 목록 숨김
    if (!q && !showAllWhenEmpty) return []
    return getCourtSuggestions(inputValue, locale, 12)
  }, [inputValue, locale, showAllWhenEmpty])

  const commit = (name: string) => {
    onChange(name)
    setOpen(false)
  }

  const updateRect = () => {
    const el = inputRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setRect({ left: r.left, top: r.bottom, width: r.width })
  }

  useEffect(() => {
    if (!open) return
    updateRect()

    const onScroll = () => updateRect()
    const onResize = () => updateRect()
    window.addEventListener("scroll", onScroll, true)
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("scroll", onScroll, true)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  return (
    <div className="space-y-2" style={{ position: "relative" }}>
      <label className="block text-sm font-medium text-secondary">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          placeholder={placeholder || label}
          onFocus={() => {
            setOpen(true)
            setShowAllWhenEmpty(false)
            updateRect()
          }}
          onBlur={() => {
            // 클릭 선택을 위해 약간 지연
            blurTimer.current = window.setTimeout(() => setOpen(false), 120)
          }}
          onChange={(e) => {
            onChange(e.target.value)
            setOpen(true)
            setShowAllWhenEmpty(false)
            setActive(0)
          }}
          onKeyDown={(e) => {
            if (!open) return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActive((p) => Math.min(p + 1, Math.max(0, suggestions.length - 1)))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActive((p) => Math.max(p - 1, 0))
            } else if (e.key === "Enter") {
              if (suggestions[active]) {
                e.preventDefault()
                commit(suggestions[active].value)
              }
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
          className="w-full pr-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="button"
          aria-label="법원 목록 열기"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          onMouseDown={() => {
            // input blur 방지
            if (blurTimer.current) window.clearTimeout(blurTimer.current)
          }}
          onClick={() => {
            setOpen((v) => {
              const next = !v
              // ▾ 버튼으로 열 때는, 입력이 비어있으면 전체 목록도 볼 수 있게
              if (next) setShowAllWhenEmpty(true)
              return next
            })
            setActive(0)
            updateRect()
            inputRef.current?.focus()
          }}
        >
          ▾
        </button>
      </div>

      {errorText && <p className="text-sm text-red-500">{errorText}</p>}

      {open && suggestions.length > 0 && rect &&
        createPortal(
          <div
            className="border border-gray-200 rounded-lg bg-white shadow-lg"
            style={{
              position: "fixed",
              left: `${rect.left}px`,
              top: `${rect.top + 6}px`,
              width: `${rect.width}px`,
              zIndex: 9999,
              maxHeight: "260px",
              overflowY: "auto",
            }}
            onMouseDown={() => {
              // input blur 전에 닫히지 않도록
              if (blurTimer.current) window.clearTimeout(blurTimer.current)
            }}
          >
            {suggestions.map((s, idx) => (
              <button
                key={`${s.label}-${idx}`}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm ${
                  idx === active ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-100`}
                onMouseEnter={() => setActive(idx)}
                onClick={() => commit(s.value)}
              >
                {s.label}
              </button>
            ))}
          </div>,
          document.body
        )}

      <p className="text-xs text-text-secondary">
        초성 예시: <span className="font-medium">ㅅㅇㅈㅇㅈㅂㅇ</span> / <span className="font-medium">ㅇㅈㅂ</span>
      </p>
    </div>
  )
}


