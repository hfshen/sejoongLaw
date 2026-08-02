"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  BookOpenCheck,
  Bot,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileLock2,
  FileText,
  Globe2,
  HeartPulse,
  HelpCircle,
  Home,
  Languages,
  Landmark,
  LayoutDashboard,
  ListChecks,
  Loader2,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  PackageCheck,
  Plane,
  ReceiptText,
  RefreshCw,
  Scale,
  Search,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Speaker,
  UploadCloud,
  UserRound,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react"
import {
  emergencyContacts,
  getPhaseSteps,
  journeyPhases,
  journeySteps,
  languageLabels,
  oneStopServices,
  responsibilityLabels,
  statusLabels,
  t,
  type JourneyPhaseId,
  type OneStopService,
  type StayCareLanguage,
  type StepStatus,
} from "@/lib/staycare/lifecycle-model"
import { integrationDescriptors } from "@/lib/staycare/integrations"

type WorkerView = "home" | "journey" | "services" | "documents" | "money" | "ai" | "help" | "return"
type ContextType = "general" | "airport" | "workplace" | "hospital" | "bank" | "immigration" | "housing" | "remittance"

const ui = {
  ko: {
    appName: "세중 한국생활 원스톱",
    appSubtitle: "스리랑카 → 대한민국",
    home: "홈",
    journey: "내 준비과정",
    services: "원스톱 서비스",
    documents: "내 서류",
    money: "급여·송금",
    ai: "AI 통역",
    help: "도움·긴급",
    return: "귀국 준비",
    welcome: "안녕하세요, 니말님",
    status: "현재 단계",
    currentPhase: "비자 발급 후 출국 준비",
    nextActions: "지금 해야 할 일",
    allJourney: "전체 여정",
    governmentBoundary: "정부가 처리하는 공식 절차",
    sejoongBoundary: "세중이 통합하는 생활·행정 서비스",
    open: "열기",
    start: "신청하기",
    continue: "계속하기",
    complete: "완료 처리",
    details: "상세보기",
    search: "서비스 검색",
    noPrice: "제휴사업자 연결 전 실제 요금·환율은 표시하지 않습니다.",
    privacy: "여권번호·외국인등록번호·카드번호는 AI에 입력하지 마세요.",
    submit: "접수하기",
    cancel: "닫기",
    saved: "신청서가 임시 접수되었습니다. 실제 개통·송금·행정신청은 공식기관 또는 인가사업자 연동 후 진행됩니다.",
    official: "공식 절차",
    oneStop: "세중 원스톱",
    partner: "인가·제휴 사업자",
    required: "필수",
    optional: "선택",
    progress: "전체 준비도",
    documentWallet: "디지털 서류함",
    documentNotice: "실서비스에서는 비공개 Storage, 짧은 만료 URL, 마스킹과 조회 감사기록을 적용합니다.",
    translate: "번역",
    guide: "생활 가이드",
    aiPlaceholder: "예: 공항에서 SIM을 어디서 받아야 하나요?",
    aiRun: "AI 실행",
    listen: "음성 입력",
    speak: "결과 읽기",
    emergencyNotice: "생명·신체 위험은 앱 상담보다 112·119에 먼저 연락하세요.",
    returnTitle: "한국을 떠나기 전 놓치지 말아야 할 일",
  },
  en: {
    appName: "Sejoong Korea Life One-stop",
    appSubtitle: "Sri Lanka → Korea",
    home: "Home",
    journey: "My journey",
    services: "One-stop services",
    documents: "Documents",
    money: "Pay & remittance",
    ai: "AI interpreter",
    help: "Help & emergency",
    return: "Return home",
    welcome: "Hello, Nimal",
    status: "Current stage",
    currentPhase: "After visa, before departure",
    nextActions: "What to do now",
    allJourney: "Full journey",
    governmentBoundary: "Official steps handled by authorities",
    sejoongBoundary: "Life and administration integrated by Sejoong",
    open: "Open",
    start: "Apply",
    continue: "Continue",
    complete: "Mark complete",
    details: "Details",
    search: "Search services",
    noPrice: "Live price and exchange rate appear only after a licensed provider is connected.",
    privacy: "Do not enter passport, registration or card numbers into AI.",
    submit: "Submit",
    cancel: "Close",
    saved: "The request was saved as a draft. Actual activation, remittance or filing requires an official or licensed-provider connection.",
    official: "Official process",
    oneStop: "Sejoong one-stop",
    partner: "Licensed provider",
    required: "Required",
    optional: "Optional",
    progress: "Overall readiness",
    documentWallet: "Digital document wallet",
    documentNotice: "Production uses private Storage, expiring URLs, masking and access audit logs.",
    translate: "Translate",
    guide: "Life guide",
    aiPlaceholder: "Example: Where do I collect my SIM at the airport?",
    aiRun: "Run AI",
    listen: "Voice input",
    speak: "Read result",
    emergencyNotice: "For immediate danger, call 112 or 119 before using app support.",
    returnTitle: "Do not miss these tasks before leaving Korea",
  },
  si: {
    appName: "Sejoong කොරියා ජීවිත එක්-තැනක සේවාව",
    appSubtitle: "ශ්‍රී ලංකාව → කොරියාව",
    home: "මුල් පිටුව",
    journey: "මගේ ගමන",
    services: "එක්-තැනක සේවා",
    documents: "ලේඛන",
    money: "වැටුප් හා මුදල් යැවීම",
    ai: "AI පරිවර්තකය",
    help: "උදව් හා හදිසි",
    return: "ආපසු යාම",
    welcome: "ආයුබෝවන්, Nimal",
    status: "වත්මන් අදියර",
    currentPhase: "වීසා ලැබුණු පසු පිටත්වීමට පෙර",
    nextActions: "දැන් කළ යුතු දේ",
    allJourney: "සම්පූර්ණ ගමන",
    governmentBoundary: "රාජ්‍ය ආයතන විසින් කරන නිල පියවර",
    sejoongBoundary: "Sejoong එකතු කරන ජීවිත හා පරිපාලන සේවා",
    open: "විවෘත කරන්න",
    start: "අයදුම් කරන්න",
    continue: "ඉදිරියට",
    complete: "සම්පූර්ණයි ලෙස සලකන්න",
    details: "විස්තර",
    search: "සේවා සොයන්න",
    noPrice: "බලපත්‍රලාභී සේවාවක් සම්බන්ධ වූ පසු පමණක් සජීවී මිල හා විනිමය අනුපාත පෙන්වයි.",
    privacy: "ගමන් බලපත්‍ර, ලියාපදිංචි හෝ කාඩ් අංක AI වෙත ඇතුළත් නොකරන්න.",
    submit: "යොමු කරන්න",
    cancel: "වසන්න",
    saved: "ඉල්ලීම කෙටුම්පතක් ලෙස සුරකින ලදී. සැබෑ සක්‍රිය කිරීම, මුදල් යැවීම හෝ අයදුම් කිරීම සඳහා නිල හෝ බලපත්‍රලාභී සේවාවක් අවශ්‍යය.",
    official: "නිල ක්‍රියාවලිය",
    oneStop: "Sejoong එක්-තැනක සේවාව",
    partner: "බලපත්‍රලාභී සේවාව",
    required: "අනිවාර්ය",
    optional: "විකල්ප",
    progress: "සමස්ත සූදානම",
    documentWallet: "ඩිජිටල් ලේඛන ගබඩාව",
    documentNotice: "සැබෑ සේවාවේ private Storage, කල් ඉකුත්වන URL, masking සහ ප්‍රවේශ audit logs භාවිත කරයි.",
    translate: "පරිවර්තනය",
    guide: "ජීවිත මාර්ගෝපදේශය",
    aiPlaceholder: "උදා: ගුවන් තොටුපළේ SIM එක ගන්නේ කොහෙන්ද?",
    aiRun: "AI ක්‍රියාත්මක කරන්න",
    listen: "හඬ ඇතුළත් කරන්න",
    speak: "ප්‍රතිඵලය කියවන්න",
    emergencyNotice: "හදිසි අනතුරක් නම් යෙදුමට පෙර 112 හෝ 119 අමතන්න.",
    returnTitle: "කොරියාවෙන් යාමට පෙර අමතක නොකළ යුතු දේ",
  },
  ta: {
    appName: "Sejoong கொரியா வாழ்க்கை ஒரே இட சேவை",
    appSubtitle: "இலங்கை → கொரியா",
    home: "முகப்பு",
    journey: "என் பயணம்",
    services: "ஒரே இட சேவைகள்",
    documents: "ஆவணங்கள்",
    money: "சம்பளம் மற்றும் பணஅனுப்பு",
    ai: "AI மொழிபெயர்ப்பாளர்",
    help: "உதவி மற்றும் அவசரம்",
    return: "தாயகம் திரும்புதல்",
    welcome: "வணக்கம், Nimal",
    status: "தற்போதைய கட்டம்",
    currentPhase: "விசா கிடைத்த பின், புறப்படுவதற்கு முன்",
    nextActions: "இப்போது செய்ய வேண்டியது",
    allJourney: "முழுப் பயணம்",
    governmentBoundary: "அதிகாரிகள் கையாளும் அதிகாரப்பூர்வ நடைமுறைகள்",
    sejoongBoundary: "Sejoong ஒருங்கிணைக்கும் வாழ்க்கை மற்றும் நிர்வாக சேவைகள்",
    open: "திறக்கவும்",
    start: "விண்ணப்பிக்கவும்",
    continue: "தொடரவும்",
    complete: "முடிந்ததாக குறிக்கவும்",
    details: "விவரங்கள்",
    search: "சேவைகளைத் தேடவும்",
    noPrice: "உரிமம் பெற்ற வழங்குநர் இணைந்த பிறகே நேரடி விலை மற்றும் மாற்று விகிதம் காட்டப்படும்.",
    privacy: "கடவுச்சீட்டு, பதிவெண் அல்லது அட்டை எண்களை AI-இல் உள்ளிட வேண்டாம்.",
    submit: "சமர்ப்பிக்கவும்",
    cancel: "மூடவும்",
    saved: "கோரிக்கை வரைவாக சேமிக்கப்பட்டது. உண்மையான செயல்படுத்தல், பணஅனுப்பு அல்லது தாக்கல் அதிகாரப்பூர்வ நிறுவனம் அல்லது உரிமம் பெற்ற வழங்குநர் இணைப்புக்குப் பிறகே நடைபெறும்.",
    official: "அதிகாரப்பூர்வ நடைமுறை",
    oneStop: "Sejoong ஒரே இட சேவை",
    partner: "உரிமம் பெற்ற வழங்குநர்",
    required: "கட்டாயம்",
    optional: "விருப்பம்",
    progress: "மொத்தத் தயார்நிலை",
    documentWallet: "டிஜிட்டல் ஆவணப் பெட்டி",
    documentNotice: "உற்பத்தி சேவையில் தனிப்பட்ட Storage, காலாவதியாகும் URL, மறைப்பு மற்றும் அணுகல் தணிக்கை பதிவுகள் பயன்படுத்தப்படும்.",
    translate: "மொழிபெயர்ப்பு",
    guide: "வாழ்க்கை வழிகாட்டி",
    aiPlaceholder: "உதாரணம்: விமான நிலையத்தில் SIM எங்கே பெறுவது?",
    aiRun: "AI இயக்கவும்",
    listen: "குரல் உள்ளீடு",
    speak: "முடிவை வாசிக்கவும்",
    emergencyNotice: "உடனடி ஆபத்தில் பயன்பாட்டு உதவிக்கு முன் 112 அல்லது 119 அழைக்கவும்.",
    returnTitle: "கொரியாவை விட்டு புறப்படும் முன் தவறவிடக்கூடாத பணிகள்",
  },
} as const

const navItems: Array<{ id: WorkerView; icon: typeof Home; label: keyof typeof ui.ko }> = [
  { id: "home", icon: Home, label: "home" },
  { id: "journey", icon: ListChecks, label: "journey" },
  { id: "services", icon: Sparkles, label: "services" },
  { id: "documents", icon: FileLock2, label: "documents" },
  { id: "money", icon: CircleDollarSign, label: "money" },
  { id: "ai", icon: Languages, label: "ai" },
  { id: "help", icon: HelpCircle, label: "help" },
  { id: "return", icon: Plane, label: "return" },
]

const serviceIcons = {
  identity: FileLock2,
  telecom: Smartphone,
  finance: Landmark,
  remittance: Banknote,
  immigration: Scale,
  insurance: ShieldCheck,
  housing: Building2,
  health: HeartPulse,
  work: BriefcaseBusiness,
  mobility: MapPin,
  translation: Languages,
  return: Plane,
} as const

const initialStatuses: Record<string, StepStatus> = Object.fromEntries(
  journeySteps.map((step) => {
    if (step.phaseId === "prepare" || step.phaseId === "official") return [step.id, "completed"]
    if (step.phaseId === "preDeparture") return [step.id, step.id === "digital-profile" ? "completed" : "in_progress"]
    if (step.phaseId === "arrival") return [step.id, "ready"]
    return [step.id, "not_started"]
  })
)

const sampleDocuments = [
  { id: "passport", title: { ko: "여권", en: "Passport", si: "ගමන් බලපත්‍රය", ta: "கடவுச்சீட்டு" }, status: "approved", expiry: "2031-02-18", mask: "N•••••482" },
  { id: "visa", title: { ko: "대한민국 비자", en: "Korean visa", si: "කොරියානු වීසා", ta: "கொரியா விசா" }, status: "approved", expiry: "2028-07-26", mask: "E-7" },
  { id: "contract", title: { ko: "근로계약서", en: "Employment contract", si: "සේවා ගිවිසුම", ta: "வேலை ஒப்பந்தம்" }, status: "review", expiry: "2028-07-26", mask: "PDF" },
  { id: "medical", title: { ko: "건강검진", en: "Medical examination", si: "වෛද්‍ය පරීක්ෂණය", ta: "மருத்துவ பரிசோதனை" }, status: "approved", expiry: "2026-10-10", mask: "PDF" },
]

interface SpeechRecognitionResultEventLike {
  results: ArrayLike<{ 0: { transcript: string } }>
}

interface SpeechRecognitionLike {
  lang: string
  interimResults: boolean
  continuous: boolean
  onresult: ((event: SpeechRecognitionResultEventLike) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  start: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function languageSpeechCode(language: StayCareLanguage) {
  if (language === "ko") return "ko-KR"
  if (language === "si") return "si-LK"
  if (language === "ta") return "ta-LK"
  return "en-US"
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-[#bb271a] transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>
}

function Panel({ title, description, action, children, className = "" }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ServiceApplicationDrawer({
  service,
  language,
  onClose,
}: {
  service: OneStopService
  language: StayCareLanguage
  onClose: () => void
}) {
  const copy = ui[language]
  const [submitted, setSubmitted] = useState(false)
  const [delivery, setDelivery] = useState("digital")
  const [consent, setConsent] = useState(false)
  const [amount, setAmount] = useState("500000")

  const submit = () => {
    if (!consent) return
    setSubmitted(true)
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-slate-950/45 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#bb271a]">One-stop application</p>
            <h2 className="mt-1 text-xl font-black">{t(service.title, language)}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500"><X className="h-5 w-5" /></button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-sm leading-7 text-slate-300">{t(service.description, language)}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {service.ownership.map((owner) => (
                <Pill key={owner} className="border-white/15 bg-white/10 text-white">{t(responsibilityLabels[owner], language)}</Pill>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-black">{language === "ko" ? "필요한 정보" : language === "si" ? "අවශ්‍ය තොරතුරු" : "Required information"}</h3>
            <div className="mt-4 space-y-3">
              {service.requiredData.map((item) => (
                <div key={t(item, language)} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  <FileCheck2 className="h-5 w-5 text-emerald-600" /> {t(item, language)}
                </div>
              ))}
            </div>
          </div>

          {service.category === "telecom" ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="font-black">{language === "ko" ? "수령·활성화 방법" : language === "si" ? "ලබාගැනීම / සක්‍රිය කිරීම" : "Pickup / activation"}</h3>
              {["digital", "airport", "accommodation"].map((mode) => (
                <label key={mode} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${delivery === mode ? "border-[#bb271a] bg-red-50" : "border-slate-200"}`}>
                  <input type="radio" name="delivery" value={mode} checked={delivery === mode} onChange={() => setDelivery(mode)} />
                  <span className="text-sm font-bold">
                    {mode === "digital"
                      ? language === "ko" ? "eSIM QR 온라인 발급" : language === "si" ? "මාර්ගගත eSIM QR" : "Online eSIM QR"
                      : mode === "airport"
                        ? language === "ko" ? "한국 공항 카운터 수령" : language === "si" ? "කොරියානු ගුවන් තොටුපළ ලබාගැනීම" : "Korean airport counter pickup"
                        : language === "ko" ? "숙소 일괄 배송" : language === "si" ? "නවාතැන් බෙදාහැරීම" : "Accommodation delivery"}
                  </span>
                </label>
              ))}
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={language === "ko" ? "휴대폰 모델" : language === "si" ? "දුරකථන මාදිලිය" : "Phone model"} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={language === "ko" ? "입국일·공항" : language === "si" ? "පැමිණීමේ දිනය / ගුවන් තොටුපළ" : "Arrival date / airport"} />
            </div>
          ) : null}

          {service.category === "remittance" ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="font-black">{language === "ko" ? "송금 준비" : language === "si" ? "මුදල් යැවීමේ සූදානම" : "Remittance preparation"}</h3>
              <label className="block text-sm font-bold">
                KRW
                <input value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^0-9]/g, ""))} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" inputMode="numeric" />
              </label>
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={language === "ko" ? "스리랑카 수취인 이름" : language === "si" ? "ශ්‍රී ලංකා ලාභියාගේ නම" : "Sri Lanka beneficiary name"} />
              <input className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={language === "ko" ? "수취 은행·계좌" : language === "si" ? "ලැබෙන බැංකුව / ගිණුම" : "Receiving bank / account"} />
              <div className="rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">{copy.noPrice}</div>
            </div>
          ) : null}

          {service.category === "immigration" ? (
            <div className="space-y-4 rounded-2xl border border-slate-200 p-5">
              <h3 className="font-black">{language === "ko" ? "행정업무 선택" : language === "si" ? "පරිපාලන කාර්යය තෝරන්න" : "Select administration task"}</h3>
              <select className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm">
                <option>{language === "ko" ? "외국인등록" : language === "si" ? "විදේශික ලියාපදිංචිය" : "Foreigner registration"}</option>
                <option>{language === "ko" ? "체류기간 연장" : language === "si" ? "රැඳී සිටීම දිගු කිරීම" : "Stay extension"}</option>
                <option>{language === "ko" ? "체류지 변경" : language === "si" ? "ලිපින වෙනස" : "Address change"}</option>
                <option>{language === "ko" ? "사업장 변경 검토" : language === "si" ? "සේවා ස්ථාන වෙනස" : "Workplace change review"}</option>
                <option>{language === "ko" ? "귀국·출국 준비" : language === "si" ? "ආපසු යාම / පිටත්වීම" : "Return / departure"}</option>
              </select>
              <textarea className="min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder={language === "ko" ? "현재 상황과 마감일" : language === "si" ? "වත්මන් තත්ත්වය හා අවසන් දිනය" : "Current situation and deadline"} />
            </div>
          ) : null}

          {service.legalBoundary ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-900">
              <ShieldCheck className="mb-2 h-5 w-5" /> {t(service.legalBoundary, language)}
            </div>
          ) : null}

          <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 text-sm leading-6 text-slate-700">
            <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
            <span>{language === "ko" ? "저장된 개인자료를 이 신청에 필요한 범위에서 세중과 지정 사업자에게 전달하는 데 동의합니다." : language === "si" ? "මෙම අයදුමට අවශ්‍ය සීමාව තුළ සුරකින දත්ත Sejoong හා තෝරාගත් සේවාවට ලබාදීමට එකඟ වෙමි." : "I consent to sharing stored data with Sejoong and the selected provider only as required for this application."}</span>
          </label>

          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm leading-7 text-emerald-900">
              <CheckCircle2 className="mb-2 h-6 w-6" /> {copy.saved}
            </div>
          ) : (
            <button disabled={!consent} onClick={submit} className="w-full rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-40">
              {copy.submit}
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

export default function StayCareWorkerApp({ initialLocale = "ko" }: { initialLocale?: string }) {
  const initialLanguage: StayCareLanguage = initialLocale === "en" ? "en" : "ko"
  const [language, setLanguage] = useState<StayCareLanguage>(initialLanguage)
  const [view, setView] = useState<WorkerView>("home")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [selectedPhase, setSelectedPhase] = useState<JourneyPhaseId>("preDeparture")
  const [statuses, setStatuses] = useState<Record<string, StepStatus>>(initialStatuses)
  const [selectedService, setSelectedService] = useState<OneStopService | null>(null)
  const [serviceQuery, setServiceQuery] = useState("")
  const [aiMode, setAiMode] = useState<"translate" | "guide">("translate")
  const [aiSource, setAiSource] = useState<StayCareLanguage>("si")
  const [aiTarget, setAiTarget] = useState<StayCareLanguage>("ko")
  const [aiContext, setAiContext] = useState<ContextType>("general")
  const [aiText, setAiText] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [aiError, setAiError] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [speechListening, setSpeechListening] = useState(false)

  const copy = ui[language]
  const completedCount = Object.values(statuses).filter((status) => status === "completed").length
  const overallProgress = Math.round((completedCount / journeySteps.length) * 100)

  const filteredServices = useMemo(() => {
    const query = serviceQuery.trim().toLowerCase()
    if (!query) return oneStopServices
    return oneStopServices.filter((service) => [t(service.title, language), t(service.description, language), service.category].some((value) => value.toLowerCase().includes(query)))
  }, [language, serviceQuery])

  const nextSteps = useMemo(() => journeySteps.filter((step) => step.phaseId === "preDeparture" && statuses[step.id] !== "completed").slice(0, 4), [statuses])

  const setStepCompleted = (stepId: string) => {
    setStatuses((current) => ({ ...current, [stepId]: "completed" }))
  }

  const runAi = async () => {
    if (!aiText.trim()) return
    setAiLoading(true)
    setAiError("")
    setAiResult("")
    try {
      const response = await fetch("/api/staycare/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiText,
          sourceLanguage: aiSource,
          targetLanguage: aiTarget,
          mode: aiMode,
          context: aiContext,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "AI request failed")
      setAiResult(data.result || "")
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "AI request failed")
    } finally {
      setAiLoading(false)
    }
  }

  const startSpeech = () => {
    if (typeof window === "undefined") return
    const extendedWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
    const Constructor = extendedWindow.SpeechRecognition || extendedWindow.webkitSpeechRecognition
    if (!Constructor) {
      setAiError(language === "ko" ? "이 브라우저는 음성입력을 지원하지 않습니다. 텍스트를 입력해 주세요." : language === "si" ? "මෙම බ්‍රවුසරය හඬ ඇතුළත් කිරීම සඳහා සහාය නොදක්වයි. පෙළ ඇතුළත් කරන්න." : "This browser does not support speech input. Please type the text.")
      return
    }
    const recognition = new Constructor()
    recognition.lang = languageSpeechCode(aiSource)
    recognition.interimResults = false
    recognition.continuous = false
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript
      if (transcript) setAiText(transcript)
    }
    recognition.onerror = () => setSpeechListening(false)
    recognition.onend = () => setSpeechListening(false)
    setSpeechListening(true)
    recognition.start()
  }

  const speakResult = () => {
    if (typeof window === "undefined" || !aiResult || !("speechSynthesis" in window)) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(aiResult)
    utterance.lang = languageSpeechCode(aiTarget)
    window.speechSynthesis.speak(utterance)
  }

  const renderHome = () => (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.55),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.15),transparent_32%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-red-200"><Plane className="h-4 w-4" /> {copy.appSubtitle}</div>
            <h1 className="mt-5 text-3xl font-black tracking-tight sm:text-4xl">{copy.welcome}</h1>
            <p className="mt-3 text-lg font-bold text-red-200">{copy.currentPhase}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{t(journeyPhases.find((phase) => phase.id === "preDeparture")!.description, language)}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setView("journey")} className="inline-flex items-center rounded-2xl bg-[#bb271a] px-5 py-3 text-sm font-black text-white">{copy.continue}<ArrowRight className="ml-2 h-4 w-4" /></button>
              <button onClick={() => setView("ai")} className="inline-flex items-center rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-black text-white"><Languages className="mr-2 h-4 w-4" />{copy.ai}</button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-300">{copy.progress}</p><p className="mt-2 text-4xl font-black">{overallProgress}%</p></div><BadgeCheck className="h-10 w-10 text-emerald-400" /></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${overallProgress}%` }} /></div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center"><div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{completedCount}</p><p className="mt-1 text-[11px] text-slate-400">Done</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">{nextSteps.length}</p><p className="mt-1 text-[11px] text-slate-400">Now</p></div><div className="rounded-xl bg-white/10 p-3"><p className="text-2xl font-black">8</p><p className="mt-1 text-[11px] text-slate-400">Stages</p></div></div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel title={copy.nextActions} description={t(journeyPhases.find((phase) => phase.id === "preDeparture")!.location, language)}>
          <div className="divide-y divide-slate-100">
            {nextSteps.map((step) => (
              <div key={step.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><ClipboardCheck className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1"><p className="font-black text-slate-900">{t(step.title, language)}</p><p className="mt-1 text-sm leading-6 text-slate-500">{t(step.description, language)}</p></div>
                <button onClick={() => setStepCompleted(step.id)} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:border-[#bb271a] hover:text-[#bb271a]">{copy.complete}</button>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title={copy.oneStop} description={language === "ko" ? "비자 발급 이후 한국생활에 필요한 서비스를 한 번에 신청" : language === "si" ? "වීසා ලැබුණු පසු අවශ්‍ය සේවා එකම ස්ථානයක" : "Apply for post-visa Korea-life services in one place"}>
          <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-1">
            {oneStopServices.slice(1, 6).map((service) => {
              const Icon = serviceIcons[service.category]
              return <button key={service.id} onClick={() => setSelectedService(service)} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#bb271a] hover:bg-red-50/40"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1"><span className="block font-black text-slate-900">{t(service.title, language)}</span><span className="mt-1 block truncate text-xs text-slate-500">{t(service.result, language)}</span></span><ChevronRight className="h-5 w-5 text-slate-400" /></button>
            })}
          </div>
        </Panel>
      </div>

      <Panel title={copy.allJourney} description={language === "ko" ? "정부 공식절차와 세중 원스톱 서비스를 구분해서 보여줍니다." : language === "si" ? "නිල රජයේ පියවර හා Sejoong සේවා වෙන වෙනම පෙන්වයි." : "Official government steps and Sejoong services are clearly separated."}>
        <div className="overflow-x-auto p-5">
          <div className="flex min-w-[920px] items-start gap-3">
            {journeyPhases.map((phase) => {
              const phaseSteps = getPhaseSteps(phase.id)
              const done = phaseSteps.filter((step) => statuses[step.id] === "completed").length
              const percent = phaseSteps.length ? Math.round((done / phaseSteps.length) * 100) : 0
              return <button key={phase.id} onClick={() => { setSelectedPhase(phase.id); setView("journey") }} className={`w-44 shrink-0 rounded-2xl border p-4 text-left transition ${phase.id === "preDeparture" ? "border-[#bb271a] bg-red-50" : "border-slate-200 bg-white hover:border-slate-400"}`}><p className="text-xs font-black text-[#bb271a]">STEP {phase.order}</p><p className="mt-2 font-black text-slate-900">{t(phase.shortTitle, language)}</p><p className="mt-1 text-xs text-slate-500">{t(phase.location, language)}</p><div className="mt-4"><ProgressBar value={percent} /></div><p className="mt-2 text-right text-[11px] text-slate-400">{percent}%</p></button>
            })}
          </div>
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title={copy.governmentBoundary} description={language === "ko" ? "플랫폼은 공식 승인·처리를 대신하지 않습니다." : language === "si" ? "වේදිකාව නිල අනුමැතිය හෝ ක්‍රියාවලියට ආදේශයක් නොවේ." : "The platform does not replace official approval or processing."}>
          <div className="space-y-3 p-5">
            {journeySteps.filter((step) => step.official).slice(0, 5).map((step) => <div key={step.id} className="flex gap-3 rounded-xl bg-blue-50 p-4"><Landmark className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><p className="text-sm font-black text-blue-950">{t(step.title, language)}</p><p className="mt-1 text-xs leading-5 text-blue-800/75">{t(step.description, language)}</p></div></div>)}
          </div>
        </Panel>
        <Panel title={copy.sejoongBoundary} description={language === "ko" ? "정보를 반복 입력하지 않고 신청·진행·완료를 통합합니다." : language === "si" ? "දත්ත නැවත ඇතුළත් නොකර අයදුම්, තත්ත්වය හා සම්පූර්ණ කිරීම එකතු කරයි." : "Apply, track and complete services without re-entering the same data."}>
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {oneStopServices.slice(0, 6).map((service) => <div key={service.id} className="rounded-xl bg-emerald-50 p-4"><p className="text-sm font-black text-emerald-950">{t(service.title, language)}</p><p className="mt-2 text-xs leading-5 text-emerald-800/80">{t(service.description, language)}</p></div>)}
          </div>
        </Panel>
      </div>
    </div>
  )

  const renderJourney = () => {
    const phase = journeyPhases.find((item) => item.id === selectedPhase) || journeyPhases[0]
    const steps = getPhaseSteps(phase.id)
    return (
      <div className="space-y-5">
        <Panel title={copy.allJourney} description={language === "ko" ? "단계를 선택하면 공식기관·세중·근로자·고용주의 역할이 표시됩니다." : language === "si" ? "අදියරක් තෝරාගත් විට එක් එක් පාර්ශ්වයේ වගකීම පෙන්වයි." : "Select a stage to see authority, Sejoong, worker and employer responsibilities."}>
          <div className="overflow-x-auto p-4"><div className="flex min-w-[900px] gap-2">{journeyPhases.map((item) => <button key={item.id} onClick={() => setSelectedPhase(item.id)} className={`flex-1 rounded-xl border px-3 py-3 text-left ${selectedPhase === item.id ? "border-[#bb271a] bg-red-50 text-[#bb271a]" : "border-slate-200 bg-white text-slate-600"}`}><span className="text-[10px] font-black">{item.order}</span><span className="mt-1 block text-xs font-black">{t(item.shortTitle, language)}</span></button>)}</div></div>
        </Panel>
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white"><p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">STEP {phase.order} · {t(phase.location, language)}</p><h1 className="mt-3 text-3xl font-black">{t(phase.title, language)}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{t(phase.description, language)}</p></section>
        <div className="grid gap-4">
          {steps.map((step) => {
            const status = statuses[step.id]
            return <article key={step.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 lg:flex-row lg:items-start"><div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${step.official ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#bb271a]"}`}>{step.official ? <Landmark className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-black text-slate-950">{t(step.title, language)}</h2>{step.required ? <Pill className="border-red-200 bg-red-50 text-red-700">{copy.required}</Pill> : <Pill className="border-slate-200 bg-slate-50 text-slate-600">{copy.optional}</Pill>}<Pill className={step.official ? "border-blue-200 bg-blue-50 text-blue-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{step.official ? copy.official : copy.oneStop}</Pill></div><p className="mt-3 text-sm leading-7 text-slate-600">{t(step.description, language)}</p><div className="mt-4 flex flex-wrap gap-2">{step.responsibility.map((owner) => <Pill key={owner} className="border-slate-200 bg-slate-50 text-slate-600">{t(responsibilityLabels[owner], language)}</Pill>)}</div>{step.documents?.length ? <div className="mt-4 flex flex-wrap gap-2">{step.documents.map((doc) => <span key={t(doc, language)} className="inline-flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700"><FileText className="h-3.5 w-3.5" />{t(doc, language)}</span>)}</div> : null}</div><div className="flex shrink-0 flex-col gap-2 lg:w-44"><Pill className={status === "completed" ? "justify-center border-emerald-200 bg-emerald-50 text-emerald-700" : status === "attention" ? "justify-center border-red-200 bg-red-50 text-red-700" : "justify-center border-amber-200 bg-amber-50 text-amber-700"}>{t(statusLabels[status], language)}</Pill>{status !== "completed" ? <button onClick={() => setStepCompleted(step.id)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">{copy.complete}</button> : null}{step.serviceCategory ? <button onClick={() => { const service = oneStopServices.find((item) => item.category === step.serviceCategory); if (service) setSelectedService(service) }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700">{copy.start}</button> : null}{step.officialReference ? <a href={step.officialReference.url} target="_blank" rel="noreferrer" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-xs font-bold text-blue-700">{step.officialReference.label}</a> : null}</div></div></article>
          })}
        </div>
      </div>
    )
  }

  const renderServices = () => (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">One-stop service catalog</p><h1 className="mt-3 text-3xl font-black">{copy.services}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{language === "ko" ? "여권·비자·입국·주소 등 이미 저장된 정보를 동의 후 재사용해 통신, 계좌, 송금, 체류, 병원과 귀국 서비스를 신청합니다." : language === "si" ? "අනුමැතියෙන් සුරකින දත්ත නැවත භාවිත කර සන්නිවේදන, බැංකු, මුදල් යැවීම, වීසා, සෞඛ්‍ය හා ආපසු යාමේ සේවා සඳහා අයදුම් කරන්න." : "Reuse verified profile data with consent to apply for telecom, banking, remittance, stay, healthcare and return services."}</p></section>
      <div className="relative"><Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" /><input value={serviceQuery} onChange={(event) => setServiceQuery(event.target.value)} placeholder={copy.search} className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm shadow-sm outline-none focus:border-[#bb271a]" /></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredServices.map((service) => { const Icon = serviceIcons[service.category]; return <article key={service.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><Icon className="h-6 w-6" /></span><Pill className={service.integrationStatus === "ready_ui" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{service.integrationStatus === "ready_ui" ? "Platform ready" : copy.partner}</Pill></div><h2 className="mt-5 text-xl font-black">{t(service.title, language)}</h2><p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{t(service.description, language)}</p><div className="mt-5 flex flex-wrap gap-2">{service.deliveryModes.map((mode) => <span key={mode} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">{mode}</span>)}</div><button onClick={() => setSelectedService(service)} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white">{copy.start}<ArrowRight className="ml-2 h-4 w-4" /></button></article> })}</div>
    </div>
  )

  const renderDocuments = () => (
    <div className="space-y-5">
      <Panel title={copy.documentWallet} description={copy.documentNotice} action={<button className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white"><UploadCloud className="mr-2 h-4 w-4" />Upload</button>}>
        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">{sampleDocuments.map((doc) => <article key={doc.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><FileText className="h-5 w-5" /></span><Pill className={doc.status === "approved" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{doc.status}</Pill></div><h3 className="mt-5 font-black">{t(doc.title, language)}</h3><p className="mt-2 text-sm font-semibold text-slate-500">{doc.mask}</p><p className="mt-4 text-xs text-slate-400">Expiry {doc.expiry}</p></article>)}</div>
      </Panel>
      <Panel title={language === "ko" ? "서류 재사용 원칙" : language === "si" ? "ලේඛන නැවත භාවිත කිරීමේ නීති" : "Document reuse rules"} description={language === "ko" ? "한 번 저장한 자료도 서비스마다 필요한 범위와 수신자를 다시 확인합니다." : language === "si" ? "සුරකින ලේඛන එක් එක් සේවාව සඳහා අවශ්‍ය සීමාව හා ලැබෙන පාර්ශ්වය නැවත තහවුරු කරයි." : "Each service reconfirms the minimum required fields and receiving party."}>
        <div className="grid gap-3 p-5 md:grid-cols-2">{[language === "ko" ? "원본은 공개 URL로 제공하지 않음" : language === "si" ? "මුල් ලේඛන public URL ලෙස නොදීම" : "No public URL for originals", language === "ko" ? "여권·등록번호 목록 마스킹" : language === "si" ? "ගමන් බලපත්‍ර හා ලියාපදිංචි අංක masking" : "Mask passport and registration numbers", language === "ko" ? "서비스별 별도 공유동의" : language === "si" ? "සේවාව අනුව වෙනම බෙදාගැනීමේ අනුමැතිය" : "Separate sharing consent per service", language === "ko" ? "조회·다운로드·전달 감사기록" : language === "si" ? "බැලීම, බාගත කිරීම හා යැවීම audit කිරීම" : "Audit view, download and sharing"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><ShieldCheck className="h-5 w-5 text-emerald-600" />{item}</div>)}</div>
      </Panel>
    </div>
  )

  const renderMoney = () => {
    const remittance = oneStopServices.find((service) => service.id === "remittance")!
    return <div className="space-y-5"><section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300"><Banknote className="h-7 w-7" /></div><h1 className="mt-5 text-3xl font-black">{t(remittance.title, language)}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{t(remittance.description, language)}</p><button onClick={() => setSelectedService(remittance)} className="mt-6 rounded-2xl bg-[#bb271a] px-5 py-3 text-sm font-black text-white">{copy.start}</button></section><div className="grid gap-5 lg:grid-cols-2"><Panel title={language === "ko" ? "송금 흐름" : language === "si" ? "මුදල් යැවීමේ ප්‍රවාහය" : "Remittance flow"}><div className="space-y-3 p-5">{[language === "ko" ? "1. 본인·급여계좌 확인" : language === "si" ? "1. හැඳුනුම් හා වැටුප් ගිණුම තහවුරු කරන්න" : "1. Verify identity and payroll account", language === "ko" ? "2. 스리랑카 수취인 등록" : language === "si" ? "2. ශ්‍රී ලංකා ලාභියා ලියාපදිංචි කරන්න" : "2. Register Sri Lanka beneficiary", language === "ko" ? "3. 인가사업자 실시간 견적 비교" : language === "si" ? "3. බලපත්‍රලාභී සේවා සජීවී සසඳන්න" : "3. Compare licensed-provider quotes", language === "ko" ? "4. 선택 사업자에서 본인인증·송금" : language === "si" ? "4. තෝරාගත් සේවාවෙන් තහවුරු කර යවන්න" : "4. Verify and send with selected provider", language === "ko" ? "5. 수취·영수증·환불 상태 확인" : language === "si" ? "5. ලැබීම, රිසිට් හා ආපසු ගෙවීම අනුගමනය කරන්න" : "5. Track receipt, proof and refund"].map((item) => <div key={item} className="rounded-xl bg-slate-50 p-4 text-sm font-bold text-slate-700">{item}</div>)}</div></Panel><Panel title={language === "ko" ? "규제 경계" : language === "si" ? "නියාමන සීමාව" : "Regulatory boundary"}><div className="space-y-4 p-5"><div className="rounded-xl bg-blue-50 p-4 text-sm leading-7 text-blue-900">{t(remittance.legalBoundary!, language)}</div><div className="rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-900">{copy.noPrice}</div><div className="rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">{language === "ko" ? "등록된 소액해외송금업자 또는 은행과 정식 API·제휴계약을 체결한 뒤 실시간 견적과 송금상태를 표시합니다." : language === "si" ? "ලියාපදිංචි මුදල් යැවීමේ සේවාවක් හෝ බැංකුවක් සමඟ නිල API ගිවිසුමකින් පසු සජීවී මිල හා තත්ත්වය පෙන්වයි." : "Live quotes and status are enabled only after a formal API agreement with a bank or registered remittance provider."}</div></div></Panel></div></div>
  }

  const renderAi = () => (
    <div className="space-y-5">
      <section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8"><div className="flex items-center gap-3"><span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-300"><Bot className="h-7 w-7" /></span><div><p className="text-xs font-black uppercase tracking-[0.18em] text-violet-300">AI language layer</p><h1 className="mt-1 text-3xl font-black">{copy.ai}</h1></div></div><p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">{language === "ko"
                ? "한국어·영어·싱할라어·타밀어를 번역하고 공항·사업장·병원·은행·출입국·숙소·송금 상황의 다음 행동을 안내합니다."
                : language === "si"
                  ? "කොරියානු, ඉංග්‍රීසි, සිංහල හා දෙමළ පරිවර්තනය කර ගුවන් තොටුපළ, වැඩ, රෝහල්, බැංකු, ආගමන, නවාතැන් හා මුදල් යැවීමේ ඊළඟ පියවර කියාදෙයි."
                  : language === "ta"
                    ? "கொரிய, ஆங்கில, சிங்கள மற்றும் தமிழ் மொழிகளை மொழிபெயர்த்து விமான நிலையம், வேலைத்தளம், மருத்துவமனை, வங்கி, குடிவரவு, வீடு மற்றும் பணஅனுப்பு சூழல்களின் அடுத்த நடவடிக்கையை விளக்குகிறது."
                    : "Translate Korean, English, Sinhala and Tamil and explain next actions for airport, workplace, hospital, bank, immigration, housing and remittance situations."}</p></section>
      <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title={language === "ko" ? "입력" : language === "si" ? "ඇතුළත් කිරීම" : "Input"} description={copy.privacy}>
          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-2"><button onClick={() => setAiMode("translate")} className={`rounded-xl border px-4 py-3 text-sm font-black ${aiMode === "translate" ? "border-[#bb271a] bg-red-50 text-[#bb271a]" : "border-slate-200"}`}>{copy.translate}</button><button onClick={() => setAiMode("guide")} className={`rounded-xl border px-4 py-3 text-sm font-black ${aiMode === "guide" ? "border-[#bb271a] bg-red-50 text-[#bb271a]" : "border-slate-200"}`}>{copy.guide}</button></div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2"><select value={aiSource} onChange={(event) => setAiSource(event.target.value as StayCareLanguage)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm">{(Object.keys(languageLabels) as StayCareLanguage[]).map((item) => <option key={item} value={item}>{languageLabels[item]}</option>)}</select><ArrowRight className="h-4 w-4 text-slate-400" /><select value={aiTarget} onChange={(event) => setAiTarget(event.target.value as StayCareLanguage)} className="rounded-xl border border-slate-200 px-3 py-3 text-sm">{(Object.keys(languageLabels) as StayCareLanguage[]).map((item) => <option key={item} value={item}>{languageLabels[item]}</option>)}</select></div>
            <select value={aiContext} onChange={(event) => setAiContext(event.target.value as ContextType)} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm">{["general", "airport", "workplace", "hospital", "bank", "immigration", "housing", "remittance"].map((item) => <option key={item} value={item}>{item}</option>)}</select>
            <textarea value={aiText} onChange={(event) => setAiText(event.target.value)} placeholder={copy.aiPlaceholder} className="min-h-44 w-full rounded-2xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-[#bb271a]" />
            <div className="grid grid-cols-2 gap-3"><button onClick={startSpeech} className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold"><Mic className={`mr-2 h-4 w-4 ${speechListening ? "animate-pulse text-red-600" : ""}`} />{copy.listen}</button><button onClick={runAi} disabled={aiLoading || !aiText.trim()} className="inline-flex items-center justify-center rounded-xl bg-[#bb271a] px-4 py-3 text-sm font-black text-white disabled:opacity-40">{aiLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}{copy.aiRun}</button></div>
          </div>
        </Panel>
        <Panel title={language === "ko" ? "AI 결과" : language === "si" ? "AI ප්‍රතිඵලය" : "AI result"} action={aiResult ? <button onClick={speakResult} className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><Speaker className="mr-2 h-4 w-4" />{copy.speak}</button> : null}>
          <div className="min-h-[360px] p-5">{aiError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-900">{aiError}</div> : aiResult ? <div className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-8 text-white">{aiResult}</div> : <div className="flex min-h-[310px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center"><Languages className="h-10 w-10 text-slate-300" /><p className="mt-4 text-sm text-slate-500">{language === "ko" ? "번역하거나 궁금한 상황을 입력하세요." : language === "si" ? "පරිවර්තනය කිරීමට හෝ විමසීමට පෙළක් ඇතුළත් කරන්න." : "Enter text to translate or a situation to explain."}</p></div>}</div>
        </Panel>
      </div>
    </div>
  )

  const renderHelp = () => (
    <div className="space-y-5"><section className="rounded-[2rem] border border-red-200 bg-red-50 p-6 sm:p-8"><div className="flex items-start gap-4"><AlertTriangle className="h-8 w-8 shrink-0 text-red-700" /><div><h1 className="text-2xl font-black text-red-950">{copy.emergencyNotice}</h1><p className="mt-3 text-sm leading-7 text-red-900/80">{language === "ko" ? "AI 번역은 긴급신고를 돕는 보조수단이며 공식 긴급통역이나 구조를 대체하지 않습니다." : language === "si" ? "AI පරිවර්තනය හදිසි ඇමතුමට උදව් කරන නමුත් නිල හදිසි පරිවර්තනය හෝ ගලවාගැනීමකට ආදේශයක් නොවේ." : "AI translation can assist but does not replace official emergency interpretation or rescue."}</p></div></div></section><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{emergencyContacts.map((contact) => <a key={contact.id} href={`tel:${contact.number}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-[#bb271a]"><p className="text-3xl font-black text-[#bb271a]">{contact.number}</p><p className="mt-3 text-sm font-black text-slate-900">{t(contact.title, language)}</p></a>)}</div><Panel title={language === "ko" ? "세중 도움요청" : language === "si" ? "Sejoong උදව් ඉල්ලීම" : "Ask Sejoong for help"} description={language === "ko" ? "생활·체류·노무·법률 문제를 한 번 접수하면 내부 담당팀이 이어서 처리합니다." : language === "si" ? "ජීවිත, වීසා, කම්කරු හෝ නීතිමය ගැටලුවක් එක් වරක් යොමු කළ විට අදාළ කණ්ඩායම අනුගමනය කරයි." : "Submit a life, stay, labor or legal issue once; the relevant internal team follows it through."}><div className="grid gap-3 p-5 md:grid-cols-2">{["immigration", "work", "housing", "health"].map((category) => <button key={category} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left"><span className="font-black capitalize">{category}</span><ChevronRight className="h-5 w-5 text-slate-400" /></button>)}</div></Panel></div>
  )

  const renderReturn = () => {
    const returnSteps = getPhaseSteps("return")
    return <div className="space-y-5"><section className="rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8"><p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">D-180 Return workflow</p><h1 className="mt-3 text-3xl font-black">{copy.returnTitle}</h1><p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{t(journeyPhases.find((phase) => phase.id === "return")!.description, language)}</p></section><div className="grid gap-4">{returnSteps.map((step, index) => <article key={step.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">{index + 1}</span><div className="min-w-0 flex-1"><h2 className="font-black">{t(step.title, language)}</h2><p className="mt-2 text-sm leading-7 text-slate-600">{t(step.description, language)}</p><div className="mt-4 flex flex-wrap gap-2">{step.responsibility.map((owner) => <Pill key={owner} className="border-slate-200 bg-slate-50 text-slate-600">{t(responsibilityLabels[owner], language)}</Pill>)}</div></div><button onClick={() => setStepCompleted(step.id)} className="hidden h-fit rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold sm:block">{statuses[step.id] === "completed" ? <Check className="h-4 w-4 text-emerald-600" /> : copy.complete}</button></div></article>)}</div></div>
  }

  const renderView = () => {
    if (view === "home") return renderHome()
    if (view === "journey") return renderJourney()
    if (view === "services") return renderServices()
    if (view === "documents") return renderDocuments()
    if (view === "money") return renderMoney()
    if (view === "ai") return renderAi()
    if (view === "help") return renderHelp()
    return renderReturn()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><Link href="/ko/staycare" className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</span><span><span className="block font-black">StayCare</span><span className="block text-[11px] text-slate-400">{copy.appSubtitle}</span></span></Link><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div>
        <div className="border-b border-white/10 p-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 font-black text-[#bb271a]">NP</span><div><p className="font-black">Nimal Perera</p><p className="text-xs text-slate-400">E-7 · Sri Lanka</p></div></div><div className="mt-4"><ProgressBar value={overallProgress} /></div><p className="mt-2 text-right text-[11px] text-slate-400">{overallProgress}%</p></div></div>
        <nav className="space-y-1 p-3">{navItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? "bg-[#bb271a] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon className="h-5 w-5" />{copy[item.label]}</button> })}</nav>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-400"><p className="font-bold text-slate-200">Sejoong one-stop desk</p><p className="mt-1">Government steps are linked and tracked; private services are fulfilled by Sejoong and licensed providers.</p></div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl"><div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#bb271a]">{copy.appName}</p><h1 className="mt-1 text-lg font-black">{copy[navItems.find((item) => item.id === view)?.label || "home"]}</h1></div></div><div className="flex items-center gap-2"><select value={language} onChange={(event) => setLanguage(event.target.value as StayCareLanguage)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold">{(Object.keys(languageLabels) as StayCareLanguage[]).map((item) => <option key={item} value={item}>{languageLabels[item]}</option>)}</select><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button></div></div></header>
        <main className="p-4 sm:p-6 lg:p-8">{renderView()}</main>
      </div>

      {selectedService ? <ServiceApplicationDrawer service={selectedService} language={language} onClose={() => setSelectedService(null)} /> : null}
    </div>
  )
}
