"use client"

import Script from "next/script"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole, Mail, Phone, ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId?: string) => void
    }
  }
}

const copy = {
  ko: {
    title: "StayCare 계정으로 시작하세요",
    description: "스리랑카에서 준비한 정보와 한국 입국 후 생활·체류 서비스를 같은 계정으로 이어갑니다.",
    email: "이메일",
    phone: "휴대전화",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "+94 또는 +82 국가번호 포함",
    send: "로그인 코드 보내기",
    sent: "로그인 링크 또는 인증코드를 보냈습니다. 받은편지함이나 문자메시지를 확인하세요.",
    back: "StayCare 소개로 돌아가기",
    privacy: "로그인 과정에서 여권번호나 외국인등록번호를 입력하지 않습니다.",
  },
  en: {
    title: "Start with your StayCare account",
    description: "Continue from preparation in Sri Lanka to life and stay services in Korea with one account.",
    email: "Email",
    phone: "Mobile phone",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "Include +94 or +82 country code",
    send: "Send login code",
    sent: "A login link or verification code was sent. Check your email or SMS.",
    back: "Back to StayCare",
    privacy: "Do not enter a passport or foreigner-registration number during login.",
  },
  si: {
    title: "ඔබගේ StayCare ගිණුමෙන් ආරම්භ කරන්න",
    description: "ශ්‍රී ලංකාවේ සූදානම් වීමේ සිට කොරියාවේ ජීවිත හා රැඳී සිටීමේ සේවා එකම ගිණුමෙන් භාවිත කරන්න.",
    email: "විද්‍යුත් තැපෑල",
    phone: "ජංගම දුරකථනය",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "+94 හෝ +82 රට කේතය ඇතුළත් කරන්න",
    send: "පිවිසුම් කේතය යවන්න",
    sent: "පිවිසුම් සබැඳිය හෝ කේතය යවා ඇත. විද්‍යුත් තැපෑල හෝ SMS බලන්න.",
    back: "StayCare වෙත ආපසු",
    privacy: "පිවිසීමේදී ගමන් බලපත්‍ර හෝ විදේශික ලියාපදිංචි අංක ඇතුළත් නොකරන්න.",
  },
} as const

type LoginLanguage = keyof typeof copy

export default function StayCareLogin({ locale }: { locale: string }) {
  const language: LoginLanguage = locale === "en" ? "en" : locale === "si" ? "si" : "ko"
  const text = copy[language]
  const [mode, setMode] = useState<"email" | "phone">("email")
  const [value, setValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const captchaContainer = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string>()
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const renderCaptcha = () => {
    if (!siteKey || !window.turnstile || !captchaContainer.current || widgetId.current) return
    widgetId.current = window.turnstile.render(captchaContainer.current, {
      sitekey: siteKey,
      theme: "light",
      callback: (token: string) => setCaptchaToken(token),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setCaptchaToken(""),
    })
  }

  useEffect(() => {
    renderCaptcha()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSent(false)

    if (!value.trim()) return
    if (siteKey && !captchaToken) {
      setError("Please complete the security check.")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=/${locale}/staycare/app`
      const result = mode === "email"
        ? await supabase.auth.signInWithOtp({
            email: value.trim().toLowerCase(),
            options: {
              emailRedirectTo: redirectTo,
              captchaToken: captchaToken || undefined,
              shouldCreateUser: true,
            },
          })
        : await supabase.auth.signInWithOtp({
            phone: value.replace(/\s+/g, ""),
            options: {
              captchaToken: captchaToken || undefined,
              shouldCreateUser: true,
            },
          })

      if (result.error) throw result.error
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send the login code.")
      if (window.turnstile && widgetId.current) window.turnstile.reset(widgetId.current)
      setCaptchaToken("")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-10 text-slate-950 sm:py-16">
      {siteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderCaptcha}
        />
      ) : null}

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-slate-950 p-8 text-white sm:p-10">
          <Link href={`/${locale}/staycare`} className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#bb271a] text-lg font-black">S</span>
            <span>
              <span className="block font-black">Sejoong StayCare</span>
              <span className="text-xs text-slate-400">Sri Lanka → Korea</span>
            </span>
          </Link>

          <h1 className="mt-12 text-3xl font-black leading-tight sm:text-4xl">{text.title}</h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">{text.description}</p>

          <div className="mt-10 space-y-4">
            {[
              "한국어 · English · සිංහල",
              "Private document storage",
              "Government / Sejoong / provider responsibility",
              "AI language and Korea-life support",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 sm:p-10">
          <div className="flex rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => { setMode("email"); setValue(""); setSent(false); setError("") }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${mode === "email" ? "bg-white shadow-sm" : "text-slate-500"}`}
            >
              <Mail className="h-4 w-4" /> {text.email}
            </button>
            <button
              type="button"
              onClick={() => { setMode("phone"); setValue(""); setSent(false); setError("") }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${mode === "phone" ? "bg-white shadow-sm" : "text-slate-500"}`}
            >
              <Phone className="h-4 w-4" /> {text.phone}
            </button>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <label className="block">
              <span className="text-sm font-black">{mode === "email" ? text.email : text.phone}</span>
              <input
                type={mode === "email" ? "email" : "tel"}
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={mode === "email" ? text.emailPlaceholder : text.phonePlaceholder}
                autoComplete={mode === "email" ? "email" : "tel"}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-4 text-base outline-none transition focus:border-[#bb271a] focus:ring-4 focus:ring-red-50"
                required
              />
            </label>

            {siteKey ? <div ref={captchaContainer} className="min-h-[65px]" /> : null}

            {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
            {sent ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">{text.sent}</div> : null}

            <button
              type="submit"
              disabled={loading || !value.trim()}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white transition hover:bg-[#9d2016] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LockKeyhole className="mr-2 h-5 w-5" />}
              {text.send} <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
            <ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />
            {text.privacy}
          </div>

          <Link href={`/${locale}/staycare`} className="mt-6 inline-flex text-sm font-bold text-slate-500 hover:text-slate-950">
            {text.back}
          </Link>
        </section>
      </div>
    </main>
  )
}
