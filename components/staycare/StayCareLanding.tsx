import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  FileLock2,
  Headphones,
  Languages,
  LayoutDashboard,
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
  DEFAULT_ANNUAL_FEE,
  DEFAULT_MEMBER_COUNT,
  formatKrw,
  implementationPhases,
  sejoongOperatingModel,
} from "@/lib/staycare/commercial-model"

const lifecycle = [
  {
    icon: ClipboardList,
    step: "01",
    title: "입국 전 준비",
    description: "200명 명단, 여권, 비자경로, 고용주, 항공, 숙소와 교육자료를 개인별 체크리스트로 관리합니다.",
  },
  {
    icon: CalendarCheck2,
    step: "02",
    title: "입국·초기정착",
    description: "공항 인계, 외국인등록, 유심, 계좌, 보험, 숙소, 사업장 배치를 담당자와 기한으로 연결합니다.",
  },
  {
    icon: Headphones,
    step: "03",
    title: "체류·생활지원",
    description: "한국어·영어·싱할라어 문의를 세중 통합운영센터가 접수하고 P0~P3 SLA로 처리합니다.",
  },
  {
    icon: Scale,
    step: "04",
    title: "법률·출입국·노무",
    description: "일반업무와 전문사건을 분리된 외부창구로 넘기지 않고 세중 내부 담당팀이 직접 관리합니다.",
  },
]

export default function StayCareLanding({ locale }: { locale: string }) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f7f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</span>
            <span>
              <span className="block font-black tracking-tight">Sejoong StayCare</span>
              <span className="block text-[11px] text-slate-500">by 법무법인 세중</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#service" className="hover:text-slate-950">서비스</a>
            <a href="#model" className="hover:text-slate-950">운영구조</a>
            <a href="#membership" className="hover:text-slate-950">연간 멤버십</a>
            <a href="#security" className="hover:text-slate-950">보안·권한</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/staycare/briefing`} className="hidden rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 sm:inline-flex">
              27일 브리핑
            </Link>
            <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#bb271a]">
              운영 플랫폼 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.16),transparent_37%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-[#bb271a] shadow-sm">
              <BadgeCheck className="h-4 w-4" /> 세중 주도 외국인 근로자 통합관리 서비스
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              200명의 입국·체류·생활을
              <span className="block text-[#bb271a]">하나의 책임창구로.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">
              법무법인 세중이 회원계약과 비용수납, 상담, 행정, 현장지원과 전문사건을 통합 관리합니다. 위탁 운영사는 세중 브랜드 아래에서 플랫폼, 일정, 문서, CS와 실행업무를 운영합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/staycare/briefing`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#9a1f14]">
                200명 사업 브리핑 보기 <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:border-slate-400">
                운영 플랫폼 열기
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> 세중 단일 책임</span>
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-blue-600" /> 한·영·싱할라 우선</span>
              <span className="flex items-center gap-2"><FileLock2 className="h-4 w-4 text-violet-600" /> RLS·감사기록</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-red-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">Sri Lanka 200 Program</p>
                    <p className="mt-2 text-2xl font-black">상용 도입 준비 대시보드</p>
                  </div>
                  <LayoutDashboard className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    ["목표 인원", `${DEFAULT_MEMBER_COUNT}`],
                    ["연간 단가", "100만"],
                    ["직접비", "20~30%"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 p-4">
                {[
                  ["서비스 주체", "법무법인 세중", "계약·수납·품질"],
                  ["운영 실행", "위탁 운영사", "플랫폼·CS·현장"],
                  ["27일 목적", "담당자 협의", "인원·비자·일정 확정"],
                ].map(([label, title, note], index) => (
                  <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-black text-slate-700">{index + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-500">{label}</p>
                      <p className="font-black text-slate-900">{title}</p>
                    </div>
                    <span className="text-xs font-bold text-[#bb271a]">{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="service" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Lifecycle operations</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">입국 전부터 연간 체류관리까지 하나의 업무흐름</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">정보를 보여주는 데서 끝나지 않고 담당자, 기한, 증빙, 상담량, 현장지원과 비용을 추적합니다.</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {lifecycle.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.step} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-red-50 p-3 text-[#bb271a]"><Icon className="h-6 w-6" /></div>
                  <span className="text-sm font-black text-slate-300">{item.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-black">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="model" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Operating model</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">고객에게는 세중 하나, 내부에는 역할별 실행조직</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">일반업무와 전문업무의 고객창구를 나누지 않습니다. 세중이 접수하고 내부 담당팀과 위탁 운영사를 배정합니다.</p>
          </div>
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

      <section id="membership" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Annual membership</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">1인 연 100만 원의 범위가 명확한 통합관리 상품</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">고용주, 근로자 또는 외부 도입기관이 비용을 부담할 수 있습니다. 포함량을 초과한 고비용 업무는 세중을 통해 별도 견적합니다.</p>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold text-[#bb271a]">{annualMembership.name}</p>
                <p className="mt-2 text-4xl font-black">{formatKrw(DEFAULT_ANNUAL_FEE)}</p>
                <p className="mt-2 text-sm text-slate-500">월 환산 약 {formatKrw(Math.round(DEFAULT_ANNUAL_FEE / 12))}</p>
              </div>
              <div className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white">납부자·분납방식 선택</div>
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
              <h3 className="mt-4 text-xl font-black">지역·현장지원</h3>
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
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">Delivery</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">200명 도입을 계약·사전준비·초기정착·연간관리로 분리</h2>
            <p className="mt-4 text-lg leading-8 text-slate-300">실제 인원과 입국일이 확정되기 전에도 플랫폼, 명단 템플릿, 체크리스트와 상담 운영기준을 먼저 구축할 수 있습니다.</p>
          </div>
          <div className="mt-10 grid gap-4 lg:grid-cols-4">
            {implementationPhases.map((phase) => (
              <article key={phase.phase} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-red-300">{phase.phase}</p>
                <h3 className="mt-3 text-xl font-black">{phase.title}</h3>
                <p className="mt-2 text-sm font-semibold text-slate-400">{phase.period}</p>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                  {phase.outputs.map((output) => (
                    <li key={output} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />{output}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="security" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Security & governance</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">여권·비자·건강·임금정보를 다루는 수준으로 설계</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">역할기반 권한, 테넌트 격리, 비공개 문서함, Signed URL, 마스킹, 관리자 Step-up과 append-only 감사기록을 적용합니다.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              [ShieldCheck, "테넌트·조직·역할 RLS", "세중·운영사·고용주·회원·수행팀의 접근범위를 서버와 DB에서 분리"],
              [FileLock2, "비공개 문서함", "여권·비자·계약·체류자료를 공개 URL 없이 제한된 시간만 조회"],
              [Smartphone, "근로자 모바일", "한국어·영어·싱할라어 온보딩, 체크리스트, 문의와 진행상태"],
              [WalletCards, "외부 PG 참조", "카드번호·CVC를 저장하지 않고 월·연 청구와 환불 상태만 관리"],
            ].map(([Icon, title, description]) => {
              const IconComponent = Icon as typeof ShieldCheck
              return (
                <article key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <IconComponent className="h-7 w-7 text-[#bb271a]" />
                  <h3 className="mt-4 text-lg font-black">{String(title)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{String(description)}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold text-red-300">Sejoong StayCare</p>
            <h2 className="mt-3 text-3xl font-black">27일에는 200명의 조건을 확정하고, 플랫폼에서 실행합니다.</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-300">세중이 계약·수납·서비스 품질을 책임하고 위탁 운영사가 플랫폼과 현장을 운영하는 완성 구조입니다.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
            <Link href={`/${locale}/staycare/briefing`} className="inline-flex items-center justify-center rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white">
              브리핑 열기 <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center justify-center rounded-2xl border border-white/20 px-6 py-4 font-bold text-white">
              운영 플랫폼 열기
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
