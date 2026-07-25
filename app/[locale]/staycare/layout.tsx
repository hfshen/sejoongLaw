"use client"

import type { ReactNode } from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Loader2,
  RefreshCw,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
  X,
  Zap,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Surface = "worker" | "staff" | "partner"
type Language = "ko" | "en" | "si"
type Priority = "critical" | "high" | "normal" | "waiting"
type Tab = "today" | "timeline" | "automation"
type Row = Record<string, unknown>

interface ActionItem {
  id: string
  title: string
  detail: string
  priority: Priority
  view: string
  dueAt?: string | null
}

interface TimelineItem {
  id: string
  title: string
  detail: string
  at: string
  view: string
}

interface Snapshot {
  loading: boolean
  error: string
  userId: string
  name: string
  actions: ActionItem[]
  timeline: TimelineItem[]
  checked: number
  waiting: number
}

interface Draft {
  savedAt: string
  fields: Record<string, string | boolean>
}

const initial: Snapshot = {
  loading: true,
  error: "",
  userId: "",
  name: "",
  actions: [],
  timeline: [],
  checked: 0,
  waiting: 0,
}

const messages = {
  ko: {
    label: "StayCare 자동화",
    checking: "현재 상황과 다음 업무를 자동 점검 중입니다",
    today: "오늘 할 일",
    timeline: "통합 타임라인",
    automation: "자동화 상태",
    noTask: "지금 직접 처리할 일이 없습니다.",
    noTaskDetail: "세중·기관·제휴사 처리 단계는 계속 자동 추적합니다.",
    urgent: "긴급·기한임박",
    waiting: "외부 처리 대기",
    checked: "자동 점검",
    open: "자동화 허브 열기",
    act: "바로 처리",
    refresh: "다시 점검",
    due: "기한",
    saved: "입력 자동 저장됨",
    saving: "입력 저장 중",
    draft: "이어서 작성할 초안이 있습니다",
    restore: "초안 복원",
    clear: "초안 삭제",
    online: "온라인 · 변경사항 자동저장",
    offline: "오프라인 · 이 기기에 임시저장",
    active: "자동 감시 중",
    rules: [
      "기한·만료 자동감지",
      "신청·서류 상태 추적",
      "SLA·미배정 업무 감지",
      "민감정보 제외 입력 자동저장",
    ],
  },
  en: {
    label: "StayCare automation",
    checking: "Automatically checking your status and next work",
    today: "Today’s actions",
    timeline: "Unified timeline",
    automation: "Automation status",
    noTask: "There is nothing you need to do right now.",
    noTaskDetail: "StayCare continues tracking Sejoong, authority and provider work.",
    urgent: "Urgent / due soon",
    waiting: "Waiting on others",
    checked: "Automated checks",
    open: "Open automation hub",
    act: "Open action",
    refresh: "Check again",
    due: "Due",
    saved: "Input autosaved",
    saving: "Saving input",
    draft: "A saved draft is ready to continue",
    restore: "Restore draft",
    clear: "Delete draft",
    online: "Online · changes autosave",
    offline: "Offline · saved on this device",
    active: "Monitoring",
    rules: [
      "Deadline and expiry detection",
      "Application and document tracking",
      "SLA and unassigned-work detection",
      "Safe form autosave",
    ],
  },
  si: {
    label: "StayCare ස්වයංක්‍රීයකරණය",
    checking: "ඔබගේ තත්ත්වය සහ ඊළඟ කාර්යය ස්වයංක්‍රීයව පරීක්ෂා කරයි",
    today: "අද කළ යුතු දේ",
    timeline: "එකම කාලරේඛාව",
    automation: "ස්වයංක්‍රීය තත්ත්වය",
    noTask: "දැන් ඔබ විසින් කළ යුතු කාර්යයක් නැත.",
    noTaskDetail: "Sejoong, ආයතන සහ සේවා සපයන්නන්ගේ වැඩ දිගටම නිරීක්ෂණය කරයි.",
    urgent: "හදිසි / කාලය ළඟයි",
    waiting: "අන් අයගේ ක්‍රියාව බලා සිටී",
    checked: "ස්වයංක්‍රීය පරීක්ෂණ",
    open: "ස්වයංක්‍රීය මධ්‍යස්ථානය විවෘත කරන්න",
    act: "දැන් විවෘත කරන්න",
    refresh: "නැවත පරීක්ෂා කරන්න",
    due: "කාලසීමාව",
    saved: "ඇතුළත් කිරීම ස්වයංක්‍රීයව සුරකින ලදී",
    saving: "සුරකිමින්",
    draft: "සුරැකි කෙටුම්පතක් ඇත",
    restore: "කෙටුම්පත නැවත ලබා ගන්න",
    clear: "කෙටුම්පත මකන්න",
    online: "අන්තර්ජාලය ඇත · ස්වයංක්‍රීයව සුරකියි",
    offline: "අන්තර්ජාලය නැත · උපකරණයේ සුරකියි",
    active: "නිරීක්ෂණය කරයි",
    rules: [
      "කාලසීමා සහ කල් ඉකුත්වීම",
      "අයදුම් සහ ලේඛන තත්ත්වය",
      "SLA සහ පවරා නැති වැඩ",
      "ආරක්ෂිත ස්වයංක්‍රීය සුරැකීම",
    ],
  },
} as const

const navLabels: Record<string, string[]> = {
  overview: ["홈", "현황", "Home", "Overview", "මුල් පිටුව", "සාරාංශය"],
  journey: ["내 준비과정", "My journey", "මගේ ගමන"],
  applications: [
    "신청현황",
    "신청",
    "서비스 처리",
    "Applications",
    "Service queue",
    "අයදුම්",
    "සේවා ඉල්ලීම්",
  ],
  services: ["원스톱 서비스", "One-stop services", "එක්-තැනක සේවා"],
  documents: ["내 서류", "서류", "Documents", "ලේඛන"],
  support: ["상담·도움", "상담", "Support", "සහාය"],
  profile: ["내 정보", "Profile", "මගේ තොරතුරු"],
  workers: ["근로자", "대상 근로자", "Workers", "සේවකයින්"],
  tickets: ["티켓", "상담", "Tickets"],
  audit: ["감사", "Audit"],
  coordination: [
    "세중 협업요청",
    "Coordinate with Sejoong",
    "Sejoong සමඟ සම්බන්ධ වීම",
  ],
}

function surfaceOf(path: string): Surface | null {
  if (path.includes("/staycare/app")) return "worker"
  if (path.includes("/staycare/admin")) return "staff"
  if (path.includes("/staycare/portal")) return "partner"
  return null
}

function row(value: unknown): Row | null {
  if (Array.isArray(value)) return row(value[0])
  return value && typeof value === "object" ? (value as Row) : null
}

function str(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback
}

function date(value: unknown) {
  return typeof value === "string" && !Number.isNaN(new Date(value).getTime())
    ? value
    : null
}

function days(value: unknown) {
  const valid = date(value)
  return valid
    ? Math.ceil((new Date(valid).getTime() - Date.now()) / 86_400_000)
    : null
}

function localeText(language: Language, values: Record<Language, string>) {
  return values[language]
}

function localized(value: unknown, language: Language, fallback: string) {
  if (typeof value === "string") return value
  const source = row(value)
  return source
    ? str(source[language]) ||
        str(source.en) ||
        str(source.ko) ||
        str(source.si) ||
        fallback
    : fallback
}

function format(value: string | null | undefined, language: Language) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(
      language === "ko" ? "ko-KR" : language === "si" ? "si-LK" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: value.includes("T") ? "2-digit" : undefined,
        minute: value.includes("T") ? "2-digit" : undefined,
      }
    ).format(new Date(value))
  } catch {
    return value
  }
}

function priorityFor(value: unknown): Priority {
  const remaining = days(value)
  if (remaining !== null && remaining <= 7) return "critical"
  if (remaining !== null && remaining <= 30) return "high"
  return "normal"
}

function priorityRank(value: Priority) {
  return { critical: 0, high: 1, normal: 2, waiting: 3 }[value]
}

function dedupe(items: ActionItem[]) {
  const ids = new Set<string>()
  return items
    .filter((item) => !ids.has(item.id) && Boolean(ids.add(item.id)))
    .sort((a, b) => priorityRank(a.priority) - priorityRank(b.priority))
}

function priorityStyle(priority: Priority) {
  if (priority === "critical") return "border-red-200 bg-red-50 text-red-800"
  if (priority === "high") return "border-amber-200 bg-amber-50 text-amber-800"
  if (priority === "waiting") return "border-sky-200 bg-sky-50 text-sky-800"
  return "border-emerald-200 bg-emerald-50 text-emerald-800"
}

function safeField(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
) {
  if (!element.name || element.disabled || element.closest("[data-automation-hub]")) {
    return false
  }
  if (
    element instanceof HTMLInputElement &&
    ["password", "file", "hidden"].includes(element.type)
  ) {
    return false
  }
  return !/(passport|registration|resident|account|card|phone|email|address|recipient|beneficiary|imei|identity|document|file|name)/i.test(
    element.name
  )
}

function setValue(
  element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  value: string | boolean
) {
  if (
    element instanceof HTMLInputElement &&
    ["checkbox", "radio"].includes(element.type)
  ) {
    element.checked = Boolean(value)
  } else {
    const prototype =
      element instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : element instanceof HTMLSelectElement
          ? HTMLSelectElement.prototype
          : HTMLInputElement.prototype
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(
      element,
      String(value)
    )
  }
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
}

export default function StayCareAutomationLayout({
  children,
}: {
  children: ReactNode
}) {
  const pathname = usePathname()
  const surface = surfaceOf(pathname)
  const supabase = useMemo(() => createClient(), [])
  const [language, setLanguage] = useState<Language>("ko")
  const [snapshot, setSnapshot] = useState<Snapshot>(initial)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>("today")
  const [online, setOnline] = useState(true)
  const [draftState, setDraftState] = useState<
    "idle" | "saving" | "saved" | "available"
  >("idle")
  const draftRef = useRef<Draft | null>(null)
  const draftKey = useRef("")
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const t = messages[language]

  useEffect(() => {
    const stored = window.localStorage.getItem("staycare_language")
    setLanguage(
      stored === "en" || stored === "si"
        ? stored
        : pathname.startsWith("/en/")
          ? "en"
          : "ko"
    )
  }, [pathname])

  const loadWorker = useCallback(
    async (userId: string): Promise<Snapshot> => {
      const { data: worker, error } = await supabase
        .from("staycare_workers")
        .select(
          "id, full_name, full_name_en, profile_completion, visa_expires_at, passport_expires_at, next_action, next_action_due_at"
        )
        .eq("auth_user_id", userId)
        .maybeSingle()
      if (error) throw error
      if (!worker) return { ...initial, loading: false, userId }

      const [
        stepsResult,
        appsResult,
        docsResult,
        noticesResult,
        ticketsResult,
      ] = await Promise.all([
        supabase
          .from("staycare_journey_steps")
          .select("id, title, description, status, due_at, created_at")
          .eq("worker_id", worker.id)
          .limit(100),
        supabase
          .from("staycare_service_applications")
          .select(
            "id, application_no, status, submitted_at, created_at, rejected_reason, service:staycare_service_catalog(name)"
          )
          .eq("worker_id", worker.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("staycare_documents")
          .select(
            "id, original_filename, status, rejection_reason, expiry_date, created_at"
          )
          .eq("worker_id", worker.id)
          .neq("status", "deleted")
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("staycare_notifications")
          .select("id, subject, body, read_at, created_at")
          .eq("worker_id", worker.id)
          .order("created_at", { ascending: false })
          .limit(100),
        supabase
          .from("staycare_tickets")
          .select(
            "id, ticket_no, title, status, priority, resolution_due_at, created_at"
          )
          .eq("worker_id", worker.id)
          .order("created_at", { ascending: false })
          .limit(100),
      ])

      const steps = (stepsResult.data || []) as Row[]
      const apps = (appsResult.data || []) as Row[]
      const docs = (docsResult.data || []) as Row[]
      const notices = (noticesResult.data || []) as Row[]
      const tickets = (ticketsResult.data || []) as Row[]
      const actions: ActionItem[] = []
      const timeline: TimelineItem[] = []

      if (str(worker.next_action)) {
        actions.push({
          id: "next",
          title: str(worker.next_action),
          detail: t.checking,
          priority: priorityFor(worker.next_action_due_at),
          view: "journey",
          dueAt: date(worker.next_action_due_at),
        })
      }

      steps.forEach((step) => {
        const status = str(step.status)
        if (["ready", "attention", "in_progress", "waiting_worker"].includes(status)) {
          actions.push({
            id: `step-${str(step.id)}`,
            title: localized(step.title, language, t.today),
            detail: localized(step.description, language, status),
            priority:
              status === "attention" || status === "waiting_worker"
                ? "critical"
                : priorityFor(step.due_at),
            view: "journey",
            dueAt: date(step.due_at),
          })
        }
      })

      apps.forEach((app) => {
        const service = row(app.service)
        const title = localized(service?.name, language, t.today)
        const status = str(app.status)
        if (["waiting_worker", "rejected"].includes(status)) {
          actions.push({
            id: `app-${str(app.id)}`,
            title,
            detail: str(app.rejected_reason) || status,
            priority: "critical",
            view: "applications",
          })
        }
        timeline.push({
          id: `app-t-${str(app.id)}`,
          title,
          detail: `${str(app.application_no)} · ${status}`,
          at: date(app.submitted_at) || date(app.created_at) || new Date().toISOString(),
          view: "applications",
        })
      })

      docs.forEach((doc) => {
        const remaining = days(doc.expiry_date)
        if (str(doc.status) === "rejected") {
          actions.push({
            id: `doc-${str(doc.id)}`,
            title: str(doc.original_filename),
            detail: str(doc.rejection_reason) || "rejected",
            priority: "critical",
            view: "documents",
          })
        } else if (remaining !== null && remaining <= 60) {
          actions.push({
            id: `expiry-${str(doc.id)}`,
            title: str(doc.original_filename),
            detail: localeText(language, {
              ko: `${remaining}일 후 만료`,
              en: `Expires in ${remaining} days`,
              si: `දින ${remaining} කින් කල් ඉකුත් වේ`,
            }),
            priority: remaining <= 14 ? "critical" : "high",
            view: "documents",
            dueAt: date(doc.expiry_date),
          })
        }
        timeline.push({
          id: `doc-t-${str(doc.id)}`,
          title: str(doc.original_filename),
          detail: str(doc.status),
          at: date(doc.created_at) || new Date().toISOString(),
          view: "documents",
        })
      })

      const unread = notices.filter((notice) => !notice.read_at)
      if (unread.length) {
        actions.push({
          id: "notices",
          title: localeText(language, {
            ko: `새 알림 ${unread.length}건`,
            en: `${unread.length} unread alerts`,
            si: `නොකියවූ දැනුම්දීම් ${unread.length}`,
          }),
          detail: str(unread[0].subject) || str(unread[0].body),
          priority: "high",
          view: "overview",
        })
      }
      notices.slice(0, 20).forEach((notice) =>
        timeline.push({
          id: `notice-${str(notice.id)}`,
          title: str(notice.subject, t.label),
          detail: str(notice.body),
          at: date(notice.created_at) || new Date().toISOString(),
          view: "overview",
        })
      )

      tickets.forEach((ticket) => {
        if (!["resolved", "closed"].includes(str(ticket.status))) {
          actions.push({
            id: `ticket-${str(ticket.id)}`,
            title: str(ticket.title),
            detail: `${str(ticket.ticket_no)} · ${str(ticket.status)}`,
            priority: ["P0", "P1"].includes(str(ticket.priority))
              ? "critical"
              : "waiting",
            view: "support",
            dueAt: date(ticket.resolution_due_at),
          })
        }
        timeline.push({
          id: `ticket-t-${str(ticket.id)}`,
          title: str(ticket.title),
          detail: `${str(ticket.ticket_no)} · ${str(ticket.status)}`,
          at: date(ticket.created_at) || new Date().toISOString(),
          view: "support",
        })
      })

      const visaDays = days(worker.visa_expires_at)
      if (visaDays !== null && visaDays <= 120) {
        actions.push({
          id: "visa",
          title: localeText(language, {
            ko: "체류기간 연장 준비",
            en: "Prepare stay extension",
            si: "රැඳී සිටීම දිගු කිරීමට සූදානම් වන්න",
          }),
          detail: localeText(language, {
            ko: `${visaDays}일 남음`,
            en: `${visaDays} days remaining`,
            si: `දින ${visaDays} ඉතිරි`,
          }),
          priority: visaDays <= 30 ? "critical" : "high",
          view: "services",
          dueAt: date(worker.visa_expires_at),
        })
      }
      const passportDays = days(worker.passport_expires_at)
      if (passportDays !== null && passportDays <= 180) {
        actions.push({
          id: "passport",
          title: localeText(language, {
            ko: "여권 유효기간 확인",
            en: "Check passport validity",
            si: "ගමන් බලපත්‍ර වලංගු කාලය බලන්න",
          }),
          detail: localeText(language, {
            ko: `${passportDays}일 남음`,
            en: `${passportDays} days remaining`,
            si: `දින ${passportDays} ඉතිරි`,
          }),
          priority: passportDays <= 60 ? "critical" : "high",
          view: "documents",
          dueAt: date(worker.passport_expires_at),
        })
      }
      if ((worker.profile_completion || 0) < 100) {
        actions.push({
          id: "profile",
          title: localeText(language, {
            ko: "내 정보 완성하기",
            en: "Complete profile",
            si: "තොරතුරු සම්පූර්ණ කරන්න",
          }),
          detail: `${worker.profile_completion || 0}%`,
          priority: "normal",
          view: "profile",
        })
      }

      const sorted = dedupe(actions)
      return {
        loading: false,
        error: "",
        userId,
        name: str(worker.full_name_en) || str(worker.full_name),
        actions: sorted,
        timeline: timeline
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
          .slice(0, 40),
        checked:
          steps.length + apps.length + docs.length + notices.length + tickets.length + 4,
        waiting: apps.filter((app) =>
          ["reviewing", "waiting_authority", "waiting_provider"].includes(
            str(app.status)
          )
        ).length,
      }
    },
    [language, supabase, t.checking, t.label, t.today]
  )

  const loadOperations = useCallback(
    async (userId: string, partner: boolean): Promise<Snapshot> => {
      const { data: memberships, error } = await supabase
        .from("staycare_memberships")
        .select("tenant_id, organization_id")
        .eq("user_id", userId)
        .eq("status", "active")
      if (error) throw error
      const membershipRows = (memberships || []) as Row[]
      const tenantIds = Array.from(
        new Set(membershipRows.map((item) => str(item.tenant_id)).filter(Boolean))
      )
      if (!tenantIds.length) return { ...initial, loading: false, userId }

      const [appsResult, docsResult, ticketsResult, workersResult] =
        await Promise.all([
          supabase
            .from("staycare_service_applications")
            .select(
              "id, application_no, status, submitted_at, assigned_user_id, assigned_organization_id, service:staycare_service_catalog(name), worker:staycare_workers(member_no, full_name, full_name_en)"
            )
            .in("tenant_id", tenantIds)
            .order("created_at", { ascending: false })
            .limit(300),
          partner
            ? Promise.resolve({ data: [] })
            : supabase
                .from("staycare_documents")
                .select(
                  "id, original_filename, status, created_at, worker:staycare_workers(member_no, full_name, full_name_en)"
                )
                .in("tenant_id", tenantIds)
                .neq("status", "deleted")
                .limit(300),
          supabase
            .from("staycare_tickets")
            .select(
              "id, ticket_no, title, status, priority, first_response_due_at, resolution_due_at, created_at, assigned_organization_id"
            )
            .in("tenant_id", tenantIds)
            .order("created_at", { ascending: false })
            .limit(300),
          supabase
            .from("staycare_workers")
            .select(
              "id, member_no, full_name, full_name_en, visa_expires_at, passport_expires_at, risk_score"
            )
            .in("tenant_id", tenantIds)
            .neq("status", "closed")
            .limit(500),
        ])

      const apps = (appsResult.data || []) as Row[]
      const docs = (docsResult.data || []) as Row[]
      const tickets = (ticketsResult.data || []) as Row[]
      const workers = (workersResult.data || []) as Row[]
      const actions: ActionItem[] = []
      const timeline: TimelineItem[] = []

      apps.forEach((app) => {
        const service = row(app.service)
        const worker = row(app.worker)
        const title = `${localized(service?.name, language, t.today)} · ${str(
          app.application_no
        )}`
        if (
          ["submitted", "reviewing", "waiting_provider", "waiting_worker"].includes(
            str(app.status)
          )
        ) {
          actions.push({
            id: `ops-app-${str(app.id)}`,
            title,
            detail: `${str(worker?.member_no)} ${
              str(worker?.full_name_en) || str(worker?.full_name)
            } · ${str(app.status)}`,
            priority:
              !app.assigned_user_id && !app.assigned_organization_id
                ? "critical"
                : str(app.status) === "waiting_worker"
                  ? "high"
                  : "normal",
            view: "applications",
            dueAt: date(app.submitted_at),
          })
        }
        timeline.push({
          id: `ops-app-t-${str(app.id)}`,
          title,
          detail: str(app.status),
          at: date(app.submitted_at) || new Date().toISOString(),
          view: "applications",
        })
      })

      docs.forEach((doc) => {
        if (["review_required", "rejected"].includes(str(doc.status))) {
          actions.push({
            id: `ops-doc-${str(doc.id)}`,
            title: str(doc.original_filename),
            detail: str(doc.status),
            priority: str(doc.status) === "rejected" ? "high" : "normal",
            view: "documents",
          })
        }
      })

      tickets.forEach((ticket) => {
        if (["resolved", "closed"].includes(str(ticket.status))) return
        const overdue =
          (days(ticket.first_response_due_at) ?? 1) < 0 ||
          (days(ticket.resolution_due_at) ?? 1) < 0
        actions.push({
          id: `ops-ticket-${str(ticket.id)}`,
          title: `${str(ticket.ticket_no)} · ${str(ticket.title)}`,
          detail: overdue
            ? localeText(language, {
                ko: "SLA 기한 초과",
                en: "SLA overdue",
                si: "SLA කාලය ඉක්මවා ඇත",
              })
            : str(ticket.status),
          priority:
            overdue || ["P0", "P1"].includes(str(ticket.priority))
              ? "critical"
              : "normal",
          view: partner ? "coordination" : "tickets",
          dueAt: date(ticket.resolution_due_at),
        })
        timeline.push({
          id: `ops-ticket-t-${str(ticket.id)}`,
          title: str(ticket.title),
          detail: str(ticket.status),
          at: date(ticket.created_at) || new Date().toISOString(),
          view: partner ? "coordination" : "tickets",
        })
      })

      if (!partner) {
        workers.forEach((worker) => {
          const risk = typeof worker.risk_score === "number" ? worker.risk_score : 0
          const visa = days(worker.visa_expires_at)
          const passport = days(worker.passport_expires_at)
          if (
            risk >= 70 ||
            (visa !== null && visa <= 30) ||
            (passport !== null && passport <= 60)
          ) {
            actions.push({
              id: `ops-worker-${str(worker.id)}`,
              title: `${str(worker.member_no)} · ${
                str(worker.full_name_en) || str(worker.full_name)
              }`,
              detail:
                risk >= 70
                  ? `Risk ${risk}`
                  : visa !== null && visa <= 30
                    ? `Visa D-${visa}`
                    : `Passport D-${passport}`,
              priority: "critical",
              view: "workers",
            })
          }
        })
      }

      const sorted = dedupe(actions)
      return {
        loading: false,
        error: "",
        userId,
        name: partner ? "Partner" : "Sejoong",
        actions: sorted,
        timeline: timeline
          .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
          .slice(0, 40),
        checked: apps.length + docs.length + tickets.length + workers.length + 4,
        waiting: sorted.filter((item) => item.priority === "waiting").length,
      }
    },
    [language, supabase, t.today]
  )

  const load = useCallback(async () => {
    if (!surface) return
    setSnapshot((current) => ({ ...current, loading: true, error: "" }))
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setSnapshot({
          ...initial,
          loading: false,
          error: "Authentication required",
        })
        return
      }
      setSnapshot(
        surface === "worker"
          ? await loadWorker(user.id)
          : await loadOperations(user.id, surface === "partner")
      )
    } catch (caught) {
      setSnapshot((current) => ({
        ...current,
        loading: false,
        error:
          caught instanceof Error ? caught.message : "Unable to load automation",
      }))
    }
  }, [loadOperations, loadWorker, supabase.auth, surface])

  useEffect(() => {
    if (!surface) return
    void load()
    const timer = window.setInterval(() => void load(), 120_000)
    return () => window.clearInterval(timer)
  }, [load, surface])

  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    update()
    window.addEventListener("online", update)
    window.addEventListener("offline", update)
    return () => {
      window.removeEventListener("online", update)
      window.removeEventListener("offline", update)
    }
  }, [])

  useEffect(() => {
    if (!surface || !snapshot.userId) return
    const key = `staycare:draft:v1:${snapshot.userId}:${pathname}`
    draftKey.current = key
    const stored = window.localStorage.getItem(key)
    if (stored) {
      try {
        draftRef.current = JSON.parse(stored) as Draft
        setDraftState("available")
      } catch {
        window.localStorage.removeItem(key)
      }
    }

    const save = () => {
      const fields: Draft["fields"] = {}
      document
        .querySelectorAll<
          HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >("form input[name], form textarea[name], form select[name]")
        .forEach((element, index) => {
          if (!safeField(element)) return
          fields[`${index}:${element.name}`] =
            element instanceof HTMLInputElement &&
            ["checkbox", "radio"].includes(element.type)
              ? element.checked
              : element.value
        })
      if (!Object.keys(fields).length) return
      setDraftState("saving")
      const draft = { savedAt: new Date().toISOString(), fields }
      draftRef.current = draft
      window.localStorage.setItem(key, JSON.stringify(draft))
      setDraftState("saved")
    }

    const listener = (event: Event) => {
      const target = event.target
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement
        ) ||
        !safeField(target)
      ) {
        return
      }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(save, 600)
    }
    document.addEventListener("input", listener, true)
    document.addEventListener("change", listener, true)
    return () => {
      document.removeEventListener("input", listener, true)
      document.removeEventListener("change", listener, true)
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [pathname, snapshot.userId, surface])

  const restoreDraft = () => {
    if (!draftRef.current) return
    document
      .querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >("form input[name], form textarea[name], form select[name]")
      .forEach((element, index) => {
        if (!safeField(element)) return
        const value = draftRef.current?.fields[`${index}:${element.name}`]
        if (value !== undefined) setValue(element, value)
      })
    setDraftState("saved")
  }

  const clearDraft = () => {
    if (draftKey.current) window.localStorage.removeItem(draftKey.current)
    draftRef.current = null
    setDraftState("idle")
  }

  const navigate = (view: string) => {
    const labels = navLabels[view] || []
    const button = Array.from(
      document.querySelectorAll<HTMLButtonElement>("button")
    )
      .filter((item) => !item.closest("[data-automation-hub]"))
      .find((item) =>
        labels.some((label) => item.textContent?.includes(label))
      )
    button?.click()
    setOpen(false)
    window.setTimeout(
      () => window.scrollTo({ top: 0, behavior: "smooth" }),
      50
    )
  }

  if (!surface) return <>{children}</>

  const urgent = snapshot.actions.filter(
    (item) => item.priority === "critical" || item.priority === "high"
  ).length

  return (
    <>
      <div
        data-automation-hub
        className="sticky top-0 z-[80] border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-3 py-2.5 sm:px-5">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${
              urgent
                ? "bg-amber-100 text-amber-700"
                : "bg-emerald-100 text-emerald-700"
            }`}
          >
            {snapshot.loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : urgent ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <CheckCircle2 className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <strong className="block truncate text-sm font-black text-slate-950">
              {t.label}
            </strong>
            <p className="truncate text-xs text-slate-500">
              {snapshot.actions[0]?.title || t.checking}
            </p>
          </div>
          <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 lg:inline">
            {online ? t.online : t.offline}
          </span>
          {draftState !== "idle" ? (
            <span className="hidden items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 lg:inline-flex">
              <Save className="h-3 w-3" />
              {draftState === "saving"
                ? t.saving
                : draftState === "available"
                  ? t.draft
                  : t.saved}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-black text-white"
            aria-label={t.open}
          >
            <Zap className="h-4 w-4" />
            {t.today}
            <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] text-slate-950">
              {snapshot.actions.length}
            </span>
          </button>
        </div>
      </div>
      {children}

      {open ? (
        <div
          data-automation-hub
          className="fixed inset-0 z-[120] flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-label={t.label}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <aside className="relative flex h-full w-full max-w-xl flex-col bg-slate-50 shadow-2xl">
            <header className="border-b border-slate-200 bg-white p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    {t.label}
                  </span>
                  <h2 className="mt-3 text-xl font-black text-slate-950">
                    {snapshot.name || t.checking}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-slate-200 p-2 text-slate-500"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric value={urgent} label={t.urgent} tone="red" />
                <Metric value={snapshot.waiting} label={t.waiting} tone="sky" />
                <Metric value={snapshot.checked} label={t.checked} tone="emerald" />
              </div>
              <div className="mt-4 flex rounded-2xl bg-slate-100 p-1">
                {(["today", "timeline", "automation"] as Tab[]).map(
                  (value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setTab(value)}
                      className={`flex-1 rounded-xl px-2 py-2 text-xs font-black ${
                        tab === value
                          ? "bg-white text-slate-950 shadow-sm"
                          : "text-slate-500"
                      }`}
                    >
                      {value === "today"
                        ? t.today
                        : value === "timeline"
                          ? t.timeline
                          : t.automation}
                    </button>
                  )
                )}
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {snapshot.error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {snapshot.error}
                </div>
              ) : snapshot.loading ? (
                <div className="flex min-h-64 items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
                </div>
              ) : tab === "today" ? (
                <div className="space-y-3">
                  {draftState === "available" ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                      <div className="flex items-center gap-2 font-black text-blue-900">
                        <RotateCcw className="h-5 w-5" />
                        {t.draft}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={restoreDraft}
                          className="rounded-xl bg-blue-700 px-3 py-2 text-xs font-black text-white"
                        >
                          {t.restore}
                        </button>
                        <button
                          type="button"
                          onClick={clearDraft}
                          className="rounded-xl border border-blue-200 bg-white px-3 py-2 text-xs font-black text-blue-700"
                        >
                          {t.clear}
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {snapshot.actions.length ? (
                    snapshot.actions.map((item, index) => (
                      <article
                        key={item.id}
                        className={`rounded-2xl border p-4 shadow-sm ${priorityStyle(
                          item.priority
                        )}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 font-black shadow-sm">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black">{item.title}</h3>
                            <p className="mt-1 text-sm leading-6 opacity-80">
                              {item.detail}
                            </p>
                            {item.dueAt ? (
                              <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold">
                                <CalendarClock className="h-3.5 w-3.5" />
                                {t.due}: {format(item.dueAt, language)}
                              </p>
                            ) : null}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(item.view)}
                          className="mt-3 flex w-full items-center justify-between rounded-xl bg-white/80 px-3 py-2.5 text-sm font-black shadow-sm"
                        >
                          {t.act}
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </article>
                    ))
                  ) : (
                    <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-7 text-center">
                      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
                      <h3 className="mt-3 font-black text-emerald-950">
                        {t.noTask}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-emerald-700">
                        {t.noTaskDetail}
                      </p>
                    </div>
                  )}
                </div>
              ) : tab === "timeline" ? (
                <div className="space-y-3">
                  {snapshot.timeline.length ? (
                    snapshot.timeline.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigate(item.view)}
                        className="flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
                      >
                        <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-violet-500 ring-4 ring-violet-50" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-black text-slate-950">
                            {item.title}
                          </h3>
                          <p className="mt-1 text-sm text-slate-600">
                            {item.detail}
                          </p>
                          <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />
                            {format(item.at, language)}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">{t.noTaskDetail}</p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {t.rules.map((rule) => (
                    <article
                      key={rule}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                          <Bot className="h-5 w-5" />
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-slate-950">{rule}</h3>
                            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">
                              {t.active}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            {t.checking}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                  <div
                    className={`rounded-2xl border p-4 ${
                      online
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-amber-200 bg-amber-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="h-5 w-5" />
                      <strong>{online ? t.online : t.offline}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <footer className="border-t border-slate-200 bg-white p-4 sm:px-6">
              <button
                type="button"
                onClick={() => void load()}
                disabled={snapshot.loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-800"
              >
                <RefreshCw
                  className={`h-4 w-4 ${snapshot.loading ? "animate-spin" : ""}`}
                />
                {t.refresh}
              </button>
            </footer>
          </aside>
        </div>
      ) : null}
    </>
  )
}

function Metric({
  value,
  label,
  tone,
}: {
  value: number
  label: string
  tone: "red" | "sky" | "emerald"
}) {
  const styles =
    tone === "red"
      ? "border-red-100 bg-red-50 text-red-700"
      : tone === "sky"
        ? "border-sky-100 bg-sky-50 text-sky-700"
        : "border-emerald-100 bg-emerald-50 text-emerald-700"
  return (
    <div className={`rounded-2xl border p-3 ${styles}`}>
      <div className="text-xl font-black">{value}</div>
      <div className="mt-1 text-[10px] font-bold">{label}</div>
    </div>
  )
}
