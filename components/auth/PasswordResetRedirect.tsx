"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export default function PasswordResetRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // 해시 프래그먼트에서 access_token과 type 확인
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      
      if (hash) {
        const params = new URLSearchParams(hash.substring(1))
        const token = params.get("access_token")
        const type = params.get("type")
        
        // 비밀번호 재설정 토큰이 있고, 아직 재설정 페이지가 아닌 경우
        if (token && type === "recovery" && !pathname?.includes("/admin/reset-password")) {
          // 해시를 포함한 URL로 리다이렉트
          router.push(`/admin/reset-password${hash}`)
        }
      }
    }
  }, [router, pathname])

  return null
}

