"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"
import { useLocale } from "next-intl"

export default function NotFound() {
  const locale = useLocale()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto container-padding">
        <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-3xl font-bold text-secondary mb-4">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="body-text mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={`/${locale}`} className="premium-button">
            홈으로
          </Link>
          <button
            onClick={() => window.history.back()}
            className="premium-button-outline"
          >
            이전 페이지
          </button>
        </div>
      </div>
    </div>
  )
}

