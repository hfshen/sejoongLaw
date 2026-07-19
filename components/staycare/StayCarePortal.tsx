"use client"

import { useMemo, useState } from "react"
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileClock,
  FileText,
  Gauge,
  Handshake,
  Languages,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareWarning,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  UserRound,
  UsersRound,
  X,
} from "lucide-react"
import {
  demoAuditEvents,
  demoPartners,
  demoSubscriptions,
  demoTasks,
  demoTickets,
  demoWorkers,
  formatWon,
  getWorker,
  overviewKpis,
  roleLabels,
  statusLabel,
} from "@/lib/staycare/demo-data"
import type {
  StayCareRole,
  StayCareTask,
  StayCareTicket,
  StayCareView,
  StayCareWorker,
} from "@/lib/staycare/types"

const navItems: Array<{
  id: StayCareView
  label: string
  icon: typeof LayoutDashboard
  roles?: StayCareRole[]
}> = [
  { id: "overview", label: "운영 현황", icon: LayoutDashboard },
  { id: "workers", label: "회원·근로자", icon: UsersRound },
  { id: "onboarding", label: "입국·온보딩", icon: ClipboardCheck },
  { id: "tasks", label: "업무 보드", icon: ListChecks },
  { id: "tickets", label: "민원·사건", icon: MessageSquareWarning },
  {
    id: "subscriptions",
    label: "구독·청구",
    icon: CircleDollarSign,
    roles: ["sejoong_admin", "operator_manager", "auditor"],
  },
  {
    id: "partners",
    label: "전문 파트너",
    icon: Handshake,
    roles: ["sejoong_admin", "sejoong_lawyer", "operator_manager", "operator_agent"],
  },
  {
    id: "audit",
    label: "감사 기록",
    icon: ShieldCheck,
    roles: ["sejoong_admin", "operator_manager", "auditor"],
  },
]

const lifecycleStyles: Record<string, string> = {
  invited: "border-slate-200 bg-slate-50 text-slate-700",
  onboarding: "border-blue-200 bg-blue-50 text-blue-700",
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  paused: "border-amber-200 bg-amber-50 text-amber-700",
  offboarding: "border-violet-200 bg-violet-50 text-violet-700",
  closed: "border-slate-200 bg-slate-100 text-slate-600",
}

const priorityStyles: Record<string, string> = {
  P0: "border-red-200 bg-red-50 text-red-700",
  P1: "border-orange-200 bg-orange-50 text-orange-700",
  P2: "border-amber-200 bg-amber-50 text-amber-700",
  P3: "border-slate-200 bg-slate-50 text-slate-700",
}

const riskStyles: Record<string, string> = {
  low: "bg-emerald-500",
  medium: "bg-amber-500",
  high: "bg-red-500",
}

const kpiToneStyles: Record<string, string> = {
  neutral: "border-slate-200 bg-white",
  positive: "border-emerald-200 bg-emerald-50/40",
  warning: "border-amber-200 bg-amber-50/50",
  critical: "border-red-200 bg-red-50/50",
}

function LabelPill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  )
}

function SectionCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string
  description?: string
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100" aria-label={`진행률 ${value}%`}>
      <div className="h-full rounded-full bg-[#bb271a]" style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function WorkerName({ worker }: { worker?: StayCareWorker }) {
  if (!worker) return <span className="text-slate-400">알 수 없음</span>
  return (
    <div>
      <p className="font-semibold text-slate-900">{worker.name}</p>
      <p className="text-xs text-slate-500">{worker.nameEn}</p>
    </div>
  )
}

function WorkerDetailDrawer({ worker, onClose }: { worker: StayCareWorker; onClose: () => void }) {
  const tasks = demoTasks.filter((task) => task.workerId === worker.id)
  const tickets = demoTickets.filter((ticket) => ticket.workerId === worker.id)
  const subscription = demoSubscriptions.find((item) => item.id === worker.subscriptionId)

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/35 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="상세 닫기" />
      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#bb271a]">Member detail</p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">{worker.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          <div className="rounded-2xl bg-slate-950 p-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-300">{worker.id}</p>
                <p className="mt-2 text-2xl font-bold">{worker.nameEn}</p>
                <p className="mt-1 text-sm text-slate-300">
                  {worker.visaType} · {worker.role} · {worker.preferredLanguage}
                </p>
              </div>
              <LabelPill className="border-white/20 bg-white/10 text-white">
                {statusLabel[worker.lifecycle]}
              </LabelPill>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-slate-300">고용주</p>
                <p className="mt-1 font-semibold">{worker.employer}</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <p className="text-slate-300">담당 코디네이터</p>
                <p className="mt-1 font-semibold">{worker.coordinator}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["입국일", worker.arrivalDate],
              ["체류만료", worker.visaExpiresAt],
              ["여권만료", worker.passportExpiresAt],
              ["숙소", worker.accommodation],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>

          <SectionCard title="정착 진행률" description="입국·등록·통신·계좌·보험 상태">
            <div className="space-y-4 p-5">
              <div>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">전체 체크리스트</span>
                  <span className="font-bold text-[#bb271a]">{worker.checklistProgress}%</span>
                </div>
                <ProgressBar value={worker.checklistProgress} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <StatusTile label="외국인등록" value={worker.foreignerRegistration} />
                <StatusTile label="통신" value={worker.phoneStatus} />
                <StatusTile label="은행" value={worker.bankStatus} />
                <StatusTile label="보험" value={worker.insuranceStatus} />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="다음 조치" description={`기한 ${worker.nextActionDue}`}>
            <div className="flex items-center gap-3 p-5">
              <div className="rounded-xl bg-red-50 p-3 text-[#bb271a]">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">{worker.nextAction}</p>
                <p className="mt-1 text-sm text-slate-500">담당자 {worker.coordinator}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard title={`업무 ${tasks.length}건`}>
            <div className="divide-y divide-slate-100">
              {tasks.length ? tasks.map((task) => <TaskRow key={task.id} task={task} compact />) : <EmptyRow text="등록된 업무가 없습니다." />}
            </div>
          </SectionCard>

          <SectionCard title={`민원·사건 ${tickets.length}건`}>
            <div className="divide-y divide-slate-100">
              {tickets.length ? tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} compact />) : <EmptyRow text="등록된 티켓이 없습니다." />}
            </div>
          </SectionCard>

          {subscription ? (
            <SectionCard title="구독 상태">
              <div className="grid grid-cols-2 gap-3 p-5 text-sm">
                <StatusMetric label="플랜" value={subscription.plan} />
                <StatusMetric label="상태" value={statusLabel[subscription.status] ?? subscription.status} />
                <StatusMetric label="부담주체" value={subscription.payer} />
                <StatusMetric label="갱신일" value={subscription.renewsAt} />
              </div>
            </SectionCard>
          ) : null}
        </div>
      </aside>
    </div>
  )
}

function StatusTile({ label, value }: { label: string; value: string }) {
  const complete = ["issued", "active", "complete"].includes(value)
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        {complete ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Clock3 className="h-4 w-4 text-amber-600" />}
        <span className="font-semibold text-slate-800">{complete ? "완료" : "진행중"}</span>
      </div>
    </div>
  )
}

function StatusMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function EmptyRow({ text }: { text: string }) {
  return <div className="px-5 py-8 text-center text-sm text-slate-500">{text}</div>
}

function TaskRow({ task, compact = false }: { task: StayCareTask; compact?: boolean }) {
  const worker = getWorker(task.workerId)
  return (
    <div className={`flex items-center gap-3 px-5 ${compact ? "py-3" : "py-4"}`}>
      <div className="rounded-xl bg-slate-100 p-2.5 text-slate-600">
        <FileClock className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {worker?.name ?? task.workerId} · {task.assignee} · {task.dueAt.slice(0, 10)}
        </p>
      </div>
      <LabelPill className="border-slate-200 bg-slate-50 text-slate-700">
        {statusLabel[task.status] ?? task.status}
      </LabelPill>
    </div>
  )
}

function TicketRow({ ticket, compact = false }: { ticket: StayCareTicket; compact?: boolean }) {
  const worker = getWorker(ticket.workerId)
  return (
    <div className={`flex items-center gap-3 px-5 ${compact ? "py-3" : "py-4"}`}>
      <div className={`rounded-xl p-2.5 ${ticket.priority === "P1" || ticket.priority === "P0" ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-600"}`}>
        <Siren className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900">{ticket.title}</p>
        <p className="mt-1 text-xs text-slate-500">
          {worker?.name ?? ticket.workerId} · {ticket.owner} · {ticket.status}
        </p>
      </div>
      <LabelPill className={priorityStyles[ticket.priority]}>{ticket.priority}</LabelPill>
    </div>
  )
}

function OverviewView({ onOpenWorker }: { onOpenWorker: (worker: StayCareWorker) => void }) {
  const urgentTickets = demoTickets.filter((ticket) => ticket.priority === "P0" || ticket.priority === "P1")
  const dueTasks = demoTasks.filter((task) => task.status !== "completed" && task.status !== "cancelled")

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewKpis.map((kpi) => (
          <div key={kpi.label} className={`rounded-2xl border p-5 shadow-sm ${kpiToneStyles[kpi.tone]}`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-slate-600">{kpi.label}</p>
              <MoreHorizontal className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-4 text-3xl font-black tracking-tight text-slate-950">{kpi.value}</p>
            <p className="mt-2 text-xs font-medium text-slate-500">{kpi.delta}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <SectionCard
          title="27일 입국 준비 현황"
          description="스리랑카 신규 입국자와 초기정착 업무"
          action={<LabelPill className="border-blue-200 bg-blue-50 text-blue-700">파일럿 그룹</LabelPill>}
        >
          <div className="divide-y divide-slate-100">
            {demoWorkers.slice(0, 2).map((worker) => (
              <button
                key={worker.id}
                onClick={() => onOpenWorker(worker)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-slate-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  {worker.name.slice(0, 1)}
                </div>
                <div className="min-w-0 flex-1">
                  <WorkerName worker={worker} />
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1"><ProgressBar value={worker.checklistProgress} /></div>
                    <span className="text-xs font-bold text-slate-600">{worker.checklistProgress}%</span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="긴급·고위험 티켓" description="세중 또는 전문파트너 검토 필요">
          <div className="divide-y divide-slate-100">
            {urgentTickets.length ? urgentTickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />) : <EmptyRow text="고위험 티켓이 없습니다." />}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_1fr]">
        <SectionCard title="다가오는 업무" description="미완료 업무 중 우선 처리 항목">
          <div className="divide-y divide-slate-100">
            {dueTasks.slice(0, 5).map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </SectionCard>

        <SectionCard title="서비스 운영 경계" description="대외 서비스와 전문업무를 분리합니다.">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
              <ShieldCheck className="h-5 w-5 text-[#bb271a]" />
              <p className="mt-3 font-bold text-slate-950">세중 수행</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">법률판단, 사건수임, 고위험 검토, 서비스 정책</p>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <Activity className="h-5 w-5 text-blue-700" />
              <p className="mt-3 font-bold text-slate-950">운영사 수행</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">온보딩, 일정, 생활지원, 티켓, 파트너 조정</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function WorkersView({ query, onOpenWorker }: { query: string; onOpenWorker: (worker: StayCareWorker) => void }) {
  const workers = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return demoWorkers
    return demoWorkers.filter((worker) =>
      [worker.name, worker.nameEn, worker.id, worker.employer, worker.visaType, worker.worksite]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    )
  }, [query])

  return (
    <SectionCard
      title="회원·근로자"
      description={`합성데이터 ${workers.length}명 · 실제 운영에서는 테넌트와 고용주 범위로 제한`}
      action={<button className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white">회원 초대</button>}
    >
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">회원</th>
              <th className="px-5 py-3 font-semibold">비자·근무지</th>
              <th className="px-5 py-3 font-semibold">정착 진행</th>
              <th className="px-5 py-3 font-semibold">리스크</th>
              <th className="px-5 py-3 font-semibold">다음 조치</th>
              <th className="px-5 py-3 font-semibold" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {workers.map((worker) => (
              <tr key={worker.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <WorkerName worker={worker} />
                  <p className="mt-1 text-xs text-slate-400">{worker.id}</p>
                </td>
                <td className="px-5 py-4">
                  <LabelPill className="border-slate-200 bg-white text-slate-700">{worker.visaType}</LabelPill>
                  <p className="mt-2 font-medium text-slate-800">{worker.employer}</p>
                  <p className="text-xs text-slate-500">{worker.worksite}</p>
                </td>
                <td className="min-w-[180px] px-5 py-4">
                  <div className="mb-2 flex justify-between text-xs text-slate-500">
                    <span>{statusLabel[worker.lifecycle]}</span>
                    <span>{worker.checklistProgress}%</span>
                  </div>
                  <ProgressBar value={worker.checklistProgress} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${riskStyles[worker.riskLabel]}`} />
                    <span className="font-semibold text-slate-800">{worker.riskScore}</span>
                  </div>
                </td>
                <td className="max-w-[240px] px-5 py-4">
                  <p className="truncate font-medium text-slate-800">{worker.nextAction}</p>
                  <p className="mt-1 text-xs text-slate-500">{worker.nextActionDue} · {worker.coordinator}</p>
                </td>
                <td className="px-5 py-4 text-right">
                  <button onClick={() => onOpenWorker(worker)} className="rounded-xl border border-slate-200 p-2 text-slate-500 hover:bg-white hover:text-slate-900">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function OnboardingView({ onOpenWorker }: { onOpenWorker: (worker: StayCareWorker) => void }) {
  const onboarding = demoWorkers.filter((worker) => worker.lifecycle === "onboarding")
  const stages = [
    { label: "입국 전 확인", icon: FileCheck2, count: 2 },
    { label: "도착·숙소", icon: Building2, count: 2 },
    { label: "외국인등록", icon: BadgeCheck, count: 2 },
    { label: "은행·보험", icon: BriefcaseBusiness, count: 2 },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        {stages.map((stage, index) => {
          const Icon = stage.icon
          return (
            <div key={stage.label} className="relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-2.5 text-[#bb271a]"><Icon className="h-5 w-5" /></div>
                <span className="text-2xl font-black text-slate-950">{stage.count}</span>
              </div>
              <p className="mt-4 font-bold text-slate-900">{stage.label}</p>
              <p className="mt-1 text-xs text-slate-500">Stage {index + 1}</p>
            </div>
          )
        })}
      </div>

      <SectionCard title="27일 입국자 온보딩 보드" description="D-7부터 D+30까지 담당자와 증빙을 추적합니다.">
        <div className="grid gap-4 p-5 lg:grid-cols-2">
          {onboarding.map((worker) => (
            <button key={worker.id} onClick={() => onOpenWorker(worker)} className="rounded-2xl border border-slate-200 p-5 text-left transition hover:border-slate-300 hover:shadow-md">
              <div className="flex items-start justify-between gap-4">
                <WorkerName worker={worker} />
                <LabelPill className={lifecycleStyles[worker.lifecycle]}>{statusLabel[worker.lifecycle]}</LabelPill>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <StatusMetric label="입국" value={worker.arrivalDate} />
                <StatusMetric label="숙소" value={worker.accommodation} />
              </div>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs text-slate-500">
                  <span>전체 준비도</span><span>{worker.checklistProgress}%</span>
                </div>
                <ProgressBar value={worker.checklistProgress} />
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <p className="text-xs text-slate-500">다음 조치</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{worker.nextAction}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </div>
            </button>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function TasksView() {
  const columns: Array<{ id: StayCareTask["status"]; label: string }> = [
    { id: "assigned", label: "배정" },
    { id: "in_progress", label: "처리중" },
    { id: "waiting_partner", label: "파트너 대기" },
    { id: "review_required", label: "검토 필요" },
  ]

  return (
    <div className="grid gap-4 xl:grid-cols-4">
      {columns.map((column) => {
        const tasks = demoTasks.filter((task) => task.status === column.id)
        return (
          <section key={column.id} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center justify-between px-2 py-2">
              <h2 className="font-bold text-slate-900">{column.label}</h2>
              <span className="rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-600 shadow-sm">{tasks.length}</span>
            </div>
            <div className="mt-2 space-y-3">
              {tasks.length ? tasks.map((task) => {
                const worker = getWorker(task.workerId)
                return (
                  <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <LabelPill className="border-slate-200 bg-slate-50 text-slate-600">{task.category}</LabelPill>
                      {task.evidenceRequired ? <FileText className="h-4 w-4 text-slate-400" /> : null}
                    </div>
                    <p className="mt-3 font-bold leading-6 text-slate-900">{task.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{worker?.name}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
                      <span>{task.assignee}</span>
                      <span>{task.dueAt.slice(5, 10)}</span>
                    </div>
                  </article>
                )
              }) : <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-6 text-center text-sm text-slate-400">업무 없음</div>}
            </div>
          </section>
        )
      })}
    </div>
  )
}

function TicketsView() {
  return (
    <SectionCard title="민원·사건 티켓" description="운영 문의와 전문 검토를 우선순위에 따라 분류합니다.">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-5 py-3">우선순위</th>
              <th className="px-5 py-3">티켓</th>
              <th className="px-5 py-3">회원</th>
              <th className="px-5 py-3">담당·에스컬레이션</th>
              <th className="px-5 py-3">상태</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demoTickets.map((ticket) => {
              const worker = getWorker(ticket.workerId)
              return (
                <tr key={ticket.id} className="align-top hover:bg-slate-50">
                  <td className="px-5 py-4"><LabelPill className={priorityStyles[ticket.priority]}>{ticket.priority}</LabelPill></td>
                  <td className="max-w-lg px-5 py-4">
                    <p className="font-bold text-slate-900">{ticket.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">{ticket.summary}</p>
                    <p className="mt-2 text-xs text-slate-400">{ticket.id} · {ticket.openedAt.slice(0, 16).replace("T", " ")}</p>
                  </td>
                  <td className="px-5 py-4"><WorkerName worker={worker} /></td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800">{ticket.owner}</p>
                    <p className="mt-1 text-xs text-slate-500">{ticket.escalationTarget ?? "일반 운영"}</p>
                  </td>
                  <td className="px-5 py-4"><LabelPill className="border-slate-200 bg-slate-50 text-slate-700">{ticket.status}</LabelPill></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

function SubscriptionsView() {
  const activeRevenue = demoSubscriptions
    .filter((item) => item.status === "active" || item.status === "grace_period")
    .reduce((sum, item) => sum + (item.billingCycle === "annual" ? Math.round(item.amount / 12) : item.amount), 0)

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        <StatusSummary icon={CircleDollarSign} label="데모 월 환산매출" value={formatWon(activeRevenue)} />
        <StatusSummary icon={BadgeCheck} label="활성 구독" value={`${demoSubscriptions.filter((item) => item.status === "active").length}건`} />
        <StatusSummary icon={AlertTriangle} label="미납·유예" value={`${demoSubscriptions.filter((item) => item.status !== "active").length}건`} />
      </div>
      <SectionCard title="구독·청구 현황" description="가격은 환경설정과 계약 승인 후 확정하며 카드정보는 저장하지 않습니다.">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-5 py-3">회원</th><th className="px-5 py-3">플랜</th><th className="px-5 py-3">부담</th><th className="px-5 py-3">금액</th><th className="px-5 py-3">지원시간</th><th className="px-5 py-3">상태</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {demoSubscriptions.map((subscription) => {
                const worker = getWorker(subscription.workerId)
                const usage = Math.round((subscription.usedSupportMinutes / subscription.includedSupportMinutes) * 100)
                return (
                  <tr key={subscription.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4"><WorkerName worker={worker} /></td>
                    <td className="px-5 py-4"><p className="font-bold text-slate-900">{subscription.plan}</p><p className="text-xs text-slate-500">{subscription.billingCycle}</p></td>
                    <td className="px-5 py-4 font-medium text-slate-700">{subscription.payer}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatWon(subscription.amount)}</td>
                    <td className="min-w-[180px] px-5 py-4"><div className="mb-2 flex justify-between text-xs text-slate-500"><span>{subscription.usedSupportMinutes}분</span><span>{subscription.includedSupportMinutes}분</span></div><ProgressBar value={usage} /></td>
                    <td className="px-5 py-4"><LabelPill className={subscription.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{statusLabel[subscription.status] ?? subscription.status}</LabelPill></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

function StatusSummary({ icon: Icon, label, value }: { icon: typeof CircleDollarSign; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3"><div className="rounded-xl bg-red-50 p-2.5 text-[#bb271a]"><Icon className="h-5 w-5" /></div><p className="text-sm font-semibold text-slate-500">{label}</p></div>
      <p className="mt-4 text-2xl font-black text-slate-950">{value}</p>
    </div>
  )
}

function PartnersView() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {demoPartners.map((partner) => (
        <article key={partner.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="rounded-2xl bg-slate-950 p-3 text-white"><Handshake className="h-5 w-5" /></div>
            <LabelPill className={partner.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-blue-200 bg-blue-50 text-blue-700"}>{partner.status}</LabelPill>
          </div>
          <p className="mt-5 text-lg font-bold text-slate-950">{partner.name}</p>
          <p className="mt-1 text-sm text-slate-500">{partner.type} · {partner.region}</p>
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
            <StatusMetric label="SLA" value={`${partner.slaHours}h`} />
            <StatusMetric label="진행" value={`${partner.openTasks}건`} />
            <StatusMetric label="평점" value={partner.rating.toFixed(1)} />
          </div>
          <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{partner.contact}</p>
        </article>
      ))}
    </div>
  )
}

function AuditView() {
  return (
    <SectionCard title="감사 기록" description="민감정보 조회, 권한, 긴급도, 구독 변경의 이유를 남깁니다.">
      <div className="divide-y divide-slate-100">
        {demoAuditEvents.map((event) => (
          <div key={event.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start">
            <div className={`rounded-xl p-2.5 ${event.severity === "critical" ? "bg-red-50 text-red-600" : event.severity === "warning" ? "bg-amber-50 text-amber-600" : "bg-slate-100 text-slate-600"}`}>
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-slate-900">{event.action}</p>
                <LabelPill className="border-slate-200 bg-slate-50 text-slate-600">{roleLabels[event.actorRole]}</LabelPill>
              </div>
              <p className="mt-1 text-sm text-slate-600">{event.actor} · {event.entity} · {event.entityId}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">사유: {event.reason}</p>
            </div>
            <p className="text-xs text-slate-400">{event.occurredAt.slice(0, 16).replace("T", " ")}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export default function StayCarePortal() {
  const [view, setView] = useState<StayCareView>("overview")
  const [role, setRole] = useState<StayCareRole>("operator_manager")
  const [query, setQuery] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedWorker, setSelectedWorker] = useState<StayCareWorker | null>(null)

  const visibleNavItems = navItems.filter((item) => !item.roles || item.roles.includes(role))
  const activeNav = navItems.find((item) => item.id === view)

  function selectView(nextView: StayCareView) {
    setView(nextView)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-800 bg-[#111316] text-white transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</div>
              <div><p className="font-black tracking-tight">Sejoong StayCare</p><p className="text-xs text-slate-400">Foreign Worker Operations</p></div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-slate-400 lg:hidden"><X className="h-5 w-5" /></button>
          </div>

          <div className="border-b border-white/10 p-4">
            <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Demo role</label>
            <select
              value={role}
              onChange={(event) => {
                const nextRole = event.target.value as StayCareRole
                setRole(nextRole)
                if (!navItems.find((item) => item.id === view)?.roles?.includes(nextRole) && navItems.find((item) => item.id === view)?.roles) setView("overview")
              }}
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none"
            >
              {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value} className="text-slate-900">{label}</option>)}
            </select>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              const active = item.id === view
              return (
                <button key={item.id} onClick={() => selectView(item.id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold transition ${active ? "bg-[#bb271a] text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}>
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                  {active ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
                </button>
              )
            })}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-2xl bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400"><Sparkles className="h-4 w-4" /> 합성데이터 데모</div>
              <p className="mt-2 text-xs leading-5 text-slate-400">실제 개인정보·결제·비자처리는 연결되지 않았습니다.</p>
            </div>
            <button className="mt-3 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><LogOut className="h-4 w-4" /> 데모 종료</button>
          </div>
        </div>
      </aside>

      {sidebarOpen ? <button className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-label="메뉴 닫기" /> : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
          <div className="flex h-20 items-center gap-4 px-4 sm:px-6 lg:px-8">
            <button onClick={() => setSidebarOpen(true)} className="rounded-xl border border-slate-200 p-2.5 text-slate-600 lg:hidden"><Menu className="h-5 w-5" /></button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#bb271a]">Sejoong StayCare</p>
              <h1 className="truncate text-xl font-black text-slate-950">{activeNav?.label ?? "운영 현황"}</h1>
            </div>
            <div className="hidden min-w-[280px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 sm:flex">
              <Search className="h-4 w-4 text-slate-400" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="회원, 비자, 고용주 검색" className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
            </div>
            <button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600"><Bell className="h-5 w-5" /><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#bb271a]" /></button>
            <div className="hidden items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 sm:flex">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">운</div>
              <div><p className="text-xs font-bold text-slate-900">운영 PM</p><p className="text-[11px] text-slate-500">{roleLabels[role]}</p></div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Reference implementation:</strong> 화면과 데이터는 사업검토용이며 실제 업무 수행 또는 법률판단을 의미하지 않습니다.</p></div>
              <LabelPill className="shrink-0 border-amber-300 bg-white text-amber-800">Phase 0</LabelPill>
            </div>

            {view === "overview" ? <OverviewView onOpenWorker={setSelectedWorker} /> : null}
            {view === "workers" ? <WorkersView query={query} onOpenWorker={setSelectedWorker} /> : null}
            {view === "onboarding" ? <OnboardingView onOpenWorker={setSelectedWorker} /> : null}
            {view === "tasks" ? <TasksView /> : null}
            {view === "tickets" ? <TicketsView /> : null}
            {view === "subscriptions" ? <SubscriptionsView /> : null}
            {view === "partners" ? <PartnersView /> : null}
            {view === "audit" ? <AuditView /> : null}
          </div>
        </main>
      </div>

      {selectedWorker ? <WorkerDetailDrawer worker={selectedWorker} onClose={() => setSelectedWorker(null)} /> : null}
    </div>
  )
}
