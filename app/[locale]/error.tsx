"use client"

import { useEffect } from "react"
import Button from "@/components/ui/Button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto container-padding">
        <h2 className="text-3xl font-bold text-secondary mb-4">
          문제가 발생했습니다
        </h2>
        <p className="body-text mb-8">
          페이지를 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>다시 시도</Button>
          <Button variant="outline" onClick={() => window.location.href = "/"}>
            홈으로
          </Button>
        </div>
      </div>
    </div>
  )
}

