"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import GoogleAnalytics from "./GoogleAnalytics"
import { initializeHotjar, initializeClarity } from "@/lib/analytics/analytics"

export default function AnalyticsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  useEffect(() => {
    // Hotjar 초기화
    initializeHotjar()

    // Microsoft Clarity 초기화
    initializeClarity()
  }, [])

  return (
    <>
      <GoogleAnalytics />
      {children}
    </>
  )
}

