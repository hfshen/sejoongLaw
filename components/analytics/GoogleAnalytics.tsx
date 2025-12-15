"use client"

import Script from "next/script"
import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackPageView } from "@/lib/analytics/analytics"

export default function GoogleAnalytics() {
  const pathname = usePathname()
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  useEffect(() => {
    if (gaId && pathname) {
      trackPageView(pathname)
    }
  }, [pathname, gaId])

  if (!gaId) {
    return null
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  )
}

