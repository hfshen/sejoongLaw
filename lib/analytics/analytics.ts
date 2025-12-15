"use client"

// Google Analytics 4
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("event", eventName, eventParams)
  }
}

export const trackPageView = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    ;(window as any).gtag("config", process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    })
  }
}

export const trackConversion = (conversionType: string, value?: number) => {
  trackEvent("conversion", {
    conversion_type: conversionType,
    value: value,
  })
}

// Hotjar (히트맵)
export const initializeHotjar = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_HOTJAR_ID) {
    const h = window as any
    const o = document
    h.hj =
      h.hj ||
      function () {
        ;(h.hj.q = h.hj.q || []).push(arguments)
      }
    h._hjSettings = { hjid: parseInt(process.env.NEXT_PUBLIC_HOTJAR_ID!), hjsv: 6 }
    const a = o.getElementsByTagName("head")[0]
    const r = o.createElement("script")
    r.async = true
    r.src = `https://static.hotjar.com/c/hotjar-${h._hjSettings.hjid}.js?sv=${h._hjSettings.hjsv}`
    a.appendChild(r)
  }
}

// Microsoft Clarity
export const initializeClarity = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLARITY_ID) {
    const c = window as any
    const l = document
    c.clarity =
      c.clarity ||
      function () {
        ;(c.clarity.q = c.clarity.q || []).push(arguments)
      }
    const t = l.createElement("script")
    t.async = true
    t.src = `https://www.clarity.ms/tag/${process.env.NEXT_PUBLIC_CLARITY_ID}`
    const y = l.getElementsByTagName("script")[0]
    y.parentNode?.insertBefore(t, y)
  }
}

// 사용자 행동 추적
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  trackEvent("user_action", {
    action,
    ...details,
    timestamp: new Date().toISOString(),
  })
}

// 전환 추적
export const trackConsultationRequest = () => {
  trackConversion("consultation_request")
  trackEvent("consultation_requested", {
    timestamp: new Date().toISOString(),
  })
}

export const trackBookingCompleted = () => {
  trackConversion("booking_completed")
  trackEvent("booking_completed", {
    timestamp: new Date().toISOString(),
  })
}

