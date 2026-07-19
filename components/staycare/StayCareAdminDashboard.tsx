"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  FileSearch,
  Loader2,
  RefreshCw,
  Send,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from "lucide-react"

interface AdminApplication {
  id: string
  application_no: string
  status: string
  language: string
  submitted_at: string | null
  external_reference: string | null
  submitted_data: Record<string, unknown> | null
  worker?: {
    full_name?: string
    full_name_en?: string | null
    member_no?: string
    visa_type?: string | null
  } | null
  service?: {
    code?: string
    category?: string
    name?: Record<string, string> | string
    integration_mode?: string
  } | null
}

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

function localized(value: Record<string, string> | string | undefined) {
  if (!value) return "Service"
  if (typeof value === "string") return value
  return value.ko || value.en || value.si || "Service"
}

function statusClass(status: string) {
  if (["fulfilled", "approved"].includes(status)) return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (["rejected", "cancelled"].includes(status)) return "border-red-200 bg-red-50 text-red-700"
  return "border-amber-200 bg-amber-50 text-amber-700"
}

function environmentStateClass(state: EnvironmentItem["state"]) {
  if (state === "configured") return "border-emerald-200 bg-emerald-50 text-emerald-700"
  if (state === "manual") return "border-blue-200 bg-blue-50 text-blue-700"
  if (state === "partial") return "border-amber-200 bg-amber-50 text-amber-700"
  return "border-red-200 bg-red-50 text-red-700"
}

function environmentStateLabel(state: EnvironmentItem["state"]) {
  if (state === "configured") return "설정됨"
  if (state === "manual") return "수동운영"
  if (state === "partial") return "일부설정"
  return "미설정"
}

function releaseStateCopy(state: EnvironmentReport["summary"]["releaseState"]) {
  if (state === "production-ready") return { label: "상용 운영 준비", className: "bg-emerald-500 text-white" }
  if (state === "limited-production") return { label: "제한 상용 운영", className: "bg-blue-600 text-white" }
  if (state === "internal-pilot") return { label: "내부 파일럿 가능", className: "bg-amber-400 text-amber-950" }
  return { label: "출시 차단", className: "bg-red-600 text-white" }
}

const environmentGroupLabels: Record<EnvironmentItem["group"], string> = {
  core: "핵심 인프라",
  production: "상용 운영 필수",
  provider: "외부 공급자",
  optional: "선택 기능",
}

export default function StayCareAdminDashboard({
  applications: initialApplications,
  metrics,
  environment,
  databaseStatus,
}: {
  applications: AdminApplication[]
  metrics: {
    workers: number
    openApplications: number
    reviewDocuments: number
    urgentTickets: number
  }
  environment: EnvironmentReport
  databaseStatus: {
    connected: boolean
    tenantCount: number
  }
}) {
  const [applications, setApplications] = useState(initialApplications)
  const [selected, setSelected] = useState<AdminApplication | null>(null)
  const [status, setStatus] = useState("reviewing")
  const [message, setMessage] = useState("")
  const [externalReference, setExternalReference] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showEnvironment, setShowEnvironment] = useState(true)
  const router = useRouter()

  const save = async () => {
    if (!selected) return
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`/api/staycare/admin/applications/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          workerVisibleMessage: message,
          externalReference,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Update failed")
      setApplications((current) => current.map((item) => item.id === selected.id ? { ...item, ...data.application } : item))
      setSelected(null)
      setMessage("")
      setExternalReference("")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Update failed")
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    [UsersRound, "Registered workers", metrics.workers],
    [Send, "Open applications", metrics.openApplications],
    [FileSearch, "Documents for review", metrics.reviewDocuments],
    [AlertTriangle, "P0/P1 tickets", metrics.urgentTickets],
  ] as const

  const release = releaseStateCopy(environment.summary.releaseState)
  const missingRequired = environment.items.filter((item) => item.required && item.state !== "configured")

  return (
    <main className="min-h-screen bg-[#f4f5f7] p-4 text-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#bb271a]">Sejoong StayCare Operations</p>
            <h1 className="mt-2 text-3xl font-black">통합 운영센터</h1>
            <p className="mt-2 text-sm text-slate-500">실제 회원·문서·서비스 신청·공급자 처리상태와 운영 환경을 관리합니다.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowEnvironment((current) => !current)}
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"
            >
              <Settings2 className="mr-2 h-4 w-4" /> 환경설정
            </button>
            <button onClick={() => router.refresh()} className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black">
              <RefreshCw className="mr-2 h-4 w-4" /> 새로고침
            </button>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([Icon, label, value]) => (
            <article key={label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span>
                <span className="text-3xl font-black">{value}</span>
              </div>
              <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
            </article>
          ))}
        </section>

        {showEnvironment ? (
          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 border-b border-slate-200 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-lg font-black">상용 환경 준비상태</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${release.className}`}>{release.label}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  비밀값 자체는 표시하지 않고, Vercel 런타임에 입력되었는지와 공개 가능한 호스트·모드만 보여줍니다.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 text-xs font-bold text-slate-600">
                <span className="rounded-xl bg-slate-100 px-3 py-2">환경 {environment.environment}</span>
                <span className="rounded-xl bg-slate-100 px-3 py-2">Commit {environment.commitSha || "local"}</span>
                <span className="rounded-xl bg-slate-100 px-3 py-2">점검 {environment.summary.percentage}%</span>
              </div>
            </div>

            <div className="grid gap-4 border-b border-slate-100 p-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3"><Database className="h-5 w-5 text-emerald-600" /><p className="font-black">Database</p></div>
                <p className="mt-3 text-2xl font-black text-slate-950">{databaseStatus.connected ? "Connected" : "Unavailable"}</p>
                <p className="mt-1 text-xs text-slate-500">활성 tenant membership {databaseStatus.tenantCount}개</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3"><Server className="h-5 w-5 text-blue-600" /><p className="font-black">Core environment</p></div>
                <p className="mt-3 text-2xl font-black text-slate-950">{environment.summary.coreConfigured}/{environment.summary.coreTotal}</p>
                <p className="mt-1 text-xs text-slate-500">DB·Storage·암호화·내부 보안값</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-violet-600" /><p className="font-black">Production services</p></div>
                <p className="mt-3 text-2xl font-black text-slate-950">{environment.summary.productionConfigured}/{environment.summary.productionTotal}</p>
                <p className="mt-1 text-xs text-slate-500">AI·Rate limit·Email·Bot protection·Monitoring</p>
              </div>
            </div>

            {missingRequired.length ? (
              <div className="flex gap-3 border-b border-red-100 bg-red-50 px-5 py-4 text-sm leading-6 text-red-900">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-black">필수 설정 {missingRequired.length}개가 남아 있습니다.</p>
                  <p className="mt-1">{missingRequired.map((item) => item.label).join(" · ")}</p>
                </div>
              </div>
            ) : null}

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3">구분</th>
                    <th className="px-5 py-3">서비스</th>
                    <th className="px-5 py-3">환경변수</th>
                    <th className="px-5 py-3">공개 정보</th>
                    <th className="px-5 py-3">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {environment.items.map((item) => (
                    <tr key={item.id} className="align-top hover:bg-slate-50/60">
                      <td className="whitespace-nowrap px-5 py-4 text-xs font-black text-slate-500">{environmentGroupLabels[item.group]}</td>
                      <td className="px-5 py-4">
                        <p className="font-black text-slate-900">{item.label}</p>
                        <p className="mt-1 max-w-lg text-xs leading-5 text-slate-500">{item.detail}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-md flex-wrap gap-1.5">
                          {item.keys.map((key) => <code key={key} className="rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">{key}</code>)}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-semibold text-slate-600">{item.publicValue || "비밀값 비공개"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${environmentStateClass(item.state)}`}>{environmentStateLabel(item.state)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-500">
              마지막 서버 점검: {new Date(environment.generatedAt).toLocaleString("ko-KR")} · 값 변경 후에는 Vercel 재배포가 필요합니다.
            </div>
          </section>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-black">서비스 신청 처리 큐</h2>
            <p className="mt-1 text-sm text-slate-500">수동 운영, Sandbox, API 연동 모두 같은 상태체계로 처리합니다.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">신청</th>
                  <th className="px-5 py-3">회원</th>
                  <th className="px-5 py-3">서비스</th>
                  <th className="px-5 py-3">접수일</th>
                  <th className="px-5 py-3">상태</th>
                  <th className="px-5 py-3">처리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4"><p className="font-black">{application.application_no}</p><p className="mt-1 text-xs text-slate-400">{application.service?.integration_mode || "manual"}</p></td>
                    <td className="px-5 py-4"><p className="font-bold">{application.worker?.full_name_en || application.worker?.full_name || "—"}</p><p className="mt-1 text-xs text-slate-400">{application.worker?.member_no || "—"} · {application.worker?.visa_type || "visa pending"}</p></td>
                    <td className="px-5 py-4"><p className="font-bold">{localized(application.service?.name)}</p><p className="mt-1 text-xs text-slate-400">{application.service?.category}</p></td>
                    <td className="px-5 py-4 text-slate-500">{application.submitted_at ? new Date(application.submitted_at).toLocaleString("ko-KR") : "—"}</td>
                    <td className="px-5 py-4"><span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusClass(application.status)}`}>{application.status}</span></td>
                    <td className="px-5 py-4"><button onClick={() => { setSelected(application); setStatus(application.status === "submitted" ? "reviewing" : application.status); setExternalReference(application.external_reference || "") }} className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white">열기</button></td>
                  </tr>
                ))}
                {!applications.length ? <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-500">현재 처리할 신청이 없습니다.</td></tr> : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-sm">
          <button className="absolute inset-0" onClick={() => setSelected(null)} aria-label="닫기" />
          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div><p className="text-xs font-black text-[#bb271a]">{selected.application_no}</p><h2 className="mt-1 text-xl font-black">{localized(selected.service?.name)}</h2></div>
              <button onClick={() => setSelected(null)} className="rounded-xl border border-slate-200 p-2" aria-label="닫기">×</button>
            </div>
            <div className="space-y-5 p-5">
              <div className="rounded-2xl bg-slate-950 p-5 text-sm leading-7 text-slate-300">
                <p className="font-black text-white">{selected.worker?.full_name_en || selected.worker?.full_name}</p>
                <p className="mt-2">{selected.worker?.member_no} · {selected.worker?.visa_type || "Visa pending"}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-black">Submitted data</p>
                <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">{JSON.stringify(selected.submitted_data || {}, null, 2)}</pre>
              </div>

              <label className="block text-sm font-black">처리상태
                <select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3">
                  <option value="reviewing">reviewing</option>
                  <option value="waiting_worker">waiting_worker</option>
                  <option value="waiting_authority">waiting_authority</option>
                  <option value="waiting_provider">waiting_provider</option>
                  <option value="approved">approved</option>
                  <option value="fulfilled">fulfilled</option>
                  <option value="rejected">rejected</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </label>
              <label className="block text-sm font-black">공급자·기관 참조번호
                <input value={externalReference} onChange={(event) => setExternalReference(event.target.value)} maxLength={200} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              <label className="block text-sm font-black">회원에게 보일 안내
                <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} className="mt-2 min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3" />
              </label>
              {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">{error}</div> : null}
              <button onClick={save} disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-[#bb271a] px-5 py-4 font-black text-white disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}저장 및 회원 통지
              </button>
            </div>
          </aside>
        </div>
      ) : null}
    </main>
  )
}
