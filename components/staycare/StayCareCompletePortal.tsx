"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Activity,
  AlertTriangle,
  ArrowRight,
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
  CreditCard,
  FileCheck2,
  FileLock2,
  FileText,
  Gauge,
  Headphones,
  Languages,
  LayoutDashboard,
  ListChecks,
  Menu,
  MessageSquareWarning,
  ReceiptText,
  Scale,
  Search,
  Settings2,
  ShieldCheck,
  Siren,
  Smartphone,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react"
import {
  annualMembership,
  calculateUnitEconomics,
  DEFAULT_ANNUAL_FEE,
  DEFAULT_DIRECT_COST_RATE,
  DEFAULT_MEMBER_COUNT,
  formatKrw,
  implementationPhases,
  payerLabels,
  programMemberSamples,
  programTicketSamples,
  sejoongOperatingModel,
  type ProgramMemberSample,
  type StayCarePayer,
  type StayCarePriority,
} from "@/lib/staycare/commercial-model"

type PortalView =
  | "overview"
  | "cohort"
  | "members"
  | "workflow"
  | "serviceDesk"
  | "membership"
  | "finance"
  | "reports"
  | "governance"

const navItems: Array<{ id: PortalView; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "통합 현황", icon: LayoutDashboard },
  { id: "cohort", label: "200명 도입계획", icon: UsersRound },
  { id: "members", label: "회원·근로자", icon: BriefcaseBusiness },
  { id: "workflow", label: "업무·기한", icon: ListChecks },
  { id: "serviceDesk", label: "상담·사건", icon: MessageSquareWarning },
  { id: "membership", label: "멤버십·청구", icon: CreditCard },
  { id: "finance", label: "운영비·원가", icon: CircleDollarSign },
  { id: "reports", label: "리포트", icon: FileText },
  { id: "governance", label: "권한·감사", icon: ShieldCheck },
]

const priorityStyles: Record<StayCarePriority, string> = {
  P0: "border-red-200 bg-red-50 text-red-700",
  P1: "border-orange-200 bg-orange-50 text-orange-700",
  P2: "border-amber-200 bg-amber-50 text-amber-700",
  P3: "border-slate-200 bg-slate-50 text-slate-700",
}

const readinessItems = [
  { label: "사업 계약·비용부담자", status: "협의 필요", progress: 35, owner: "세중 대표·담당자" },
  { label: "200명 기본 명단", status: "자료 요청", progress: 20, owner: "해외 도입 담당자" },
  { label: "비자·직무·고용주 매핑", status: "자료 요청", progress: 15, owner: "세중 출입국팀" },
  { label: "고용조건·숙소·보험 구조", status: "검토 준비", progress: 25, owner: "세중 노무·생활정착팀" },
  { label: "플랫폼·다국어 온보딩", status: "브리핑 가능", progress: 80, owner: "위탁 운영사" },
  { label: "상담·SLA·현장지원 기준", status: "기준안 완료", progress: 90, owner: "세중 통합운영센터" },
]

const workflowRows = [
  { id: "WF-001", title: "도입 담당자 사업정보 확인", category: "계약", owner: "세중 통합운영센터", due: "7월 27일", status: "협의대기", evidence: "인원·비자·고용주 표" },
  { id: "WF-002", title: "200명 명단 업로드 템플릿 배포", category: "온보딩", owner: "위탁 운영사", due: "계약 후 D+1", status: "준비완료", evidence: "CSV·초대링크" },
  { id: "WF-003", title: "국가·비자·직무별 문서 체크", category: "출입국", owner: "세중 출입국팀", due: "명단 수령 후 5영업일", status: "대기", evidence: "누락자료 리포트" },
  { id: "WF-004", title: "숙소·유심·계좌·보험 실행계획", category: "정착", owner: "세중 생활정착팀", due: "첫 입국 30일 전", status: "템플릿완료", evidence: "현장 운영표" },
  { id: "WF-005", title: "근로조건·공제·숙소비 검토", category: "노무", owner: "세중 노무·산재팀", due: "계약서 수령 후 3영업일", status: "대기", evidence: "검토의견" },
  { id: "WF-006", title: "월간 회원상태·SLA·원가보고", category: "리포트", owner: "세중 통합운영센터", due: "매월 5영업일", status: "자동화예정", evidence: "PDF·Excel" },
]

const reportCards = [
  { title: "세중 경영 리포트", description: "활성회원, 계약금액, 미납, 상담량, 전문사건, 직접비, 운영재원", audience: "세중 경영진" },
  { title: "200명 도입 진행 리포트", description: "명단, 문서누락, 비자경로, 고용주, 입국파동, 숙소·보험 준비", audience: "도입 담당자" },
  { title: "고용주 제한 리포트", description: "소속 근로자의 기한·누락·배치·일반 운영이슈만 최소정보로 제공", audience: "고용주" },
  { title: "운영·SLA 리포트", description: "티켓량, 최초응답, 해결시간, 현장지원, 통역시간, 담당자 부하", audience: "운영센터" },
]

const auditRows = [
  { time: "2026-07-19 18:20", actor: "세중 서비스 관리자", action: "연간 멤버십 기준안 승인", object: "상품 StayCare Annual", reason: "27일 브리핑 기준" },
  { time: "2026-07-19 18:05", actor: "위탁 운영 PM", action: "200명 도입 프로그램 생성", object: "Sri Lanka 200 Program", reason: "담당자 협의 준비" },
  { time: "2026-07-19 17:48", actor: "세중 출입국팀", action: "E-7·E-9·E-10 체크리스트 버전 등록", object: "Workflow templates", reason: "국적·직무별 검토" },
  { time: "2026-07-19 17:30", actor: "시스템", action: "브리핑 화면 noindex 확인", object: "StayCare briefing", reason: "내부 협의자료 보호" },
]

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold ${className}`}>{children}</span>
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div className="h-full rounded-full bg-[#bb271a]" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

function Card({ title, description, action, children, className = "" }: { title: string; description?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-black text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

function Metric({ label, value, note, tone = "default" }: { label: string; value: string; note: string; tone?: "default" | "success" | "warning" | "critical" }) {
  const toneClass = tone === "success" ? "border-emerald-200 bg-emerald-50/60" : tone === "warning" ? "border-amber-200 bg-amber-50/60" : tone === "critical" ? "border-red-200 bg-red-50/60" : "border-slate-200 bg-white"
  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  )
}

function MemberDrawer({ member, onClose }: { member: ProgramMemberSample; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-sm" role="dialog" aria-modal="true">
      <button className="absolute inset-0" onClick={onClose} aria-label="닫기" />
      <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#bb271a]">Pre-arrival profile</p>
            <h2 className="mt-1 text-xl font-black">{member.name}</h2>
          </div>
          <button onClick={onClose} className="rounded-xl border border-slate-200 p-2 text-slate-500"><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-5 p-5">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm text-slate-400">{member.id}</p>
            <p className="mt-2 text-2xl font-black">{member.nameEn}</p>
            <p className="mt-2 text-sm text-slate-300">{member.visa} · {member.job}</p>
            <div className="mt-5"><Progress value={member.completion} /></div>
            <p className="mt-2 text-right text-xs text-slate-400">사전준비 {member.completion}%</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["고용주", member.employer],
              ["비용부담", payerLabels[member.payer]],
              ["현재 단계", member.stage],
              ["세중 담당", member.owner],
              ["다음 업무", member.nextAction],
              ["위험도", member.risk],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 p-4">
                <p className="text-xs font-semibold text-slate-500">{label}</p>
                <p className="mt-2 text-sm font-black text-slate-900">{value}</p>
              </div>
            ))}
          </div>
          <Card title="입국 전 확인항목" description="실제 명단 수령 후 회원별 상태로 전환">
            <div className="space-y-3 p-5">
              {["여권 원문과 만료일", "세부 비자·직종 코드", "경력·자격·학력 증빙", "고용주·사업장·계약조건", "입국 파동·항공편", "숙소·보험·통신·은행 계획"].map((item, index) => (
                <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                  {index < 2 ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Clock3 className="h-5 w-5 text-amber-600" />}
                  {item}
                </div>
              ))}
            </div>
          </Card>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900">
            이 화면은 합성 프로필입니다. 실명·여권·비자 자료는 계약, 동의, 비공개 Storage, RLS와 감사로그가 적용된 뒤에만 입력합니다.
          </div>
        </div>
      </aside>
    </div>
  )
}

export default function StayCareCompletePortal({ locale = "ko" }: { locale?: string }) {
  const [view, setView] = useState<PortalView>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [selectedMember, setSelectedMember] = useState<ProgramMemberSample | null>(null)
  const [memberCount, setMemberCount] = useState(DEFAULT_MEMBER_COUNT)
  const [annualFee, setAnnualFee] = useState(DEFAULT_ANNUAL_FEE)
  const [directCostRate, setDirectCostRate] = useState(DEFAULT_DIRECT_COST_RATE)
  const [payer, setPayer] = useState<StayCarePayer>("employer")

  const economics = useMemo(() => calculateUnitEconomics({ memberCount, annualFee, directCostRate }), [memberCount, annualFee, directCostRate])
  const members = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return programMemberSamples
    return programMemberSamples.filter((member) => [member.name, member.nameEn, member.id, member.visa, member.job, member.employer].some((value) => value.toLowerCase().includes(normalized)))
  }, [query])

  const renderOverview = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="도입 목표" value={`${memberCount}명`} note="27일 담당자와 명단·비자·입국파동 확정" />
        <Metric label="기준 계약금액" value={formatKrw(economics.annualRevenue)} note={`1인 연 ${formatKrw(annualFee)} · ${payerLabels[payer]}`} tone="success" />
        <Metric label="플랫폼·운영재원" value={formatKrw(economics.annualOperationsBudget)} note={`직접비 ${Math.round(directCostRate * 100)}% 제외`} tone="success" />
        <Metric label="현재 준비도" value="44%" note="플랫폼 기준안 완료, 사업정보·명단 협의 필요" tone="warning" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="27일 협의 준비 현황" description="입국자가 오는 날이 아니라 200명 사업조건을 확정하는 미팅입니다" action={<Link href={`/${locale}/staycare/briefing`} className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">브리핑 모드 <ArrowRight className="ml-2 h-4 w-4" /></Link>}>
          <div className="divide-y divide-slate-100">
            {readinessItems.map((item) => (
              <div key={item.label} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_130px_130px] sm:items-center">
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.owner}</p>
                </div>
                <div><Progress value={item.progress} /><p className="mt-1 text-right text-[11px] text-slate-400">{item.progress}%</p></div>
                <Pill className={item.progress >= 80 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{item.status}</Pill>
              </div>
            ))}
          </div>
        </Card>

        <Card title="세중 단일 책임구조" description="회원에게는 세중만 보이고 운영·전문팀은 내부 배정됩니다">
          <div className="space-y-3 p-5">
            {sejoongOperatingModel.map((item, index) => (
              <div key={item.actor} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">{index + 1}</span>
                  <div><p className="font-black">{item.actor}</p><p className="text-xs text-[#bb271a]">{item.externalRole}</p></div>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">{item.responsibilities.slice(0, 2).join(" · ")}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="200명 실행 단계" description="사업 확정 후 명단·입국파동에 따라 자동 생성">
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {implementationPhases.map((phase) => (
              <div key={phase.phase} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-black text-[#bb271a]">{phase.phase}</p>
                <p className="mt-2 font-black">{phase.title}</p>
                <p className="mt-1 text-xs text-slate-500">{phase.period}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card title="긴급도별 SLA" description="모든 문의는 세중 통합운영센터로 접수">
          <div className="space-y-3 p-5">
            {Object.entries(annualMembership.responsePolicy).map(([priority, policy]) => (
              <div key={priority} className="flex gap-3 rounded-2xl border border-slate-200 p-4">
                <Pill className={priorityStyles[priority as StayCarePriority]}>{priority}</Pill>
                <p className="text-sm leading-6 text-slate-600">{policy}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderCohort = () => (
    <div className="space-y-5">
      <Card title="스리랑카 200명 도입 프로그램" description="실제 인원·비자·고용주·입국일은 27일 담당자 협의 후 확정">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="목표 인원" value={`${memberCount}명`} note="계약 후 명단 CSV·초대링크 등록" />
          <Metric label="입국 파동" value="협의 필요" note="일괄 또는 단계별 입국 일정" tone="warning" />
          <Metric label="비자 구성" value="E-7·E-9·E-10" note="개인별 자격경로를 세중이 검토" />
          <Metric label="고용주·사업장" value="미확정" note="계약·숙소·현장지원 권역 결정 필요" tone="warning" />
        </div>
      </Card>
      <div className="grid gap-5 xl:grid-cols-[1fr_0.9fr]">
        <Card title="단계별 산출물" description="입국 전 8~12주부터 연간 관리까지">
          <div className="divide-y divide-slate-100">
            {implementationPhases.map((phase) => (
              <div key={phase.phase} className="grid gap-3 px-5 py-5 sm:grid-cols-[100px_1fr]">
                <div><Pill className="border-red-200 bg-red-50 text-[#bb271a]">{phase.phase}</Pill><p className="mt-2 text-xs text-slate-500">{phase.period}</p></div>
                <div><p className="font-black">{phase.title}</p><div className="mt-3 flex flex-wrap gap-2">{phase.outputs.map((output) => <span key={output} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">{output}</span>)}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="계약 직후 필요한 데이터" description="200명을 관리할 최소 시작정보">
          <div className="space-y-3 p-5">
            {["개인 영문명·생년월일·여권번호·여권만료", "희망·예정 비자와 직무·경력·자격", "고용주·사업장·근로조건·숙소", "예상 입국일·항공편·입국파동", "비용부담자·청구방식·계약번호", "한국·스리랑카 담당자·긴급연락망"].map((item, index) => (
              <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-black text-[#bb271a]">{index + 1}</span>{item}</div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )

  const renderMembers = () => (
    <Card title="회원·근로자 사전명단" description="현재 화면은 200명 프로그램을 설명하기 위한 합성 샘플입니다" action={<div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="이름·비자·직무 검색" className="w-64 rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#bb271a]" /></div>}>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{["회원", "비자·직무", "현재 단계", "비용부담", "세중 담당", "준비도", "위험"].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100">
            {members.map((member) => (
              <tr key={member.id} onClick={() => setSelectedMember(member)} className="cursor-pointer hover:bg-slate-50">
                <td className="px-5 py-4"><p className="font-black text-slate-900">{member.name}</p><p className="text-xs text-slate-500">{member.nameEn} · {member.id}</p></td>
                <td className="px-5 py-4"><p className="font-semibold">{member.visa}</p><p className="text-xs text-slate-500">{member.job}</p></td>
                <td className="px-5 py-4"><Pill className="border-blue-200 bg-blue-50 text-blue-700">{member.stage}</Pill></td>
                <td className="px-5 py-4 text-slate-600">{payerLabels[member.payer]}</td>
                <td className="px-5 py-4 text-slate-600">{member.owner}</td>
                <td className="min-w-32 px-5 py-4"><Progress value={member.completion} /><p className="mt-1 text-right text-xs text-slate-400">{member.completion}%</p></td>
                <td className="px-5 py-4"><Pill className={member.risk === "높음" ? "border-red-200 bg-red-50 text-red-700" : member.risk === "주의" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}>{member.risk}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )

  const renderWorkflow = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="기준안 완료" value="3" note="플랫폼·상품·SLA" tone="success" />
        <Metric label="협의 대기" value="1" note="27일 담당자 미팅" tone="warning" />
        <Metric label="자료 수령 대기" value="2" note="명단·고용주·비자·일정" tone="warning" />
        <Metric label="자동화 대상" value="6" note="체크리스트·알림·리포트" />
      </div>
      <Card title="업무·기한 보드" description="모든 일반·전문업무를 세중 내부 담당조직에 배정">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs text-slate-500"><tr>{["업무", "분류", "세중 담당", "기한", "상태", "완료증빙"].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead>
            <tbody className="divide-y divide-slate-100">{workflowRows.map((row) => <tr key={row.id}><td className="px-5 py-4"><p className="font-black">{row.title}</p><p className="text-xs text-slate-400">{row.id}</p></td><td className="px-5 py-4">{row.category}</td><td className="px-5 py-4 text-slate-600">{row.owner}</td><td className="px-5 py-4 font-semibold">{row.due}</td><td className="px-5 py-4"><Pill className={row.status.includes("완료") || row.status.includes("준비") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>{row.status}</Pill></td><td className="px-5 py-4 text-slate-600">{row.evidence}</td></tr>)}</tbody>
          </table>
        </div>
      </Card>
    </div>
  )

  const renderServiceDesk = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {programTicketSamples.map((ticket) => <Metric key={ticket.id} label={`${ticket.priority} · ${ticket.category}`} value={ticket.sla} note={ticket.title} tone={ticket.priority === "P0" ? "critical" : ticket.priority === "P1" ? "warning" : "default"} />)}
      </div>
      <Card title="세중 통합 상담·사건 큐" description="일반업무와 전문사건을 고객에게 분리시키지 않고 세중 내부에서 담당팀을 배정">
        <div className="divide-y divide-slate-100">
          {programTicketSamples.map((ticket) => (
            <div key={ticket.id} className="grid gap-3 px-5 py-5 md:grid-cols-[80px_1.4fr_1fr_110px] md:items-center">
              <Pill className={priorityStyles[ticket.priority]}>{ticket.priority}</Pill>
              <div><p className="font-black">{ticket.title}</p><p className="mt-1 text-xs text-slate-500">{ticket.id} · {ticket.category}</p></div>
              <div><p className="text-sm font-semibold text-slate-700">{ticket.owner}</p><p className="mt-1 text-xs text-slate-500">{ticket.status}</p></div>
              <div className="text-right"><p className="text-xs text-slate-500">최초응답</p><p className="font-black text-[#bb271a]">{ticket.sla}</p></div>
            </div>
          ))}
        </div>
      </Card>
      <Card title="연간 포함 상담량" description="합리적 사용량을 정하고 초과 업무는 세중이 별도 견적">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="예약형 비대면 상담" value="연 12회" note="회당 최대 30분" />
          <Metric label="기본 전문검토" value="연 4회" note="법률·출입국·노무 기본범위" />
          <Metric label="전화·화상 통역" value="연 180분" note="초과 시 사전승인" />
          <Metric label="현장지원" value="연 2회" note="계약권역·회당 2시간" />
        </div>
      </Card>
    </div>
  )

  const renderMembership = () => (
    <div className="space-y-5">
      <Card title="연간 통합관리 멤버십" description="기본값 1인 연 100만 원, 납부자는 계약별 설정">
        <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr]">
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm font-bold text-red-300">{annualMembership.name}</p>
            <p className="mt-4 text-4xl font-black">{formatKrw(annualFee)}</p>
            <p className="mt-2 text-sm text-slate-400">월 환산 {formatKrw(Math.round(annualFee / 12))} · 가격은 관리자 설정값</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">{(Object.keys(payerLabels) as StayCarePayer[]).map((item) => <button key={item} onClick={() => setPayer(item)} className={`rounded-xl border p-3 text-left text-xs font-bold ${payer === item ? "border-red-300 bg-red-400/15 text-red-200" : "border-white/10 bg-white/5 text-slate-300"}`}>{payerLabels[item]}</button>)}</div>
          </div>
          <div className="space-y-3">{annualMembership.billingOptions.map((item) => <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-semibold text-slate-700"><WalletCards className="h-5 w-5 text-[#bb271a]" />{item}</div>)}</div>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="포함 서비스" description="연간 기본요금으로 제공">
          <div className="max-h-[560px] space-y-3 overflow-y-auto p-5">{annualMembership.included.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-700"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />{item}</div>)}</div>
        </Card>
        <Card title="별도 견적·실비" description="모두 세중을 통해 접수하되 연간 포함량과 분리">
          <div className="space-y-3 p-5">{annualMembership.separatelyQuoted.map((item) => <div key={item} className="flex gap-3 rounded-xl bg-amber-50 p-3 text-sm leading-6 text-amber-950"><ReceiptText className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />{item}</div>)}</div>
        </Card>
      </div>
    </div>
  )

  const renderFinance = () => (
    <div className="space-y-5">
      <Card title="200명 기준 단위경제성" description="직접비 20~30%, 잔여 재원은 플랫폼·운영 인력·CS·품질관리 예산">
        <div className="grid gap-5 p-5 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-5 rounded-3xl bg-slate-50 p-5">
            <label className="block"><span className="flex justify-between text-sm font-bold"><span>회원 수</span><span>{memberCount}명</span></span><input className="mt-3 w-full accent-[#bb271a]" type="range" min="20" max="1000" step="10" value={memberCount} onChange={(event) => setMemberCount(Number(event.target.value))} /></label>
            <label className="block"><span className="flex justify-between text-sm font-bold"><span>1인 연간요금</span><span>{formatKrw(annualFee)}</span></span><input className="mt-3 w-full accent-[#bb271a]" type="range" min="300000" max="2000000" step="50000" value={annualFee} onChange={(event) => setAnnualFee(Number(event.target.value))} /></label>
            <label className="block"><span className="flex justify-between text-sm font-bold"><span>직접비</span><span>{Math.round(directCostRate * 100)}%</span></span><input className="mt-3 w-full accent-[#bb271a]" type="range" min="0.2" max="0.3" step="0.01" value={directCostRate} onChange={(event) => setDirectCostRate(Number(event.target.value))} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Metric label="연간 총 계약금액" value={formatKrw(economics.annualRevenue)} note={`${memberCount}명 × ${formatKrw(annualFee)}`} tone="success" />
            <Metric label="월 환산 매출" value={formatKrw(economics.monthlyRunRate)} note="연간 금액 ÷ 12" />
            <Metric label="연간 직접비" value={formatKrw(economics.annualDirectCost)} note="전문가·통역·현장·외부 실비" tone="warning" />
            <Metric label="플랫폼·운영재원" value={formatKrw(economics.annualOperationsBudget)} note="개발·운영인력·CS·품질·예비비" tone="success" />
          </div>
        </div>
      </Card>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="직접비 25% 예시" description="실제 배분은 세중과 운영사 계약에서 확정">
          <div className="space-y-3 p-5">{[
            ["전문가·법률·출입국·노무 수행비", "10%"],
            ["싱할라어·영어 통역·번역", "5%"],
            ["현장지원·교통·지역 수행", "5%"],
            ["통신·숙소·의료 등 제3자 실행비", "3%"],
            ["긴급·예외 직접비 예비", "2%"],
          ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="font-black text-[#bb271a]">{value}</span></div>)}</div>
        </Card>
        <Card title="플랫폼·운영재원 75% 예시" description="Boss 측 운영비와 실제 서비스 인력·개발비를 이 재원에서 집행">
          <div className="space-y-3 p-5">{[
            ["플랫폼 개발·보안·유지보수", "15%"],
            ["운영 PM·코디네이터·CS", "30%"],
            ["세중 통합운영·품질관리", "15%"],
            ["다국어 콘텐츠·교육·리포트", "5%"],
            ["사업관리·예비비·확장재원", "10%"],
          ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 p-4"><span className="text-sm font-semibold text-slate-700">{label}</span><span className="font-black text-slate-950">{value}</span></div>)}</div>
        </Card>
      </div>
    </div>
  )

  const renderReports = () => (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">{reportCards.map((report) => <article key={report.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start justify-between"><div className="rounded-2xl bg-red-50 p-3 text-[#bb271a]"><FileText className="h-6 w-6" /></div><Pill className="border-slate-200 bg-slate-50 text-slate-600">{report.audience}</Pill></div><h3 className="mt-5 text-xl font-black">{report.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{report.description}</p><button className="mt-5 inline-flex items-center text-sm font-bold text-[#bb271a]">미리보기 <ChevronRight className="ml-1 h-4 w-4" /></button></article>)}</div>
      <Card title="상용 KPI" description="200명 계약 이후 실제 운영성과를 월별 추적">
        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="회원 온보딩" value="95%+" note="필수 동의·기본자료 등록" />
          <Metric label="기한 누락" value="0건" note="체류·계약·보험 핵심기한" />
          <Metric label="일반 SLA" value="95%+" note="1영업일 내 최초응답" />
          <Metric label="월간 리포트" value="100%" note="세중·운영사·고용주 범위별" />
        </div>
      </Card>
    </div>
  )

  const renderGovernance = () => (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="테넌트 격리" value="RLS" note="세중·고용주·회원·수행팀 범위 분리" tone="success" />
        <Metric label="민감문서" value="Private" note="Signed URL·다운로드 감사·마스킹" tone="success" />
        <Metric label="관리자 작업" value="Step-up" note="환불·내보내기·민감정보 조회" />
        <Metric label="브리핑·샘플" value="Noindex" note="합성데이터만 사용" />
      </div>
      <Card title="감사 이벤트" description="누가 어떤 이유로 민감정보·금액·업무를 변경했는지 append-only 기록">
        <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs text-slate-500"><tr>{["시각", "행위자", "행동", "대상", "사유"].map((heading) => <th key={heading} className="px-5 py-3 font-bold">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-100">{auditRows.map((row) => <tr key={`${row.time}-${row.action}`}><td className="whitespace-nowrap px-5 py-4 text-slate-500">{row.time}</td><td className="px-5 py-4 font-semibold">{row.actor}</td><td className="px-5 py-4">{row.action}</td><td className="px-5 py-4 text-slate-600">{row.object}</td><td className="px-5 py-4 text-slate-600">{row.reason}</td></tr>)}</tbody></table></div>
      </Card>
      <Card title="실데이터 전환 게이트" description="아래 항목 완료 전에는 여권·외국인등록·건강·임금정보를 넣지 않습니다">
        <div className="grid gap-3 p-5 md:grid-cols-2">{["세중·운영사 위탁계약과 업무범위", "약관·개인정보·민감정보 동의", "개발 Supabase RLS 침투테스트", "비공개 Storage와 Signed URL", "MFA·계정회수·접근권한", "보존기간·다운로드·파기 감사", "결제 PG 테스트·웹훅·환불", "싱할라어 현지 문구 검수"].map((item) => <div key={item} className="flex gap-3 rounded-xl bg-slate-50 p-4 text-sm font-semibold text-slate-700"><FileLock2 className="h-5 w-5 shrink-0 text-[#bb271a]" />{item}</div>)}</div>
      </Card>
    </div>
  )

  const renderView = () => {
    if (view === "overview") return renderOverview()
    if (view === "cohort") return renderCohort()
    if (view === "members") return renderMembers()
    if (view === "workflow") return renderWorkflow()
    if (view === "serviceDesk") return renderServiceDesk()
    if (view === "membership") return renderMembership()
    if (view === "finance") return renderFinance()
    if (view === "reports") return renderReports()
    return renderGovernance()
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-5">
          <Link href={`/${locale}/staycare`} className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black">S</span><span><span className="block font-black">Sejoong StayCare</span><span className="block text-[11px] text-slate-400">통합 운영 플랫폼</span></span></Link>
          <button className="lg:hidden" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
        </div>
        <div className="border-b border-white/10 p-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-xs font-bold text-red-300">SERVICE OWNER</p><p className="mt-2 font-black">법무법인 세중</p><p className="mt-1 text-xs leading-5 text-slate-400">고객 계약·수납·상담·행정·현장지원 단일 책임주체</p></div>
        </div>
        <nav className="space-y-1 p-3">{navItems.map((item) => { const Icon = item.icon; const active = view === item.id; return <button key={item.id} onClick={() => { setView(item.id); setMobileOpen(false) }} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold transition ${active ? "bg-[#bb271a] text-white" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}><Icon className="h-5 w-5" />{item.label}</button> })}</nav>
        <div className="absolute inset-x-3 bottom-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-400"><p className="font-bold text-slate-200">합성데이터 상용 설계본</p><p className="mt-1">실명·실결제·정부시스템·실제 법률판단은 연결하지 않았습니다.</p></div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
          <div className="flex min-h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3"><button className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#bb271a]">Sri Lanka 200 Program</p><h1 className="mt-1 text-xl font-black">{navItems.find((item) => item.id === view)?.label}</h1></div></div>
            <div className="flex items-center gap-2"><Link href={`/${locale}/staycare/briefing`} className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 sm:inline-flex">27일 브리핑</Link><button className="relative rounded-xl border border-slate-200 p-2.5 text-slate-600"><Bell className="h-5 w-5" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" /></button><div className="hidden rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white sm:block">세중 서비스 관리자</div></div>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8">{renderView()}</main>
      </div>

      {selectedMember ? <MemberDrawer member={selectedMember} onClose={() => setSelectedMember(null)} /> : null}
    </div>
  )
}
