"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileLock2,
  FileText,
  HeartPulse,
  HelpCircle,
  Home,
  Languages,
  Landmark,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  Phone,
  Plane,
  Scale,
  Send,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
  UserRound,
  WalletCards,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export type ProductionLanguage = "ko" | "en" | "si"
type View = "home" | "journey" | "services" | "documents" | "ai" | "help"

type LocalizedValue = Partial<Record<ProductionLanguage, string>> | string | null

export interface ProductionWorker {
  id: string
  member_no: string
  full_name: string
  full_name_en: string | null
  preferred_language: ProductionLanguage
  visa_type: string | null
  occupation: string | null
  status: string
  current_phase: string
  profile_completion: number
  expected_arrival_date: string | null
  visa_expires_at: string | null
  passport_expires_at: string | null
  phone_number: string | null
  next_action: string | null
  next_action_due_at: string | null
}

export interface ProductionStep {
  id: string
  step_code: string
  phase: string
  title: LocalizedValue
  description: LocalizedValue
  responsibility: string[]
  official_process: boolean
  required: boolean
  status: string
  due_at: string | null
  official_reference_url: string | null
  data: Record<string, unknown> | null
}

export interface ProductionService {
  id: string
  code: string
  category: string
  name: LocalizedValue
  description: LocalizedValue
  available_from_phase: string
  ownership: string[]
  delivery_modes: string[]
  required_data: unknown
  integration_mode: string
  legal_boundary: LocalizedValue
}

export interface ProductionDocument {
  id: string
  document_type: string
  original_filename: string
  mime_type: string
  byte_size: number
  status: string
  issue_date: string | null
  expiry_date: string | null
  created_at: string
}

export interface ProductionApplication {
  id: string
  application_no: string
  status: string
  language: string
  submitted_at: string | null
  fulfilled_at: string | null
  created_at: string
  service?: {
    code?: string
    category?: string
    name?: LocalizedValue
  } | null
}

interface Props {
  locale: string
  userEmail?: string
  worker: ProductionWorker
  initialSteps: ProductionStep[]
  services: ProductionService[]
  documents: ProductionDocument[]
  applications: ProductionApplication[]
}

const languageLabels: Record<ProductionLanguage, string> = {
  ko: "한국어",
  en: "English",
  si: "සිංහල",
}

const ui = {
  ko: {
    home: "홈",
    journey: "내 준비과정",
    services: "원스톱 서비스",
    documents: "내 서류",
    ai: "AI 언어지원",
    help: "도움·긴급",
    welcome: "한국생활 준비 현황",
    nextActions: "지금 해야 할 일",
    recentApplications: "최근 서비스 신청",
    official: "정부·공공기관 확인",
    sejoong: "세중 원스톱",
    required: "필수",
    complete: "완료 확인",
    start: "신청하기",
    upload: "서류 업로드",
    noData: "아직 등록된 항목이 없습니다.",
    signOut: "로그아웃",
    submitted: "신청이 정상 접수되었습니다.",
    privacy: "여권번호·외국인등록번호·계좌·카드번호를 AI에 입력하지 마세요.",
  },
  en: {
    home: "Home",
    journey: "My journey",
    services: "One-stop services",
    documents: "Documents",
    ai: "AI language",
    help: "Help & emergency",
    welcome: "Korea-life readiness",
    nextActions: "What to do now",
    recentApplications: "Recent applications",
    official: "Authority confirmation",
    sejoong: "Sejoong one-stop",
    required: "Required",
    complete: "Confirm complete",
    start: "Apply",
    upload: "Upload document",
    noData: "No items have been registered yet.",
    signOut: "Sign out",
    submitted: "Your application was submitted.",
    privacy: "Do not enter passport, registration, bank-account or card numbers into AI.",
  },
  si: {
    home: "මුල් පිටුව",
    journey: "මගේ ගමන",
    services: "එක්-තැනක සේවා",
    documents: "ලේඛන",
    ai: "AI භාෂා සහාය",
    help: "උදව් හා හදිසි",
    welcome: "කොරියානු ජීවිත සූදානම",
    nextActions: "දැන් කළ යුතු දේ",
    recentApplications: "මෑත අයදුම්",
    official: "රාජ්‍ය ආයතන තහවුරු කිරීම",
    sejoong: "Sejoong එක්-තැනක සේවාව",
    required: "අනිවාර්ය",
    complete: "සම්පූර්ණ බව තහවුරු කරන්න",
    start: "අයදුම් කරන්න",
    upload: "ලේඛනය උඩුගත කරන්න",
    noData: "තවම අයිතම නොමැත.",
    signOut: "ඉවත් වන්න",
    submitted: "ඔබගේ අයදුම යොමු කර ඇත.",
    privacy: "ගමන් බලපත්‍ර, ලියාපදිංචි, බැංකු හෝ කාඩ් අංක AI වෙත ඇතුළත් නොකරන්න.",
  },
} as const

const phaseOrder = ["prepare", "official", "pre_departure", "arrival", "settlement", "living", "renewal", "return"]

const phaseLabels: Record<string, Record<ProductionLanguage, string>> = {
  prepare: { ko: "스리랑카 현지 준비", en: "Prepare in Sri Lanka", si: "ශ්‍රී ලංකාවේ සූදානම" },
  official: { ko: "정부·EPS 절차", en: "Government / EPS", si: "රජයේ / EPS ක්‍රියාවලිය" },
  pre_departure: { ko: "비자 후 출국 준비", en: "After visa / pre-departure", si: "වීසා පසු පිටත්වීම" },
  arrival: { ko: "한국 도착", en: "Arrival in Korea", si: "කොරියාවට පැමිණීම" },
  settlement: { ko: "초기 정착", en: "First 90 days", si: "පළමු දින 90" },
  living: { ko: "한국 생활·근로", en: "Work and life", si: "වැඩ හා ජීවිතය" },
  renewal: { ko: "체류 연장·변경", en: "Extension and changes", si: "දිගු කිරීම හා වෙනස්කම්" },
  return: { ko: "귀국·재정착", en: "Return home", si: "ආපසු යාම" },
}

const serviceIcons: Record<string, typeof Smartphone> = {
  telecom: Smartphone,
  finance: WalletCards,
  remittance: Banknote,
  immigration: Scale,
  insurance: ShieldCheck,
  housing: Building2,
  health: HeartPulse,
  healthcare: HeartPulse,
  identity: FileLock2,
  translation: Languages,
  return: Plane,
}

function localized(value: LocalizedValue, language: ProductionLanguage) {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[language] || value.en || value.ko || value.si || ""
}

function formatDate(value: string | null, language: ProductionLanguage) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : language === "si" ? "si-LK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(value))
  } catch {
    return value
  }
}

function StatusBadge({ status }: { status: string }) {
  const positive = ["completed", "fulfilled", "approved", "issued", "active"].includes(status)
  const danger = ["attention", "rejected", "failed", "cancelled"].includes(status)
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${positive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : danger ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
      {status.replaceAll("_", " ")}
    </span>
  )
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
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

function ServiceDrawer({ service, language, onClose, onSubmitted }: { service: ProductionService; language: ProductionLanguage; onClose: () => void; onSubmitted: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError("")
    const form = new FormData(event.currentTarget)
    const submittedData: Record<string, string> = {}
    form.forEach((value, key) => {
      if (typeof value === "string" && value.trim()) submittedData[key] = value.trim()
    })

    try {
      const response = await fetch("/api/staycare/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-idempotency-key": crypto.randomUUID(),
        },
        body: JSON.stringify({
          serviceCode: service.code,
          language,
          submittedData,
          sharedDocumentIds: [],
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Application failed")
      setSuccess(true)
      onSubmitted()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Application failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/50 backdrop-blur-sm">
      <button className="absolute inset-0" onClick={onClose} aria-label="Close" />
      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb271a]">Sejoong one-stop</p>
            <h2 className="mt-1 text-xl font-black">{localized(service.name, language)}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2"><X className="h-5 w-5" /></button>
        </div>

        <form onSubmit={submit} className="space-y-5 p-5">
          <div className="rounded-3xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">
            {localized(service.description, language)}
          </div>

          {service.category === "telecom" ? (
            <>
              <label className="block text-sm font-black">SIM type
                <select name="simType" defaultValue="esim" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option value="esim">eSIM</option>
                  <option value="physical_sim">Physical SIM</option>
                  <option value="resident_plan">Resident mobile plan</option>
                </select>
              </label>
              <label className="block text-sm font-black">Device model
                <input name="deviceModel" maxLength={120} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <label className="block text-sm font-black">IMEI last 6 digits
                <input name="imeiLast6" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <label className="block text-sm font-black">Delivery / activation
                <select name="deliveryMethod" defaultValue="digital" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option value="digital">Online eSIM QR</option>
                  <option value="airport">Airport pickup</option>
                  <option value="accommodation">Accommodation delivery</option>
                  <option value="branch">Provider branch</option>
                </select>
              </label>
              <input name="arrivalAirport" placeholder="Arrival airport" maxLength={80} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="arrivalTerminal" placeholder="Terminal" maxLength={40} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="deliveryAddressSummary" placeholder="Delivery address summary" maxLength={300} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            </>
          ) : service.category === "immigration" ? (
            <>
              <label className="block text-sm font-black">Administration task
                <select name="caseType" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option value="foreigner_registration">Foreigner registration</option>
                  <option value="stay_extension">Stay extension</option>
                  <option value="address_change">Address change</option>
                  <option value="workplace_change">Workplace change review</option>
                  <option value="visa_change">Visa status review</option>
                  <option value="departure">Departure / return</option>
                  <option value="certificate">Certificate</option>
                  <option value="other">Other</option>
                </select>
              </label>
              <label className="block text-sm font-black">Deadline
                <input name="deadlineAt" type="datetime-local" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <textarea name="description" maxLength={2000} placeholder="Current situation and request" className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3" />
            </>
          ) : service.category === "remittance" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">
                StayCare does not hold, exchange or transmit funds. This request connects you to a contracted bank or registered remittance provider.
              </div>
              <input name="sourceAmount" inputMode="numeric" placeholder="KRW amount" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="beneficiaryName" placeholder="Sri Lanka beneficiary name" maxLength={120} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="beneficiaryBank" placeholder="Receiving bank" maxLength={120} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="purpose" placeholder="Remittance purpose" maxLength={120} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            </div>
          ) : (
            <>
              <textarea name="description" maxLength={2000} placeholder="Describe what you need" className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3" />
              <input name="preferredDate" type="date" className="w-full rounded-xl border border-slate-200 px-4 py-3" />
            </>
          )}

          {localized(service.legal_boundary, language) ? (
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950">
              <ShieldCheck className="mb-2 h-5 w-5" />
              {localized(service.legal_boundary, language)}
            </div>
          ) : null}

          {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
          {success ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><CheckCircle2 className="mb-2 h-5 w-5" />Application submitted.</div> : null}

          {!success ? (
            <button disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:opacity-50">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
              Submit application
            </button>
          ) : (
            <button type="button" onClick={onClose} className="w-full rounded-2xl bg-slate-950 px-5 py-4 font-black text-white">Close</button>
          )}
        </form>
      </aside>
    </div>
  )
}

export default function StayCareProductionApp({ locale, userEmail, worker, initialSteps, services, documents, applications }: Props) {
  const initialLanguage: ProductionLanguage = worker.preferred_language || (locale === "en" ? "en" : locale === "si" ? "si" : "ko")
  const [language, setLanguage] = useState<ProductionLanguage>(initialLanguage)
  const [view, setView] = useState<View>("home")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [steps, setSteps] = useState(initialSteps)
  const [selectedService, setSelectedService] = useState<ProductionService | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [aiText, setAiText] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState("")
  const router = useRouter()
  const text = ui[language]

  const completed = steps.filter((step) => step.status === "completed").length
  const progress = steps.length ? Math.round((completed / steps.length) * 100) : worker.profile_completion
  const nextSteps = steps.filter((step) => !["completed", "cancelled"].includes(step.status)).slice(0, 5)

  const stepsByPhase = useMemo(() => phaseOrder.map((phase) => ({ phase, steps: steps.filter((step) => step.phase === phase) })), [steps])

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = `/${locale}/staycare/login`
  }

  const completeStep = async (step: ProductionStep) => {
    const nextStatus = step.official_process ? "attention" : "completed"
    const response = await fetch(`/api/staycare/journey/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    })
    const data = await response.json()
    if (!response.ok) {
      window.alert(data.error || "Unable to update the step")
      return
    }
    setSteps((current) => current.map((item) => item.id === step.id ? { ...item, status: data.step.status } : item))
  }

  const uploadDocument = async (file: File) => {
    setUploading(true)
    setUploadError("")
    try {
      const authorization = await fetch("/api/staycare/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "other",
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }),
      })
      const authData = await authorization.json()
      if (!authorization.ok) throw new Error(authData.error || "Unable to authorize upload")

      const supabase = createClient()
      const { error: uploadError } = await supabase.storage
        .from(authData.bucket)
        .uploadToSignedUrl(authData.path, authData.token, file, { contentType: file.type })
      if (uploadError) throw uploadError

      const hashBuffer = await crypto.subtle.digest("SHA-256", await file.arrayBuffer())
      const sha256 = Array.from(new Uint8Array(hashBuffer)).map((byte) => byte.toString(16).padStart(2, "0")).join("")

      const complete = await fetch("/api/staycare/documents/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: authData.documentId, sha256 }),
      })
      const completeData = await complete.json()
      if (!complete.ok) throw new Error(completeData.error || "Unable to finalize upload")
      router.refresh()
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : "Document upload failed")
    } finally {
      setUploading(false)
    }
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
          sourceLanguage: language,
          targetLanguage: language === "ko" ? "si" : "ko",
          mode: "guide",
          context: "general",
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "AI request failed")
      setAiResult(data.result || "")
    } catch (caught) {
      setAiError(caught instanceof Error ? caught.message : "AI request failed")
    } finally {
      setAiLoading(false)
    }
  }

  const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
    { id: "home", label: text.home, icon: Home },
    { id: "journey", label: text.journey, icon: ListChecks },
    { id: "services", label: text.services, icon: Sparkles },
    { id: "documents", label: text.documents, icon: FileLock2 },
    { id: "ai", label: text.ai, icon: Languages },
    { id: "help", label: text.help, icon: HelpCircle },
  ]

  const renderHome = () => (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{worker.member_no}</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{worker.full_name_en || worker.full_name}</h1>
            <p className="mt-3 text-lg font-bold text-red-200">{phaseLabels[worker.current_phase]?.[language] || worker.current_phase}</p>
            <p className="mt-4 text-sm leading-7 text-slate-300">{worker.next_action || text.nextActions}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{worker.visa_type || "Visa pending"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{worker.occupation || "Occupation pending"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{worker.status}</span>
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-slate-300">Overall readiness</p><p className="mt-2 text-4xl font-black">{progress}%</p></div>
              <BadgeCheck className="h-10 w-10 text-emerald-400" />
            </div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /></div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center text-xs text-slate-400">
              <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-white">{completed}</p>Done</div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-white">{nextSteps.length}</p>Next</div>
              <div className="rounded-xl bg-white/5 p-3"><p className="text-2xl font-black text-white">{applications.length}</p>Requests</div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={text.nextActions} description={worker.next_action_due_at ? `Due ${formatDate(worker.next_action_due_at, language)}` : undefined}>
          <div className="divide-y divide-slate-100">
            {nextSteps.length ? nextSteps.map((step) => (
              <div key={step.id} className="flex flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${step.official_process ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#bb271a]"}`}>
                  {step.official_process ? <Landmark className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-black">{localized(step.title, language)}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{localized(step.description, language)}</p>
                </div>
                <button onClick={() => completeStep(step)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold hover:border-[#bb271a] hover:text-[#bb271a]">
                  {step.official_process ? text.official : text.complete}
                </button>
              </div>
            )) : <p className="p-5 text-sm text-slate-500">{text.noData}</p>}
          </div>
        </Panel>

        <Panel title={text.recentApplications}>
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 6).map((application) => (
              <div key={application.id} className="flex items-center gap-3 px-5 py-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100"><Send className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{localized(application.service?.name || application.service?.code || "Service", language)}</p><p className="mt-1 text-xs text-slate-500">{application.application_no}</p></div>
                <StatusBadge status={application.status} />
              </div>
            ))}
            {!applications.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}
          </div>
        </Panel>
      </div>
    </div>
  )

  const renderJourney = () => (
    <div className="space-y-5">
      {stepsByPhase.map(({ phase, steps: phaseSteps }, index) => (
        <Panel key={phase} title={`${index + 1}. ${phaseLabels[phase]?.[language] || phase}`} description={`${phaseSteps.filter((step) => step.status === "completed").length}/${phaseSteps.length} completed`}>
          <div className="divide-y divide-slate-100">
            {phaseSteps.map((step) => (
              <article key={step.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${step.official_process ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#bb271a]"}`}>
                  {step.official_process ? <Landmark className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{localized(step.title, language)}</h3>{step.required ? <span className="rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-black text-red-700">{text.required}</span> : null}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{localized(step.description, language)}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold text-slate-500">{step.responsibility.map((owner) => <span key={owner} className="rounded-lg bg-slate-100 px-2.5 py-1.5">{owner}</span>)}</div>
                </div>
                <div className="flex shrink-0 items-center gap-2 lg:w-52 lg:flex-col lg:items-stretch">
                  <StatusBadge status={step.status} />
                  {step.status !== "completed" ? <button onClick={() => completeStep(step)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">{step.official_process ? text.official : text.complete}</button> : null}
                  {step.official_reference_url ? <a href={step.official_reference_url} target="_blank" rel="noreferrer" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-center text-xs font-bold text-blue-700">Official channel</a> : null}
                </div>
              </article>
            ))}
            {!phaseSteps.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}
          </div>
        </Panel>
      ))}
    </div>
  )

  const renderServices = () => (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => {
        const Icon = serviceIcons[service.category] || Sparkles
        return (
          <article key={service.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><Icon className="h-6 w-6" /></span><span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-500">{service.integration_mode}</span></div>
            <h2 className="mt-5 text-xl font-black">{localized(service.name, language)}</h2>
            <p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{localized(service.description, language)}</p>
            <div className="mt-5 flex flex-wrap gap-2">{service.delivery_modes?.map((mode) => <span key={mode} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-bold text-slate-500">{mode}</span>)}</div>
            <button onClick={() => setSelectedService(service)} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">{text.start}<ArrowRight className="ml-2 h-4 w-4" /></button>
          </article>
        )
      })}
    </div>
  )

  const renderDocuments = () => (
    <Panel title={text.documents} description="Private Storage · expiring links · access audit" action={
      <label className="inline-flex cursor-pointer items-center rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">
        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}{text.upload}
        <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadDocument(file); event.target.value = "" }} />
      </label>
    }>
      {uploadError ? <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{uploadError}</div> : null}
      <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-slate-200 p-5">
            <div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><FileText className="h-5 w-5" /></span><StatusBadge status={document.status} /></div>
            <h3 className="mt-5 truncate font-black">{document.original_filename}</h3>
            <p className="mt-2 text-xs text-slate-500">{document.document_type} · {(document.byte_size / 1024 / 1024).toFixed(2)} MB</p>
            <p className="mt-3 text-xs text-slate-400">Expiry: {formatDate(document.expiry_date, language)}</p>
            <a href={`/api/staycare/documents/${document.id}/download?redirect=1`} className="mt-5 inline-flex items-center text-sm font-black text-[#bb271a]">Open secure file <ChevronRight className="ml-1 h-4 w-4" /></a>
          </article>
        ))}
        {!documents.length ? <p className="text-sm text-slate-500">{text.noData}</p> : null}
      </div>
    </Panel>
  )

  const renderAi = () => (
    <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
      <Panel title={text.ai} description={text.privacy}>
        <div className="space-y-4 p-5">
          <textarea value={aiText} onChange={(event) => setAiText(event.target.value)} maxLength={3000} placeholder="Ask about Korea life, airport, hospital, bank, immigration, housing or remittance." className="min-h-64 w-full rounded-2xl border border-slate-200 p-4 text-sm leading-7 outline-none focus:border-[#bb271a]" />
          <button onClick={runAi} disabled={aiLoading || !aiText.trim()} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:opacity-50">
            {aiLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bot className="mr-2 h-5 w-5" />}Run AI guide
          </button>
        </div>
      </Panel>
      <Panel title="AI result" description="Important legal, medical and immigration decisions require human confirmation.">
        <div className="min-h-[360px] p-5">
          {aiError ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{aiError}</div> : aiResult ? <div className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-8 text-white">{aiResult}</div> : <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500"><Languages className="mb-4 h-10 w-10 text-slate-300" />AI results appear here.</div>}
        </div>
      </Panel>
    </div>
  )

  const renderHelp = () => (
    <div className="space-y-5">
      <section className="rounded-[2rem] border border-red-200 bg-red-50 p-6"><div className="flex gap-4"><AlertTriangle className="h-8 w-8 shrink-0 text-red-700" /><div><h1 className="text-2xl font-black text-red-950">Immediate danger: contact public emergency services first.</h1><p className="mt-3 text-sm leading-7 text-red-900">AI and StayCare support do not replace police, ambulance or fire response.</p></div></div></section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[["112", "Police"], ["119", "Ambulance / Fire"], ["1345", "Immigration"], ["1350", "Labor"], ["1577-0071", "Foreign workforce"]].map(([number, label]) => <a key={number} href={`tel:${number}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-3xl font-black text-[#bb271a]">{number}</p><p className="mt-3 text-sm font-black">{label}</p></a>)}
      </div>
      <Panel title="StayCare support" description={userEmail || "Sejoong StayCare"}><div className="grid gap-3 p-5 md:grid-cols-2">{services.filter((service) => ["immigration", "health", "healthcare", "housing"].includes(service.category)).map((service) => <button key={service.id} onClick={() => setSelectedService(service)} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 text-left"><span className="font-black">{localized(service.name, language)}</span><ChevronRight className="h-5 w-5 text-slate-400" /></button>)}</div></Panel>
    </div>
  )

  const renderView = () => {
    if (view === "home") return renderHome()
    if (view === "journey") return renderJourney()
    if (view === "services") return renderServices()
    if (view === "documents") return renderDocuments()
    if (view === "ai") return renderAi()
    return renderHelp()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</span><div><p className="font-black">StayCare</p><p className="text-[11px] text-slate-400">Sri Lanka → Korea</p></div></div><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div>
        <div className="border-b border-white/10 p-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-[#bb271a]"><UserRound className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate font-black">{worker.full_name_en || worker.full_name}</p><p className="truncate text-xs text-slate-400">{worker.member_no}</p></div></div></div></div>
        <nav className="space-y-1 p-3">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${view === item.id ? "bg-[#bb271a] text-white" : "text-slate-300 hover:bg-white/5"}`}><Icon className="h-5 w-5" />{item.label}</button> })}</nav>
        <button onClick={signOut} className="absolute inset-x-3 bottom-3 flex items-center rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-slate-300 hover:bg-white/5"><LogOut className="mr-3 h-5 w-5" />{text.signOut}</button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb271a]">Sejoong StayCare</p><h1 className="mt-1 text-lg font-black">{navItems.find((item) => item.id === view)?.label}</h1></div></div><div className="flex items-center gap-2"><select value={language} onChange={(event) => setLanguage(event.target.value as ProductionLanguage)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold">{Object.entries(languageLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="relative rounded-xl border border-slate-200 p-2.5"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button></div></div></header>
        <main className="p-4 sm:p-6 lg:p-8">{renderView()}</main>
      </div>

      {selectedService ? <ServiceDrawer service={selectedService} language={language} onClose={() => setSelectedService(null)} onSubmitted={() => router.refresh()} /> : null}
    </div>
  )
}
