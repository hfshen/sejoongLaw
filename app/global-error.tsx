"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-950 px-4 py-16 text-white">
        <main className="mx-auto max-w-xl rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-red-300">Sejoong StayCare</p>
          <h1 className="mt-4 text-3xl font-black">서비스 처리 중 오류가 발생했습니다.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            입력하던 정보는 다시 확인해 주세요. 같은 문제가 반복되면 세중 StayCare 운영센터로 문의해 주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-8 rounded-2xl bg-[#bb271a] px-6 py-3 font-black text-white"
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  )
}
