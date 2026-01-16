"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"

export default function WeChatMeta() {
  const pathname = usePathname()
  const locale = useLocale()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  useEffect(() => {
    // 클라이언트 사이드에서만 실행
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return
    }

    // WeChat User-Agent 감지
    const isWeChat = /MicroMessenger/i.test(navigator.userAgent)
    
    if (isWeChat) {
      // WeChat 미니 프로그램 스타일 적용
      document.documentElement.classList.add("wechat-mini-program")
      
      // 기존 viewport 메타 태그 업데이트
      let viewport = document.querySelector('meta[name="viewport"]')
      if (viewport) {
        viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover")
      } else {
        viewport = document.createElement("meta")
        viewport.setAttribute("name", "viewport")
        viewport.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover")
        document.head.appendChild(viewport)
      }

      // WeChat 전용 메타 태그 추가
      const metaTags = [
        { name: "format-detection", content: "telephone=no" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
        { name: "apple-mobile-web-app-title", content: "세중 법률" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "theme-color", content: "#bb271a" },
      ]

      metaTags.forEach((tag) => {
        let element = document.querySelector(`meta[name="${tag.name}"]`)

        if (!element) {
          element = document.createElement("meta")
          element.setAttribute("name", tag.name)
          document.head.appendChild(element)
        }

        element.setAttribute("content", tag.content)
      })

      // WeChat 공유 설정 (WeChat JS-SDK가 로드된 경우)
      if ((window as any).wx) {
        const wx = (window as any).wx
        wx.config({
          // WeChat JS-SDK 설정 (필요시 추가)
          debug: false,
        })
      }

      // WeChat에서 스크롤 최적화
      ;(document.body.style as any).webkitOverflowScrolling = "touch"
    }

    return () => {
      // Cleanup: WeChat 클래스 제거
      if (typeof document !== "undefined") {
        document.documentElement.classList.remove("wechat-mini-program")
      }
    }
  }, [pathname, baseUrl])

  return null
}
