"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  Building2,
  Eye,
  KeyRound,
  Landmark,
  Loader2,
  ShieldAlert,
  UserRound,
  Wrench,
} from "lucide-react"
import StayCareTurnstile, {
  type StayCareTurnstileHandle,
} from "@/components/staycare/StayCareTurnstile"
import { createClient } from "@/lib/supabase/client"
import {
  getStayCareDemoTargetPath,
  isStayCareDemoLoginEnabled,
  stayCareDemoAccounts,
  stayCareDemoPassword,
  type StayCareDemoAccount,
  type StayCareDemoGroup,
} from "@/lib/staycare/demo-accounts"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const groupIcons: Record<StayCareDemoGroup, typeof UserRound> = {
  worker: UserRound,
  sejoong: Landmark,
  operator: Wrench,
  external: Building2,
  audit: Eye,
}

const groupOrder: StayCareDemoGroup[] = [
  "worker",
  "sejoong",
  "operator",
  "external",
  "audit",
]

const copy = {
  ko: {
    eyebrow: "Demo access",
    title: "역할별 데모 계정으로 바로 확인",
    description:
      "모든 데모 계정은 실제 운영 데이터와 분리된 전용 테넌트의 합성데이터만 사용합니다.",
    password: "공통 비밀번호",
    signIn: "이 역할로 로그인",
    signingIn: "로그인 중",
    captcha: "데모 로그인 전에 보안 확인을 완료해 주세요.",
    failed:
      "데모 계정 로그인에 실패했습니다. Supabase에 데모 계정이 생성되어 있는지 확인하세요.",
    groups: {
      worker: "근로자",
      sejoong: "법무법인 세중",
      operator: "위탁 운영사",
      external: "외부 참여기관",
      audit: "감사·품질",
    },
    warning:
      "공개 데모 계정입니다. 실제 개인정보·여권·계좌정보를 입력하지 마세요.",
  },
  en: {
    eyebrow: "Demo access",
    title: "Open the platform with a role-based demo account",
    description:
      "Every demo account is isolated in a synthetic-data tenant and cannot access production member data.",
    password: "Shared password",
    signIn: "Sign in as this role",
    signingIn: "Signing in",
    captcha: "Complete the security check before using a demo account.",
    failed:
      "Demo sign-in failed. Confirm that the demo users were provisioned in Supabase.",
    groups: {
      worker: "Worker",
      sejoong: "Sejoong Law",
      operator: "Operating company",
      external: "External organizations",
      audit: "Audit and quality",
    },
    warning:
      "These are public demo accounts. Never enter real passport, identity, bank or remittance data.",
  },
  si: {
    eyebrow: "Demo access",
    title: "භූමිකාව අනුව demo ගිණුමකින් පද්ධතිය බලන්න",
    description:
      "සියලු demo ගිණුම් සැබෑ දත්තවලින් වෙන් වූ කෘතිම දත්ත tenant එකක් පමණක් භාවිතා කරයි.",
    password: "පොදු මුරපදය",
    signIn: "මෙම භූමිකාවෙන් පිවිසෙන්න",
    signingIn: "පිවිසෙමින්",
    captcha:
      "Demo ගිණුම භාවිතා කිරීමට පෙර ආරක්ෂක පරීක්ෂාව සම්පූර්ණ කරන්න.",
    failed:
      "Demo පිවිසීම අසාර්ථකයි. Supabase හි demo users නිර්මාණය කර ඇතිද බලන්න.",
    groups: {
      worker: "සේවකයා",
      sejoong: "Sejoong නීති කාර්යාලය",
      operator: "මෙහෙයුම් සමාගම",
      external: "බාහිර ආයතන",
      audit: "විගණන හා ගුණාත්මකභාවය",
    },
    warning:
      "මෙය පොදු demo ගිණුම් වේ. සැබෑ ගමන් බලපත්‍ර, හැඳුනුම්, බැංකු හෝ මුදල් යැවීමේ දත්ත ඇතුළත් නොකරන්න.",
  },
  ta: {
    eyebrow: "Demo அணுகல்",
    title: "பங்கு அடிப்படையிலான demo கணக்கில் தளத்தைப் பாருங்கள்",
    description:
      "அனைத்து demo கணக்குகளும் உண்மையான செயல்பாட்டு தரவிலிருந்து பிரிக்கப்பட்ட செயற்கை தரவு tenant-ஐ மட்டும் பயன்படுத்துகின்றன.",
    password: "பொது கடவுச்சொல்",
    signIn: "இந்தப் பங்கில் உள்நுழையவும்",
    signingIn: "உள்நுழைகிறது",
    captcha: "Demo கணக்கைப் பயன்படுத்துவதற்கு முன் பாதுகாப்புச் சரிபார்ப்பை முடிக்கவும்.",
    failed: "Demo உள்நுழைவு தோல்வியடைந்தது. Supabase-இல் demo பயனர்கள் உருவாக்கப்பட்டுள்ளார்களா எனச் சரிபார்க்கவும்.",
    groups: {
      worker: "தொழிலாளர்",
      sejoong: "Sejoong சட்ட அலுவலகம்",
      operator: "செயல்பாட்டு நிறுவனம்",
      external: "வெளிப்புற நிறுவனங்கள்",
      audit: "தணிக்கை மற்றும் தரம்",
    },
    warning: "இவை பொது demo கணக்குகள். உண்மையான கடவுச்சீட்டு, அடையாளம், வங்கி அல்லது பணமாற்றத் தகவலை உள்ளிட வேண்டாம்.",
  },
} as const

function DemoAccountCard({
  account,
  language,
  loading,
  disabled,
  onLogin,
}: {
  account: StayCareDemoAccount
  language: StayCarePreferredLanguage
  loading: boolean
  disabled: boolean
  onLogin: (account: StayCareDemoAccount) => void
}) {
  const Icon = groupIcons[account.group]
  const text = copy[language]

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h4 className="font-black text-slate-950">
            {account.label[language]}
          </h4>
          <p className="mt-1 break-all text-xs font-semibold text-[#bb271a]">
            {account.email}
          </p>
        </div>
      </div>
      <p className="mt-3 flex-1 text-xs leading-6 text-slate-600">
        {account.description[language]}
      </p>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onLogin(account)}
        className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white transition hover:bg-[#bb271a] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <KeyRound className="mr-2 h-4 w-4" />
        )}
        {loading ? text.signingIn : text.signIn}
      </button>
    </article>
  )
}

export default function StayCareDemoLogin({ locale }: { locale: string }) {
  const initialLanguage: StayCarePreferredLanguage =
    locale === "en" ? "en" : "ko"
  const { language } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [captchaToken, setCaptchaToken] = useState("")
  const turnstileRef = useRef<StayCareTurnstileHandle | null>(null)
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  const groups = useMemo(
    () =>
      groupOrder.map((group) => ({
        group,
        accounts: stayCareDemoAccounts.filter(
          (account) => account.group === group
        ),
      })),
    []
  )
  const handleCaptchaToken = useCallback((token: string) => {
    setCaptchaToken(token)
  }, [])

  if (!isStayCareDemoLoginEnabled()) return null

  const resetCaptcha = () => {
    turnstileRef.current?.reset()
    setCaptchaToken("")
  }

  const login = async (account: StayCareDemoAccount) => {
    setError("")
    if (siteKey && !captchaToken) {
      setError(text.captcha)
      return
    }

    setLoadingId(account.id)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: stayCareDemoPassword,
        options: captchaToken ? { captchaToken } : undefined,
      })
      if (authError) throw authError
      window.location.assign(
        getStayCareDemoTargetPath(account, locale, language)
      )
    } catch (caught) {
      const detail =
        caught instanceof Error ? caught.message : "Unknown authentication error"
      setError(`${text.failed} (${detail})`)
      resetCaptcha()
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="bg-[#f5f5f3] px-4 pb-16">
      <section className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 shadow-sm">
        <div className="border-b border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#bb271a]">
                {text.eyebrow}
              </p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">
                {text.title}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                {text.description}
              </p>
            </div>
            <div className="shrink-0 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-amber-700">
                {text.password}
              </p>
              <p className="mt-1 font-mono text-sm font-black text-amber-950">
                {stayCareDemoPassword}
              </p>
            </div>
          </div>

          <StayCareTurnstile
            ref={turnstileRef}
            siteKey={siteKey}
            action="staycare_demo_login"
            onToken={handleCaptchaToken}
            className="mt-5 min-h-[65px]"
          />
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          {groups.map(({ group, accounts }) => {
            const Icon = groupIcons[group]
            return (
              <div key={group}>
                <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-700">
                  <Icon className="h-4 w-4 text-[#bb271a]" />
                  {text.groups[group]}
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-400">
                    {accounts.length}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {accounts.map((account) => (
                    <DemoAccountCard
                      key={account.id}
                      account={account}
                      language={language}
                      loading={loadingId === account.id}
                      disabled={Boolean(loadingId)}
                      onLogin={login}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {error ? (
            <p
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-700"
            >
              {error}
            </p>
          ) : null}

          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            {text.warning}
          </div>
        </div>
      </section>
    </div>
  )
}
