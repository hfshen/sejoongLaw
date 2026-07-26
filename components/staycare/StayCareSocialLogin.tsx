"use client"

import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Facebook, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

function safeNext(candidate: string | null, locale: string) {
  const fallback = `/${locale}/staycare/claim`
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }
  return candidate.includes("/staycare/") ? candidate : fallback
}

export default function StayCareSocialLogin({ locale }: { locale: string }) {
  const googleEnabled = process.env.NEXT_PUBLIC_STAYCARE_GOOGLE_LOGIN_ENABLED === "true"
  const facebookEnabled = process.env.NEXT_PUBLIC_STAYCARE_FACEBOOK_LOGIN_ENABLED === "true"
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState<"google" | "facebook" | null>(null)
  const [error, setError] = useState("")

  if (!googleEnabled && !facebookEnabled) return null

  async function signIn(provider: "google" | "facebook") {
    setLoading(provider)
    setError("")
    try {
      const destination = safeNext(searchParams.get("next"), locale)
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          queryParams:
            provider === "google"
              ? { access_type: "offline", prompt: "consent" }
              : undefined,
        },
      })
      if (authError) throw authError
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to start social login")
      setLoading(null)
    }
  }

  return (
    <section className="mx-auto -mt-8 mb-10 max-w-5xl px-4">
      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-950/5">
        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.16em] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          Optional account access
          <span className="h-px flex-1 bg-slate-200" />
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {googleEnabled ? (
            <button
              type="button"
              onClick={() => signIn("google")}
              disabled={Boolean(loading)}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-black text-slate-800 hover:bg-slate-50 disabled:opacity-50"
            >
              {loading === "google" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-xs font-black">G</span>
              )}
              Continue with Google
            </button>
          ) : null}
          {facebookEnabled ? (
            <button
              type="button"
              onClick={() => signIn("facebook")}
              disabled={Boolean(loading)}
              className="inline-flex items-center justify-center rounded-2xl bg-[#1877F2] px-4 py-3.5 text-sm font-black text-white disabled:opacity-50"
            >
              {loading === "facebook" ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Facebook className="mr-2 h-5 w-5" />
              )}
              Continue with Facebook
            </button>
          ) : null}
        </div>
        <p className="mt-4 text-center text-xs leading-5 text-slate-500">
          Social login verifies account access only. The official worker roster invitation is still required.
        </p>
        {error ? (
          <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  )
}
