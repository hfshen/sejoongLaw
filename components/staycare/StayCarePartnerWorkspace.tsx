"use client"

import type { FormEvent, ReactNode } from "react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  HelpCircle,
  Loader2,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  TicketCheck,
  UsersRound,
  X,
} from "lucide-react"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import { createClient } from "@/lib/supabase/client"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"
import {
  getStayCareRoleLabel,
  type StayCareRole,
  type StayCareRoleCapabilities,
} from "@/lib/staycare/role-capabilities"

type View = "overview" | "workers" | "applications" | "coordination"
type PartnerRole = Extract<
  StayCareRole,
  "employer_admin" | "institution_admin" | "provider_agent"
>
type LocalizedValue =
  | Partial<Record<StayCarePreferredLanguage, string>>
  | string
  | null
  | undefined

export interface PartnerWorker {
  id: string
  member_no: string
  full_name: string
  full_name_en: string | null
  status: string
  current_phase: string
  profile_completion: number
  visa_type: string | null
  expected_arrival_date: string | null
  visa_expires_at: string | null
  next_action: string | null
  next_action_due_at: string | null
}

export interface PartnerApplication {
  id: string
  application_no: string
  status: string
  submitted_at: string | null
  external_reference: string | null
  rejected_reason: string | null
  submitted_data: Record<string, unknown> | null
  worker?: {
    member_no?: string
    full_name?: string
    full_name_en?: string | null
  } | null
  service?: {
    code?: string
    category?: string
    name?: LocalizedValue
  } | null
  events?: Array<{
    id: string
    event_type: string
    body: Record<string, unknown> | null
    created_at: string
  }> | null
}

export interface PartnerTicket {
  id: string
  ticket_no: string
  title: string
  category: string
  priority: string
  status: string
  employer_visible_summary: string | null
  created_at: string
  worker?: {
    member_no?: string
    full_name?: string
    full_name_en?: string | null
  } | null
}

interface Props {
  locale: string
  role: PartnerRole
  capabilities: StayCareRoleCapabilities
  organizationName: string
  userEmail?: string
  initialWorkers: PartnerWorker[]
  initialApplications: PartnerApplication[]
  initialTickets: PartnerTicket[]
}

const copy = {
  ko: {
    overview: "현황",
    workers: "대상 근로자",
    applications: "서비스 처리",
    coordination: "세중 협업요청",
    signOut: "로그아웃",
    search: "근로자·신청번호 검색",
    visibleWorkers: "조회 근로자",
    readyWorkers: "준비도 80% 이상",
    openApplications: "진행 중 신청",
    openTickets: "협업 요청",
    noData: "현재 권한으로 조회 가능한 항목이 없습니다.",
    submit: "협업 요청 접수",
    providerSave: "처리 결과 저장",
    privacy:
      "역할·소속기관에 허용된 업무정보만 표시됩니다. 개인 법률·의료·인권·송금 상세정보는 제공되지 않습니다.",
  },
  en: {
    overview: "Overview",
    workers: "Workers",
    applications: "Service queue",
    coordination: "Coordinate with Sejoong",
    signOut: "Sign out",
    search: "Search worker or application",
    visibleWorkers: "Visible workers",
    readyWorkers: "Readiness above 80%",
    openApplications: "Open applications",
    openTickets: "Coordination requests",
    noData: "Nothing is visible under the current role and organization.",
    submit: "Submit coordination request",
    providerSave: "Save provider result",
    privacy:
      "Only role- and organization-authorized operational data is shown. Private legal, medical, human-rights and remittance details are excluded.",
  },
  si: {
    overview: "සාරාංශය",
    workers: "සේවකයින්",
    applications: "සේවා ඉල්ලීම්",
    coordination: "Sejoong සමඟ සම්බන්ධ වීම",
    signOut: "ඉවත් වන්න",
    search: "සේවකයා හෝ අයදුම සොයන්න",
    visibleWorkers: "පෙනෙන සේවකයින්",
    readyWorkers: "80% ට වැඩි සූදානම",
    openApplications: "ක්‍රියාත්මක අයදුම්",
    openTickets: "සම්බන්ධීකරණ ඉල්ලීම්",
    noData: "මෙම භූමිකාවට පෙනෙන අයිතම නොමැත.",
    submit: "සම්බන්ධීකරණ ඉල්ලීම යොමු කරන්න",
    providerSave: "සේවා ප්‍රතිඵලය සුරකින්න",
    privacy:
      "භූමිකාවට සහ ආයතනයට අනුමත මෙහෙයුම් දත්ත පමණක් පෙන්වයි. පුද්ගලික නීති, වෛද්‍ය, මානව හිමිකම් සහ මුදල් යැවීමේ විස්තර නොපෙන්වයි.",
  },
} as const

const roleCopy: Record<
  PartnerRole,
  Record<
    StayCarePreferredLanguage,
    { title: string; description: string; workerFocus: string }
  >
> = {
  employer_admin: {
    ko: {
      title: "고용주 정착지원 포털",
      description:
        "소속 근로자의 입국·정착·고용 준비도를 확인하고 세중에 협업을 요청합니다.",
      workerFocus: "고용주에게 공유 가능한 준비도와 다음 행동",
    },
    en: {
      title: "Employer settlement portal",
      description:
        "Review assigned worker arrival, settlement and employment readiness and coordinate with Sejoong.",
      workerFocus: "Employer-visible readiness and next actions",
    },
    si: {
      title: "සේවායෝජක පදිංචි සහාය",
      description:
        "අදාළ සේවකයින්ගේ පැමිණීම, පදිංචිය සහ රැකියා සූදානම බලන්න.",
      workerFocus: "සේවායෝජකයාට පෙනෙන සූදානම",
    },
  },
  institution_admin: {
    ko: {
      title: "스리랑카 현지 준비 포털",
      description:
        "후보자의 교육·서류·비자 후 출국준비를 확인하고 한국 측 인계를 조율합니다.",
      workerFocus: "교육기관에게 공유 가능한 출국준비 상태",
    },
    en: {
      title: "Sri Lanka preparation portal",
      description:
        "Track candidate training, records and pre-departure readiness and coordinate Korea handoff.",
      workerFocus: "Institution-visible training and departure readiness",
    },
    si: {
      title: "ශ්‍රී ලංකා සූදානම් පෝර්ටලය",
      description:
        "අපේක්ෂක පුහුණුව, ලේඛන සහ පිටත්වීමේ සූදානම බලන්න.",
      workerFocus: "ආයතනයට පෙනෙන පුහුණු හා පිටත්වීමේ තත්ත්වය",
    },
  },
  provider_agent: {
    ko: {
      title: "제휴 서비스 처리 포털",
      description:
        "세중이 배정한 통신·배송·금융 등 신청만 확인하고 처리 결과를 회신합니다.",
      workerFocus: "서비스 수행에 필요한 최소 정보",
    },
    en: {
      title: "Service provider portal",
      description:
        "Process only telecom, delivery or finance requests assigned by Sejoong and return results.",
      workerFocus: "Minimum information required for assigned service execution",
    },
    si: {
      title: "සේවා සපයන්නාගේ පෝර්ටලය",
      description:
        "Sejoong විසින් පවරන ලද සේවා ඉල්ලීම් පමණක් ක්‍රියාත්මක කර ප්‍රතිඵල යවන්න.",
      workerFocus: "පවරන ලද සේවාව සඳහා අවම තොරතුරු",
    },
  },
}

function localized(
  value: LocalizedValue,
  language: StayCarePreferredLanguage
) {
  if (!value) return "Service"
  if (typeof value === "string") return value
  return value[language] || value.en || value.ko || value.si || "Service"
}

function formatDate(
  value: string | null | undefined,
  language: StayCarePreferredLanguage
) {
  if (!value) return "—"
  try {
    return new Intl.DateTimeFormat(
      language === "ko" ? "ko-KR" : language === "si" ? "si-LK" : "en-US",
      { year: "numeric", month: "short", day: "numeric" }
    ).format(new Date(value))
  } catch {
    return value
  }
}

function badgeClass(status: string) {
  if (
    ["fulfilled", "approved", "completed", "active", "resolved", "closed"].includes(
      status
    )
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (
    ["rejected", "failed", "cancelled", "attention", "P0", "P1"].includes(
      status
    )
  ) {
    return "border-red-200 bg-red-50 text-red-700"
  }
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function Badge({ value }: { value: string }) {
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${badgeClass(
        value
      )}`}
    >
      {value.replaceAll("_", " ")}
    </span>
  )
}

function Panel({
  title,
  description,
  action,
  children,
}: {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof UsersRound
  label: string
  value: number
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100">
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-3xl font-black">{value}</span>
      </div>
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
    </article>
  )
}

export default function StayCarePartnerWorkspace({
  locale,
  role,
  capabilities,
  organizationName,
  userEmail,
  initialWorkers,
  initialApplications,
  initialTickets,
}: Props) {
  const router = useRouter()
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const roleText = roleCopy[role][language]
  const [view, setView] = useState<View>(
    role === "provider_agent" ? "applications" : "overview"
  )
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [applications, setApplications] = useState(initialApplications)
  const [tickets, setTickets] = useState(initialTickets)
  const [selectedApplication, setSelectedApplication] =
    useState<PartnerApplication | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const workers = useMemo(() => {
    const normalized = query.toLowerCase()
    return initialWorkers.filter((item) =>
      `${item.member_no} ${item.full_name} ${item.full_name_en || ""} ${
        item.visa_type || ""
      }`
        .toLowerCase()
        .includes(normalized)
    )
  }, [initialWorkers, query])

  const filteredApplications = useMemo(() => {
    const normalized = query.toLowerCase()
    return applications.filter((item) =>
      `${item.application_no} ${item.worker?.member_no || ""} ${
        item.worker?.full_name_en || item.worker?.full_name || ""
      } ${localized(item.service?.name, language)}`
        .toLowerCase()
        .includes(normalized)
    )
  }, [applications, language, query])

  const readyWorkers = initialWorkers.filter(
    (item) => item.profile_completion >= 80
  ).length
  const openApplications = applications.filter(
    (item) => !["fulfilled", "cancelled", "rejected"].includes(item.status)
  ).length

  const signOut = async () => {
    await createClient().auth.signOut()
    window.location.href = `/${locale}/staycare/login`
  }

  const submitCoordination = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setBusy(true)
    setError("")
    try {
      const form = new FormData(event.currentTarget)
      const response = await fetch("/api/staycare/portal/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workerId: form.get("workerId") || null,
          title: form.get("title"),
          category: form.get("category"),
          description: form.get("description"),
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Unable to submit coordination request")
      }
      setTickets((items) => [data.ticket as PartnerTicket, ...items])
      event.currentTarget.reset()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to submit coordination request"
      )
    } finally {
      setBusy(false)
    }
  }

  const updateProviderApplication = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!selectedApplication || !capabilities.canRespondAsProvider) return
    setBusy(true)
    setError("")
    try {
      const form = new FormData(event.currentTarget)
      const response = await fetch(
        `/api/staycare/portal/applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: form.get("status"),
            externalReference: form.get("externalReference"),
            workerVisibleMessage: form.get("workerVisibleMessage"),
            rejectionReason: form.get("rejectionReason"),
          }),
        }
      )
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Unable to update the assigned application")
      }
      setApplications((items) =>
        items.map((item) =>
          item.id === selectedApplication.id
            ? { ...item, ...data.application }
            : item
        )
      )
      setSelectedApplication(null)
      router.refresh()
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update the assigned application"
      )
    } finally {
      setBusy(false)
    }
  }

  const nav = [
    { id: "overview" as const, label: text.overview, icon: Building2, show: true },
    {
      id: "workers" as const,
      label: text.workers,
      icon: UsersRound,
      show: role !== "provider_agent",
    },
    {
      id: "applications" as const,
      label: text.applications,
      icon: ClipboardList,
      show: true,
    },
    {
      id: "coordination" as const,
      label: text.coordination,
      icon: HelpCircle,
      show: true,
    },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">
              {getStayCareRoleLabel(role, language)}
            </p>
            <h1 className="mt-3 text-3xl font-black">{roleText.title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              {roleText.description}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-black text-white">{organizationName}</p>
            <p className="mt-2 break-all text-xs">{userEmail}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={UsersRound}
          label={text.visibleWorkers}
          value={initialWorkers.length}
        />
        <MetricCard
          icon={FileCheck2}
          label={text.readyWorkers}
          value={readyWorkers}
        />
        <MetricCard
          icon={Send}
          label={text.openApplications}
          value={openApplications}
        />
        <MetricCard
          icon={TicketCheck}
          label={text.openTickets}
          value={
            tickets.filter(
              (item) => !["resolved", "closed"].includes(item.status)
            ).length
          }
        />
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950">
        <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
        {text.privacy}
      </div>

      {role !== "provider_agent" ? (
        <Panel
          title={roleText.workerFocus}
          action={
            <button
              type="button"
              onClick={() => setView("workers")}
              className="text-sm font-black text-[#bb271a]"
            >
              {text.workers}
            </button>
          }
        >
          <div className="divide-y divide-slate-100">
            {initialWorkers.slice(0, 6).map((worker) => (
              <article
                key={worker.id}
                className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="font-black">
                    {worker.full_name_en || worker.full_name}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {worker.member_no} · {worker.visa_type || "Visa pending"}
                  </p>
                  <p className="mt-2 text-sm text-slate-600">
                    {worker.next_action || worker.current_phase}
                  </p>
                </div>
                <div className="w-36">
                  <div className="flex justify-between text-xs">
                    <span>Readiness</span>
                    <span>{worker.profile_completion}%</span>
                  </div>
                  <div className="mt-2 h-2.5 rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#bb271a]"
                      style={{ width: `${worker.profile_completion}%` }}
                    />
                  </div>
                </div>
              </article>
            ))}
            {!initialWorkers.length ? (
              <p className="p-5 text-sm text-slate-500">{text.noData}</p>
            ) : null}
          </div>
        </Panel>
      ) : (
        <Panel title={text.applications}>
          <div className="divide-y divide-slate-100">
            {filteredApplications.slice(0, 8).map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedApplication(item)}
                className="flex w-full items-center gap-3 p-5 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-black">
                    {localized(item.service?.name, language)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {item.application_no}
                  </p>
                </div>
                <Badge value={item.status} />
              </button>
            ))}
            {!filteredApplications.length ? (
              <p className="p-5 text-sm text-slate-500">{text.noData}</p>
            ) : null}
          </div>
        </Panel>
      )}
    </div>
  )

  const renderWorkers = () => (
    <Panel title={text.workers} description={roleText.workerFocus}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">Worker</th>
              <th className="px-5 py-3">Phase</th>
              <th className="px-5 py-3">Readiness</th>
              <th className="px-5 py-3">Next action</th>
              <th className="px-5 py-3">Arrival / visa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map((worker) => (
              <tr key={worker.id}>
                <td className="px-5 py-4">
                  <p className="font-black">
                    {worker.full_name_en || worker.full_name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {worker.member_no} · {worker.visa_type || "—"}
                  </p>
                </td>
                <td className="px-5 py-4">
                  <Badge value={worker.current_phase} />
                  <p className="mt-2 text-xs text-slate-400">{worker.status}</p>
                </td>
                <td className="px-5 py-4">
                  <div className="w-32">
                    <div className="flex justify-between text-xs">
                      <span>Profile</span>
                      <span>{worker.profile_completion}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-[#bb271a]"
                        style={{ width: `${worker.profile_completion}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="max-w-sm px-5 py-4 text-slate-600">
                  {worker.next_action || "—"}
                  <p className="mt-1 text-xs text-slate-400">
                    {formatDate(worker.next_action_due_at, language)}
                  </p>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500">
                  Arrival {formatDate(worker.expected_arrival_date, language)}
                  <br />
                  Visa {formatDate(worker.visa_expires_at, language)}
                </td>
              </tr>
            ))}
            {!workers.length ? (
              <tr>
                <td colSpan={5} className="p-10 text-center text-slate-500">
                  {text.noData}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </Panel>
  )

  const renderApplications = () => (
    <Panel
      title={text.applications}
      description={
        role === "provider_agent"
          ? "Only applications assigned to your organization are visible and actionable."
          : "Only applications explicitly assigned to your organization are visible."
      }
    >
      <div className="divide-y divide-slate-100">
        {filteredApplications.map((item) => (
          <button
            type="button"
            key={item.id}
            onClick={() => setSelectedApplication(item)}
            className="grid w-full gap-3 p-5 text-left sm:grid-cols-[1fr_auto] sm:items-center"
          >
            <div>
              <p className="font-black">
                {localized(item.service?.name || item.service?.code, language)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {item.application_no}
                {item.worker?.member_no ? ` · ${item.worker.member_no}` : ""} ·{" "}
                {formatDate(item.submitted_at, language)}
              </p>
              {item.external_reference ? (
                <p className="mt-2 text-xs text-slate-500">
                  Reference {item.external_reference}
                </p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Badge value={item.status} />
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
          </button>
        ))}
        {!filteredApplications.length ? (
          <p className="p-5 text-sm text-slate-500">{text.noData}</p>
        ) : null}
      </div>
    </Panel>
  )

  const renderCoordination = () => (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Panel
        title={text.coordination}
        description="Use this channel for operational coordination. Do not include unnecessary private identifiers."
      >
        <form onSubmit={submitCoordination} className="space-y-4 p-5">
          {role !== "provider_agent" ? (
            <select
              name="workerId"
              defaultValue=""
              className="w-full rounded-xl border border-slate-200 px-4 py-3"
            >
              <option value="">General organization request</option>
              {initialWorkers.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.member_no} · {worker.full_name_en || worker.full_name}
                </option>
              ))}
            </select>
          ) : null}
          <input
            name="title"
            required
            minLength={4}
            maxLength={160}
            placeholder="Request title"
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <select
            name="category"
            defaultValue={
              role === "provider_agent"
                ? "provider_support"
                : role === "institution_admin"
                  ? "training"
                  : "coordination"
            }
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="coordination">Coordination</option>
            <option value="arrival">Arrival</option>
            <option value="employment">Employment</option>
            <option value="training">Training</option>
            <option value="provider_support">Provider support</option>
            <option value="other">Other</option>
          </select>
          <textarea
            name="description"
            required
            minLength={10}
            maxLength={4000}
            placeholder="Describe the operational request and the expected action."
            className="min-h-40 w-full rounded-xl border border-slate-200 px-4 py-3"
          />
          <button
            disabled={busy}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#bb271a] px-4 py-4 font-black text-white disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Send className="mr-2 h-5 w-5" />
            )}
            {text.submit}
          </button>
        </form>
      </Panel>

      <Panel title={text.openTickets}>
        <div className="divide-y divide-slate-100">
          {tickets.map((ticket) => (
            <article key={ticket.id} className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-black">{ticket.title}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {ticket.ticket_no} · {ticket.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge value={ticket.priority} />
                  <Badge value={ticket.status} />
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {ticket.employer_visible_summary ||
                  "Sejoong is reviewing this request."}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {formatDate(ticket.created_at, language)}
              </p>
            </article>
          ))}
          {!tickets.length ? (
            <p className="p-5 text-sm text-slate-500">{text.noData}</p>
          ) : null}
        </div>
      </Panel>
    </div>
  )

  const renderView = () => {
    if (view === "overview") return renderOverview()
    if (view === "workers") return renderWorkers()
    if (view === "applications") return renderApplications()
    return renderCoordination()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-950 text-white transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">
              S
            </span>
            <div>
              <p className="font-black">StayCare Partner</p>
              <p className="max-w-44 truncate text-[11px] text-slate-400">
                {organizationName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 p-3">
          {nav
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setView(item.id)
                    setMobileOpen(false)
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${
                    view === item.id
                      ? "bg-[#bb271a]"
                      : "text-slate-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              )
            })}
        </nav>
        <button
          type="button"
          onClick={signOut}
          className="absolute inset-x-3 bottom-3 flex items-center rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-bold text-slate-300"
        >
          <LogOut className="mr-3 h-5 w-5" />
          {text.signOut}
        </button>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded-xl border p-2 lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#bb271a]">
                  {getStayCareRoleLabel(role, language)}
                </p>
                <h1 className="mt-1 text-lg font-black">
                  {nav.find((item) => item.id === view)?.label}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={text.search}
                  className="w-64 rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm"
                />
              </div>
              <StayCareLanguageSwitcher value={language} onChange={setLanguage} />
              <button
                type="button"
                onClick={() => router.refresh()}
                className="rounded-xl border p-2.5"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">
          {error ? (
            <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
              <AlertTriangle className="h-5 w-5" />
              {error}
            </div>
          ) : null}
          {renderView()}
        </main>
      </div>

      {selectedApplication ? (
        <div className="fixed inset-0 z-[80] flex justify-end bg-slate-950/50">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setSelectedApplication(null)}
            aria-label="Close"
          />
          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white">
            <div className="sticky top-0 flex items-center justify-between border-b bg-white p-5">
              <div>
                <p className="text-xs font-black text-[#bb271a]">
                  {selectedApplication.application_no}
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {localized(selectedApplication.service?.name, language)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApplication(null)}
                className="rounded-xl border p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-5 p-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-white">
                <div className="flex justify-between gap-3">
                  <p className="font-black">
                    {selectedApplication.worker?.full_name_en ||
                      selectedApplication.worker?.full_name ||
                      "Assigned customer"}
                  </p>
                  <Badge value={selectedApplication.status} />
                </div>
                <p className="mt-2 text-xs text-slate-300">
                  {selectedApplication.worker?.member_no ||
                    "Provider-minimum view"}
                </p>
              </div>

              <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-xs leading-6">
                {JSON.stringify(selectedApplication.submitted_data || {}, null, 2)}
              </pre>

              {selectedApplication.events?.length ? (
                <Panel title="Timeline">
                  <div className="divide-y divide-slate-100">
                    {selectedApplication.events.map((event) => (
                      <div key={event.id} className="p-4">
                        <p className="text-sm font-black">
                          {event.event_type.replaceAll("_", " ")}
                        </p>
                        {event.body?.message ? (
                          <p className="mt-2 text-sm text-slate-600">
                            {String(event.body.message)}
                          </p>
                        ) : null}
                        <p className="mt-2 text-xs text-slate-400">
                          {formatDate(event.created_at, language)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Panel>
              ) : null}

              {capabilities.canRespondAsProvider ? (
                <form onSubmit={updateProviderApplication} className="space-y-4">
                  <select
                    name="status"
                    defaultValue="approved"
                    className="w-full rounded-xl border px-4 py-3"
                  >
                    <option value="waiting_worker">Need customer information</option>
                    <option value="approved">Approved / scheduled</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <input
                    name="externalReference"
                    defaultValue={selectedApplication.external_reference || ""}
                    placeholder="Provider reference"
                    className="w-full rounded-xl border px-4 py-3"
                  />
                  <textarea
                    name="workerVisibleMessage"
                    placeholder="Message visible to the worker"
                    className="min-h-28 w-full rounded-xl border px-4 py-3"
                  />
                  <textarea
                    name="rejectionReason"
                    placeholder="Rejection reason when rejected"
                    className="min-h-24 w-full rounded-xl border px-4 py-3"
                  />
                  <button
                    disabled={busy}
                    className="inline-flex w-full items-center justify-center rounded-xl bg-[#bb271a] px-4 py-4 font-black text-white disabled:opacity-50"
                  >
                    {busy ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                    )}
                    {text.providerSave}
                  </button>
                </form>
              ) : (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950">
                  <ShieldCheck className="mb-2 h-5 w-5" />
                  This role can view only organization-authorized status and cannot
                  change provider results.
                </div>
              )}
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  )
}
