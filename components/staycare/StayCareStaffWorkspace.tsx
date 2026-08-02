"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Database,
  Eye,
  FileSearch,
  FileText,
  Gauge,
  Landmark,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Send,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  UserCog,
  UsersRound,
  X,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { StayCareRole, StayCareRoleCapabilities } from "@/lib/staycare/role-capabilities"
import { getStayCareRoleLabel } from "@/lib/staycare/role-capabilities"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import { useStayCareLanguage, type StayCarePreferredLanguage } from "@/lib/staycare/language-preference"
import { translateStayCareTamil } from "@/lib/staycare/tamil-translations"

type View = "overview" | "applications" | "workers" | "documents" | "tickets" | "immigration" | "audit" | "environment"

interface EnvironmentItem {
  id: string
  label: string
  keys: string[]
  group: "core" | "production" | "optional" | "provider"
  required: boolean
  state: "configured" | "missing" | "manual" | "partial"
  detail: string
  publicValue?: string
}

interface EnvironmentReport {
  environment: string
  commitSha: string | null
  generatedAt: string
  items: EnvironmentItem[]
  summary: {
    coreConfigured: number
    coreTotal: number
    productionConfigured: number
    productionTotal: number
    overallConfigured: number
    overallTotal: number
    percentage: number
    releaseState: "blocked" | "internal-pilot" | "limited-production" | "production-ready"
  }
}

export interface StaffApplication {
  id: string
  application_no: string
  status: string
  submitted_at: string | null
  external_reference: string | null
  rejected_reason: string | null
  submitted_data: Record<string, unknown> | null
  assigned_user_id: string | null
  worker?: { id?: string; full_name?: string; full_name_en?: string | null; member_no?: string; visa_type?: string | null } | null
  service?: { code?: string; category?: string; name?: Record<string, string> | string; integration_mode?: string } | null
  events?: Array<{ id: string; event_type: string; body: Record<string, unknown> | null; created_at: string }> | null
}

export interface StaffWorker {
  id: string
  member_no: string
  full_name: string
  full_name_en: string | null
  status: string
  current_phase: string
  profile_completion: number
  visa_type: string | null
  occupation: string | null
  expected_arrival_date: string | null
  visa_expires_at: string | null
  passport_expires_at: string | null
  next_action: string | null
  next_action_due_at: string | null
  risk_score: number
  employer?: { name?: string } | null
  training?: { name?: string } | null
}

export interface StaffDocument {
  id: string
  document_type: string
  original_filename: string
  mime_type: string
  byte_size: number
  status: string
  rejection_reason: string | null
  expiry_date: string | null
  created_at: string
  worker?: { id?: string; full_name?: string; full_name_en?: string | null; member_no?: string } | null
}

export interface StaffTicket {
  id: string
  ticket_no: string
  title: string
  category: string
  priority: string
  status: string
  description: string | null
  assigned_department: string | null
  worker_visible_summary: string | null
  first_response_due_at: string | null
  resolution_due_at: string | null
  created_at: string
  worker?: { id?: string; full_name?: string; full_name_en?: string | null; member_no?: string } | null
  events?: Array<{ id: string; event_type: string; worker_visible: boolean; body: Record<string, unknown> | null; created_at: string }> | null
}

export interface StaffImmigrationCase {
  id: string
  case_type: string
  official_authority: string | null
  official_reference: string | null
  deadline_at: string | null
  appointment_at: string | null
  status: string
  required_documents: unknown
  decision_summary: string | null
  worker?: { full_name?: string; full_name_en?: string | null; member_no?: string } | null
}

export interface StaffAuditEvent {
  id: string
  actor_role: string | null
  action: string
  entity_type: string
  severity: string
  metadata: Record<string, unknown> | null
  occurred_at: string
}

interface Props {
  locale: string
  role: StayCareRole
  capabilities: StayCareRoleCapabilities
  userEmail?: string
  applications: StaffApplication[]
  workers: StaffWorker[]
  documents: StaffDocument[]
  tickets: StaffTicket[]
  immigrationCases: StaffImmigrationCase[]
  auditEvents: StaffAuditEvent[]
  environment: EnvironmentReport
  databaseStatus: { connected: boolean; tenantCount: number }
}

function localizedValue(value: Record<string, string> | string | undefined, language: StayCarePreferredLanguage) {
  if (!value) return "Service"
  if (typeof value === "string") return value
  if (language === "ta") return value.ta || translateStayCareTamil(value.en || value.ko || "Service")
  return value[language] || value.en || value.ko || value.si || "Service"
}

const dateLocale: Record<StayCarePreferredLanguage, string> = { ko: "ko-KR", en: "en-US", si: "si-LK", ta: "ta-LK" }

function formatLocalizedDate(value: string | null | undefined, language: StayCarePreferredLanguage) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(dateLocale[language], { year: "numeric", month: "short", day: "numeric", hour: value.includes("T") ? "2-digit" : undefined, minute: value.includes("T") ? "2-digit" : undefined }).format(new Date(value))
  } catch {
    return value
  }
}

function statusClass(status: string) {
  if (["fulfilled", "approved", "completed", "resolved", "closed", "active"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (["rejected", "cancelled", "failed", "expired", "P0", "P1"].includes(status)) return "border-red-200 bg-red-50 text-red-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function Badge({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(value)}`}>{value.replaceAll("_", " ")}</span>
}

function Panel({ title, description, action, children }: { title: string; description?: string; action?: ReactNode; children: ReactNode }) {
  return <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-black">{title}</h2>{description ? <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p> : null}</div>{action}</div>{children}</section>
}

const roleFocus: Record<StayCareRole, { title: string; description: string; defaultView: View }> = {
  worker: { title: "근로자", description: "근로자 앱 계정입니다.", defaultView: "overview" },
  sejoong_admin: { title: "통합 운영 총괄", description: "전체 테넌트, 인력, 신청, 문서, 티켓, 환경설정을 관리합니다.", defaultView: "overview" },
  sejoong_lawyer: { title: "법률·노무 검토 데스크", description: "법률, 노동, 인권 및 고위험 체류 사건을 검토합니다.", defaultView: "tickets" },
  immigration_manager: { title: "출입국 업무 데스크", description: "외국인등록, 체류연장, 주소·사업장 변경과 귀국행정을 관리합니다.", defaultView: "immigration" },
  operator_manager: { title: "운영관리 센터", description: "온보딩, SLA, 공급자 전달과 전체 처리량을 관리합니다.", defaultView: "overview" },
  operator_agent: { title: "고객운영 처리함", description: "근로자 문의, 서류 보완, 신청 진행과 후속안내를 처리합니다.", defaultView: "applications" },
  employer_admin: { title: "고용주", description: "협력기관 포털 계정입니다.", defaultView: "overview" },
  institution_admin: { title: "현지기관", description: "협력기관 포털 계정입니다.", defaultView: "overview" },
  provider_agent: { title: "제휴사", description: "협력기관 포털 계정입니다.", defaultView: "applications" },
  auditor: { title: "감사·품질관리", description: "전체 운영기록을 읽기 전용으로 검토합니다.", defaultView: "audit" },
}

export default function StayCareStaffWorkspace({
  locale,
  role,
  capabilities,
  userEmail,
  applications: initialApplications,
  workers: initialWorkers,
  documents: initialDocuments,
  tickets: initialTickets,
  immigrationCases,
  auditEvents,
  environment,
  databaseStatus,
}: Props) {
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const router = useRouter()
  const localized = (value: Record<string, string> | string | undefined) => localizedValue(value, language)
  const formatDate = (value: string | null | undefined) => formatLocalizedDate(value, language)
  const focus = roleFocus[role]
  const [view, setView] = useState<View>(focus.defaultView)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [applications, setApplications] = useState(initialApplications)
  const [workers, setWorkers] = useState(initialWorkers)
  const [documents, setDocuments] = useState(initialDocuments)
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedApplication, setSelectedApplication] = useState<StaffApplication | null>(null)
  const [selectedWorker, setSelectedWorker] = useState<StaffWorker | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<StaffDocument | null>(null)
  const [selectedTicket, setSelectedTicket] = useState<StaffTicket | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const filteredApplications = useMemo(() => applications.filter((item) => {
    const haystack = `${item.application_no} ${item.worker?.member_no || ""} ${item.worker?.full_name_en || item.worker?.full_name || ""} ${localized(item.service?.name)} ${item.status}`.toLowerCase()
    const roleRelevant = role === "sejoong_lawyer" ? ["immigration", "labor", "legal", "human_rights"].includes(item.service?.category || "") : role === "immigration_manager" ? item.service?.category === "immigration" : true
    return roleRelevant && haystack.includes(query.toLowerCase())
  }), [applications, query, role])

  const filteredWorkers = workers.filter((item) => `${item.member_no} ${item.full_name} ${item.full_name_en || ""} ${item.visa_type || ""} ${item.employer?.name || ""}`.toLowerCase().includes(query.toLowerCase()))
  const filteredDocuments = documents.filter((item) => `${item.original_filename} ${item.document_type} ${item.worker?.member_no || ""} ${item.worker?.full_name_en || item.worker?.full_name || ""}`.toLowerCase().includes(query.toLowerCase()))
  const filteredTickets = tickets.filter((item) => {
    const haystack = `${item.ticket_no} ${item.title} ${item.category} ${item.worker?.member_no || ""} ${item.worker?.full_name_en || item.worker?.full_name || ""}`.toLowerCase()
    const roleRelevant = role === "sejoong_lawyer" ? ["labor", "legal", "human_rights", "emergency_followup"].includes(item.category) || ["P0", "P1"].includes(item.priority) : role === "immigration_manager" ? item.category === "immigration" : true
    return roleRelevant && haystack.includes(query.toLowerCase())
  })

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = `/${locale}/staycare/login`
  }

  const updateApplication = async (form: FormData) => {
    if (!selectedApplication || !capabilities.canManageApplications) return
    setBusy(true); setError("")
    try {
      const response = await fetch(`/api/staycare/admin/applications/${selectedApplication.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: form.get("status"), workerVisibleMessage: form.get("workerVisibleMessage"), externalReference: form.get("externalReference"), rejectionReason: form.get("rejectionReason") }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "신청 처리에 실패했습니다.")
      setApplications((items) => items.map((item) => item.id === selectedApplication.id ? { ...item, ...data.application } : item))
      setSelectedApplication(null); router.refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : "신청 처리에 실패했습니다.") } finally { setBusy(false) }
  }

  const updateDocument = async (form: FormData) => {
    if (!selectedDocument || !capabilities.canManageDocuments) return
    setBusy(true); setError("")
    try {
      const response = await fetch(`/api/staycare/admin/documents/${selectedDocument.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: form.get("status"), rejectionReason: form.get("rejectionReason") }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "문서 검수에 실패했습니다.")
      setDocuments((items) => items.map((item) => item.id === selectedDocument.id ? { ...item, ...data.document } : item))
      setSelectedDocument(null); router.refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : "문서 검수에 실패했습니다.") } finally { setBusy(false) }
  }

  const updateTicket = async (form: FormData) => {
    if (!selectedTicket || !capabilities.canManageTickets) return
    setBusy(true); setError("")
    try {
      const response = await fetch(`/api/staycare/admin/tickets/${selectedTicket.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: form.get("status"), priority: form.get("priority"), assignedDepartment: form.get("assignedDepartment"), workerVisibleSummary: form.get("workerVisibleSummary"), internalNote: form.get("internalNote") }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "티켓 처리에 실패했습니다.")
      setTickets((items) => items.map((item) => item.id === selectedTicket.id ? { ...item, ...data.ticket } : item))
      setSelectedTicket(null); router.refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : "티켓 처리에 실패했습니다.") } finally { setBusy(false) }
  }

  const updateWorker = async (form: FormData) => {
    if (!selectedWorker || !capabilities.canManageWorkers) return
    setBusy(true); setError("")
    try {
      const due = String(form.get("nextActionDueAt") || "")
      const response = await fetch(`/api/staycare/admin/workers/${selectedWorker.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: form.get("status"), currentPhase: form.get("currentPhase"), nextAction: form.get("nextAction"), nextActionDueAt: due ? new Date(due).toISOString() : "", visaExpiresAt: form.get("visaExpiresAt"), passportExpiresAt: form.get("passportExpiresAt") }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "근로자 상태 변경에 실패했습니다.")
      setWorkers((items) => items.map((item) => item.id === selectedWorker.id ? { ...item, ...data.worker } : item))
      setSelectedWorker(null); router.refresh()
    } catch (caught) { setError(caught instanceof Error ? caught.message : "근로자 상태 변경에 실패했습니다.") } finally { setBusy(false) }
  }

  const navigation: Array<{ id: View; label: string; icon: typeof Gauge; show: boolean }> = [
    { id: "overview", label: "대시보드", icon: Gauge, show: true },
    { id: "applications", label: "서비스 신청", icon: Send, show: capabilities.canSeeOperationsQueue || capabilities.canSeeLegalQueue || capabilities.canSeeImmigrationQueue },
    { id: "workers", label: "근로자", icon: UsersRound, show: true },
    { id: "documents", label: "문서 검수", icon: FileSearch, show: true },
    { id: "tickets", label: "상담·티켓", icon: TicketCheck, show: true },
    { id: "immigration", label: "출입국 사건", icon: Landmark, show: capabilities.canSeeImmigrationQueue || capabilities.canSeeLegalQueue },
    { id: "audit", label: "감사기록", icon: Eye, show: role === "sejoong_admin" || role === "operator_manager" || role === "auditor" },
    { id: "environment", label: "운영환경", icon: Settings2, show: capabilities.canSeeEnvironment },
  ]

  const metrics = [
    [UsersRound, "활성 근로자", workers.filter((item) => item.status !== "closed").length],
    [Send, "진행 중 신청", applications.filter((item) => !["fulfilled", "cancelled", "rejected"].includes(item.status)).length],
    [FileSearch, "검수 대기", documents.filter((item) => ["review_required", "scanning", "uploaded"].includes(item.status)).length],
    [AlertTriangle, "P0/P1 티켓", tickets.filter((item) => ["P0", "P1"].includes(item.priority) && !["resolved", "closed"].includes(item.status)).length],
  ] as const

  const renderOverview = () => <div className="space-y-6"><section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8"><div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{getStayCareRoleLabel(role, language)}</p><h1 className="mt-3 text-3xl font-black">{focus.title}</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{focus.description}</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300"><p className="font-black text-white">{userEmail}</p><p className="mt-2">Tenant {databaseStatus.tenantCount} · {capabilities.readOnly ? "읽기 전용" : "처리 권한"}</p></div></div></section><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([Icon, label, value]) => <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100"><Icon className="h-5 w-5" /></span><span className="text-3xl font-black">{value}</span></div><p className="mt-4 text-sm font-bold text-slate-500">{label}</p></article>)}</section><div className="grid gap-6 xl:grid-cols-2"><Panel title="우선 처리 신청"><div className="divide-y divide-slate-100">{filteredApplications.slice(0, 6).map((item) => <button key={item.id} onClick={() => setSelectedApplication(item)} className="flex w-full items-center gap-3 p-4 text-left"><div className="min-w-0 flex-1"><p className="font-black">{localized(item.service?.name)}</p><p className="mt-1 text-xs text-slate-500">{item.application_no} · {item.worker?.member_no}</p></div><Badge value={item.status} /></button>)}{!filteredApplications.length ? <p className="p-5 text-sm text-slate-500">처리할 신청이 없습니다.</p> : null}</div></Panel><Panel title="긴급·지연 티켓"><div className="divide-y divide-slate-100">{filteredTickets.slice(0, 6).map((item) => <button key={item.id} onClick={() => setSelectedTicket(item)} className="flex w-full items-center gap-3 p-4 text-left"><div className="min-w-0 flex-1"><p className="font-black">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.ticket_no} · {item.worker?.member_no}</p></div><Badge value={item.priority} /></button>)}{!filteredTickets.length ? <p className="p-5 text-sm text-slate-500">처리할 티켓이 없습니다.</p> : null}</div></Panel></div></div>

  const renderApplications = () => <Panel title="서비스 신청 처리함" description="접수부터 기관·제휴사 전달, 보완, 완료까지 같은 상태체계로 관리합니다."><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">신청</th><th className="px-5 py-3">근로자</th><th className="px-5 py-3">서비스</th><th className="px-5 py-3">접수일</th><th className="px-5 py-3">상태</th><th className="px-5 py-3">처리</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredApplications.map((item) => <tr key={item.id}><td className="px-5 py-4 font-black">{item.application_no}</td><td className="px-5 py-4"><p className="font-bold">{item.worker?.full_name_en || item.worker?.full_name}</p><p className="text-xs text-slate-400">{item.worker?.member_no}</p></td><td className="px-5 py-4"><p className="font-bold">{localized(item.service?.name)}</p><p className="text-xs text-slate-400">{item.service?.category}</p></td><td className="px-5 py-4 text-slate-500">{formatDate(item.submitted_at)}</td><td className="px-5 py-4"><Badge value={item.status} /></td><td className="px-5 py-4"><button onClick={() => setSelectedApplication(item)} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white">{capabilities.canManageApplications ? "처리" : "보기"}</button></td></tr>)}{!filteredApplications.length ? <tr><td colSpan={6} className="p-10 text-center text-slate-500">검색 결과가 없습니다.</td></tr> : null}</tbody></table></div></Panel>

  const renderWorkers = () => <Panel title="근로자 생애주기" description="입국 전 준비부터 정착, 체류, 귀국까지 다음 행동과 기한을 관리합니다."><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">근로자</th><th className="px-5 py-3">고용주·기관</th><th className="px-5 py-3">단계</th><th className="px-5 py-3">준비도</th><th className="px-5 py-3">다음 행동</th><th className="px-5 py-3">관리</th></tr></thead><tbody className="divide-y divide-slate-100">{filteredWorkers.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-black">{item.full_name_en || item.full_name}</p><p className="text-xs text-slate-400">{item.member_no} · {item.visa_type || "Visa pending"}</p></td><td className="px-5 py-4"><p className="font-bold">{item.employer?.name || "—"}</p><p className="text-xs text-slate-400">{item.training?.name || "—"}</p></td><td className="px-5 py-4"><Badge value={item.current_phase} /><p className="mt-2 text-xs text-slate-400">{item.status}</p></td><td className="px-5 py-4"><div className="w-28"><div className="flex justify-between text-xs"><span>Profile</span><span>{item.profile_completion}%</span></div><div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#bb271a]" style={{ width: `${item.profile_completion}%` }} /></div></div></td><td className="max-w-xs px-5 py-4 text-slate-600">{item.next_action || "—"}<p className="mt-1 text-xs text-slate-400">{formatDate(item.next_action_due_at)}</p></td><td className="px-5 py-4"><button onClick={() => setSelectedWorker(item)} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black">{capabilities.canManageWorkers ? "관리" : "보기"}</button></td></tr>)}</tbody></table></div></Panel>

  const renderDocuments = () => <Panel title="문서 검수함" description="승인·반려 사유는 즉시 근로자 알림으로 전달됩니다."><div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">{filteredDocuments.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-5"><div className="flex justify-between"><FileText className="h-6 w-6 text-violet-700" /><Badge value={item.status} /></div><h3 className="mt-4 truncate font-black">{item.original_filename}</h3><p className="mt-2 text-xs text-slate-500">{item.worker?.full_name_en || item.worker?.full_name} · {item.worker?.member_no}</p><p className="mt-1 text-xs text-slate-400">{item.document_type} · {(item.byte_size / 1024 / 1024).toFixed(2)} MB</p>{item.rejection_reason ? <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs text-red-800">{item.rejection_reason}</p> : null}<div className="mt-4 flex gap-2"><a href={`/api/staycare/documents/${item.id}/download?redirect=1`} className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-black">열기</a><button onClick={() => setSelectedDocument(item)} className="flex-1 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white">{capabilities.canManageDocuments ? "검수" : "보기"}</button></div></article>)}{!filteredDocuments.length ? <p className="text-sm text-slate-500">검색 결과가 없습니다.</p> : null}</div></Panel>

  const renderTickets = () => <Panel title="상담·티켓 SLA" description="우선순위, 담당부서, 근로자 안내와 내부기록을 함께 관리합니다."><div className="divide-y divide-slate-100">{filteredTickets.map((item) => <button key={item.id} onClick={() => setSelectedTicket(item)} className="grid w-full gap-3 p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-black">{item.title}</h3><Badge value={item.priority} /></div><p className="mt-1 text-xs text-slate-500">{item.ticket_no} · {item.category} · {item.worker?.member_no}</p><p className="mt-2 text-sm text-slate-600">{item.worker_visible_summary || item.description}</p><p className="mt-2 text-xs text-slate-400">1차 응답 {formatDate(item.first_response_due_at)} · 해결 {formatDate(item.resolution_due_at)}</p></div><Badge value={item.status} /></button>)}{!filteredTickets.length ? <p className="p-5 text-sm text-slate-500">검색 결과가 없습니다.</p> : null}</div></Panel>

  const renderImmigration = () => <Panel title="출입국 사건·기한" description="공식 결정은 관계기관이 수행하며 StayCare는 자료와 기한을 관리합니다."><div className="divide-y divide-slate-100">{immigrationCases.map((item) => <article key={item.id} className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><p className="font-black">{item.case_type.replaceAll("_", " ")}</p><p className="mt-1 text-sm text-slate-600">{item.worker?.full_name_en || item.worker?.full_name} · {item.worker?.member_no}</p><p className="mt-2 text-xs text-slate-400">기관 {item.official_authority || "미정"} · 예약 {formatDate(item.appointment_at)} · 기한 {formatDate(item.deadline_at)}</p>{item.decision_summary ? <p className="mt-2 text-sm text-slate-600">{item.decision_summary}</p> : null}</div><Badge value={item.status} /></article>)}{!immigrationCases.length ? <p className="p-5 text-sm text-slate-500">등록된 사건이 없습니다.</p> : null}</div></Panel>

  const renderAudit = () => <Panel title="감사·변경기록" description="누가 언제 어떤 상태를 변경했는지 확인합니다. 감사자는 수정할 수 없습니다."><div className="divide-y divide-slate-100">{auditEvents.map((item) => <article key={item.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="font-black">{item.action}</p><Badge value={item.severity} /></div><p className="mt-1 text-xs text-slate-500">{item.actor_role || "system"} · {item.entity_type}</p><pre className="mt-3 max-h-28 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[11px] leading-5 text-slate-600">{JSON.stringify(item.metadata || {}, null, 2)}</pre></div><p className="text-xs text-slate-400">{formatDate(item.occurred_at)}</p></article>)}</div></Panel>

  const renderEnvironment = () => { const missing = environment.items.filter((item) => item.required && item.state !== "configured"); return <div className="space-y-5"><section className="grid gap-4 md:grid-cols-3"><article className="rounded-3xl border bg-white p-5"><Database className="h-5 w-5 text-emerald-600" /><p className="mt-3 text-2xl font-black">{databaseStatus.connected ? "Connected" : "Unavailable"}</p><p className="text-xs text-slate-500">Tenant {databaseStatus.tenantCount}</p></article><article className="rounded-3xl border bg-white p-5"><Server className="h-5 w-5 text-blue-600" /><p className="mt-3 text-2xl font-black">{environment.summary.coreConfigured}/{environment.summary.coreTotal}</p><p className="text-xs text-slate-500">핵심 인프라</p></article><article className="rounded-3xl border bg-white p-5"><ShieldCheck className="h-5 w-5 text-violet-600" /><p className="mt-3 text-2xl font-black">{environment.summary.percentage}%</p><p className="text-xs text-slate-500">상용 준비도</p></article></section>{missing.length ? <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><ShieldAlert className="h-5 w-5" /><div><p className="font-black">필수 설정 {missing.length}개 미완료</p><p className="mt-1">{missing.map((item) => item.label).join(" · ")}</p></div></div> : null}<Panel title="환경변수 상태"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">서비스</th><th className="px-5 py-3">환경값</th><th className="px-5 py-3">공개정보</th><th className="px-5 py-3">상태</th></tr></thead><tbody className="divide-y divide-slate-100">{environment.items.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-black">{item.label}</p><p className="mt-1 text-xs text-slate-500">{item.detail}</p></td><td className="px-5 py-4">{item.keys.map((key) => <code key={key} className="mr-1 rounded bg-slate-100 px-2 py-1 text-[11px]">{key}</code>)}</td><td className="px-5 py-4 text-xs">{item.publicValue || "비밀값 비공개"}</td><td className="px-5 py-4"><Badge value={item.state} /></td></tr>)}</tbody></table></div></Panel></div> }

  const renderView = () => {
    if (view === "overview") return renderOverview()
    if (view === "applications") return renderApplications()
    if (view === "workers") return renderWorkers()
    if (view === "documents") return renderDocuments()
    if (view === "tickets") return renderTickets()
    if (view === "immigration") return renderImmigration()
    if (view === "audit") return renderAudit()
    return renderEnvironment()
  }

  return <div className="min-h-screen bg-[#f4f5f7] text-slate-950"><aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}><div className="flex h-20 items-center justify-between border-b border-white/10 px-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</span><div><p className="font-black">StayCare Staff</p><p className="text-[11px] text-slate-400">{getStayCareRoleLabel(role, language)}</p></div></div><button onClick={() => setMobileOpen(false)} className="lg:hidden"><X className="h-5 w-5" /></button></div><nav className="space-y-1 overflow-y-auto p-3 pb-24">{navigation.filter((item) => item.show).map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${view === item.id ? "bg-[#bb271a]" : "text-slate-300 hover:bg-white/5"}`}><Icon className="h-5 w-5" />{item.label}</button> })}</nav><button onClick={signOut} className="absolute inset-x-3 bottom-3 flex items-center rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300"><LogOut className="mr-3 h-5 w-5" />로그아웃</button></aside><div className="lg:pl-72"><header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"><div className="flex items-center gap-3"><button onClick={() => setMobileOpen(true)} className="rounded-xl border p-2 lg:hidden"><Menu className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb271a]">Sejoong StayCare</p><h1 className="mt-1 text-lg font-black">{navigation.find((item) => item.id === view)?.label}</h1></div></div><div className="flex items-center gap-2"><StayCareLanguageSwitcher value={language} onChange={setLanguage} compact /><div className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회원·신청·티켓 검색" className="w-72 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm" /></div><button onClick={() => router.refresh()} className="rounded-xl border p-2.5"><RefreshCw className="h-5 w-5" /></button></div></div></header><main className="p-4 sm:p-6 lg:p-8">{error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}{capabilities.readOnly ? <div className="mb-5 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950"><Eye className="h-5 w-5" /><div><p className="font-black">읽기 전용 계정</p><p className="mt-1">데이터와 감사기록을 조회할 수 있지만 상태·문서·티켓은 변경할 수 없습니다.</p></div></div> : null}{renderView()}</main></div>

  {selectedApplication ? <Drawer title={selectedApplication.application_no} onClose={() => setSelectedApplication(null)}><div className="space-y-5"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="font-black">{localized(selectedApplication.service?.name)}</p><p className="mt-2 text-sm text-slate-300">{selectedApplication.worker?.full_name_en || selectedApplication.worker?.full_name} · {selectedApplication.worker?.member_no}</p><div className="mt-3"><Badge value={selectedApplication.status} /></div></div><pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6">{JSON.stringify(selectedApplication.submitted_data || {}, null, 2)}</pre>{capabilities.canManageApplications ? <form action={updateApplication} className="space-y-4"><select name="status" defaultValue={selectedApplication.status === "submitted" ? "reviewing" : selectedApplication.status} className="w-full rounded-xl border px-4 py-3"><option value="reviewing">reviewing</option><option value="waiting_worker">waiting_worker</option><option value="waiting_authority">waiting_authority</option><option value="waiting_provider">waiting_provider</option><option value="approved">approved</option><option value="fulfilled">fulfilled</option><option value="rejected">rejected</option><option value="cancelled">cancelled</option></select><input name="externalReference" defaultValue={selectedApplication.external_reference || ""} placeholder="기관·제휴사 참조번호" className="w-full rounded-xl border px-4 py-3" /><textarea name="workerVisibleMessage" placeholder="근로자에게 보일 안내" className="min-h-28 w-full rounded-xl border px-4 py-3" /><textarea name="rejectionReason" placeholder="반려 사유" className="min-h-24 w-full rounded-xl border px-4 py-3" /><SubmitButton busy={busy} label="저장 및 근로자 통지" /></form> : null}</div></Drawer> : null}

  {selectedDocument ? <Drawer title="문서 검수" onClose={() => setSelectedDocument(null)}><div className="space-y-5"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="font-black">{selectedDocument.original_filename}</p><p className="mt-2 text-sm text-slate-300">{selectedDocument.worker?.full_name_en || selectedDocument.worker?.full_name} · {selectedDocument.worker?.member_no}</p></div><a href={`/api/staycare/documents/${selectedDocument.id}/download?redirect=1`} target="_blank" className="block rounded-xl border px-4 py-3 text-center font-black">보안 파일 열기</a>{capabilities.canManageDocuments ? <form action={updateDocument} className="space-y-4"><select name="status" defaultValue="approved" className="w-full rounded-xl border px-4 py-3"><option value="approved">승인</option><option value="rejected">반려</option><option value="review_required">재검토 대기</option></select><textarea name="rejectionReason" placeholder="반려·보완 사유" className="min-h-32 w-full rounded-xl border px-4 py-3" /><SubmitButton busy={busy} label="검수 결과 저장" /></form> : null}</div></Drawer> : null}

  {selectedTicket ? <Drawer title={selectedTicket.ticket_no} onClose={() => setSelectedTicket(null)}><div className="space-y-5"><div className="rounded-2xl bg-slate-950 p-5 text-white"><div className="flex justify-between gap-3"><p className="font-black">{selectedTicket.title}</p><Badge value={selectedTicket.priority} /></div><p className="mt-3 text-sm text-slate-300">{selectedTicket.worker?.full_name_en || selectedTicket.worker?.full_name} · {selectedTicket.worker?.member_no}</p></div><p className="rounded-2xl bg-slate-50 p-4 text-sm leading-7">{selectedTicket.description}</p>{capabilities.canManageTickets ? <form action={updateTicket} className="space-y-4"><div className="grid grid-cols-2 gap-3"><select name="status" defaultValue={selectedTicket.status} className="rounded-xl border px-4 py-3"><option value="triaged">triaged</option><option value="assigned">assigned</option><option value="in_progress">in_progress</option><option value="waiting">waiting</option><option value="resolved">resolved</option><option value="closed">closed</option></select><select name="priority" defaultValue={selectedTicket.priority} className="rounded-xl border px-4 py-3"><option value="P0">P0</option><option value="P1">P1</option><option value="P2">P2</option><option value="P3">P3</option></select></div><input name="assignedDepartment" defaultValue={selectedTicket.assigned_department || ""} placeholder="담당부서" className="w-full rounded-xl border px-4 py-3" /><textarea name="workerVisibleSummary" defaultValue={selectedTicket.worker_visible_summary || ""} placeholder="근로자에게 보일 안내" className="min-h-28 w-full rounded-xl border px-4 py-3" /><textarea name="internalNote" placeholder="내부 처리기록" className="min-h-24 w-full rounded-xl border px-4 py-3" /><SubmitButton busy={busy} label="티켓 처리 저장" /></form> : null}</div></Drawer> : null}

  {selectedWorker ? <Drawer title={selectedWorker.member_no} onClose={() => setSelectedWorker(null)}><div className="space-y-5"><div className="rounded-2xl bg-slate-950 p-5 text-white"><p className="text-xl font-black">{selectedWorker.full_name_en || selectedWorker.full_name}</p><p className="mt-2 text-sm text-slate-300">{selectedWorker.visa_type} · {selectedWorker.occupation}</p></div>{capabilities.canManageWorkers ? <form action={updateWorker} className="space-y-4"><div className="grid grid-cols-2 gap-3"><select name="status" defaultValue={selectedWorker.status} className="rounded-xl border px-4 py-3">{["invited","preparing","official_process","pre_departure","arrived","settling","active","renewal","returning","returned","closed"].map((value) => <option key={value}>{value}</option>)}</select><select name="currentPhase" defaultValue={selectedWorker.current_phase} className="rounded-xl border px-4 py-3">{["prepare","official","pre_departure","arrival","settlement","living","renewal","return"].map((value) => <option key={value}>{value}</option>)}</select></div><textarea name="nextAction" defaultValue={selectedWorker.next_action || ""} placeholder="다음 행동" className="min-h-28 w-full rounded-xl border px-4 py-3" /><label className="block text-sm font-black">다음 행동 기한<input name="nextActionDueAt" type="datetime-local" className="mt-2 w-full rounded-xl border px-4 py-3" /></label><div className="grid grid-cols-2 gap-3"><label className="text-sm font-black">비자 만료<input name="visaExpiresAt" type="date" defaultValue={selectedWorker.visa_expires_at || ""} className="mt-2 w-full rounded-xl border px-4 py-3" /></label><label className="text-sm font-black">여권 만료<input name="passportExpiresAt" type="date" defaultValue={selectedWorker.passport_expires_at || ""} className="mt-2 w-full rounded-xl border px-4 py-3" /></label></div><SubmitButton busy={busy} label="생애주기 저장 및 알림" /></form> : null}</div></Drawer> : null}
  </div>
}

function Drawer({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/50"><button className="absolute inset-0" onClick={onClose} aria-label="닫기" /><aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white"><div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-5"><h2 className="text-xl font-black">{title}</h2><button onClick={onClose} className="rounded-xl border p-2"><X className="h-5 w-5" /></button></div><div className="p-5">{children}</div></aside></div>
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return <button disabled={busy} className="inline-flex w-full items-center justify-center rounded-xl bg-[#bb271a] px-4 py-4 font-black text-white disabled:opacity-50">{busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}{label}</button>
}
