"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  FileLock2,
  Globe2,
  Headphones,
  Landmark,
  Languages,
  MapPinned,
  ReceiptText,
  Scale,
  ShieldCheck,
  Smartphone,
  UsersRound,
  WalletCards,
} from "lucide-react"
import {
  annualMembership,
  briefingDecisions,
  calculateUnitEconomics,
  DEFAULT_ANNUAL_FEE,
  DEFAULT_DIRECT_COST_RATE,
  DEFAULT_MEMBER_COUNT,
  formatKrw,
  implementationPhases,
  payerLabels,
  sejoongOperatingModel,
  type StayCarePayer,
} from "@/lib/staycare/commercial-model"

const agenda = [
  "사업 정의",
  "200명 운영 구조",
  "연 100만 원 상품",
  "서비스 범위·SLA",
  "플랫폼 화면",
  "수익·원가 구조",
  "27일 확정사항",
]

function MetricCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
    </div>
  )
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="max-w-3xl">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#bb271a]">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">{description}</p> : null}
    </div>
  )
}

export default function StayCareBriefing({ locale }: { locale: string }) {
  const [memberCount, setMemberCount] = useState(DEFAULT_MEMBER_COUNT)
  const [annualFee, setAnnualFee] = useState(DEFAULT_ANNUAL_FEE)
  const [directCostRate, setDirectCostRate] = useState(DEFAULT_DIRECT_COST_RATE)
  const [payer, setPayer] = useState<StayCarePayer>("employer")

  const economics = useMemo(
    () => calculateUnitEconomics({ memberCount, annualFee, directCostRate }),
    [memberCount, annualFee, directCostRate]
  )

  return (
    <main className="min-h-screen bg-[#f5f5f2] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f5f5f2]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href={`/${locale}/staycare`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</span>
            <span>
              <span className="block text-sm font-black">Sejoong StayCare</span>
              <span className="block text-[11px] text-slate-500">200명 도입 담당자 브리핑</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/staycare`} className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 sm:inline-flex">
              <ArrowLeft className="mr-2 h-4 w-4" /> 소개 화면
            </Link>
            <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white">
              운영 플랫폼 <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-950 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.55),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(212,175,55,0.18),transparent_35%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-red-200">
              <CalendarDays className="h-4 w-4" /> 7월 27일 담당자 협의용
            </div>
            <h1 className="mt-7 max-w-4xl text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              스리랑카 인력 200명을 위한
              <span className="block text-red-300">세중 통합관리 플랫폼</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              27일은 근로자의 입국일이 아니라, 약 200명 도입을 추진하는 담당자와 계약·업무범위·가격·일정을 확정하기 위한 협의일입니다. 고객에게는 법무법인 세중이 하나의 책임창구가 되고, 위탁 운영사는 세중의 플랫폼과 운영체계를 실행합니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {agenda.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <MetricCard label="도입 목표" value={`${DEFAULT_MEMBER_COUNT}명`} note="명단·비자·고용주·입국파동을 단계별 관리" />
            <MetricCard label="기준 상품" value="1인 연 100만 원" note="고용주·근로자·외부기관 중 납부자 설정 가능" />
            <MetricCard label="직접비 가정" value="20~30%" note="전문가·통역·현장·제3자 실비 예산" />
            <MetricCard label="세중 창구" value="One Stop" note="법률·출입국·노무·생활업무를 세중이 통합 관리" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Business definition"
          title="비자대행 앱이 아니라 200명의 체류·생활·사건을 운영하는 서비스"
          description="입국 전 준비부터 체류기한, 고용, 숙소, 통신, 보험, 생활민원, 전문사건까지 업무의 담당자·기한·증빙·SLA를 관리합니다."
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            [ClipboardList, "입국 전", "여권·비자·고용·항공·숙소·교육 체크리스트"],
            [Landmark, "초기 정착", "외국인등록·계좌·보험·유심·사업장 인계"],
            [Headphones, "연간 관리", "다국어 문의·월간 체크인·기한·민원·위험관리"],
            [Scale, "전문 사건", "법률·출입국·노무·산재 사안을 세중이 직접 관리"],
          ].map(([Icon, title, description]) => {
            const IconComponent = Icon as typeof ClipboardList
            return (
              <article key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]">
                  <IconComponent className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-black">{String(title)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{String(description)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Single service owner"
            title="대외적으로는 세중이 전부 처리하고, 운영사는 내부 실행조직으로 움직입니다"
            description="회원에게 운영사와 외부업체가 각각 계약을 요구하지 않습니다. 세중이 접수·배정·품질·결과를 책임지고 운영사는 세중의 위탁업무를 수행합니다."
          />
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {sejoongOperatingModel.map((item, index) => (
              <article key={item.actor} className="rounded-3xl border border-slate-200 bg-[#fafaf8] p-6">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">{index + 1}</span>
                  <BadgeCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="mt-5 text-xl font-black">{item.actor}</h3>
                <p className="mt-2 text-sm font-semibold text-[#bb271a]">{item.externalRole}</p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                  {item.responsibilities.map((responsibility) => (
                    <li key={responsibility} className="flex gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{responsibility}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Annual membership"
          title="1인 연 100만 원에 포함되는 합리적인 서비스 범위"
          description="원격지원은 전국으로 제공하고, 현장지원은 계약 사업장 권역을 기준으로 제한합니다. 고비용 개별 사건과 제3자 실비는 세중을 통해 별도 견적합니다."
        />
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[#bb271a]">{annualMembership.name}</p>
                <p className="mt-2 text-4xl font-black">{formatKrw(annualMembership.annualFee)}</p>
                <p className="mt-2 text-sm text-slate-500">월 환산 {formatKrw(annualMembership.monthlyEquivalent)} · VAT 및 별도 실비 기준은 계약서 확정</p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">납부자 선택 가능</div>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {annualMembership.included.map((feature) => (
                <div key={feature} className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-slate-950 p-6 text-white">
              <MapPinned className="h-7 w-7 text-red-300" />
              <h3 className="mt-4 text-xl font-black">지역·현장지원 기준</h3>
              <div className="mt-5 space-y-4 text-sm leading-6 text-slate-300">
                <p><strong className="text-white">전국 원격:</strong> {annualMembership.serviceArea.remote}</p>
                <p><strong className="text-white">포함 현장:</strong> {annualMembership.serviceArea.includedField}</p>
                <p><strong className="text-white">추가 현장:</strong> {annualMembership.serviceArea.additionalField}</p>
              </div>
            </div>
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
              <ReceiptText className="h-7 w-7 text-amber-700" />
              <h3 className="mt-4 text-xl font-black text-amber-950">별도 견적·실비</h3>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-amber-950/80">
                {annualMembership.separatelyQuoted.map((item) => (
                  <li key={item} className="flex gap-2"><span className="font-black">·</span><span>{item}</span></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Service level"
            title="상담 횟수보다 중요한 것은 긴급도별 응답·담당·종결 기준입니다"
            description="일반 문의는 예약형 상담과 디지털 접수로 관리하고, 위험사안은 정해진 SLA에 따라 세중 담당팀으로 즉시 승격합니다."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(annualMembership.responsePolicy).map(([priority, policy]) => (
              <article key={priority} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${priority === "P0" ? "bg-red-500 text-white" : priority === "P1" ? "bg-orange-400 text-slate-950" : priority === "P2" ? "bg-amber-300 text-slate-950" : "bg-slate-200 text-slate-900"}`}>
                  {priority}
                </span>
                <p className="mt-5 text-sm leading-7 text-slate-300">{policy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Delivery roadmap"
          title="200명을 한 번에 등록하는 것이 아니라 계약·입국파동·초기정착·연간관리로 나눕니다"
          description="실제 입국일과 인원이 확정되기 전에도 명단과 증빙 준비, 사용자 초대, 워크플로 설정을 먼저 시작할 수 있습니다."
        />
        <div className="mt-10 grid gap-4 lg:grid-cols-4">
          {implementationPhases.map((phase) => (
            <article key={phase.phase} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#bb271a]">{phase.phase}</p>
              <h3 className="mt-3 text-xl font-black">{phase.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{phase.period}</p>
              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
                {phase.outputs.map((output) => (
                  <li key={output} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{output}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Unit economics"
            title="200명 기준 매출·직접비·플랫폼 운영재원을 즉석에서 계산합니다"
            description="기준값은 1인 연 100만 원과 직접비 25%입니다. 27일 협의에서 인원·가격·부담자를 바꿔 즉시 비교할 수 있습니다."
          />
          <div className="mt-10 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-[#fafaf8] p-6">
              <div className="flex items-center gap-3">
                <Calculator className="h-6 w-6 text-[#bb271a]" />
                <h3 className="text-lg font-black">협의값 입력</h3>
              </div>
              <div className="mt-6 space-y-6">
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-bold"><span>관리 인원</span><span>{memberCount}명</span></span>
                  <input className="mt-3 w-full accent-[#bb271a]" type="range" min="20" max="1000" step="10" value={memberCount} onChange={(event) => setMemberCount(Number(event.target.value))} />
                </label>
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-bold"><span>1인 연간비용</span><span>{formatKrw(annualFee)}</span></span>
                  <input className="mt-3 w-full accent-[#bb271a]" type="range" min="300000" max="2000000" step="50000" value={annualFee} onChange={(event) => setAnnualFee(Number(event.target.value))} />
                </label>
                <label className="block">
                  <span className="flex items-center justify-between text-sm font-bold"><span>직접비 비율</span><span>{Math.round(directCostRate * 100)}%</span></span>
                  <input className="mt-3 w-full accent-[#bb271a]" type="range" min="0.2" max="0.3" step="0.01" value={directCostRate} onChange={(event) => setDirectCostRate(Number(event.target.value))} />
                </label>
                <div>
                  <p className="text-sm font-bold">비용부담자</p>
                  <div className="mt-3 grid gap-2">
                    {(Object.keys(payerLabels) as StayCarePayer[]).map((item) => (
                      <button key={item} onClick={() => setPayer(item)} className={`rounded-xl border px-4 py-3 text-left text-sm font-bold transition ${payer === item ? "border-[#bb271a] bg-red-50 text-[#bb271a]" : "border-slate-200 bg-white text-slate-600"}`}>
                        {payerLabels[item]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard label="연간 총 계약금액" value={formatKrw(economics.annualRevenue)} note={`${memberCount}명 × ${formatKrw(annualFee)} · ${payerLabels[payer]}`} />
              <MetricCard label="월 환산 매출" value={formatKrw(economics.monthlyRunRate)} note="연간 계약금액을 12개월로 환산" />
              <MetricCard label="연간 직접비 예산" value={formatKrw(economics.annualDirectCost)} note={`전문가·통역·현장·제3자 비용 ${Math.round(directCostRate * 100)}%`} />
              <MetricCard label="플랫폼·운영 재원" value={formatKrw(economics.annualOperationsBudget)} note="개발·인력·CS·현장관리·품질관리 운영비" />
              <MetricCard label="1인 월 환산" value={formatKrw(economics.revenuePerMemberPerMonth)} note="근로자 개인이 반드시 부담한다는 의미가 아님" />
              <MetricCard label="1인 운영재원" value={formatKrw(economics.operationsBudgetPerMember)} note="직접비를 제외한 연간 플랫폼·운영 가용재원" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:px-8">
        <SectionTitle
          eyebrow="Meeting decisions"
          title="27일에는 이 10가지만 확정하면 개발과 계약을 바로 진행할 수 있습니다"
          description="입국자가 오는 날이 아니라 사업 책임자와 200명 운영조건을 정하는 날이므로, 질문도 계약과 실행조건에 집중합니다."
        />
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {briefingDecisions.map((decision, index) => (
            <div key={decision} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white">{index + 1}</span>
              <p className="pt-1 text-sm font-semibold leading-6 text-slate-700">{decision}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold text-red-300">Briefing close</p>
            <h2 className="mt-3 text-3xl font-black">세중이 계약하고, 플랫폼이 추적하고, 운영사가 실행합니다.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">200명 도입 일정과 비용부담자만 확정되면 근로자 초대, 문서수집, 워크플로, 상담·SLA·청구 체계를 한 번에 시작할 수 있습니다.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center justify-center rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white">
              운영 플랫폼 열기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href={`/${locale}/staycare`} className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-4 font-bold text-white">
              서비스 소개 보기
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
