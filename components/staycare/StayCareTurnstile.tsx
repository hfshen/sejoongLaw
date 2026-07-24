"use client"

import Script from "next/script"
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string
          theme?: "light" | "dark" | "auto"
          action?: string
          callback?: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove?: (widgetId: string) => void
    }
  }
}

export interface StayCareTurnstileHandle {
  reset: () => void
}

interface Props {
  siteKey?: string
  action: string
  onToken: (token: string) => void
  className?: string
}

const StayCareTurnstile = forwardRef<StayCareTurnstileHandle, Props>(
  function StayCareTurnstile({ siteKey, action, onToken, className }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | null>(null)

    const renderWidget = useCallback(() => {
      if (
        !siteKey ||
        !window.turnstile ||
        !containerRef.current ||
        widgetIdRef.current
      ) {
        return
      }

      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        theme: "light",
        action,
        callback: onToken,
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      })
    }, [action, onToken, siteKey])

    const reset = useCallback(() => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current)
      }
      onToken("")
    }, [onToken])

    useImperativeHandle(ref, () => ({ reset }), [reset])

    useEffect(() => {
      renderWidget()
      return () => {
        if (window.turnstile?.remove && widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current)
        }
        widgetIdRef.current = null
      }
    }, [renderWidget])

    if (!siteKey) return null

    return (
      <>
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderWidget}
        />
        <div ref={containerRef} className={className || "min-h-[65px]"} />
      </>
    )
  }
)

export default StayCareTurnstile
