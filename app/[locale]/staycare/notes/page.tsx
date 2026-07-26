import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileLock2,
  Gauge,
  HeartHandshake,
  KeyRound,
  Plane,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"

export const metadata: Metadata = {
  title: "StayCare 화면·섹션 운영 노트",
  robots: { index: false, follow: false },
}

const sections = [
  {
    title: "로그인",
    href: "login",
    icon: KeyRound,
    audience: "모든 사용자",
    purpose: "이메일 또는 +94·+82 휴대전화 OTP로 연락수단 소유를 확인합니다.",
    boundary: "로그인 계정 생성은 공식 근로자 자격을 의미하지 않습니다.",
  },
  {
    title: "근로자 명부 Claim",
    href: "claim",
    icon: BadgeCheck,
    audience: "스리랑카 지정 근로자",
    purpose: "초대코드·여권 영문명·생년월일을 공식 사전명부와 대조해 근로자 ID를 연결합니다.",
    boundary: "명부에 없는 사람은 근로자 앱에 진입할 수 없습니다.",
  },
  {
    title: "근로자 앱",
    href: "app",
    icon: Smartphone,
    audience: "Claim 완료 근로자",
    purpose: "출국 준비부터 입국, 90일 정착, 근로·체류, 사고·민원, 귀국까지 다음 행동을 표시합니다.",
    boundary: "정부 승인과 법률·의료 결정을 대신하지 않습니다.",
  },
  {
    title: "연락수단 승계",
    href: "account",
    icon: Smartphone,
    audience: "근로자",
    purpose: "+94 번호로 시작한 계정에 한국 +82 번호를 OTP로 추가하고 주 연락수단을 전환합니다.",
    boundary: "전화번호는 영구 회원번호가 아니며 변경이력을 유지합니다.",
  },
  {
    title: "통합 운영센터",
    href: "admin",
    icon: Gauge,
    audience: "세중·운영사·감사자",
    purpose: "근로자, 문서, 신청, 체류사건, 티켓, 감사로그와 환경상태를 역할별로 처리합니다.",
    boundary: "변호사·출입국·운영자·감사자의 권한이 분리됩니다.",
  },
  {
    title: "2,000명 Control Tower",
    href: "admin/control-tower",
    icon: Users,
    audience: "사업·운영 총괄",
    purpose: "Cohort, 입국차수, 항공편, 버스, Claim, 입국, 외국인등록, 사고를 집계합니다.",
    boundary: "개인 법률·의료·인권상담은 고용주 집계화면에 노출하지 않습니다.",
  },
  {
    title: "명부·초대 등록",
    href: "admin/roster",
    icon: ClipboardList,
    audience: "세중 관리자·운영 매니저",
    purpose: "검증된 CSV·TSV 명부를 Cohort와 입국차수에 등록하고 1회용 초대코드를 발급합니다.",
    boundary: "적법한 공식 채널에서 확정된 명부만 입력합니다.",
  },
  {
    title: "협력기관 포털",
    href: "portal",
    icon: Building2,
    audience: "고용주·현지기관·인가 공급자",
    purpose: "각 기관에 배정된 최소 운영정보, 서비스 신청과 처리결과만 제공합니다.",
    boundary: "다른 기관·근로자의 데이터와 개인 민감상담에 접근할 수 없습니다.",
  },
]

const lifecycle = [
  ["1", "공식 명부", "검증된 인원과 초대코드를 생성"],
  ["2", "현지 준비", "여권·계약·검진·교육·비자 준비"],
  ["3", "출국", "공항 집결·탑승·항공편 상태"],
  ["4", "한국 도착", "공항·버스·기숙사·사업장 인계"],
  ["5", "90일 정착", "외국인등록·통신·계좌·보험"],
  ["6", "근로·생활", "급여·송금·병원·숙소·민원"],
  ["7", "체류 관리", "연장·변경·E-7-4 준비 데이터"],
  ["8", "귀국", "최종급여·퇴직금·보험·서비스 종료"],
]

export default async function StayCareNotesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        title="프론트 화면·섹션 운영 노트"
        purpose="개발자, 운영자, 고용주와 현지기관이 각 화면의 사용자·목적·입력·출력·법적 경계를 동일하게 이해하도록 만든 제품 내 설명서입니다."
        boundary="이 노트는 운영 설계와 화면 사용을 설명합니다. 법률의견, 모집승인, 비자결정 또는 의료판단 문서가 아닙니다."
        items={[
          { label: "Who", description: "누가 해당 화면을 사용하는가" },
          { label: "Why", description: "어떤 운영문제를 해결하는가" },
          { label: "Boundary", description: "정부·세중·고용주·공급자 책임구분" },
          { label: "Output", description: "다음 단계와 운영기록이 무엇인가" },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <article key={section.href} className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800"><Icon className="h-5 w-5" /></span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-800">{section.audience}</span>
                </div>
                <h2 className="mt-5 text-xl font-black">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{section.purpose}</p>
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900">{section.boundary}</p>
                <Link href={`/${locale}/staycare/${section.href}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black text-blue-700">
                  화면 열기 <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )
          })}
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-center gap-3"><Plane className="h-7 w-7 text-blue-700" /><div><h2 className="text-2xl font-black">근로자 전 생애주기</h2><p className="mt-1 text-sm text-slate-500">각 화면과 데이터는 아래 8단계 중 하나에 연결됩니다.</p></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycle.map(([number, title, description]) => (
              <div key={number} className="rounded-2xl border border-slate-200 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{number}</span><h3 className="mt-3 font-black">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{description}</p></div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <Boundary icon={FileLock2} title="개인정보 경계" text="여권·체류·건강·급여정보는 최소수집, 목적별 동의, 역할기반 접근, 감사로그와 파기정책으로 관리합니다." />
          <Boundary icon={ShieldAlert} title="사고 대응 경계" text="P0/P1 사고는 일반 상담과 분리해 즉시 담당자를 배정하고 증거보전·법률·노무·의료 에스컬레이션을 실행합니다." />
          <Boundary icon={HeartHandshake} title="서비스 수행 경계" text="통신·은행·송금·보험·의료·출입국·법률은 인가된 수행주체가 처리하고 StayCare는 신청·자료·상태·증빙을 통합합니다." />
        </section>
      </div>
    </main>
  )
}

function Boundary({ icon: Icon, title, text }: { icon: typeof FileLock2; title: string; text: string }) {
  return <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white"><Icon className="h-7 w-7 text-red-300" /><h3 className="mt-4 text-xl font-black">{title}</h3><p className="mt-3 text-sm leading-7 text-slate-300">{text}</p></div>
}
