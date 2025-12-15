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
    ;(function (h: any, o: any, t: any, j: any, a: any, r: any) {
      h.hj =
        h.hj ||
        function () {
          ;(h.hj.q = h.hj.q || []).push(arguments)
        }
      h._hjSettings = { hjid: parseInt(process.env.NEXT_PUBLIC_HOTJAR_ID!), hjsv: 6 }
      a = o.getElementsByTagName("head")[0]
      r = o.createElement("script")
      r.async = 1
      r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv
      a.appendChild(r)
    })(
      window,
      document,
      "https://static.hotjar.com/c/hotjar-",
      ".js?sv=",
      process.env.NEXT_PUBLIC_HOTJAR_ID
    )
  }
}

// Microsoft Clarity
export const initializeClarity = () => {
  if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CLARITY_ID) {
    ;(function (c: any, l: any, a: any, r: any, i: any, t: any, y: any) {
      c[a] =
        c[a] ||
        function () {
          ;(c[a].q = c[a].q || []).push(arguments)
        }
      t = l.createElement(r)
      t.async = 1
      t.src = "https://www.clarity.ms/tag/" + i
      y = l.getElementsByTagName(r)[0]
      y.parentNode.insertBefore(t, y)
    })(window, document, "clarity", "script", process.env.NEXT_PUBLIC_CLARITY_ID)
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

