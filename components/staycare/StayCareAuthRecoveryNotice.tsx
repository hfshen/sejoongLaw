"use client"

import { AlertTriangle, RefreshCcw } from "lucide-react"
import { normalizeStayCareLocale } from "@/lib/auth/redirects"
import { useStayCareLanguage } from "@/lib/staycare/language-preference"

const copy = {
  ko: {
    title: "로그인 링크가 만료되었습니다",
    body: "이 링크는 만료되었거나 이미 사용되었습니다. 아래에서 이메일 또는 휴대전화 번호를 다시 입력해 최신 6자리 인증코드를 받아 주세요.",
    action: "새 인증코드 요청",
  },
  en: {
    title: "This sign-in link has expired",
    body: "The link has expired or was already used. Enter your email address or phone number below to request a new six-digit verification code.",
    action: "Request a new code",
  },
  si: {
    title: "පිවිසුම් සබැඳිය කල් ඉකුත් වී ඇත",
    body: "මෙම සබැඳිය කල් ඉකුත් වී හෝ දැනටමත් භාවිත කර ඇත. නවතම අංක 6ක තහවුරු කිරීමේ කේතයක් ලබා ගැනීමට පහතින් ඔබගේ විද්‍යුත් තැපෑල හෝ දුරකථන අංකය නැවත ඇතුළත් කරන්න.",
    action: "නව කේතයක් ඉල්ලන්න",
  },
  ta: {
    title: "உள்நுழைவு இணைப்பு காலாவதியாகிவிட்டது",
    body: "இந்த இணைப்பு காலாவதியாகியிருக்கலாம் அல்லது ஏற்கனவே பயன்படுத்தப்பட்டிருக்கலாம். புதிய ஆறு இலக்க சரிபார்ப்பு குறியீட்டைப் பெற கீழே உங்கள் மின்னஞ்சல் அல்லது தொலைபேசி எண்ணை மீண்டும் உள்ளிடவும்.",
    action: "புதிய குறியீட்டைக் கோரவும்",
  },
} as const

export default function StayCareAuthRecoveryNotice({
  locale,
  reason,
}: {
  locale: string
  reason?: string | null
}) {
  const initialLanguage = normalizeStayCareLocale(locale)
  const { language } = useStayCareLanguage(initialLanguage)

  if (reason !== "otp_expired") return null
  const text = copy[language]

  const focusLoginForm = () => {
    const field = document.querySelector<HTMLInputElement>(
      'input[type="email"], input[type="tel"]'
    )
    field?.focus()
    field?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pt-8">
      <div
        role="alert"
        aria-live="assertive"
        className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950 shadow-sm"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <h2 className="font-black">{text.title}</h2>
            <p className="mt-2 text-sm leading-6 text-amber-900">{text.body}</p>
            <button
              type="button"
              onClick={focusLoginForm}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-950 px-4 py-2 text-sm font-black text-white transition hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-950 focus:ring-offset-2"
            >
              <RefreshCcw className="h-4 w-4" />
              {text.action}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
