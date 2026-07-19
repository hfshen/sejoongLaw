import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck2,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileLock2,
  Handshake,
  Headphones,
  Languages,
  LayoutDashboard,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  UserRoundCheck,
  UsersRound,
} from "lucide-react"

const lifecycle = [
  {
    icon: ClipboardList,
    step: "01",
    title: "입국 전 준비",
    description: "여권·비자·고용·항공·숙소 정보를 확인하고 개인별 체크리스트를 만듭니다.",
  },
  {
    icon: UserRoundCheck,
    step: "02",
    title: "입국·초기정착",
    description: "도착 확인부터 외국인등록, 유심, 계좌, 보험, 숙소까지 담당자와 기한을 연결합니다.",
  },
  {
    icon: Headphones,
    step: "03",
    title: "체류·생활지원",
    description: "다국어 문의와 생활민원을 티켓으로 접수하고 처리상태와 증빙을 남깁니다.",
  },
  {
    icon: CalendarCheck2,
    step: "04",
    title: "장기관리",
    description: "체류·계약 만료와 변경신고를 관리하고 E-7-4 등 장기경로 자료를 축적합니다.",
  },
]

const roleCards = [
  {
    icon: Scale,
    title: "법무법인 세중",
    description: "서비스 주체, 상품정책, 법률 검토와 전문 사건 수행",
    bullets: ["멤버십 계약과 청구", "법률상담·사건의 별도 수행", "고위험 티켓 검토"],
  },
  {
    icon: LayoutDashboard,
    title: "플랫폼 운영사",
    description: "제품 구축과 일상 운영, 회원·업무·파트너 조정",
    bullets: ["온보딩과 일정관리", "생활지원·다국어 티켓", "SLA와 월간 운영보고"],
  },
  {
    icon: Handshake,
    title: "전문 파트너",
    description: "자격과 계약범위에 따른 행정·노무·생활 전문서비스",
    bullets: ["행정사·노무사", "통신·병원·숙소·통역", "배정업무 결과와 증빙"],
  },
]

const plans = [
  {
    name: "Basic",
    price: "39,000",
    suffix: "월",
    description: "정보와 일정 중심의 기본 멤버십",
    features: ["모바일 문서함", "체류·계약 일정 알림", "다국어 생활가이드", "일반 문의접수"],
  },
  {
    name: "Care",
    price: "79,000",
    suffix: "월",
    description: "정기 체크인과 생활지원 운영 포함",
    featured: true,
    features: ["Basic 전체", "월간 체크인", "생활지원 티켓", "담당 코디네이터", "파트너 처리상태 확인"],
  },
  {
    name: "Care Plus",
    price: "990,000",
    suffix: "연",
    description: "연간 집중지원 예시 플랜",
    features: ["Care 전체", "우선 응답", "확대된 지원시간", "장기체류 자료관리", "고위험 전문검토 연결"],
  },
]

export default function StayCareLanding({ locale }: { locale: string }) {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</div>
            <div>
              <p className="font-black tracking-tight">Sejoong StayCare</p>
              <p className="text-[11px] text-slate-500">by 법무법인 세중</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
            <a href="#service" className="hover:text-slate-950">서비스</a>
            <a href="#roles" className="hover:text-slate-950">운영구조</a>
            <a href="#plans" className="hover:text-slate-950">요금안</a>
            <a href="#boundaries" className="hover:text-slate-950">업무경계</a>
          </nav>
          <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#bb271a]">
            운영 데모 <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.13),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-[#bb271a] shadow-sm">
              <Sparkles className="h-4 w-4" /> 외국인 근로자 체류·정착 운영 플랫폼
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              한국에서 해야 할 일을
              <span className="block text-[#bb271a]">놓치지 않도록.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Sejoong StayCare는 입국 준비부터 외국인등록, 체류기한, 숙소, 통신, 보험, 생활민원과 전문상담 연결까지 담당자와 처리상태를 한곳에서 관리합니다.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/staycare/demo`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#9a1f14]">
                역할별 운영 화면 보기 <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#service" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:border-slate-400">
                서비스 범위 확인
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> 역할기반 권한</span>
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-blue-600" /> 한·영·싱할라 우선</span>
              <span className="flex items-center gap-2"><FileLock2 className="h-4 w-4 text-violet-600" /> 개인정보 감사기록</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-red-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">27 July pilot</p>
                    <p className="mt-2 text-xl font-black">입국 준비 대시보드</p>
                  </div>
                  <BadgeCheck className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[["입국예정", "24"], ["서류완료", "19"], ["검토필요", "5"]].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 p-4">
                {[
                  ["니말 페레라", "외국인등록 서류 확인", "68%"],
                  ["카산 자야싱헤", "급여계좌 동행 배정", "74%"],
                  ["딜란 페르난도", "월간 생활 체크인", "100%"],
                ].map(([name, task, progress], index) => (
                  <div key={name} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 font-black text-slate-700">{index + 1}</div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900">{name}</p>
                      <p className="truncate text-sm text-slate-500">{task}</p>
                    </div>
                    <span className="text-sm font-black text-[#bb271a]">{progress}</span>
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
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">입국 전부터 장기체류까지 하나의 업무흐름</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">정보를 보여주는 데서 끝나지 않고 누가, 언제, 무엇을 처리해야 하는지 추적합니다.</p>
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

      <section id="roles" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Clear responsibility</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">세중이 주체가 되고, 운영사는 실행을 책임집니다</h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {roleCards.map((card) => {
              const Icon = card.icon
              return (
                <article key={card.title} className="rounded-3xl border border-slate-200 p-7">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white"><Icon className="h-6 w-6" /></div>
                  <h3 className="mt-6 text-xl font-black">{card.title}</h3>
                  <p className="mt-2 leading-7 text-slate-600">{card.description}</p>
                  <ul className="mt-6 space-y-3">
                    {card.bullets.map((bullet) => <li key={bullet} className="flex items-start gap-3 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{bullet}</li>)}
                  </ul>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="plans" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">Pricing assumption</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">서비스 범위가 보이는 요금 구조</h2>
            <p className="mt-4 text-slate-600">아래 금액은 파일럿 검토용 예시이며 세중의 최종 계약·약관 승인 후 설정합니다.</p>
          </div>
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600"><CreditCard className="h-5 w-5 text-[#bb271a]" /> 카드정보 직접 저장 안 함</div>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className={`relative rounded-3xl border p-7 ${plan.featured ? "border-[#bb271a] bg-slate-950 text-white shadow-2xl" : "border-slate-200 bg-white"}`}>
              {plan.featured ? <span className="absolute right-5 top-5 rounded-full bg-[#bb271a] px-3 py-1 text-xs font-bold text-white">권장</span> : null}
              <p className={`text-sm font-bold ${plan.featured ? "text-red-300" : "text-[#bb271a]"}`}>{plan.name}</p>
              <div className="mt-5 flex items-end gap-2"><span className="text-4xl font-black">₩{plan.price}</span><span className={plan.featured ? "text-slate-400" : "text-slate-500"}>/{plan.suffix}</span></div>
              <p className={`mt-3 text-sm ${plan.featured ? "text-slate-300" : "text-slate-600"}`}>{plan.description}</p>
              <ul className="mt-7 space-y-3">
                {plan.features.map((feature) => <li key={feature} className={`flex gap-3 text-sm ${plan.featured ? "text-slate-200" : "text-slate-700"}`}><CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.featured ? "text-emerald-400" : "text-emerald-600"}`} />{feature}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="boundaries" className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-red-300">Non-negotiable boundary</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">플랫폼이 모든 전문업무를 대신하지 않습니다</h2>
            <p className="mt-5 max-w-xl leading-8 text-slate-300">StayCare는 일정·서류·상담접수·생활지원·진행상태를 관리하는 운영 플랫폼입니다. 법률·행정·노무 등 자격이 필요한 업무는 담당 전문가가 별도로 수행합니다.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              [ShieldCheck, "비자·취업·승소 결과를 보장하지 않음"],
              [UsersRound, "무등록 모집·직업소개를 수행하지 않음"],
              [Building2, "숙소·통신·보험의 제공주체와 비용 명시"],
              [Smartphone, "합성데이터 데모와 운영데이터를 분리"],
            ].map(([Icon, text]) => {
              const ItemIcon = Icon as typeof ShieldCheck
              return <div key={text as string} className="rounded-2xl border border-white/10 bg-white/5 p-5"><ItemIcon className="h-5 w-5 text-red-300" /><p className="mt-4 text-sm font-semibold leading-6 text-slate-200">{text as string}</p></div>
            })}
          </div>
        </div>
      </section>

      <footer className="bg-[#0b0d0f] text-slate-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 text-sm sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div><p className="font-bold text-white">Sejoong StayCare</p><p className="mt-1">서비스 주체: 법무법인 세중 · 플랫폼 개발·운영: 별도 계약 운영사</p></div>
          <p>본 페이지는 사업검토용 Reference Implementation입니다.</p>
        </div>
      </footer>
    </main>
  )
}
