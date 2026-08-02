"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BadgeCheck, KeyRound, Loader2, ShieldCheck } from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import { useStayCareLanguage } from "@/lib/staycare/language-preference"

type ClaimLanguage = "ko" | "en" | "si" | "ta"

const copy: Record<ClaimLanguage, {
  title: string
  description: string
  invite: string
  name: string
  dob: string
  language: string
  submit: string
  privacy: string
  success: string
}> = {
  ko: {
    title: "공식 근로자 명부와 계정을 연결합니다",
    description: "송출·교육기관 또는 StayCare 운영자가 발급한 초대코드와 공식 명부 정보를 확인합니다.",
    invite: "초대코드",
    name: "여권 영문명",
    dob: "생년월일",
    language: "선호언어",
    submit: "내 근로자 계정 연결",
    privacy: "초대코드와 명부정보는 본인확인에만 사용되며, 여권번호 전체를 입력하지 않습니다.",
    success: "계정 연결이 완료되었습니다.",
  },
  en: {
    title: "Connect your account to the official worker roster",
    description: "Verify the invitation code and roster details issued by the sending, training or StayCare operations team.",
    invite: "Invitation code",
    name: "Passport English name",
    dob: "Date of birth",
    language: "Preferred language",
    submit: "Connect my worker account",
    privacy: "The invitation and roster details are used only for identity matching. Do not enter your full passport number.",
    success: "Your worker account is connected.",
  },
  si: {
    title: "ඔබගේ ගිණුම නිල සේවක ලැයිස්තුවට සම්බන්ධ කරන්න",
    description: "යැවීමේ, පුහුණු හෝ StayCare මෙහෙයුම් කණ්ඩායම නිකුත් කළ ආරාධනා කේතය සහ ලැයිස්තු තොරතුරු තහවුරු කරන්න.",
    invite: "ආරාධනා කේතය",
    name: "ගමන් බලපත්‍රයේ ඉංග්‍රීසි නම",
    dob: "උපන් දිනය",
    language: "කැමති භාෂාව",
    submit: "මගේ සේවක ගිණුම සම්බන්ධ කරන්න",
    privacy: "තොරතුරු භාවිත වන්නේ අනන්‍යතාව තහවුරු කිරීමට පමණි. සම්පූර්ණ ගමන් බලපත්‍ර අංකය ඇතුළත් නොකරන්න.",
    success: "ඔබගේ සේවක ගිණුම සම්බන්ධ කර ඇත.",
  },
  ta: {
    title: "உங்கள் கணக்கை அதிகாரப்பூர்வ தொழிலாளர் பட்டியலுடன் இணைக்கவும்",
    description: "அனுப்பும் நிறுவனம், பயிற்சி நிறுவனம் அல்லது StayCare செயல்பாட்டு குழு வழங்கிய அழைப்புக் குறியீடு மற்றும் பட்டியல் விவரங்களை உறுதிப்படுத்தவும்.",
    invite: "அழைப்புக் குறியீடு",
    name: "கடவுச்சீட்டில் உள்ள ஆங்கிலப் பெயர்",
    dob: "பிறந்த தேதி",
    language: "விருப்ப மொழி",
    submit: "என் தொழிலாளர் கணக்கை இணைக்கவும்",
    privacy: "இந்த விவரங்கள் அடையாளச் சரிபார்ப்புக்கு மட்டும் பயன்படுத்தப்படும். முழு கடவுச்சீட்டு எண்ணை உள்ளிட வேண்டாம்.",
    success: "உங்கள் தொழிலாளர் கணக்கு இணைக்கப்பட்டது.",
  },
}

export default function StayCareWorkerClaim({ locale }: { locale: string }) {
  const initialLanguage: ClaimLanguage = locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [completed, setCompleted] = useState(false)
  const router = useRouter()
  const text = useMemo(() => copy[language], [language])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch("/api/staycare/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: form.get("inviteCode"),
          fullNameEn: form.get("fullNameEn"),
          dateOfBirth: form.get("dateOfBirth"),
          preferredLanguage: language,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to verify the invitation")
      setCompleted(true)
      window.setTimeout(() => {
        router.replace(`/${locale}/staycare/app?claimed=1`)
        router.refresh()
      }, 700)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to verify the invitation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        initialLanguage={initialLanguage}
        title={{ ko: "근로자 명부 Claim 페이지", en: "Worker roster claim", si: "සේවක ලැයිස්තු Claim පිටුව", ta: "தொழிலாளர் பட்டியல் Claim பக்கம்" }}
        purpose={{ ko: "2,000명 지정 인원 중 실제 공식 명부에 등록된 근로자만 StayCare 계정과 연결하는 본인확인 단계입니다.", en: "An identity-verification step that links only workers on the approved 2,000-person roster to StayCare accounts.", si: "අනුමත 2,000 දෙනාගේ ලැයිස්තුවේ සිටින සේවකයින් පමණක් StayCare ගිණුම් සමඟ සම්බන්ධ කරන අනන්‍යතා තහවුරු කිරීමේ පියවරකි.", ta: "அங்கீகரிக்கப்பட்ட 2,000 பேர் பட்டியலில் உள்ள தொழிலாளர்களை மட்டும் StayCare கணக்குகளுடன் இணைக்கும் அடையாளச் சரிபார்ப்பு கட்டமாகும்." }}
        boundary={{ ko: "이 화면은 채용, 비자승인 또는 근로계약을 결정하지 않습니다. 운영기관이 사전에 등록한 명부와 로그인한 본인을 연결합니다.", en: "This screen does not decide recruitment, visa approval or employment contracts. It links the signed-in person to the roster registered by the operator.", si: "මෙම තිරය බඳවාගැනීම, වීසා අනුමැතිය හෝ රැකියා ගිවිසුම තීරණය නොකරයි. එය පිවිසුණු පුද්ගලයා මෙහෙයුම්කරු ලියාපදිංචි කළ ලැයිස්තුවට සම්බන්ධ කරයි.", ta: "இந்தத் திரை ஆட்சேர்ப்பு, விசா அங்கீகாரம் அல்லது வேலை ஒப்பந்தத்தைத் தீர்மானிக்காது. உள்நுழைந்த நபரை செயல்பாட்டாளர் பதிவு செய்த பட்டியலுடன் இணைக்கிறது." }}
        items={[
          { label: { ko: "입력", en: "Input", si: "ආදානය", ta: "உள்ளீடு" }, description: { ko: "초대코드, 여권 영문명, 생년월일", en: "Invitation code, passport English name and date of birth", si: "ආරාධනා කේතය, ගමන් බලපත්‍ර ඉංග්‍රීසි නම සහ උපන් දිනය", ta: "அழைப்புக் குறியீடு, கடவுச்சீட்டு ஆங்கிலப் பெயர் மற்றும் பிறந்த தேதி" } },
          { label: { ko: "결과", en: "Result", si: "ප්‍රතිඵලය", ta: "முடிவு" }, description: { ko: "기존 근로자 ID와 로그인 계정 연결", en: "Link the existing worker ID and login account", si: "පවතින සේවක ID සහ පිවිසුම් ගිණුම සම්බන්ධ කිරීම", ta: "உள்ள தொழிலாளர் ID மற்றும் உள்நுழைவு கணக்கை இணைத்தல்" } },
          { label: { ko: "보안", en: "Security", si: "ආරක්ෂාව", ta: "பாதுகாப்பு" }, description: { ko: "8회 실패 잠금, 요청 제한, 감사로그", en: "Lock after eight failures, rate limits and audit logs", si: "අසාර්ථක උත්සාහ 8කට පසු අගුළු දැමීම, ඉල්ලීම් සීමා සහ විගණන සටහන්", ta: "8 தோல்விகளுக்குப் பிறகு பூட்டு, கோரிக்கை வரம்புகள் மற்றும் தணிக்கைப் பதிவுகள்" } },
          { label: { ko: "다음 단계", en: "Next step", si: "ඊළඟ පියවර", ta: "அடுத்த படி" }, description: { ko: "개인별 준비·입국·정착 여정 생성", en: "Create the individual preparation, arrival and settlement journey", si: "පුද්ගලික සූදානම්, පැමිණීම සහ පදිංචි ගමන සාදන්න", ta: "தனிப்பட்ட தயாரிப்பு, வருகை மற்றும் குடியேற்றப் பயணத்தை உருவாக்கவும்" } },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-16">
        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div className="bg-slate-950 p-7 text-white sm:p-10">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#bb271a]">
                <KeyRound className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">Sri Lanka → Korea</p>
                <h1 className="mt-1 text-2xl font-black sm:text-3xl">{text.title}</h1>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-300">{text.description}</p>
          </div>

          {completed ? (
            <div className="p-10 text-center">
              <BadgeCheck className="mx-auto h-16 w-16 text-emerald-600" />
              <p className="mt-4 text-xl font-black">{text.success}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5 p-6 sm:p-10">
              <label className="block">
                <span className="text-sm font-black">{text.language}</span>
                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value as ClaimLanguage)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5"
                >
                  <option value="si">සිංහල</option>
                  <option value="ta">தமிழ்</option>
                  <option value="en">English</option>
                  <option value="ko">한국어</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black">{text.invite}</span>
                <input
                  name="inviteCode"
                  required
                  autoCapitalize="characters"
                  autoComplete="one-time-code"
                  placeholder="ABCD-EFGH-JKLM"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 font-mono uppercase tracking-widest outline-none focus:border-[#bb271a]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black">{text.name}</span>
                <input
                  name="fullNameEn"
                  required
                  autoCapitalize="characters"
                  placeholder="NIMAL PERERA"
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 uppercase outline-none focus:border-[#bb271a]"
                />
              </label>
              <label className="block">
                <span className="text-sm font-black">{text.dob}</span>
                <input
                  name="dateOfBirth"
                  type="date"
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-[#bb271a]"
                />
              </label>

              <p className="flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
                <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                {text.privacy}
              </p>

              {error ? (
                <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:opacity-50"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <BadgeCheck className="mr-2 h-5 w-5" />}
                {text.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
