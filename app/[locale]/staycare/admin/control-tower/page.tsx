import type { Metadata } from "next"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Bus,
  CheckCircle2,
  ClipboardList,
  Plane,
  ShieldAlert,
  Users,
} from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import { requireStaffContext } from "@/lib/staycare/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "StayCare Sri Lanka Control Tower",
  robots: { index: false, follow: false },
}

type Cohort = {
  id: string
  code: string
  name: string
  target_headcount: number
  status: string
  visa_path: string | null
}
type Batch = {
  id: string
  cohort_id: string
  batch_code: string
  flight_number: string | null
  scheduled_arrival_at: string | null
  expected_headcount: number
  checked_in_headcount: number
  bus_reference: string | null
  status: string
}
type Worker = {
  id: string
  cohort_id: string | null
  arrival_batch_id: string | null
  status: string
  identity_claimed_at: string | null
  foreigner_registration_status: string | null
  risk_score: number
}
type Incident = {
  id: string
  incident_no: string
  title: string
  severity: string
  category: string
  status: string
  created_at: string
}

export default async function StayCareControlTowerPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const context = await requireStaffContext(locale)
  const managerMemberships = context.memberships.filter((item) =>
    ["sejoong_admin", "operator_manager", "operator_agent", "auditor"].includes(
      String(item.role)
    )
  )
  const tenantIds = Array.from(
    new Set(managerMemberships.map((item) => String(item.tenant_id)))
  )

  if (!tenantIds.length) {
    throw new Error("Control Tower access requires an operations membership.")
  }

  const [cohortsResult, batchesResult, workersResult, incidentsResult] =
    await Promise.all([
      context.supabase
        .from("staycare_cohorts")
        .select("id, code, name, target_headcount, status, visa_path")
        .in("tenant_id", tenantIds)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("staycare_arrival_batches")
        .select(
          "id, cohort_id, batch_code, flight_number, scheduled_arrival_at, expected_headcount, checked_in_headcount, bus_reference, status"
        )
        .in("tenant_id", tenantIds)
        .order("scheduled_arrival_at", { ascending: true, nullsFirst: false }),
      context.supabase
        .from("staycare_workers")
        .select(
          "id, cohort_id, arrival_batch_id, status, identity_claimed_at, foreigner_registration_status, risk_score"
        )
        .in("tenant_id", tenantIds)
        .neq("status", "closed")
        .limit(5000),
      context.supabase
        .from("staycare_incidents")
        .select("id, incident_no, title, severity, category, status, created_at")
        .in("tenant_id", tenantIds)
        .not("status", "in", "(resolved,closed)")
        .order("created_at", { ascending: false })
        .limit(100),
    ])

  const migrationMissing = [
    cohortsResult.error,
    batchesResult.error,
    incidentsResult.error,
  ].some((error) => error?.code === "42P01" || error?.message?.includes("does not exist"))

  if (workersResult.error) throw workersResult.error
  if (!migrationMissing) {
    const error = [cohortsResult.error, batchesResult.error, incidentsResult.error].find(Boolean)
    if (error) throw error
  }

  const cohorts = (cohortsResult.data || []) as Cohort[]
  const batches = (batchesResult.data || []) as Batch[]
  const workers = (workersResult.data || []) as Worker[]
  const incidents = (incidentsResult.data || []) as Incident[]
  const claimed = workers.filter((item) => item.identity_claimed_at).length
  const arrived = workers.filter((item) =>
    ["arrived", "settling", "active", "renewal", "returning", "returned"].includes(
      item.status
    )
  ).length
  const registered = workers.filter(
    (item) => item.foreigner_registration_status === "issued"
  ).length
  const highRisk = workers.filter((item) => item.risk_score >= 70).length
  const urgentIncidents = incidents.filter((item) => ["P0", "P1"].includes(item.severity)).length

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        title="Sri Lanka Workforce Control Tower"
        purpose="2,000명 전체 사업을 Cohort, 입국차수, 항공편, 버스, 기숙사·사업장 배치와 사고 대응 관점에서 한 화면으로 통제합니다."
        boundary="고용주와 현지기관에는 필요한 운영 집계만 제공하며 개인 법률·의료·인권상담의 세부내용은 공개하지 않습니다."
        items={[
          { label: "Funnel", description: "명부 → Claim → 출국 → 입국 → 배치 → 등록" },
          { label: "Arrival", description: "항공편·공항·버스·인솔자·인계" },
          { label: "Risk", description: "기한위험·고위험 근로자·P0/P1 사고" },
          { label: "Scale", description: "20~30명 → 200명 → 2,000명 Wave" },
        ]}
        links={[
          { href: `/${locale}/staycare/admin/roster`, label: "명부·초대코드 등록" },
          { href: `/${locale}/staycare/admin`, label: "통합 운영센터" },
          { href: `/${locale}/staycare/notes`, label: "페이지별 용도" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <Link href={`/${locale}/staycare/admin`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
          <ArrowLeft className="h-4 w-4" /> 통합 운영센터
        </Link>

        {migrationMissing ? (
          <div className="mt-5 rounded-2xl border border-amber-300 bg-amber-50 p-5 text-sm font-semibold leading-6 text-amber-900">
            <AlertTriangle className="mb-2 h-5 w-5" />
            운영 데이터 테이블이 아직 적용되지 않았습니다. Staging에서
            <code className="mx-1 rounded bg-white px-1.5 py-0.5">018_staycare_sri_lanka_operations.sql</code>
            을 검증한 후 Production에 적용하면 Cohort·입국차수·사고 데이터가 표시됩니다.
          </div>
        ) : null}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Metric icon={<ClipboardList />} label="Cohorts" value={cohorts.length} />
          <Metric icon={<Users />} label="Roster workers" value={workers.length} />
          <Metric icon={<CheckCircle2 />} label="Claimed" value={claimed} />
          <Metric icon={<Plane />} label="Arrived" value={arrived} />
          <Metric icon={<ShieldAlert />} label="ARC issued" value={registered} />
          <Metric icon={<AlertTriangle />} label="Urgent / high risk" value={urgentIncidents + highRisk} danger />
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-black">Cohort funnel</h1>
                <p className="mt-1 text-sm text-slate-500">사업·계약 단위별 명부와 계정 활성화 현황</p>
              </div>
              <Users className="h-7 w-7 text-blue-700" />
            </div>
            <div className="mt-5 space-y-4">
              {cohorts.length ? cohorts.map((cohort) => {
                const cohortWorkers = workers.filter((item) => item.cohort_id === cohort.id)
                const cohortClaimed = cohortWorkers.filter((item) => item.identity_claimed_at).length
                const percent = cohort.target_headcount
                  ? Math.min(100, Math.round((cohortWorkers.length / cohort.target_headcount) * 100))
                  : 0
                return (
                  <article key={cohort.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-xs font-black uppercase tracking-wide text-blue-700">{cohort.code}</p><h2 className="mt-1 font-black">{cohort.name}</h2><p className="mt-1 text-xs text-slate-500">{cohort.visa_path || "Visa path pending"} · {cohort.status}</p></div>
                      <p className="text-sm font-black">{cohortWorkers.length} / {cohort.target_headcount}</p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-blue-700" style={{ width: `${percent}%` }} /></div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600"><span>Claimed {cohortClaimed}</span><span>Not claimed {Math.max(0, cohortWorkers.length - cohortClaimed)}</span><span>Progress {percent}%</span></div>
                  </article>
                )
              }) : <Empty label="No cohort has been registered." />}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Arrival waves</h2><p className="mt-1 text-sm text-slate-500">항공편·버스·도착인계 상태</p></div><Bus className="h-7 w-7 text-violet-700" /></div>
            <div className="mt-5 space-y-3">
              {batches.length ? batches.map((batch) => (
                <article key={batch.id} className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-black">{batch.batch_code}</p><p className="mt-1 text-xs text-slate-500">{batch.flight_number || "Flight pending"} · {batch.bus_reference || "Bus pending"}</p></div><span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-black text-violet-800">{batch.status}</span></div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold text-slate-600"><span>Expected {batch.expected_headcount}</span><span>Checked in {batch.checked_in_headcount}</span><span>{batch.scheduled_arrival_at ? new Date(batch.scheduled_arrival_at).toLocaleString("ko-KR") : "Arrival time pending"}</span></div>
                </article>
              )) : <Empty label="No arrival batch has been registered." />}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-center justify-between gap-3"><div><h2 className="text-2xl font-black">Incident command</h2><p className="mt-1 text-sm text-slate-500">P0/P1은 즉시 에스컬레이션하고 증거와 legal hold를 보존합니다.</p></div><ShieldAlert className="h-7 w-7 text-red-700" /></div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">Severity</th><th className="p-3">Incident</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Created</th></tr></thead><tbody>{incidents.map((incident) => <tr key={incident.id} className="border-b"><td className="p-3"><span className={`rounded-full px-2.5 py-1 text-xs font-black ${["P0","P1"].includes(incident.severity) ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}`}>{incident.severity}</span></td><td className="p-3"><p className="font-black">{incident.title}</p><p className="text-xs text-slate-500">{incident.incident_no}</p></td><td className="p-3">{incident.category}</td><td className="p-3">{incident.status}</td><td className="p-3 text-xs">{new Date(incident.created_at).toLocaleString("ko-KR")}</td></tr>)}</tbody></table>
            {!incidents.length ? <Empty label="No open incident." /> : null}
          </div>
        </section>
      </div>
    </main>
  )
}

function Metric({ icon, label, value, danger = false }: { icon: React.ReactNode; label: string; value: number; danger?: boolean }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${danger ? "bg-red-100 text-red-800" : "bg-slate-100 text-slate-700"}`}>{icon}</span><p className="mt-4 text-3xl font-black">{value.toLocaleString("ko-KR")}</p><p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">{label}</p></div>
}

function Empty({ label }: { label: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">{label}</div>
}
