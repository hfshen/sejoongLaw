"use client"

import { useId, useMemo } from "react"
import Button from "@/components/ui/Button"

type Props = {
  label: string
  value: string
  placeholder?: string
  onChange: (next: string) => void
  confmKey?: string
}

declare global {
  interface Window {
    [key: string]: unknown
  }
}

export function AddressSearchInput({ label, value, placeholder, onChange, confmKey }: Props) {
  const id = useId()
  const callbackName = useMemo(() => `__jusoCallback_${id.replace(/[^a-zA-Z0-9_]/g, "")}`, [id])

  const openPopup = () => {
    const key =
      confmKey ||
      process.env.NEXT_PUBLIC_JUSO_CONFM_KEY ||
      "U01TX0FVVEgyMDI2MDExMTE2MTkwNzExNzQyMjg="

    ;(window as Record<string, (payload: { roadAddrPart1?: string; roadAddrPart2?: string; addrDetail?: string; zipNo?: string }) => void>)[callbackName] = (payload: { roadAddrPart1?: string; roadAddrPart2?: string; addrDetail?: string; zipNo?: string }) => {
      const road = payload.roadAddrPart1 || ""
      const extra = payload.roadAddrPart2 || ""
      const detail = payload.addrDetail || ""
      const combined = [road, extra, detail].filter(Boolean).join(" ").trim()
      onChange(combined)
      try {
        delete (window as Record<string, unknown>)[callbackName]
      } catch {
        // ignore
      }
    }

    const cssUrl = `${window.location.origin}/juso-theme.css`
    const url = `/admin/juso-popup?confmKey=${encodeURIComponent(key)}&callback=${encodeURIComponent(callbackName)}&cssUrl=${encodeURIComponent(cssUrl)}`
    window.open(url, "jusoPopup", "width=570,height=420,scrollbars=yes,resizable=yes")
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-secondary">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || label}
          className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="button" variant="outline" size="sm" onClick={openPopup}>
          주소검색
        </Button>
      </div>
    </div>
  )
}

