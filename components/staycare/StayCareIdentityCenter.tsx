"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, PhoneCall, ShieldCheck } from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import { useStayCareLanguage, type StayCarePreferredLanguage } from "@/lib/staycare/language-preference"
import { createClient } from "@/lib/supabase/client"


const copy: Record<StayCarePreferredLanguage, {
  noteTitle: string
  notePurpose: string
  noteBoundary: string
  noteItems: Array<{ label: string; description: string }>
  back: string
  heading: string
  currentPhone: string
  recoveryEmail: string
  notRegistered: string
  purpose: string
  koreaPhone: string
  sriLankaPhone: string
  newPhone: string
  send: string
  codeHint: (phone: string) => string
  verify: string
  change: string
  success: (phone: string) => string
  invalidPrefix: (prefix: string) => string
  sendError: string
  verifyError: string
  syncError: string
}> = {
  ko: {
    noteTitle: "연락수단·계정 승계 센터",
    notePurpose: "스리랑카 +94 번호로 시작한 계정을 한국 입국 후 +82 번호로 이어 사용하고, 연락수단 변경 이력을 근로자 ID에 연결합니다.",
    noteBoundary: "전화번호는 영구 회원번호가 아닙니다. StayCare 회원번호는 유지되고 검증된 전화번호만 교체 가능한 로그인·연락수단으로 기록됩니다.",
    noteItems: [
      { label: "출국 전", description: "+94 번호를 사전 연락수단으로 유지" },
      { label: "입국 후", description: "+82 번호 OTP 검증 후 주 연락수단 전환" },
      { label: "중복 방지", description: "동일 번호와 근로자 ID 연결 이력 관리" },
      { label: "복구", description: "이메일과 기존 검증수단을 함께 유지" },
    ],
    back: "근로자 앱으로 돌아가기",
    heading: "검증된 연락수단 승계",
    currentPhone: "현재 전화번호",
    recoveryEmail: "복구 이메일",
    notRegistered: "등록되지 않음",
    purpose: "연락수단 용도",
    koreaPhone: "한국 사용 전화번호 (+82)",
    sriLankaPhone: "스리랑카 출국 전 전화번호 (+94)",
    newPhone: "새 검증 전화번호",
    send: "인증코드 보내기",
    codeHint: (phone) => `${phone}로 전송된 6자리 코드를 입력하세요.`,
    verify: "인증하고 연락수단 저장",
    change: "번호 다시 입력",
    success: (phone) => `검증된 연락수단이 저장되었습니다: ${phone}`,
    invalidPrefix: (prefix) => `${prefix}로 시작하는 국제전화 형식을 입력하세요.`,
    sendError: "전화 인증코드를 보낼 수 없습니다.",
    verifyError: "전화번호를 인증할 수 없습니다.",
    syncError: "검증된 전화번호를 동기화할 수 없습니다.",
  },
  en: {
    noteTitle: "Contact and account continuity",
    notePurpose: "Continue an account created with a Sri Lankan +94 number by adding a verified Korean +82 number after arrival and linking every change to the permanent worker ID.",
    noteBoundary: "A phone number is not the permanent member number. The StayCare member ID remains unchanged while verified phones can be replaced as login and contact methods.",
    noteItems: [
      { label: "Before departure", description: "Keep the +94 number as the pre-departure contact" },
      { label: "After arrival", description: "Verify +82 by OTP and make it the active contact" },
      { label: "Duplicate control", description: "Retain phone-to-worker linking history" },
      { label: "Recovery", description: "Keep email and another verified method" },
    ],
    back: "Back to worker app",
    heading: "Verified contact continuity",
    currentPhone: "Current phone",
    recoveryEmail: "Recovery email",
    notRegistered: "Not registered",
    purpose: "Contact purpose",
    koreaPhone: "Korea active phone (+82)",
    sriLankaPhone: "Sri Lanka pre-departure phone (+94)",
    newPhone: "New verified phone",
    send: "Send verification code",
    codeHint: (phone) => `Enter the six-digit code sent to ${phone}.`,
    verify: "Verify and save contact",
    change: "Change number",
    success: (phone) => `Verified contact saved: ${phone}`,
    invalidPrefix: (prefix) => `Use an international number beginning with ${prefix}.`,
    sendError: "Unable to send phone verification.",
    verifyError: "Unable to verify the phone.",
    syncError: "Unable to synchronize the verified phone.",
  },
  si: {
    noteTitle: "සම්බන්ධතා සහ ගිණුම් අඛණ්ඩතාව",
    notePurpose: "ශ්‍රී ලංකා +94 අංකයෙන් ආරම්භ කළ ගිණුම කොරියාවට පැමිණීමෙන් පසු තහවුරු කළ +82 අංකයකින් දිගටම භාවිත කර වෙනස්කම් සේවක ID එකට සම්බන්ධ කරයි.",
    noteBoundary: "දුරකථන අංකය ස්ථිර සාමාජික අංකය නොවේ. StayCare සාමාජික ID එක නොවෙනස්ව පවතින අතර තහවුරු කළ අංක ප්‍රවේශ සහ සම්බන්ධතා ක්‍රම ලෙස මාරු කළ හැක.",
    noteItems: [
      { label: "පිටත්වීමට පෙර", description: "+94 අංකය පෙර සම්බන්ධතාව ලෙස තබන්න" },
      { label: "පැමිණීමෙන් පසු", description: "+82 OTP තහවුරු කර ප්‍රධාන සම්බන්ධතාව කරන්න" },
      { label: "අනුපිටපත් වැළැක්වීම", description: "අංකය සහ සේවක ID සම්බන්ධ ඉතිහාසය තබන්න" },
      { label: "නැවත ලබාගැනීම", description: "Email සහ තවත් තහවුරු කළ ක්‍රමයක් තබන්න" },
    ],
    back: "සේවක යෙදුමට ආපසු",
    heading: "තහවුරු කළ සම්බන්ධතා අඛණ්ඩතාව",
    currentPhone: "වත්මන් දුරකථනය",
    recoveryEmail: "නැවත ලබාගැනීමේ email",
    notRegistered: "ලියාපදිංචි කර නැත",
    purpose: "සම්බන්ධතා අරමුණ",
    koreaPhone: "කොරියානු ක්‍රියාකාරී අංකය (+82)",
    sriLankaPhone: "ශ්‍රී ලංකා පිටත්වීමට පෙර අංකය (+94)",
    newPhone: "නව තහවුරු කළ අංකය",
    send: "තහවුරු කිරීමේ කේතය යවන්න",
    codeHint: (phone) => `${phone} වෙත යැවූ අංක 6ක කේතය ඇතුළත් කරන්න.`,
    verify: "තහවුරු කර සම්බන්ධතාව සුරකින්න",
    change: "අංකය වෙනස් කරන්න",
    success: (phone) => `තහවුරු කළ සම්බන්ධතාව සුරකින ලදී: ${phone}`,
    invalidPrefix: (prefix) => `${prefix} සමඟ ආරම්භ වන ජාත්‍යන්තර අංකයක් භාවිත කරන්න.`,
    sendError: "දුරකථන තහවුරු කිරීම යැවිය නොහැක.",
    verifyError: "දුරකථනය තහවුරු කළ නොහැක.",
    syncError: "තහවුරු කළ දුරකථනය සමමුහුර්ත කළ නොහැක.",
  },
  ta: {
    noteTitle: "தொடர்பு மற்றும் கணக்கு தொடர்ச்சி மையம்",
    notePurpose: "இலங்கை +94 எண்ணில் தொடங்கிய கணக்கை கொரியாவுக்கு வந்த பிறகு சரிபார்க்கப்பட்ட +82 எண்ணுடன் தொடரவும், ஒவ்வொரு தொடர்பு மாற்றத்தையும் நிரந்தர தொழிலாளர் ID-க்கு இணைக்கவும்.",
    noteBoundary: "தொலைபேசி எண் நிரந்தர உறுப்பினர் எண் அல்ல. StayCare உறுப்பினர் ID மாறாது; சரிபார்க்கப்பட்ட எண்கள் உள்நுழைவு மற்றும் தொடர்பு முறைகளாக மாற்றப்படலாம்.",
    noteItems: [
      { label: "புறப்படுவதற்கு முன்", description: "+94 எண்ணை முன் தொடர்பாக வைத்திருக்கவும்" },
      { label: "வருகைக்குப் பிறகு", description: "+82 எண்ணை OTP மூலம் சரிபார்த்து முதன்மை தொடர்பாக மாற்றவும்" },
      { label: "நகல் தடுப்பு", description: "எண் மற்றும் தொழிலாளர் ID இணைப்பு வரலாற்றை பராமரிக்கவும்" },
      { label: "மீட்பு", description: "மின்னஞ்சலும் மற்றொரு சரிபார்க்கப்பட்ட முறையும் வைத்திருக்கவும்" },
    ],
    back: "தொழிலாளர் செயலிக்குத் திரும்பவும்",
    heading: "சரிபார்க்கப்பட்ட தொடர்பு தொடர்ச்சி",
    currentPhone: "தற்போதைய தொலைபேசி",
    recoveryEmail: "மீட்பு மின்னஞ்சல்",
    notRegistered: "பதிவு செய்யப்படவில்லை",
    purpose: "தொடர்பு பயன்பாடு",
    koreaPhone: "கொரியாவில் செயலில் உள்ள எண் (+82)",
    sriLankaPhone: "இலங்கையில் புறப்படும் முன் எண் (+94)",
    newPhone: "புதிய சரிபார்க்கப்பட்ட எண்",
    send: "சரிபார்ப்பு குறியீட்டை அனுப்பவும்",
    codeHint: (phone) => `${phone} எண்ணுக்கு அனுப்பப்பட்ட ஆறு இலக்க குறியீட்டை உள்ளிடவும்.`,
    verify: "சரிபார்த்து தொடர்பைச் சேமிக்கவும்",
    change: "எண்ணை மாற்றவும்",
    success: (phone) => `சரிபார்க்கப்பட்ட தொடர்பு சேமிக்கப்பட்டது: ${phone}`,
    invalidPrefix: (prefix) => `${prefix} எனத் தொடங்கும் சர்வதேச எண்ணைப் பயன்படுத்தவும்.`,
    sendError: "தொலைபேசி சரிபார்ப்பை அனுப்ப முடியவில்லை.",
    verifyError: "தொலைபேசியைச் சரிபார்க்க முடியவில்லை.",
    syncError: "சரிபார்க்கப்பட்ட தொலைபேசியை ஒத்திசைக்க முடியவில்லை.",
  },
}

export default function StayCareIdentityCenter({
  locale,
  memberNo,
  currentPhone,
  currentEmail,
}: {
  locale: string
  memberNo: string
  currentPhone?: string | null
  currentEmail?: string | null
}) {
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [purpose, setPurpose] = useState<"korea_active" | "sri_lanka_predeparture">("korea_active")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function requestChange(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const normalized = phone.replace(/[\s()-]/g, "")
      const prefix = purpose === "korea_active" ? "+82" : "+94"
      if (!normalized.startsWith(prefix)) throw new Error(text.invalidPrefix(prefix))
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ phone: normalized })
      if (updateError) throw updateError
      setPhone(normalized)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.sendError)
    } finally {
      setLoading(false)
    }
  }

  async function verifyChange(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "phone_change",
      })
      if (verifyError) throw verifyError
      const response = await fetch("/api/staycare/identity/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || text.syncError)
      setSuccess(text.success(data.phone))
      setSent(false)
      setOtp("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : text.verifyError)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        title={text.noteTitle}
        purpose={text.notePurpose}
        boundary={text.noteBoundary}
        items={text.noteItems}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-4 flex justify-end"><StayCareLanguageSwitcher value={language} onChange={setLanguage} /></div>
        <Link href={`/${locale}/staycare/app`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
          <ArrowLeft className="h-4 w-4" /> {text.back}
        </Link>
        <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              <PhoneCall className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{memberNo}</p>
              <h1 className="text-2xl font-black">{text.heading}</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">{text.currentPhone}</p>
              <p className="mt-1 font-bold">{currentPhone || text.notRegistered}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">{text.recoveryEmail}</p>
              <p className="mt-1 break-all font-bold">{currentEmail || text.notRegistered}</p>
            </div>
          </div>

          {!sent ? (
            <form onSubmit={requestChange} className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-black">{text.purpose}</span>
                <select
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value as typeof purpose)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5"
                >
                  <option value="korea_active">{text.koreaPhone}</option>
                  <option value="sri_lanka_predeparture">{text.sriLankaPhone}</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black">{text.newPhone}</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  inputMode="tel"
                  placeholder={purpose === "korea_active" ? "+82 10 1234 5678" : "+94 77 123 4567"}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-600"
                />
              </label>
              <button disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-4 font-black text-white disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                {text.send}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyChange} className="mt-7 space-y-5">
              <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                {text.codeHint(phone)}
              </p>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-center font-mono text-2xl tracking-[0.35em]"
              />
              <button disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                {text.verify}
              </button>
              <button type="button" onClick={() => setSent(false)} className="w-full py-2 text-sm font-black text-slate-500">
                {text.change}
              </button>
            </form>
          )}

          {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
          {success ? <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</p> : null}
        </section>
      </div>
    </main>
  )
}
