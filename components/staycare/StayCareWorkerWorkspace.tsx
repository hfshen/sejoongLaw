"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Bell,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FileLock2,
  FileText,
  Headphones,
  HeartPulse,
  HelpCircle,
  Home,
  Languages,
  Landmark,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  Phone,
  Plane,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UploadCloud,
  UserRound,
  WalletCards,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { translateStayCareTamil } from "@/lib/staycare/tamil-translations"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

type LocalizedValue = Partial<Record<StayCarePreferredLanguage, string>> | string | null

type WorkspaceView =
  | "overview"
  | "journey"
  | "applications"
  | "services"
  | "documents"
  | "support"
  | "ai"
  | "profile"

export interface WorkerWorkspaceWorker {
  id: string
  member_no: string
  full_name: string
  full_name_en: string | null
  preferred_language: StayCarePreferredLanguage
  visa_type: string | null
  occupation: string | null
  status: string
  current_phase: string
  profile_completion: number
  expected_arrival_date: string | null
  visa_expires_at: string | null
  passport_expires_at: string | null
  phone_number: string | null
  accommodation_summary: string | null
  next_action: string | null
  next_action_due_at: string | null
}

export interface WorkerWorkspaceStep {
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

export interface WorkerWorkspaceService {
  id: string
  code: string
  category: string
  name: LocalizedValue
  description: LocalizedValue
  delivery_modes: string[]
  integration_mode: string
  legal_boundary: LocalizedValue
}

export interface WorkerWorkspaceEvent {
  id: string
  event_type: string
  body: Record<string, unknown> | null
  created_at: string
}

export interface WorkerWorkspaceApplication {
  id: string
  application_no: string
  status: string
  submitted_at: string | null
  fulfilled_at: string | null
  created_at: string
  external_reference: string | null
  rejected_reason: string | null
  submitted_data: Record<string, unknown> | null
  service?: { code?: string; category?: string; name?: LocalizedValue } | null
  events?: WorkerWorkspaceEvent[] | null
}

export interface WorkerWorkspaceDocument {
  id: string
  document_type: string
  original_filename: string
  mime_type: string
  byte_size: number
  status: string
  rejection_reason: string | null
  issue_date: string | null
  expiry_date: string | null
  created_at: string
}

export interface WorkerWorkspaceNotification {
  id: string
  subject: string | null
  body: string
  read_at: string | null
  created_at: string
  metadata: Record<string, unknown> | null
}

export interface WorkerWorkspaceTicket {
  id: string
  ticket_no: string
  title: string
  category: string
  priority: string
  status: string
  description: string | null
  worker_visible_summary: string | null
  first_response_due_at: string | null
  resolution_due_at: string | null
  resolved_at: string | null
  created_at: string
  events?: Array<{
    id: string
    event_type: string
    body: Record<string, unknown> | null
    created_at: string
  }> | null
}

export interface WorkerWorkspaceReturnPlan {
  expected_return_date: string | null
  contract_end_date: string | null
  final_salary_status: string | null
  severance_status: string | null
  insurance_claim_status: string | null
  final_remittance_status: string | null
  bank_closure_status: string | null
  telecom_closure_status: string | null
  accommodation_checkout_status: string | null
  departure_record_status: string | null
  reintegration_status: string | null
  status: string
}

interface Props {
  locale: string
  userEmail?: string
  worker: WorkerWorkspaceWorker
  initialSteps: WorkerWorkspaceStep[]
  services: WorkerWorkspaceService[]
  initialDocuments: WorkerWorkspaceDocument[]
  initialApplications: WorkerWorkspaceApplication[]
  initialNotifications: WorkerWorkspaceNotification[]
  initialTickets: WorkerWorkspaceTicket[]
  returnPlan: WorkerWorkspaceReturnPlan | null
}

const phaseOrder = ["prepare", "official", "pre_departure", "arrival", "settlement", "living", "renewal", "return"]

const copy = {
  ko: {
    overview: "홈",
    journey: "내 준비과정",
    applications: "신청현황",
    services: "원스톱 서비스",
    documents: "내 서류",
    support: "상담·도움",
    ai: "AI 언어지원",
    profile: "내 정보",
    welcome: "한국생활 준비 현황",
    nextAction: "지금 해야 할 일",
    due: "기한",
    progress: "전체 준비도",
    completed: "완료",
    openRequests: "진행 중 신청",
    documentsReady: "승인 서류",
    unread: "새 알림",
    viewAll: "전체 보기",
    noData: "아직 등록된 내용이 없습니다.",
    official: "공식 채널 확인",
    complete: "완료 표시",
    apply: "신청하기",
    close: "닫기",
    submit: "접수하기",
    upload: "서류 업로드",
    save: "저장",
    saving: "저장 중",
    signOut: "로그아웃",
    refresh: "새로고침",
    markRead: "모두 읽음",
    applicationDetail: "신청 상세",
    timeline: "처리 이력",
    requestSupport: "새 상담 요청",
    emergency: "긴급상황은 공공 긴급기관에 먼저 연락하세요.",
    readOnlyOfficial: "정부·공공기관 단계는 StayCare가 승인하지 않습니다. 공식 채널에서 상태를 확인하고 세중이 후속 준비를 지원합니다.",
    profileHelp: "연락처와 선호 언어를 최신 상태로 유지해 주세요.",
    privacy: "실제 여권번호·외국인등록번호·계좌·카드번호는 AI에 입력하지 마세요.",
  },
  en: {
    overview: "Home",
    journey: "My journey",
    applications: "Applications",
    services: "One-stop services",
    documents: "Documents",
    support: "Support",
    ai: "AI language",
    profile: "Profile",
    welcome: "Korea-life readiness",
    nextAction: "What to do now",
    due: "Due",
    progress: "Overall readiness",
    completed: "Completed",
    openRequests: "Open requests",
    documentsReady: "Approved documents",
    unread: "Unread alerts",
    viewAll: "View all",
    noData: "Nothing has been registered yet.",
    official: "Open official channel",
    complete: "Mark complete",
    apply: "Apply",
    close: "Close",
    submit: "Submit",
    upload: "Upload document",
    save: "Save",
    saving: "Saving",
    signOut: "Sign out",
    refresh: "Refresh",
    markRead: "Mark all read",
    applicationDetail: "Application detail",
    timeline: "Timeline",
    requestSupport: "New support request",
    emergency: "Contact public emergency services first for immediate danger.",
    readOnlyOfficial: "StayCare does not approve government steps. Check the official channel; Sejoong supports follow-up preparation.",
    profileHelp: "Keep your contact details and preferred language current.",
    privacy: "Do not enter real passport, registration, bank-account or card numbers into AI.",
  },
  si: {
    overview: "මුල් පිටුව",
    journey: "මගේ ගමන",
    applications: "අයදුම්",
    services: "එක්-තැනක සේවා",
    documents: "ලේඛන",
    support: "සහාය",
    ai: "AI භාෂා සහාය",
    profile: "මගේ තොරතුරු",
    welcome: "කොරියානු ජීවිත සූදානම",
    nextAction: "දැන් කළ යුතු දේ",
    due: "කාලසීමාව",
    progress: "සමස්ත සූදානම",
    completed: "සම්පූර්ණ",
    openRequests: "ක්‍රියාත්මක ඉල්ලීම්",
    documentsReady: "අනුමත ලේඛන",
    unread: "නොකියවූ දැනුම්දීම්",
    viewAll: "සියල්ල බලන්න",
    noData: "තවම කිසිවක් ලියාපදිංචි කර නැත.",
    official: "නිල නාලිකාව විවෘත කරන්න",
    complete: "සම්පූර්ණ ලෙස සලකුණු කරන්න",
    apply: "අයදුම් කරන්න",
    close: "වසන්න",
    submit: "යොමු කරන්න",
    upload: "ලේඛනය උඩුගත කරන්න",
    save: "සුරකින්න",
    saving: "සුරකිමින්",
    signOut: "ඉවත් වන්න",
    refresh: "නැවත පූරණය",
    markRead: "සියල්ල කියවූ ලෙස",
    applicationDetail: "අයදුම් විස්තර",
    timeline: "ක්‍රියා ඉතිහාසය",
    requestSupport: "නව සහාය ඉල්ලීම",
    emergency: "හදිසි අවදානමකදී පළමුව රාජ්‍ය හදිසි සේවාව අමතන්න.",
    readOnlyOfficial: "රජයේ අදියර StayCare විසින් අනුමත නොකරයි. නිල නාලිකාවෙන් තත්ත්වය බලන්න; Sejoong පසු සූදානමට සහාය දෙයි.",
    profileHelp: "ඔබගේ සම්බන්ධතා සහ කැමති භාෂාව යාවත්කාලීනව තබන්න.",
    privacy: "සැබෑ ගමන් බලපත්‍ර, ලියාපදිංචි, බැංකු හෝ කාඩ් අංක AI වෙත ඇතුළත් නොකරන්න.",
  },
  ta: {
    overview: "முகப்பு",
    journey: "என் தயாரிப்பு பயணம்",
    applications: "விண்ணப்ப நிலை",
    services: "ஒரே இட சேவைகள்",
    documents: "என் ஆவணங்கள்",
    support: "ஆலோசனை மற்றும் உதவி",
    ai: "AI மொழி உதவி",
    profile: "என் தகவல்",
    welcome: "கொரியா வாழ்க்கை தயார்நிலை",
    nextAction: "இப்போது செய்ய வேண்டியது",
    due: "காலக்கெடு",
    progress: "மொத்தத் தயார்நிலை",
    completed: "முடிந்தது",
    openRequests: "நடைபெறும் கோரிக்கைகள்",
    documentsReady: "அங்கீகரிக்கப்பட்ட ஆவணங்கள்",
    unread: "புதிய அறிவிப்புகள்",
    viewAll: "அனைத்தையும் காண்க",
    noData: "இன்னும் எந்த தகவலும் பதிவு செய்யப்படவில்லை.",
    official: "அதிகாரப்பூர்வ சேனலைத் திறக்கவும்",
    complete: "முடிந்ததாக குறிக்கவும்",
    apply: "விண்ணப்பிக்கவும்",
    close: "மூடவும்",
    submit: "சமர்ப்பிக்கவும்",
    upload: "ஆவணத்தைப் பதிவேற்றவும்",
    save: "சேமிக்கவும்",
    saving: "சேமிக்கிறது",
    signOut: "வெளியேறு",
    refresh: "புதுப்பிக்கவும்",
    markRead: "அனைத்தையும் வாசித்ததாக குறிக்கவும்",
    applicationDetail: "விண்ணப்ப விவரம்",
    timeline: "செயலாக்க வரலாறு",
    requestSupport: "புதிய உதவி கோரிக்கை",
    emergency: "உடனடி ஆபத்தில் முதலில் பொது அவசர சேவைகளைத் தொடர்புகொள்ளவும்.",
    readOnlyOfficial: "அரசு நடைமுறைகளை StayCare அங்கீகரிக்காது. அதிகாரப்பூர்வ சேனலில் நிலையைச் சரிபார்க்கவும்; Sejoong அடுத்த தயாரிப்பை ஆதரிக்கும்.",
    profileHelp: "உங்கள் தொடர்பு விவரங்களையும் விருப்ப மொழியையும் புதுப்பித்த நிலையில் வைத்திருக்கவும்.",
    privacy: "உண்மையான கடவுச்சீட்டு, பதிவெண், வங்கி கணக்கு அல்லது அட்டை எண்களை AI-இல் உள்ளிட வேண்டாம்.",
  },
} as const

const phaseLabels: Record<string, Partial<Record<StayCarePreferredLanguage, string>>> = {
  prepare: { ko: "스리랑카 현지 준비", en: "Prepare in Sri Lanka", si: "ශ්‍රී ලංකාවේ සූදානම" },
  official: { ko: "정부·EPS 절차", en: "Government / EPS", si: "රජයේ / EPS ක්‍රියාවලිය" },
  pre_departure: { ko: "비자 후 출국 준비", en: "Pre-departure", si: "පිටත්වීමේ සූදානම" },
  arrival: { ko: "한국 도착", en: "Arrival in Korea", si: "කොරියාවට පැමිණීම" },
  settlement: { ko: "초기 정착 90일", en: "First 90 days", si: "පළමු දින 90" },
  living: { ko: "한국 생활·근로", en: "Work and life", si: "වැඩ හා ජීවිතය" },
  renewal: { ko: "체류 연장·변경", en: "Extension and changes", si: "දිගු කිරීම හා වෙනස්කම්" },
  return: { ko: "귀국·재정착", en: "Return home", si: "ආපසු යාම" },
}

const statusLabels: Record<string, Partial<Record<StayCarePreferredLanguage, string>>> = {
  not_started: { ko: "시작 전", en: "Not started", si: "ආරම්භ කර නැත" },
  ready: { ko: "진행 가능", en: "Ready", si: "සූදානම්" },
  in_progress: { ko: "진행 중", en: "In progress", si: "ක්‍රියාත්මකයි" },
  waiting: { ko: "대기 중", en: "Waiting", si: "රැඳී සිටී" },
  attention: { ko: "확인 필요", en: "Needs attention", si: "අවධානය අවශ්‍යයි" },
  completed: { ko: "완료", en: "Completed", si: "සම්පූර්ණයි" },
  submitted: { ko: "접수됨", en: "Submitted", si: "යොමු කර ඇත" },
  reviewing: { ko: "검토 중", en: "Under review", si: "පරීක්ෂා කරමින්" },
  waiting_worker: { ko: "본인 보완 필요", en: "Waiting for you", si: "ඔබෙන් අවශ්‍යයි" },
  waiting_authority: { ko: "기관 회신 대기", en: "Waiting for authority", si: "ආයතනය බලා සිටී" },
  waiting_provider: { ko: "제휴사 처리 중", en: "Provider processing", si: "සේවා සපයන්නා ක්‍රියා කරයි" },
  approved: { ko: "승인", en: "Approved", si: "අනුමතයි" },
  fulfilled: { ko: "처리 완료", en: "Fulfilled", si: "සම්පූර්ණ කර ඇත" },
  rejected: { ko: "반려", en: "Rejected", si: "ප්‍රතික්ෂේපයි" },
  open: { ko: "접수", en: "Open", si: "විවෘතයි" },
  triaged: { ko: "분류 완료", en: "Triaged", si: "වර්ගීකරණය කර ඇත" },
  assigned: { ko: "담당자 배정", en: "Assigned", si: "පවරා ඇත" },
  resolved: { ko: "해결", en: "Resolved", si: "විසඳා ඇත" },
  closed: { ko: "종료", en: "Closed", si: "වසන ලදී" },
}

const serviceIcons: Record<string, typeof Smartphone> = {
  telecom: Smartphone,
  finance: WalletCards,
  remittance: Banknote,
  immigration: Landmark,
  insurance: ShieldCheck,
  housing: Home,
  health: HeartPulse,
  healthcare: HeartPulse,
  return: Plane,
}

function localized(value: LocalizedValue, language: StayCarePreferredLanguage) {
  if (!value) return ""
  if (typeof value === "string") return value
  return value[language] || value.en || value.ko || value.si || ""
}

function formatDate(value: string | null | undefined, language: StayCarePreferredLanguage) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : language === "si" ? "si-LK" : language === "ta" ? "ta-LK" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: value.includes("T") ? "2-digit" : undefined,
      minute: value.includes("T") ? "2-digit" : undefined,
    }).format(new Date(value))
  } catch {
    return value
  }
}

function localizedLabel(
  values: Partial<Record<StayCarePreferredLanguage, string>> | undefined,
  language: StayCarePreferredLanguage,
  fallback: string
) {
  if (!values) return fallback
  if (language === "ta") return values.ta || translateStayCareTamil(values.en || fallback)
  return values[language] || values.en || values.ko || values.si || fallback
}

function StatusBadge({ status, language }: { status: string; language: StayCarePreferredLanguage }) {
  const positive = ["completed", "fulfilled", "approved", "resolved", "closed", "active"].includes(status)
  const danger = ["attention", "rejected", "failed", "cancelled", "expired"].includes(status)
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${positive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : danger ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
      {localizedLabel(statusLabels[status], language, status.replaceAll("_", " "))}
    </span>
  )
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="font-black text-slate-950">{title}</h2>{description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}</div>
        {action}
      </div>
      {children}
    </section>
  )
}

export default function StayCareWorkerWorkspace({
  locale,
  userEmail,
  worker,
  initialSteps,
  services,
  initialDocuments,
  initialApplications,
  initialNotifications,
  initialTickets,
  returnPlan,
}: Props) {
  const router = useRouter()
  const { language, setLanguage } = useStayCareLanguage(worker.preferred_language || (locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"))
  const text = copy[language]
  const [view, setView] = useState<WorkspaceView>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [steps, setSteps] = useState(initialSteps)
  const [applications, setApplications] = useState(initialApplications)
  const [documents] = useState(initialDocuments)
  const [notifications, setNotifications] = useState(initialNotifications)
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedApplication, setSelectedApplication] = useState<WorkerWorkspaceApplication | null>(null)
  const [selectedService, setSelectedService] = useState<WorkerWorkspaceService | null>(null)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [documentType, setDocumentType] = useState("passport")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [aiText, setAiText] = useState("")
  const [aiResult, setAiResult] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(worker.phone_number || "")
  const [accommodation, setAccommodation] = useState(worker.accommodation_summary || "")

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const progress = steps.length ? Math.round((completedSteps / steps.length) * 100) : worker.profile_completion
  const openApplications = applications.filter((item) => !["fulfilled", "cancelled", "rejected"].includes(item.status))
  const approvedDocuments = documents.filter((item) => item.status === "approved").length
  const unreadNotifications = notifications.filter((item) => !item.read_at)
  const nextSteps = steps.filter((step) => !["completed", "cancelled"].includes(step.status)).slice(0, 5)
  const stepsByPhase = useMemo(
    () => phaseOrder.map((phase) => ({ phase, steps: steps.filter((step) => step.phase === phase) })),
    [steps]
  )

  const navItems: Array<{ id: WorkspaceView; label: string; icon: typeof Home }> = [
    { id: "overview", label: text.overview, icon: Home },
    { id: "journey", label: text.journey, icon: ListChecks },
    { id: "applications", label: text.applications, icon: ClipboardList },
    { id: "services", label: text.services, icon: Sparkles },
    { id: "documents", label: text.documents, icon: FileLock2 },
    { id: "support", label: text.support, icon: Headphones },
    { id: "ai", label: text.ai, icon: Languages },
    { id: "profile", label: text.profile, icon: UserRound },
  ]

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = `/${locale}/staycare/login`
  }

  const completeStep = async (step: WorkerWorkspaceStep) => {
    setError("")
    const response = await fetch(`/api/staycare/journey/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: step.official_process ? "attention" : "completed" }),
    })
    const data = await response.json()
    if (!response.ok) {
      setError(data.error || "Unable to update step")
      return
    }
    setSteps((items) => items.map((item) => item.id === step.id ? { ...item, status: data.step.status } : item))
  }

  const uploadDocument = async (file: File) => {
    setUploading(true)
    setError("")
    try {
      const authorization = await fetch("/api/staycare/documents/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType, filename: file.name, mimeType: file.type, size: file.size }),
      })
      const authData = await authorization.json()
      if (!authorization.ok) throw new Error(authData.error || "Unable to authorize upload")
      const { error: uploadError } = await createClient().storage
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
      setError(caught instanceof Error ? caught.message : "Document upload failed")
    } finally {
      setUploading(false)
    }
  }

  const submitService = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedService) return
    setBusy(true)
    setError("")
    try {
      const form = new FormData(event.currentTarget)
      const submittedData: Record<string, string> = {}
      form.forEach((value, key) => {
        if (typeof value === "string" && value.trim()) submittedData[key] = value.trim()
      })
      const response = await fetch("/api/staycare/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-idempotency-key": crypto.randomUUID() },
        body: JSON.stringify({ serviceCode: selectedService.code, language, submittedData, sharedDocumentIds: [] }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Application failed")
      setApplications((items) => [data.application, ...items])
      setSelectedService(null)
      setView("applications")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Application failed")
    } finally {
      setBusy(false)
    }
  }

  const markNotificationsRead = async () => {
    if (!unreadNotifications.length) return
    const response = await fetch("/api/staycare/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationIds: unreadNotifications.map((item) => item.id) }),
    })
    if (response.ok) {
      const now = new Date().toISOString()
      setNotifications((items) => items.map((item) => ({ ...item, read_at: item.read_at || now })))
    }
  }

  const createTicket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const form = new FormData(event.currentTarget)
      const response = await fetch("/api/staycare/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.get("title"),
          category: form.get("category"),
          priority: form.get("priority"),
          description: form.get("description"),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to create support request")
      setTickets((items) => [{ ...data.ticket, events: [] }, ...items])
      event.currentTarget.reset()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to create support request")
    } finally {
      setBusy(false)
    }
  }

  const runAi = async () => {
    if (!aiText.trim()) return
    setBusy(true)
    setError("")
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
      setError(caught instanceof Error ? caught.message : "AI request failed")
    } finally {
      setBusy(false)
    }
  }

  const saveProfile = async () => {
    setBusy(true)
    setError("")
    try {
      const response = await fetch("/api/staycare/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferredLanguage: language, phoneNumber, accommodationSummary: accommodation }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to update profile")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update profile")
    } finally {
      setBusy(false)
    }
  }

  const renderOverview = () => (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{worker.member_no}</p>
            <h1 className="mt-3 text-3xl font-black sm:text-4xl">{worker.full_name_en || worker.full_name}</h1>
            <p className="mt-3 text-lg font-bold text-red-200">{phaseLabels[worker.current_phase]?.[language] || worker.current_phase}</p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">{worker.next_action || text.nextAction}</p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-full bg-white/10 px-3 py-1.5">{worker.visa_type || "Visa pending"}</span>
              <span className="rounded-full bg-white/10 px-3 py-1.5">{worker.occupation || "Occupation pending"}</span>
              <StatusBadge status={worker.status} language={language} />
            </div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/10 p-5">
            <div className="flex items-center justify-between"><div><p className="text-sm text-slate-300">{text.progress}</p><p className="mt-2 text-4xl font-black">{progress}%</p></div><CheckCircle2 className="h-10 w-10 text-emerald-400" /></div>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-emerald-400" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [CheckCircle2, text.completed, completedSteps],
          [Send, text.openRequests, openApplications.length],
          [FileText, text.documentsReady, approvedDocuments],
          [Bell, text.unread, unreadNotifications.length],
        ].map(([Icon, label, value]) => {
          const CardIcon = Icon as typeof CheckCircle2
          return <button key={String(label)} onClick={() => setView(label === text.openRequests ? "applications" : label === text.documentsReady ? "documents" : label === text.unread ? "overview" : "journey")} className="rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-sm"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><CardIcon className="h-5 w-5" /></span><span className="text-3xl font-black">{String(value)}</span></div><p className="mt-4 text-sm font-bold text-slate-500">{String(label)}</p></button>
        })}
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title={text.nextAction} description={worker.next_action_due_at ? `${text.due}: ${formatDate(worker.next_action_due_at, language)}` : undefined} action={<button onClick={() => setView("journey")} className="text-sm font-black text-[#bb271a]">{text.viewAll}</button>}>
          <div className="divide-y divide-slate-100">
            {nextSteps.map((step) => <div key={step.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${step.official_process ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#bb271a]"}`}>{step.official_process ? <Landmark className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><p className="font-black">{localized(step.title, language)}</p><p className="mt-1 text-sm leading-6 text-slate-500">{localized(step.description, language)}</p></div><button onClick={() => step.official_process && step.official_reference_url ? window.open(step.official_reference_url, "_blank") : completeStep(step)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold">{step.official_process ? text.official : text.complete}</button></div>)}
            {!nextSteps.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}
          </div>
        </Panel>
        <Panel title={text.applications} action={<button onClick={() => setView("applications")} className="text-sm font-black text-[#bb271a]">{text.viewAll}</button>}>
          <div className="divide-y divide-slate-100">{applications.slice(0, 5).map((application) => <button key={application.id} onClick={() => setSelectedApplication(application)} className="flex w-full items-center gap-3 p-4 text-left"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100"><Send className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{localized(application.service?.name || application.service?.code || "Service", language)}</p><p className="mt-1 text-xs text-slate-500">{application.application_no}</p></div><StatusBadge status={application.status} language={language} /></button>)}{!applications.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}</div>
        </Panel>
      </div>
    </div>
  )

  const renderJourney = () => (
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950"><Landmark className="mb-2 h-5 w-5" />{text.readOnlyOfficial}</div>
      {stepsByPhase.map(({ phase, steps: phaseSteps }, index) => <Panel key={phase} title={`${index + 1}. ${localizedLabel(phaseLabels[phase], language, phase)}`} description={`${phaseSteps.filter((step) => step.status === "completed").length}/${phaseSteps.length}`}><div className="divide-y divide-slate-100">{phaseSteps.map((step) => <article key={step.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-start"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${step.official_process ? "bg-blue-50 text-blue-700" : "bg-red-50 text-[#bb271a]"}`}>{step.official_process ? <Landmark className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{localized(step.title, language)}</h3>{step.required ? <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-black text-red-700">Required</span> : null}</div><p className="mt-2 text-sm leading-7 text-slate-600">{localized(step.description, language)}</p><div className="mt-3 flex flex-wrap gap-2">{step.responsibility.map((owner) => <span key={owner} className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">{owner}</span>)}{step.due_at ? <span className="rounded-lg bg-amber-50 px-2.5 py-1 text-[11px] font-bold text-amber-700">{text.due} {formatDate(step.due_at, language)}</span> : null}</div></div><div className="flex shrink-0 items-center gap-2 lg:w-52 lg:flex-col lg:items-stretch"><StatusBadge status={step.status} language={language} />{step.status !== "completed" ? <button onClick={() => step.official_process && step.official_reference_url ? window.open(step.official_reference_url, "_blank") : completeStep(step)} className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white">{step.official_process ? text.official : text.complete}</button> : null}</div></article>)}{!phaseSteps.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}</div></Panel>)}
      {returnPlan ? <Panel title={phaseLabels.return[language]} description={`${text.due}: ${formatDate(returnPlan.expected_return_date, language)}`}><div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-3">{Object.entries(returnPlan).filter(([key]) => key.endsWith("_status")).map(([key, value]) => <div key={key} className="rounded-2xl border border-slate-200 p-4"><p className="text-xs font-bold text-slate-500">{key.replaceAll("_", " ")}</p><div className="mt-2"><StatusBadge status={String(value || "not_started")} language={language} /></div></div>)}</div></Panel> : null}
    </div>
  )

  const renderApplications = () => <Panel title={text.applications} description="Track every request, message and provider reference."><div className="divide-y divide-slate-100">{applications.map((application) => <button key={application.id} onClick={() => setSelectedApplication(application)} className="grid w-full gap-3 p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">{localized(application.service?.name || application.service?.code || "Service", language)}</p><p className="mt-1 text-xs text-slate-500">{application.application_no} · {formatDate(application.submitted_at || application.created_at, language)}</p>{application.rejected_reason ? <p className="mt-2 text-sm text-red-700">{application.rejected_reason}</p> : null}</div><div className="flex items-center gap-3"><StatusBadge status={application.status} language={language} /><ChevronRight className="h-4 w-4 text-slate-300" /></div></button>)}{!applications.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}</div></Panel>

  const renderServices = () => <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{services.map((service) => { const Icon = serviceIcons[service.category] || Sparkles; return <article key={service.id} className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><Icon className="h-6 w-6" /></span><span className="rounded-full border border-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-500">{service.integration_mode}</span></div><h2 className="mt-5 text-xl font-black">{localized(service.name, language)}</h2><p className="mt-3 flex-1 text-sm leading-7 text-slate-600">{localized(service.description, language)}</p><div className="mt-4 flex flex-wrap gap-2">{service.delivery_modes.map((mode) => <span key={mode} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold text-slate-500">{mode}</span>)}</div><button onClick={() => setSelectedService(service)} className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 font-black text-white">{text.apply}<ArrowRight className="ml-2 h-4 w-4" /></button></article> })}</div>

  const renderDocuments = () => <Panel title={text.documents} description="Private storage · 15MB maximum · PDF/JPG/PNG/WEBP" action={<div className="flex flex-wrap gap-2"><select value={documentType} onChange={(event) => setDocumentType(event.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold"><option value="passport">Passport</option><option value="visa">Visa</option><option value="employment_contract">Employment contract</option><option value="training_certificate">Training certificate</option><option value="accommodation_confirmation">Accommodation</option><option value="foreigner_registration">Registration</option><option value="other">Other</option></select><label className="inline-flex cursor-pointer items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">{uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadCloud className="mr-2 h-4 w-4" />}{text.upload}<input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadDocument(file); event.target.value = "" }} /></label></div>}><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{documents.map((document) => <article key={document.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex items-start justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-50 text-violet-700"><FileText className="h-5 w-5" /></span><StatusBadge status={document.status} language={language} /></div><h3 className="mt-5 truncate font-black">{document.original_filename}</h3><p className="mt-2 text-xs text-slate-500">{document.document_type} · {(document.byte_size / 1024 / 1024).toFixed(2)} MB</p>{document.rejection_reason ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs leading-5 text-red-800">{document.rejection_reason}</p> : null}<p className="mt-3 text-xs text-slate-400">Expiry: {formatDate(document.expiry_date, language)}</p><a href={`/api/staycare/documents/${document.id}/download?redirect=1`} className="mt-5 inline-flex items-center text-sm font-black text-[#bb271a]">Open secure file<ChevronRight className="ml-1 h-4 w-4" /></a></article>)}{!documents.length ? <p className="text-sm text-slate-500">{text.noData}</p> : null}</div></Panel>

  const renderSupport = () => <div className="space-y-5"><section className="rounded-[2rem] border border-red-200 bg-red-50 p-6"><div className="flex gap-4"><AlertTriangle className="h-8 w-8 shrink-0 text-red-700" /><div><h1 className="text-xl font-black text-red-950">{text.emergency}</h1><div className="mt-4 flex flex-wrap gap-2">{[["112", "Police"], ["119", "Ambulance / Fire"], ["1345", "Immigration"], ["1350", "Labor"]].map(([number, label]) => <a key={number} href={`tel:${number}`} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-red-800">{number} · {label}</a>)}</div></div></div></section><div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Panel title={text.requestSupport}><form onSubmit={createTicket} className="space-y-4 p-5"><input name="title" required minLength={4} maxLength={160} placeholder="Title" className="w-full rounded-xl border border-slate-200 px-4 py-3" /><div className="grid gap-3 sm:grid-cols-2"><select name="category" defaultValue="general" className="rounded-xl border border-slate-200 px-4 py-3"><option value="general">General</option><option value="immigration">Immigration</option><option value="labor">Labor</option><option value="housing">Housing</option><option value="health">Health</option><option value="telecom">Telecom</option><option value="finance">Finance</option><option value="remittance">Remittance</option><option value="return">Return</option></select><select name="priority" defaultValue="P3" className="rounded-xl border border-slate-200 px-4 py-3"><option value="P1">P1 urgent follow-up</option><option value="P2">P2 important</option><option value="P3">P3 normal</option><option value="P4">P4 information</option></select></div><textarea name="description" required minLength={10} maxLength={4000} placeholder="Describe what happened and what help you need." className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3" /><button disabled={busy} className="inline-flex w-full items-center justify-center rounded-xl bg-[#bb271a] px-4 py-3 font-black text-white disabled:opacity-50">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageSquareText className="mr-2 h-4 w-4" />}{text.submit}</button></form></Panel><Panel title={text.support}><div className="divide-y divide-slate-100">{tickets.map((ticket) => <article key={ticket.id} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-black">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">{ticket.ticket_no} · {ticket.category} · {ticket.priority}</p></div><StatusBadge status={ticket.status} language={language} /></div><p className="mt-3 text-sm leading-7 text-slate-600">{ticket.worker_visible_summary || ticket.description}</p><p className="mt-3 text-xs text-slate-400">{formatDate(ticket.created_at, language)}</p>{ticket.events?.length ? <div className="mt-4 space-y-2">{ticket.events.filter((event) => event.body?.message).map((event) => <div key={event.id} className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">{String(event.body?.message)} · {formatDate(event.created_at, language)}</div>)}</div> : null}</article>)}{!tickets.length ? <p className="p-5 text-sm text-slate-500">{text.noData}</p> : null}</div></Panel></div></div>

  const renderAi = () => <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]"><Panel title={text.ai} description={text.privacy}><div className="space-y-4 p-5"><textarea value={aiText} onChange={(event) => setAiText(event.target.value)} maxLength={3000} placeholder="Ask about Korea life, airport, hospital, bank, immigration, housing or remittance." className="min-h-64 w-full rounded-2xl border border-slate-200 p-4 text-sm leading-7" /><button onClick={runAi} disabled={busy || !aiText.trim()} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:opacity-50">{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Bot className="mr-2 h-5 w-5" />}AI guide</button></div></Panel><Panel title="AI result" description="Important legal, medical and immigration decisions require human confirmation."><div className="min-h-[360px] p-5">{aiResult ? <div className="whitespace-pre-wrap rounded-2xl bg-slate-950 p-5 text-sm leading-8 text-white">{aiResult}</div> : <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center text-sm text-slate-500"><Languages className="mb-4 h-10 w-10 text-slate-300" />AI results appear here.</div>}</div></Panel></div>

  const renderProfile = () => <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]"><Panel title={text.profile} description={text.profileHelp}><div className="space-y-4 p-5"><label className="block text-sm font-black">Preferred language<div className="mt-2"><StayCareLanguageSwitcher value={language} onChange={setLanguage} /></div></label><label className="block text-sm font-black">Phone number<input value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} maxLength={40} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" /></label><label className="block text-sm font-black">Accommodation summary<textarea value={accommodation} onChange={(event) => setAccommodation(event.target.value)} maxLength={500} className="mt-2 min-h-28 w-full rounded-xl border border-slate-200 px-4 py-3" /></label><button onClick={saveProfile} disabled={busy} className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3 font-black text-white disabled:opacity-50">{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}{busy ? text.saving : text.save}</button></div></Panel><Panel title="Account & deadlines"><div className="grid gap-3 p-5 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Email</p><p className="mt-1 break-all font-black">{userEmail || "—"}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Visa</p><p className="mt-1 font-black">{worker.visa_type || "—"}</p><p className="mt-1 text-xs text-slate-500">Expires {formatDate(worker.visa_expires_at, language)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Passport expiry</p><p className="mt-1 font-black">{formatDate(worker.passport_expires_at, language)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs text-slate-500">Expected arrival</p><p className="mt-1 font-black">{formatDate(worker.expected_arrival_date, language)}</p></div></div></Panel></div>

  const renderView = () => {
    if (view === "overview") return renderOverview()
    if (view === "journey") return renderJourney()
    if (view === "applications") return renderApplications()
    if (view === "services") return renderServices()
    if (view === "documents") return renderDocuments()
    if (view === "support") return renderSupport()
    if (view === "ai") return renderAi()
    return renderProfile()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</span><div><p className="font-black">StayCare</p><p className="text-[11px] text-slate-400">Sri Lanka → Korea</p></div></div><button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button></div>
        <div className="border-b border-white/10 p-4"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-[#bb271a]"><UserRound className="h-5 w-5" /></span><div className="min-w-0"><p className="truncate font-black">{worker.full_name_en || worker.full_name}</p><p className="truncate text-xs text-slate-400">{worker.member_no}</p></div></div></div></div>
        <nav className="space-y-1 overflow-y-auto p-3 pb-24">{navItems.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${view === item.id ? "bg-[#bb271a] text-white" : "text-slate-300 hover:bg-white/5"}`}><Icon className="h-5 w-5" />{item.label}</button> })}</nav>
        <button onClick={signOut} className="absolute inset-x-3 bottom-3 flex items-center rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300"><LogOut className="mr-3 h-5 w-5" />{text.signOut}</button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb271a]">Sejoong StayCare</p><h1 className="mt-1 text-lg font-black">{navItems.find((item) => item.id === view)?.label}</h1></div></div><div className="flex items-center gap-2"><StayCareLanguageSwitcher value={language} onChange={setLanguage} /><button onClick={() => router.refresh()} className="hidden rounded-xl border border-slate-200 p-2.5 sm:block"><RefreshCw className="h-5 w-5" /></button><button onClick={() => setNotificationOpen(true)} className="relative rounded-xl border border-slate-200 p-2.5"><Bell className="h-5 w-5" />{unreadNotifications.length ? <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black text-white">{unreadNotifications.length}</span> : null}</button></div></div></header>
        <main className="p-4 sm:p-6 lg:p-8">{renderView()}</main>
      </div>

      {notificationOpen ? <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/40"><button className="absolute inset-0" onClick={() => setNotificationOpen(false)} aria-label="Close" /><aside className="relative z-10 h-full w-full max-w-md overflow-y-auto bg-white"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><h2 className="text-xl font-black">Notifications</h2><p className="mt-1 text-xs text-slate-500">{unreadNotifications.length} unread</p></div><button onClick={() => setNotificationOpen(false)} className="rounded-xl border p-2"><X className="h-5 w-5" /></button></div><div className="p-4"><button onClick={markNotificationsRead} className="mb-4 w-full rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white">{text.markRead}</button><div className="space-y-3">{notifications.map((notification) => <article key={notification.id} className={`rounded-2xl border p-4 ${notification.read_at ? "border-slate-200" : "border-red-200 bg-red-50"}`}><p className="font-black">{notification.subject || "StayCare"}</p><p className="mt-2 text-sm leading-6 text-slate-600">{notification.body}</p><p className="mt-3 text-xs text-slate-400">{formatDate(notification.created_at, language)}</p></article>)}{!notifications.length ? <p className="text-sm text-slate-500">{text.noData}</p> : null}</div></div></aside></div> : null}

      {selectedApplication ? <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/50"><button className="absolute inset-0" onClick={() => setSelectedApplication(null)} aria-label="Close" /><aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-black text-[#bb271a]">{selectedApplication.application_no}</p><h2 className="mt-1 text-xl font-black">{text.applicationDetail}</h2></div><button onClick={() => setSelectedApplication(null)} className="rounded-xl border p-2"><X className="h-5 w-5" /></button></div><div className="space-y-5 p-5"><div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex items-start justify-between gap-3"><h3 className="font-black">{localized(selectedApplication.service?.name || selectedApplication.service?.code || "Service", language)}</h3><StatusBadge status={selectedApplication.status} language={language} /></div><p className="mt-3 text-sm text-slate-300">{formatDate(selectedApplication.submitted_at || selectedApplication.created_at, language)}</p>{selectedApplication.external_reference ? <p className="mt-2 text-xs text-slate-400">Reference: {selectedApplication.external_reference}</p> : null}</div>{selectedApplication.rejected_reason ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{selectedApplication.rejected_reason}</div> : null}<Panel title="Submitted data"><pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words p-4 text-xs leading-6 text-slate-600">{JSON.stringify(selectedApplication.submitted_data || {}, null, 2)}</pre></Panel><Panel title={text.timeline}><div className="divide-y divide-slate-100">{selectedApplication.events?.map((event) => <div key={event.id} className="p-4"><div className="flex items-center gap-2"><CircleAlert className="h-4 w-4 text-[#bb271a]" /><p className="text-sm font-black">{event.event_type.replaceAll("_", " ")}</p></div>{event.body?.message ? <p className="mt-2 text-sm leading-6 text-slate-600">{String(event.body.message)}</p> : null}<p className="mt-2 text-xs text-slate-400">{formatDate(event.created_at, language)}</p></div>)}{!selectedApplication.events?.length ? <p className="p-4 text-sm text-slate-500">{text.noData}</p> : null}</div></Panel></div></aside></div> : null}

      {selectedService ? <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/50"><button className="absolute inset-0" onClick={() => setSelectedService(null)} aria-label="Close" /><aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white"><div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white p-5"><div><p className="text-xs font-black text-[#bb271a]">Sejoong one-stop</p><h2 className="mt-1 text-xl font-black">{localized(selectedService.name, language)}</h2></div><button onClick={() => setSelectedService(null)} className="rounded-xl border p-2"><X className="h-5 w-5" /></button></div><form onSubmit={submitService} className="space-y-5 p-5"><div className="rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">{localized(selectedService.description, language)}</div>{selectedService.category === "telecom" ? <><select name="simType" defaultValue="esim" className="w-full rounded-xl border px-4 py-3"><option value="esim">eSIM</option><option value="physical_sim">Physical SIM</option><option value="resident_plan">Resident plan</option></select><input name="deviceModel" placeholder="Device model" maxLength={120} className="w-full rounded-xl border px-4 py-3" /><input name="imeiLast6" placeholder="IMEI last 6 digits" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} className="w-full rounded-xl border px-4 py-3" /><select name="deliveryMethod" defaultValue="digital" className="w-full rounded-xl border px-4 py-3"><option value="digital">Online eSIM QR</option><option value="airport">Airport pickup</option><option value="accommodation">Accommodation delivery</option><option value="branch">Provider branch</option></select></> : selectedService.category === "immigration" ? <><select name="caseType" className="w-full rounded-xl border px-4 py-3"><option value="foreigner_registration">Foreigner registration</option><option value="stay_extension">Stay extension</option><option value="address_change">Address change</option><option value="workplace_change">Workplace change</option><option value="visa_change">Visa review</option><option value="departure">Departure</option><option value="other">Other</option></select><input name="deadlineAt" type="datetime-local" className="w-full rounded-xl border px-4 py-3" /><textarea name="description" required maxLength={2000} placeholder="Current situation and request" className="min-h-32 w-full rounded-xl border px-4 py-3" /></> : selectedService.category === "remittance" ? <><div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-950">StayCare connects you to a licensed provider and does not hold or transmit funds.</div><input name="sourceAmount" required inputMode="numeric" placeholder="KRW amount" className="w-full rounded-xl border px-4 py-3" /><input name="beneficiaryName" required placeholder="Beneficiary name" maxLength={120} className="w-full rounded-xl border px-4 py-3" /><input name="beneficiaryBank" required placeholder="Receiving bank" maxLength={120} className="w-full rounded-xl border px-4 py-3" /><input name="purpose" placeholder="Purpose" maxLength={120} className="w-full rounded-xl border px-4 py-3" /></> : <><textarea name="description" required maxLength={2000} placeholder="Describe what you need" className="min-h-40 w-full rounded-xl border px-4 py-3" /><input name="preferredDate" type="date" className="w-full rounded-xl border px-4 py-3" /></>}{localized(selectedService.legal_boundary, language) ? <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950"><ShieldCheck className="mb-2 h-5 w-5" />{localized(selectedService.legal_boundary, language)}</div> : null}<button disabled={busy} className="inline-flex w-full items-center justify-center rounded-xl bg-[#bb271a] px-4 py-4 font-black text-white disabled:opacity-50">{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}{text.submit}</button></form></aside></div> : null}
    </div>
  )
}
