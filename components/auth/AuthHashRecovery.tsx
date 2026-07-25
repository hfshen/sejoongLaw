"use client"

import { useEffect } from "react"
import {
  classifyAuthFailure,
  stayCareLoginRecoveryPath,
} from "@/lib/auth/redirects"

export default function AuthHashRecovery({ locale }: { locale: string }) {
  useEffect(() => {
    if (!window.location.hash.startsWith("#")) return

    const hash = new URLSearchParams(window.location.hash.slice(1))
    const reason = classifyAuthFailure({
      error: hash.get("error"),
      code: hash.get("error_code"),
      description: hash.get("error_description"),
    })

    if (!reason) return

    const query = new URLSearchParams(window.location.search)
    const destination = query.get("next") || `/${locale}/staycare/app`
    window.location.replace(
      stayCareLoginRecoveryPath({ locale, reason, next: destination })
    )
  }, [locale])

  return null
}
