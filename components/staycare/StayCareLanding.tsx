import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileLock2,
  Globe2,
  HeartPulse,
  Landmark,
  Languages,
  Plane,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react"
import {
  journeyPhases,
  oneStopServices,
  responsibilityLabels,
  t,
  type StayCareLanguage,
} from "@/lib/staycare/lifecycle-model"

const serviceIcons = {
  identity: FileLock2,
  telecom: Smartphone,
  finance: WalletCards,
  remittance: Banknote,
  immigration: Scale,
  insurance: ShieldCheck,
  housing: Building2,
  health: HeartPulse,
  work: BadgeCheck,
  mobility: Plane,
  translation: Languages,
  return: Plane,
} as const

const localized = {
  ko: {
    badge: "스리랑카 근로자를 위한 한국생활 원스톱 플랫폼",
    title1: "한국에 오기 전부터",
    title2: "귀국할 때까지 한곳에서.",
    description: "정부와 EPS가 처리하는 공식 모집·고용·입국 절차는 정확히 연결하고, 비자 발급 이후 통신, 공항수령, 숙소배송, 외국인등록, 은행, 보험, 본국송금, 체류연장, 병원, AI 통역과 귀국준비를 세중 플랫폼에서 통합합니다.",
    openApp: "원스톱 앱 열기",
    journey: "전체 준비과정 보기",
    threeLanguages: "한국어·English·සිංහල",
    officialBoundary: "정부 공식절차와 민간서비스를 구분",
    reuse: "한 번 입력한 자료를 동의 후 재사용",
    journeyEyebrow: "Sri Lanka to Korea lifecycle",
    journeyTitle: "현지 준비부터 한국생활·체류·귀국까지",
    journeyDescription: "특정 인원이나 특정 일정이 아니라, 한 명의 근로자가 실제로 지나가는 전체 생애주기를 기준으로 설계했습니다.",
    servicesEyebrow: "One-stop services",
    servicesTitle: "비자 발급 이후 필요한 서비스를 한 화면에서",
    servicesDescription: "세중이 신청과 진행상태를 통합하고, 실제 개통·금융·송금은 공식기관 또는 인가·제휴 사업자가 수행합니다.",
    boundaryEyebrow: "Clear responsibility",
    boundaryTitle: "정부가 하는 일은 연결하고, 빈틈은 세중이 채웁니다",
    government: "정부·공공기관",
    governmentText: "시험, 구직자 명부, 표준근로계약, 사전교육, 사증·입국 진행, 취업교육과 고용허가제 보험 등 공식 승인·처리 영역",
    sejoong: "세중 원스톱",
    sejoongText: "공식 상태 안내, 서류 준비, 일정·만료 관리, 생활서비스 신청, 상담·사건 접수, 파트너 연결과 진행 추적",
    partner: "인가·제휴 사업자",
    partnerText: "통신 개통, 은행계좌, 해외송금, 배송, 보험·의료·숙소 등 허가와 본인확인이 필요한 실제 서비스 수행",
    aiTitle: "AI 통역을 앱의 기본 기능으로",
    aiText: "한국어·영어·싱할라어 텍스트와 브라우저 음성을 변환하고, 공항·사업장·병원·은행·출입국·숙소·송금 상황의 다음 행동을 안내합니다.",
    securityTitle: "여권과 체류정보를 다루는 수준의 보안",
    securityText: "비공개 문서함, 역할·조직별 접근통제, 짧은 만료 URL, 번호 마스킹, 공유동의와 조회·다운로드 감사기록을 전제로 합니다.",
    closeTitle: "한국생활에 필요한 것을 하나의 계정으로 시작합니다.",
    closeText: "스리랑카에서 로그인하면 지금 준비할 것과 다음 단계를 확인하고, 한국 도착 후 같은 계정으로 생활·체류·송금·귀국업무를 이어갑니다.",
  },
  en: {
    badge: "Korea-life one-stop platform for Sri Lankan workers",
    title1: "From before Korea",
    title2: "until the return home.",
    description: "The platform links official government and EPS recruitment, employment and entry processes, then integrates post-visa connectivity, pickup or delivery, registration, banking, insurance, remittance, stay extension, healthcare, AI interpretation and return preparation.",
    openApp: "Open one-stop app",
    journey: "View full journey",
    threeLanguages: "한국어 · English · සිංහල",
    officialBoundary: "Clear public/private boundary",
    reuse: "Reuse verified data with consent",
    journeyEyebrow: "Sri Lanka to Korea lifecycle",
    journeyTitle: "From local preparation to work, stay and return",
    journeyDescription: "Designed around the real lifecycle of each worker, not a specific headcount, meeting or arrival date.",
    servicesEyebrow: "One-stop services",
    servicesTitle: "Post-visa Korea-life services in one screen",
    servicesDescription: "Sejoong orchestrates applications and status; authorities and licensed providers perform regulated services.",
    boundaryEyebrow: "Clear responsibility",
    boundaryTitle: "Link official systems and fill the gaps with Sejoong",
    government: "Government and public authorities",
    governmentText: "Official approval and processing such as testing, roster placement, standard contracts, pre-departure training, visa/entry progress, employment training and EPS insurance.",
    sejoong: "Sejoong one-stop",
    sejoongText: "Explain official status, prepare records, manage deadlines, route life-service requests, receive cases and track providers.",
    partner: "Licensed or contracted providers",
    partnerText: "Perform identity-verified telecom, banking, remittance, delivery, insurance, healthcare and accommodation services.",
    aiTitle: "AI interpretation as a core app function",
    aiText: "Translate Korean, English and Sinhala text or browser-captured speech and explain next actions for airports, workplaces, hospitals, banks, immigration, housing and remittance.",
    securityTitle: "Security suitable for passport and stay records",
    securityText: "Private document storage, role and organization access controls, expiring URLs, masked identifiers, sharing consent and access/download audit logs.",
    closeTitle: "Start Korea life with one account.",
    closeText: "Log in from Sri Lanka to see what to prepare and continue with the same account for life, stay, remittance and return tasks after arrival.",
  },
} as const

export default function StayCareLanding({ locale }: { locale: string }) {
  const language: StayCareLanguage = locale === "en" ? "en" : "ko"
  const copy = localized[language]

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f7f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</span>
            <span>
              <span className="block font-black tracking-tight">Sejoong StayCare</span>
              <span className="block text-[11px] text-slate-500">Korea Life One-stop</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#journey" className="hover:text-slate-950">Journey</a>
            <a href="#services" className="hover:text-slate-950">Services</a>
            <a href="#boundary" className="hover:text-slate-950">Responsibility</a>
            <a href="#platform" className="hover:text-slate-950">AI & Security</a>
          </nav>
          <Link href={`/${locale}/staycare/app`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#bb271a]">
            {copy.openApp} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.17),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-[#bb271a] shadow-sm">
              <Sparkles className="h-4 w-4" /> {copy.badge}
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {copy.title1}
              <span className="block text-[#bb271a]">{copy.title2}</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{copy.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/staycare/app`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#9a1f14]">
                {copy.openApp} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#journey" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:border-slate-400">
                {copy.journey}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-blue-600" /> {copy.threeLanguages}</span>
              <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-600" /> {copy.officialBoundary}</span>
              <span className="flex items-center gap-2"><FileLock2 className="h-4 w-4 text-violet-600" /> {copy.reuse}</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-red-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">My Korea journey</p>
                    <p className="mt-2 text-2xl font-black">After visa · Before departure</p>
                  </div>
                  <Plane className="h-7 w-7 text-emerald-400" />
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[["Ready", "8"], ["In progress", "4"], ["Attention", "1"]].map(([label, value]) => (
                    <div key={label} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3 p-4">
                {[
                  [Smartphone, "eSIM / SIM", "Device check → airport or delivery"],
                  [Banknote, "Sri Lanka remittance", "Licensed-provider quote and receipt"],
                  [Scale, "Stay administration", "Registration → extension → return"],
                  [Bot, "AI language", "Korean · English · Sinhala"],
                ].map(([Icon, title, note]) => {
                  const IconComponent = Icon as typeof Smartphone
                  return (
                    <div key={String(title)} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><IconComponent className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-900">{String(title)}</p>
                        <p className="truncate text-xs text-slate-500">{String(note)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.journeyEyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.journeyTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{copy.journeyDescription}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeyPhases.map((phase) => (
            <article key={phase.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 font-black text-[#bb271a]">{phase.order}</span>
                <span className="text-xs font-bold text-slate-400">{t(phase.location, language)}</span>
              </div>
              <h3 className="mt-6 text-xl font-black">{t(phase.title, language)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t(phase.description, language)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.servicesEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.servicesTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{copy.servicesDescription}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {oneStopServices.map((service) => {
              const Icon = serviceIcons[service.category]
              return (
                <article key={service.id} className="rounded-3xl border border-slate-200 bg-[#fafaf8] p-6">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><Icon className="h-6 w-6" /></span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">{service.integrationStatus}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black">{t(service.title, language)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(service.description, language)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.ownership.map((owner) => <span key={owner} className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">{t(responsibilityLabels[owner], language)}</span>)}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="boundary" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.boundaryEyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.boundaryTitle}</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            [Landmark, copy.government, copy.governmentText, "blue"],
            [Sparkles, copy.sejoong, copy.sejoongText, "red"],
            [BadgeCheck, copy.partner, copy.partnerText, "emerald"],
          ].map(([Icon, title, text, tone]) => {
            const IconComponent = Icon as typeof Landmark
            return (
              <article key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-[#bb271a]"}`}><IconComponent className="h-6 w-6" /></span>
                <h3 className="mt-5 text-xl font-black">{String(title)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{String(text)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="platform" className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <Bot className="h-9 w-9 text-violet-300" />
            <h2 className="mt-5 text-2xl font-black">{copy.aiTitle}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">{copy.aiText}</p>
            <Link href={`/${locale}/staycare/app`} className="mt-6 inline-flex items-center rounded-2xl bg-violet-400/15 px-5 py-3 text-sm font-black text-violet-200">AI interpreter <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <ShieldCheck className="h-9 w-9 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-black">{copy.securityTitle}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">{copy.securityText}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-bold text-slate-300">
              {["Private Storage", "RLS", "Consent", "Audit log"].map((item) => <div key={item} className="rounded-xl bg-white/5 p-3"><CheckCircle2 className="mb-2 h-4 w-4 text-emerald-400" />{item}</div>)}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold text-[#bb271a]">Sejoong StayCare</p>
            <h2 className="mt-3 text-3xl font-black">{copy.closeTitle}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{copy.closeText}</p>
          </div>
          <Link href={`/${locale}/staycare/app`} className="inline-flex items-center justify-center rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white">
            {copy.openApp} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
