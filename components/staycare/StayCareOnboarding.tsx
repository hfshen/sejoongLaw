"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, CheckCircle2, Loader2, ShieldCheck } from "lucide-react"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const copy = {
  ko: {
    title: "내 한국생활 여정을 시작합니다",
    description: "기본정보를 등록하면 현재 단계에 맞는 준비목록과 원스톱 서비스가 생성됩니다.",
    name: "성명",
    englishName: "여권 영문명",
    language: "선호언어",
    visa: "비자 유형",
    occupation: "예정 직종",
    arrival: "예상 입국일",
    optional: "아직 확정되지 않았다면 비워두세요.",
    submit: "내 StayCare 시작하기",
    consent: "입력한 정보가 개인별 준비과정 생성과 세중 서비스 운영에 사용되는 데 동의합니다.",
  },
  en: {
    title: "Start your Korea-life journey",
    description: "Register basic information to generate your personal checklist and one-stop services.",
    name: "Full name",
    englishName: "Passport English name",
    language: "Preferred language",
    visa: "Visa type",
    occupation: "Expected occupation",
    arrival: "Expected arrival date",
    optional: "Leave optional fields blank if not confirmed.",
    submit: "Start my StayCare",
    consent: "I consent to using this information to create my personal journey and operate StayCare services.",
  },
  si: {
    title: "ඔබගේ කොරියානු ජීවිත ගමන ආරම්භ කරන්න",
    description: "මූලික තොරතුරු ලියාපදිංචි කර පුද්ගලික සූදානම් ලැයිස්තුව සහ එක්-තැනක සේවා සාදන්න.",
    name: "සම්පූර්ණ නම",
    englishName: "ගමන් බලපත්‍රයේ ඉංග්‍රීසි නම",
    language: "කැමති භාෂාව",
    visa: "වීසා වර්ගය",
    occupation: "අපේක්ෂිත රැකියාව",
    arrival: "අපේක්ෂිත පැමිණීමේ දිනය",
    optional: "තවම තහවුරු නොකළ තොරතුරු හිස්ව තබන්න.",
    submit: "මගේ StayCare ආරම්භ කරන්න",
    consent: "මෙම තොරතුරු මගේ පුද්ගලික ගමන සහ StayCare සේවා සඳහා භාවිත කිරීමට එකඟ වෙමි.",
  },
  ta: {
    title: "உங்கள் கொரிய வாழ்க்கைப் பயணத்தைத் தொடங்குங்கள்",
    description: "அடிப்படை தகவலை பதிவு செய்தால், உங்கள் தனிப்பட்ட தயாரிப்பு பட்டியலும் ஒருங்கிணைந்த சேவைகளும் உருவாக்கப்படும்.",
    name: "முழுப் பெயர்",
    englishName: "கடவுச்சீட்டில் உள்ள ஆங்கிலப் பெயர்",
    language: "விருப்ப மொழி",
    visa: "விசா வகை",
    occupation: "எதிர்பார்க்கப்படும் தொழில்",
    arrival: "எதிர்பார்க்கப்படும் வருகை தேதி",
    optional: "இன்னும் உறுதியாகாத தகவல்களை காலியாக விடலாம்.",
    submit: "என் StayCare-ஐ தொடங்கவும்",
    consent: "இந்த தகவல் எனது தனிப்பட்ட பயணத்தை உருவாக்கவும் StayCare சேவைகளை இயக்கவும் பயன்படுத்தப்படுவதற்கு நான் ஒப்புக்கொள்கிறேன்.",
  },
} as const

export default function StayCareOnboarding({ locale, email }: { locale: string; email?: string }) {
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [consent, setConsent] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")

    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch("/api/staycare/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          fullNameEn: form.get("fullNameEn"),
          preferredLanguage: language,
          nationalityCode: "LK",
          visaType: form.get("visaType"),
          occupation: form.get("occupation"),
          expectedArrivalDate: form.get("expectedArrivalDate"),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Onboarding failed")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Onboarding failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f5f3] px-4 py-10 text-slate-950 sm:py-16">
      <div className="mx-auto mb-4 flex max-w-3xl justify-end">
        <StayCareLanguageSwitcher value={language} onChange={setLanguage} />
      </div>
      <div className="mx-auto max-w-3xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
        <div className="bg-slate-950 p-7 text-white sm:p-10">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-red-300">Sejoong StayCare</p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">{text.title}</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{text.description}</p>
          {email ? <p className="mt-5 text-xs text-slate-400">Signed in as {email}</p> : null}
        </div>

        <form onSubmit={submit} className="space-y-6 p-6 sm:p-10">
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black">{text.name}</span>
              <input name="fullName" required minLength={2} maxLength={120} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#bb271a]" />
            </label>
            <label className="block">
              <span className="text-sm font-black">{text.englishName}</span>
              <input name="fullNameEn" maxLength={120} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 uppercase outline-none focus:border-[#bb271a]" />
            </label>
            <label className="block">
              <span className="text-sm font-black">{text.language}</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value as StayCarePreferredLanguage)} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5">
                <option value="si">සිංහල</option>
                <option value="ta">தமிழ்</option>
                <option value="en">English</option>
                <option value="ko">한국어</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black">{text.visa}</span>
              <input name="visaType" placeholder="E-9, E-7..." maxLength={30} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#bb271a]" />
            </label>
            <label className="block">
              <span className="text-sm font-black">{text.occupation}</span>
              <input name="occupation" maxLength={120} className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#bb271a]" />
            </label>
            <label className="block">
              <span className="text-sm font-black">{text.arrival}</span>
              <input name="expectedArrivalDate" type="date" className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#bb271a]" />
            </label>
          </div>

          <p className="text-xs text-slate-500">{text.optional}</p>

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
            <span>{text.consent}</span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            {({
              ko: ["비공개 문서함", "역할별 접근", "동의 이력", "감사기록"],
              en: ["Private storage", "Role-based access", "Consent history", "Audit log"],
              si: ["පුද්ගලික ගබඩාව", "භූමිකා ප්‍රවේශය", "අනුමැති ඉතිහාසය", "විගණන සටහන"],
              ta: ["தனிப்பட்ட ஆவண சேமிப்பு", "பங்கு அடிப்படையிலான அணுகல்", "ஒப்புதல் வரலாறு", "தணிக்கை பதிவு"],
            }[language]).map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-900">
                <CheckCircle2 className="h-4 w-4" /> {item}
              </div>
            ))}
          </div>

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}

          <button disabled={!consent || loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
            {text.submit} <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </form>
      </div>
    </main>
  )
}
