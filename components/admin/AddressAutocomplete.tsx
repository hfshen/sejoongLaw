"use client"

import { createPortal } from "react-dom"
import { useEffect, useMemo, useRef, useState } from "react"

type JusoItem = {
  roadAddrPart1?: string
  roadAddrPart2?: string
  roadFullAddr?: string
  jibunAddr?: string
  zipNo?: string
}

type Props = {
  label: string
  value: string
  placeholder?: string
  onChange: (next: string) => void
}

function combineAddress(road1: string, road2: string, detail: string) {
  return [road1, road2, detail].filter(Boolean).join(" ").trim()
}

export function AddressAutocomplete({ label, value, placeholder, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [rect, setRect] = useState<{ left: number; top: number; width: number } | null>(null)
  const [query, setQuery] = useState(value || "")
  const [debounced, setDebounced] = useState("")
  const [items, setItems] = useState<JusoItem[]>([])
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string>("")

  const [selected, setSelected] = useState<JusoItem | null>(null)
  const [detail, setDetail] = useState("")
  const [detailOpen, setDetailOpen] = useState(false)

  const blurTimer = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setQuery(value || "")
  }, [value])

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

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 250)
    return () => window.clearTimeout(t)
  }, [query])

  useEffect(() => {
    const q = debounced
    if (!open) return
    if (!q || q.length < 2) {
      setItems([])
      setApiError("")
      return
    }

    let cancelled = false
    setLoading(true)
    fetch(`/api/juso/search?keyword=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return
        const err = j?.error?.message
        setApiError(typeof err === "string" ? err : "")
        setItems(Array.isArray(j?.results) ? j.results : [])
        setActive(0)
      })
      .catch(() => {
        if (cancelled) return
        setItems([])
        setApiError("주소 검색 중 오류가 발생했습니다.")
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [debounced, open])

  const suggestions = useMemo(() => {
    return items
      .map((it) => {
        const primary = it.roadAddrPart1 || it.roadFullAddr || ""
        const secondary = it.jibunAddr ? `지번: ${it.jibunAddr}` : ""
        const zip = it.zipNo ? `(${it.zipNo})` : ""
        return {
          item: it,
          label: [primary, zip].filter(Boolean).join(" "),
          sub: secondary,
        }
      })
      .filter((x) => x.label)
  }, [items])

  const pick = (it: JusoItem) => {
    setSelected(it)
    setDetail("")
    setDetailOpen(true)
    setOpen(false)
  }

  const confirmDetail = () => {
    if (!selected) return
    const road1 = selected.roadAddrPart1 || selected.roadFullAddr || ""
    const road2 = selected.roadAddrPart2 || ""
    onChange(combineAddress(road1, road2, detail))
    setDetailOpen(false)
    setSelected(null)
  }

  return (
    <div className="space-y-2" style={{ position: "relative" }}>
      <label className="block text-sm font-medium text-secondary">{label}</label>
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder={placeholder || label}
        onFocus={() => {
          setOpen(true)
          updateRect()
        }}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 120)
        }}
        onChange={(e) => {
          const next = e.target.value
          setQuery(next)
          onChange(next) // 입력 즉시 반영(수동 입력도 허용)
          setOpen(true)
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
              pick(suggestions[active].item)
            }
          } else if (e.key === "Escape") {
            setOpen(false)
          }
        }}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      />

      {open && rect &&
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
              if (blurTimer.current) window.clearTimeout(blurTimer.current)
            }}
          >
            {loading ? (
              <div className="px-3 py-2 text-sm text-text-secondary">검색 중...</div>
            ) : apiError ? (
              <div className="px-3 py-2 text-sm text-red-600">
                {apiError}
                <div className="text-xs text-text-secondary mt-1">
                  (승인키/도메인 설정 문제일 가능성이 큽니다)
                </div>
              </div>
            ) : suggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-secondary">검색 결과가 없습니다. (2글자 이상)</div>
            ) : (
              suggestions.map((s, idx) => (
                <button
                  key={`${s.label}-${idx}`}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm ${
                    idx === active ? "bg-gray-100" : "bg-white"
                  } hover:bg-gray-100`}
                  onMouseEnter={() => setActive(idx)}
                  onClick={() => pick(s.item)}
                >
                  <div className="font-medium text-secondary">{s.label}</div>
                  {s.sub && <div className="text-xs text-text-secondary mt-0.5">{s.sub}</div>}
                </button>
              ))
            )}
          </div>,
          document.body
        )}

      {detailOpen && selected &&
        createPortal(
          <div className="fixed inset-0 z-[10000] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDetailOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl border border-gray-200 w-[min(520px,92vw)]">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="text-sm font-semibold text-secondary">상세주소 입력</div>
                <div className="text-xs text-text-secondary mt-1">
                  {selected.roadAddrPart1 || selected.roadFullAddr || ""}
                  {selected.zipNo ? ` (${selected.zipNo})` : ""}
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-1">상세주소</label>
                  <input
                    type="text"
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="동/층/호 등"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                </div>
              </div>
              <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setDetailOpen(false)}
                >
                  취소
                </button>
                <button
                  type="button"
                  className="px-3 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
                  onClick={confirmDetail}
                >
                  확인
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  )
}

