"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { FormEvent, useCallback, useMemo, useRef, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import StayCareTurnstile, {
  type StayCareTurnstileHandle,
} from "@/components/staycare/StayCareTurnstile"
import { createClient } from "@/lib/supabase/client"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const copy = {
  ko: {
    title: "StayCare 계정으로 시작하세요",
    description:
      "스리랑카에서 준비한 정보와 한국 입국 후 생활·체류 서비스를 같은 계정으로 이어갑니다.",
    email: "이메일",
    phone: "휴대전화",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "+94 또는 +82 국가번호 포함",
    sendEmail: "로그인 링크 받기",
    sendPhone: "로그인 코드 받기",
    verify: "인증하고 로그인",
    phoneCodeTitle: "6자리 인증코드",
    phoneCodeHint: "문자에 표시된 6자리 코드를 입력하세요.",
    phoneCodeSent: "휴대전화로 인증코드를 보냈습니다. 문자메시지를 확인하세요.",
    emailSentTitle: "로그인 링크를 보냈습니다",
    emailSentDescription:
      "받은편지함에서 ‘StayCare 바로 로그인’ 버튼을 누르면 이 브라우저에서 자동으로 로그인됩니다.",
    emailSentHint:
      "메일이 보이지 않으면 스팸함을 확인하세요. 링크는 한 번만 사용할 수 있고 잠시 후 만료됩니다.",
    resendEmail: "로그인 링크 다시 보내기",
    changeEmail: "다른 이메일 입력",
    changePhone: "휴대전화 번호 다시 입력",
    back: "StayCare 소개로 돌아가기",
    privacy: "로그인 과정에서 여권번호나 외국인등록번호를 입력하지 않습니다.",
    captcha: "보안 확인을 완료해 주세요.",
    invalidIdentity: "올바른 이메일 또는 국가번호가 포함된 휴대전화 번호를 입력해 주세요.",
    invalidCode: "인증코드가 올바르지 않거나 만료되었습니다. 새 코드를 요청해 주세요.",
    callbackError:
      "로그인 링크 처리에 실패했습니다. 새 로그인 링크를 요청해 주세요.",
    languages: "한국어 · English · සිංහල · தமிழ்",
  },
  en: {
    title: "Start with your StayCare account",
    description:
      "Continue from preparation in Sri Lanka to life and stay services in Korea with one account.",
    email: "Email",
    phone: "Mobile phone",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "Include +94 or +82 country code",
    sendEmail: "Send sign-in link",
    sendPhone: "Send login code",
    verify: "Verify and sign in",
    phoneCodeTitle: "6-digit verification code",
    phoneCodeHint: "Enter the six-digit code shown in the SMS.",
    phoneCodeSent: "A verification code was sent to your phone. Check your messages.",
    emailSentTitle: "Your sign-in link is on its way",
    emailSentDescription:
      "Open the email and select ‘Sign in to StayCare’ to sign in automatically in this browser.",
    emailSentHint:
      "Check your spam folder if the message is missing. The link is single-use and expires shortly.",
    resendEmail: "Send the sign-in link again",
    changeEmail: "Use a different email",
    changePhone: "Use a different phone number",
    back: "Back to StayCare",
    privacy:
      "Do not enter a passport or foreigner-registration number during login.",
    captcha: "Complete the security check.",
    invalidIdentity:
      "Enter a valid email address or a mobile number with its country code.",
    invalidCode:
      "The verification code is invalid or expired. Request a new code.",
    callbackError:
      "The sign-in link could not be completed. Request a new sign-in link.",
    languages: "한국어 · English · සිංහල · தமிழ்",
  },
  si: {
    title: "ඔබගේ StayCare ගිණුමෙන් ආරම්භ කරන්න",
    description:
      "ශ්‍රී ලංකාවේ සූදානම් වීමේ සිට කොරියාවේ ජීවිත හා රැඳී සිටීමේ සේවා එකම ගිණුමෙන් භාවිත කරන්න.",
    email: "විද්‍යුත් තැපෑල",
    phone: "ජංගම දුරකථනය",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "+94 හෝ +82 රට කේතය ඇතුළත් කරන්න",
    sendEmail: "පිවිසුම් සබැඳිය ලබාගන්න",
    sendPhone: "පිවිසුම් කේතය ලබාගන්න",
    verify: "තහවුරු කර පිවිසෙන්න",
    phoneCodeTitle: "අංක 6ක තහවුරු කිරීමේ කේතය",
    phoneCodeHint: "SMS පණිවිඩයේ අංක 6ක කේතය ඇතුළත් කරන්න.",
    phoneCodeSent: "දුරකථනයට තහවුරු කිරීමේ කේතයක් යවා ඇත. SMS පරීක්ෂා කරන්න.",
    emailSentTitle: "පිවිසුම් සබැඳිය යවා ඇත",
    emailSentDescription:
      "විද්‍යුත් තැපෑල විවෘත කර ‘StayCare වෙත පිවිසෙන්න’ බොත්තම ඔබන්න. එවිට ස්වයංක්‍රීයව පිවිසේ.",
    emailSentHint:
      "පණිවිඩය නොපෙනේ නම් spam folder පරීක්ෂා කරන්න. සබැඳිය එක් වරක් පමණක් භාවිත කළ හැකි අතර ඉක්මනින් කල් ඉකුත් වේ.",
    resendEmail: "පිවිසුම් සබැඳිය නැවත යවන්න",
    changeEmail: "වෙනත් email ලිපිනයක් භාවිත කරන්න",
    changePhone: "වෙනත් දුරකථන අංකයක් භාවිත කරන්න",
    back: "StayCare වෙත ආපසු",
    privacy:
      "පිවිසීමේදී ගමන් බලපත්‍ර හෝ විදේශික ලියාපදිංචි අංක ඇතුළත් නොකරන්න.",
    captcha: "ආරක්ෂක පරීක්ෂාව සම්පූර්ණ කරන්න.",
    invalidIdentity:
      "නිවැරදි email ලිපිනයක් හෝ රටේ කේතය සමඟ දුරකථන අංකයක් ඇතුළත් කරන්න.",
    invalidCode: "කේතය වැරදි හෝ කල් ඉකුත් වී ඇත. නව කේතයක් ඉල්ලන්න.",
    callbackError:
      "පිවිසුම් සබැඳිය සම්පූර්ණ කළ නොහැකි විය. නව සබැඳියක් ඉල්ලන්න.",
    languages: "한국어 · English · සිංහල · தமிழ்",
  },
  ta: {
    title: "உங்கள் StayCare கணக்குடன் தொடங்குங்கள்",
    description:
      "இலங்கையில் செய்யும் தயாரிப்பிலிருந்து கொரிய வாழ்க்கை மற்றும் தங்கும் சேவைகள் வரை ஒரே கணக்கில் தொடருங்கள்.",
    email: "மின்னஞ்சல்",
    phone: "மொபைல் தொலைபேசி",
    emailPlaceholder: "name@example.com",
    phonePlaceholder: "+94 அல்லது +82 நாட்டுக் குறியீட்டைச் சேர்க்கவும்",
    sendEmail: "உள்நுழைவு இணைப்பைப் பெறவும்",
    sendPhone: "உள்நுழைவு குறியீட்டைப் பெறவும்",
    verify: "சரிபார்த்து உள்நுழையவும்",
    phoneCodeTitle: "6 இலக்க சரிபார்ப்பு குறியீடு",
    phoneCodeHint: "SMS-ல் காட்டப்பட்ட ஆறு இலக்க குறியீட்டை உள்ளிடவும்.",
    phoneCodeSent: "உங்கள் தொலைபேசிக்கு சரிபார்ப்பு குறியீடு அனுப்பப்பட்டது. SMS-ஐ பார்க்கவும்.",
    emailSentTitle: "உள்நுழைவு இணைப்பு அனுப்பப்பட்டது",
    emailSentDescription:
      "மின்னஞ்சலைத் திறந்து ‘StayCare-இல் உள்நுழையவும்’ பொத்தானை அழுத்துங்கள். இந்த உலாவியில் தானாக உள்நுழைவீர்கள்.",
    emailSentHint:
      "மின்னஞ்சல் தெரியவில்லை என்றால் spam கோப்புறையைச் சரிபார்க்கவும். இணைப்பை ஒருமுறை மட்டுமே பயன்படுத்த முடியும்; அது விரைவில் காலாவதியாகும்.",
    resendEmail: "உள்நுழைவு இணைப்பை மீண்டும் அனுப்பவும்",
    changeEmail: "வேறு மின்னஞ்சலைப் பயன்படுத்தவும்",
    changePhone: "வேறு தொலைபேசி எண்ணைப் பயன்படுத்தவும்",
    back: "StayCare அறிமுகத்திற்குத் திரும்பவும்",
    privacy:
      "உள்நுழைவு செய்யும்போது கடவுச்சீட்டு எண் அல்லது வெளிநாட்டவர் பதிவு எண்ணை உள்ளிட வேண்டாம்.",
    captcha: "பாதுகாப்புச் சரிபார்ப்பை முடிக்கவும்.",
    invalidIdentity:
      "சரியான மின்னஞ்சல் முகவரி அல்லது நாட்டுக் குறியீட்டுடன் மொபைல் எண்ணை உள்ளிடவும்.",
    invalidCode: "சரிபார்ப்பு குறியீடு தவறானது அல்லது காலாவதியானது. புதிய குறியீட்டைக் கோரவும்.",
    callbackError:
      "உள்நுழைவு இணைப்பை முடிக்க முடியவில்லை. புதிய இணைப்பைக் கோரவும்.",
    languages: "한국어 · English · සිංහල · தமிழ்",
  },
} as const

type LoginMode = "email" | "phone"

function friendlyAuthError(
  message: string,
  language: StayCarePreferredLanguage
) {
  const normalized = message.toLowerCase()
  if (normalized.includes("email address not authorized")) {
    return language === "ko"
      ? "Supabase Auth에 Custom SMTP를 연결해야 외부 이메일 주소로 로그인 메일을 보낼 수 있습니다."
      : language === "si"
        ? "බාහිර email ලිපින සඳහා Supabase Auth Custom SMTP සකස් කළ යුතුය."
        : language === "ta"
          ? "வெளிப்புற மின்னஞ்சல் முகவரிகளுக்கு உள்நுழைவு மின்னஞ்சல் அனுப்ப Supabase Auth-இல் Custom SMTP அமைக்க வேண்டும்."
          : "Configure Custom SMTP in Supabase Auth to deliver login mail to external addresses."
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return language === "ko"
      ? "인증 요청 한도를 초과했습니다. 잠시 기다린 뒤 다시 시도하세요."
      : language === "si"
        ? "ඉල්ලීම් සීමාව ඉක්මවා ඇත. ටික වේලාවකට පසු නැවත උත්සාහ කරන්න."
        : language === "ta"
          ? "அங்கீகார கோரிக்கை வரம்பு எட்டப்பட்டுள்ளது. சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்."
          : "The authentication request limit was reached. Wait and try again."
  }
  if (normalized.includes("captcha")) {
    return language === "ko"
      ? "Turnstile 검증에 실패했습니다. 보안 확인을 다시 완료해 주세요."
      : language === "si"
        ? "Turnstile තහවුරු කිරීම අසාර්ථකයි. නැවත ආරක්ෂක පරීක්ෂාව සම්පූර්ණ කරන්න."
        : language === "ta"
          ? "Turnstile சரிபார்ப்பு தோல்வியடைந்தது. பாதுகாப்புச் சரிபார்ப்பை மீண்டும் முடிக்கவும்."
          : "Turnstile verification failed. Complete the security check again."
  }
  if (normalized.includes("supabase browser environment")) {
    return language === "ko"
      ? "Vercel의 Supabase 공개 환경값을 확인해 주세요."
      : language === "si"
        ? "Vercel හි Supabase public environment values පරීක්ෂා කරන්න."
        : language === "ta"
          ? "Vercel-இல் Supabase பொது சூழல் மதிப்புகளைச் சரிபார்க்கவும்."
          : "Check the public Supabase environment values in Vercel."
  }
  return message
}

function safeDestination(
  candidate: string | null,
  locale: string,
  language: StayCarePreferredLanguage
) {
  const fallback = `/${locale}/staycare/app?lang=${language}`
  if (!candidate || !candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback
  }
  return candidate.includes("/staycare/") ? candidate : fallback
}

function normalizedPhone(value: string) {
  return value.replace(/[\s()-]/g, "")
}

export default function StayCareLogin({ locale }: { locale: string }) {
  const initialLanguage: StayCarePreferredLanguage =
    locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<LoginMode>("email")
  const [identity, setIdentity] = useState("")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(
    searchParams.get("error") === "auth_callback_failed"
      ? text.callbackError
      : ""
  )
  const [captchaToken, setCaptchaToken] = useState("")
  const turnstileRef = useRef<StayCareTurnstileHandle | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

  const destination = useMemo(
    () => safeDestination(searchParams.get("next"), locale, language),
    [language, locale, searchParams]
  )

  const handleCaptchaToken = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  const resetCaptcha = () => {
    turnstileRef.current?.reset()
    setCaptchaToken("")
  }

  const resetFlow = ({ clearIdentity }: { clearIdentity: boolean }) => {
    if (clearIdentity) setIdentity("")
    setOtp("")
    setSent(false)
    setError("")
    resetCaptcha()
  }

  const changeMode = (nextMode: LoginMode) => {
    setMode(nextMode)
    resetFlow({ clearIdentity: true })
  }

  const requestAccess = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    const value = identity.trim()
    const phone = normalizedPhone(value)
    const valid =
      mode === "email"
        ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        : /^\+[1-9]\d{7,14}$/.test(phone)

    if (!valid) {
      setError(text.invalidIdentity)
      return
    }
    if (siteKey && !captchaToken) {
      setError(text.captcha)
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(destination)}`
      const result =
        mode === "email"
          ? await supabase.auth.signInWithOtp({
              email: value.toLowerCase(),
              options: {
                emailRedirectTo: redirectTo,
                captchaToken: captchaToken || undefined,
                shouldCreateUser: true,
              },
            })
          : await supabase.auth.signInWithOtp({
              phone,
              options: {
                captchaToken: captchaToken || undefined,
                shouldCreateUser: true,
              },
            })

      if (result.error) throw result.error
      setSent(true)
      resetCaptcha()
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : "Unable to send authentication."
      setError(friendlyAuthError(message, language))
      resetCaptcha()
    } finally {
      setLoading(false)
    }
  }

  const verifyPhoneCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!/^\d{6}$/.test(otp.trim())) {
      setError(text.invalidCode)
      return
    }

    setLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const result = await supabase.auth.verifyOtp({
        phone: normalizedPhone(identity),
        token: otp.trim(),
        type: "sms",
      })
      if (result.error) throw result.error
      window.location.assign(destination)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : text.invalidCode
      setError(
        message.toLowerCase().includes("token")
          ? text.invalidCode
          : friendlyAuthError(message, language)
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-10 text-slate-950 sm:py-16">
      <div className="mx-auto mb-4 flex max-w-5xl justify-end">
        <StayCareLanguageSwitcher value={language} onChange={setLanguage} />
      </div>

      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-950/10 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="bg-slate-950 p-8 text-white sm:p-10">
          <Link href={`/${locale}/staycare`} className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#bb271a] text-lg font-black">
              S
            </span>
            <span>
              <span className="block font-black">Sejoong StayCare</span>
              <span className="text-xs text-slate-400">Sri Lanka → Korea</span>
            </span>
          </Link>

          <h1 className="mt-12 text-3xl font-black leading-tight sm:text-4xl">
            {text.title}
          </h1>
          <p className="mt-5 text-sm leading-7 text-slate-300">
            {text.description}
          </p>

          <div className="mt-10 space-y-4">
            {[
              text.languages,
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
          {!sent ? (
            <>
              <div className="flex rounded-2xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => changeMode("email")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${
                    mode === "email" ? "bg-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Mail className="h-4 w-4" />
                  {text.email}
                </button>
                <button
                  type="button"
                  onClick={() => changeMode("phone")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-black ${
                    mode === "phone" ? "bg-white shadow-sm" : "text-slate-500"
                  }`}
                >
                  <Phone className="h-4 w-4" />
                  {text.phone}
                </button>
              </div>

              <form onSubmit={requestAccess} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-black">
                    {mode === "email" ? text.email : text.phone}
                  </span>
                  <span className="relative mt-2 block">
                    {mode === "email" ? (
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    ) : (
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    )}
                    <input
                      type={mode === "email" ? "email" : "tel"}
                      inputMode={mode === "email" ? "email" : "tel"}
                      autoComplete={mode === "email" ? "email" : "tel"}
                      value={identity}
                      onChange={(event) => setIdentity(event.target.value)}
                      placeholder={
                        mode === "email"
                          ? text.emailPlaceholder
                          : text.phonePlaceholder
                      }
                      required
                      className="w-full rounded-2xl border border-slate-200 py-4 pl-12 pr-4 outline-none transition focus:border-[#bb271a] focus:ring-4 focus:ring-red-100"
                    />
                  </span>
                </label>

                <StayCareTurnstile
                  ref={turnstileRef}
                  siteKey={siteKey}
                  action="staycare_login"
                  onToken={handleCaptchaToken}
                />

                {error ? (
                  <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white transition hover:bg-[#9f2117] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-5 w-5" />
                  )}
                  {mode === "email" ? text.sendEmail : text.sendPhone}
                </button>
              </form>
            </>
          ) : mode === "email" ? (
            <div className="space-y-6" aria-live="polite">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Mail className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-2xl font-black">{text.emailSentTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text.emailSentDescription}
                </p>
                <p className="mt-2 break-all text-sm font-black text-[#bb271a]">
                  {identity}
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-950">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-700" />
                  <p>{text.emailSentHint}</p>
                </div>
              </div>

              {error ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                onClick={() => resetFlow({ clearIdentity: false })}
                className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-4 font-black text-slate-800 transition hover:border-[#bb271a] hover:text-[#bb271a]"
              >
                <RefreshCw className="mr-2 h-5 w-5" />
                {text.resendEmail}
              </button>
              <button
                type="button"
                onClick={() => resetFlow({ clearIdentity: true })}
                className="inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-black text-slate-500 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                {text.changeEmail}
              </button>
            </div>
          ) : (
            <form onSubmit={verifyPhoneCode} className="space-y-5">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <KeyRound className="h-7 w-7" />
              </span>
              <div>
                <h2 className="text-2xl font-black">{text.phoneCodeTitle}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {text.phoneCodeSent}
                </p>
                <p className="mt-2 break-all text-sm font-black text-[#bb271a]">
                  {identity}
                </p>
              </div>
              <label className="block">
                <span className="sr-only">{text.phoneCodeTitle}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  required
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-center font-mono text-2xl tracking-[0.4em] outline-none transition focus:border-[#bb271a] focus:ring-4 focus:ring-red-100"
                />
              </label>
              <p className="text-xs leading-6 text-slate-500">{text.phoneCodeHint}</p>

              {error ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white transition hover:bg-[#9f2117] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <ShieldCheck className="mr-2 h-5 w-5" />
                )}
                {text.verify}
              </button>
              <button
                type="button"
                onClick={() => resetFlow({ clearIdentity: true })}
                className="inline-flex w-full items-center justify-center gap-2 py-2 text-sm font-black text-slate-500 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                {text.changePhone}
              </button>
            </form>
          )}

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="flex items-start gap-2 text-xs leading-6 text-slate-500">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" />
              {text.privacy}
            </p>
            <Link
              href={`/${locale}/staycare`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-black text-slate-700 hover:text-[#bb271a]"
            >
              <ArrowLeft className="h-4 w-4" />
              {text.back}
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
