"use client"

import { useState } from "react"
import {
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Languages,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

export interface ExternalPortalWorker {
  id: string
  member_no: string
  full_name: string
  full_name_en: string | null
  status: string
  current_phase: string
  profile_completion: number
  visa_type: string | null
  next_action: string | null
}

export interface ExternalPortalApplication {
  id: string
  application_no: string
  status: string
  submitted_at: string | null
  worker?: {
    member_no?: string
    full_name?: string
    full_name_en?: string | null
  } | null
  service?: {
    code?: string
    category?: string
    name?: Record<string, string> | string
  } | null
}

const copy = {
  ko: {
    portal: "협력기관 포털",
    signOut: "로그아웃",
    refresh: "새로고침",
    assignedWorkers: "조회 가능한 근로자",
    openApplications: "진행 중 신청",
    completedProfiles: "프로필 80% 이상",
    organization: "소속기관",
    workers: "근로자 준비현황",
    applications: "서비스 신청현황",
    noWorkers: "현재 권한으로 조회 가능한 근로자가 없습니다.",
    noApplications: "현재 권한으로 조회 가능한 신청이 없습니다.",
    privacy: "역할과 소속기관에 허용된 범위만 표시됩니다. 법률·의료·인권·개인송금 상세정보는 제한됩니다.",
    roleDescriptions: {
      employer_admin: "소속 근로자의 입국·정착·고용 관련 준비도와 고용주 공유범위의 진행상태를 확인합니다.",
      institution_admin: "스리랑카 현지 후보자의 교육·서류·출국준비와 기관 공유범위의 상태를 확인합니다.",
      provider_agent: "세중이 배정한 통신·배송·금융 등 서비스 신청만 확인하고 처리합니다.",
    },
    roleLabels: {
      employer_admin: "고용주 담당자",
      institution_admin: "스리랑카 현지기관",
      provider_agent: "제휴 서비스사",
    },
  },
  en: {
    portal: "Partner portal",
    signOut: "Sign out",
    refresh: "Refresh",
    assignedWorkers: "Visible workers",
    openApplications: "Open applications",
    completedProfiles: "Profiles above 80%",
    organization: "Organization",
    workers: "Worker readiness",
    applications: "Service applications",
    noWorkers: "No workers are visible under the current role and organization.",
    noApplications: "No applications are visible under the current role and organization.",
    privacy: "Only role- and organization-authorized data is displayed. Legal, medical, human-rights and personal-remittance details are restricted.",
    roleDescriptions: {
      employer_admin: "Review assigned workers and employer-visible arrival, settlement and employment readiness.",
      institution_admin: "Track Sri Lankan candidates, training, records and departure readiness within the institution-sharing boundary.",
      provider_agent: "Review and process only telecom, delivery or finance requests assigned by Sejoong.",
    },
    roleLabels: {
      employer_admin: "Employer administrator",
      institution_admin: "Sri Lanka institution",
      provider_agent: "Service provider",
    },
  },
  si: {
    portal: "හවුල් ආයතන පෝර්ටලය",
    signOut: "ඉවත් වන්න",
    refresh: "නැවත පූරණය",
    assignedWorkers: "පෙනෙන සේවකයින්",
    openApplications: "ක්‍රියාත්මක අයදුම්",
    completedProfiles: "80% ට වැඩි පැතිකඩ",
    organization: "ආයතනය",
    workers: "සේවක සූදානම",
    applications: "සේවා අයදුම්",
    noWorkers: "මෙම භූමිකාවට පෙනෙන සේවකයින් නොමැත.",
    noApplications: "මෙම භූමිකාවට පෙනෙන අයදුම් නොමැත.",
    privacy: "භූමිකාව සහ ආයතනයට අනුමත දත්ත පමණක් පෙන්වයි. නීති, වෛද්‍ය, මානව හිමිකම් සහ පුද්ගලික මුදල් යැවීමේ විස්තර සීමා වේ.",
    roleDescriptions: {
      employer_admin: "අදාළ සේවකයින්ගේ පැමිණීම, පදිංචි වීම සහ රැකියා සූදානම බලන්න.",
      institution_admin: "ශ්‍රී ලංකා අපේක්ෂකයින්ගේ පුහුණුව, ලේඛන සහ පිටත්වීමේ සූදානම බලන්න.",
      provider_agent: "Sejoong විසින් පවරන ලද දුරකථන, බෙදාහැරීම හෝ මූල්‍ය ඉල්ලීම් පමණක් බලන්න.",
    },
    roleLabels: {
      employer_admin: "සේවායෝජක පරිපාලක",
      institution_admin: "ශ්‍රී ලංකා ආයතනය",
      provider_agent: "සේවා සපයන්නා",
    },
  },
} as const

function localized(value: Record<string, string> | string | undefined, language: StayCarePreferredLanguage) {
  if (!value) return "Service"
  if (typeof value === "string") return value
  return value[language] || value.en || value.ko || value.si || "Service"
}

function statusClass(status: string) {
  if (["completed", "fulfilled", "approved", "active"].includes(status)) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700"
  }
  if (["attention", "rejected", "failed", "cancelled"].includes(status)) {
    return "border-red-200 bg-red-50 text-red-700"
  }
  return "border-amber-200 bg-amber-50 text-amber-700"
}

export default function StayCareExternalPortal({
  locale,
  role,
  organizationName,
  userEmail,
  workers,
  applications,
}: {
  locale: string
  role: "employer_admin" | "institution_admin" | "provider_agent"
  organizationName: string
  userEmail?: string
  workers: ExternalPortalWorker[]
  applications: ExternalPortalApplication[]
}) {
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const text = copy[language]
  const [signingOut, setSigningOut] = useState(false)
  const completedProfiles = workers.filter((worker) => worker.profile_completion >= 80).length

  const signOut = async () => {
    setSigningOut(true)
    await createClient().auth.signOut()
    window.location.href = `/${locale}/staycare/login`
  }

  return (
    <main className="min-h-screen bg-[#f4f5f7] text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-20 max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</span>
            <div>
              <p className="font-black">Sejoong StayCare</p>
              <p className="text-xs text-slate-500">{text.portal}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StayCareLanguageSwitcher value={language} onChange={setLanguage} />
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-bold"
            >
              <RefreshCw className="mr-2 h-4 w-4" /> {text.refresh}
            </button>
            <button
              type="button"
              disabled={signingOut}
              onClick={signOut}
              className="inline-flex items-center rounded-xl bg-slate-950 px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              <LogOut className="mr-2 h-4 w-4" /> {text.signOut}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-red-400/15 px-3 py-1 text-xs font-black text-red-200">
                  {text.roleLabels[role]}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-slate-300">
                  {organizationName}
                </span>
              </div>
              <h1 className="mt-5 text-3xl font-black sm:text-4xl">{text.portal}</h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">{text.roleDescriptions[role]}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              <p className="text-xs text-slate-500">{text.organization}</p>
              <p className="mt-1 font-black text-white">{organizationName}</p>
              <p className="mt-2 text-xs">{userEmail}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            [UsersRound, text.assignedWorkers, workers.length],
            [Send, text.openApplications, applications.length],
            [FileCheck2, text.completedProfiles, completedProfiles],
          ].map(([Icon, label, value]) => {
            const CardIcon = Icon as typeof UsersRound
            return (
              <article key={String(label)} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <CardIcon className="h-5 w-5" />
                  </span>
                  <span className="text-3xl font-black">{String(value)}</span>
                </div>
                <p className="mt-4 text-sm font-bold text-slate-500">{String(label)}</p>
              </article>
            )
          })}
        </section>

        <section className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-7 text-blue-950">
          <ShieldCheck className="mt-1 h-5 w-5 shrink-0" />
          {text.privacy}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <UserRound className="h-5 w-5 text-[#bb271a]" />
              <h2 className="font-black">{text.workers}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {workers.map((worker) => (
                <article key={worker.id} className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-black">{worker.full_name_en || worker.full_name}</h3>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(worker.status)}`}>
                        {worker.status.replaceAll("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{worker.member_no} · {worker.visa_type || "Visa pending"}</p>
                    <p className="mt-2 text-sm text-slate-600">{worker.next_action || worker.current_phase}</p>
                  </div>
                  <div className="min-w-28">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <span>Profile</span><span>{worker.profile_completion}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-[#bb271a]" style={{ width: `${worker.profile_completion}%` }} />
                    </div>
                  </div>
                </article>
              ))}
              {!workers.length ? <p className="p-5 text-sm text-slate-500">{text.noWorkers}</p> : null}
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <ClipboardList className="h-5 w-5 text-[#bb271a]" />
              <h2 className="font-black">{text.applications}</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {applications.map((application) => (
                <article key={application.id} className="flex items-center gap-3 p-5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100">
                    <Send className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black">
                      {localized(application.service?.name || application.service?.code, language)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {application.application_no}
                      {application.worker?.member_no ? ` · ${application.worker.member_no}` : ""}
                    </p>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${statusClass(application.status)}`}>
                    {application.status.replaceAll("_", " ")}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-300" />
                </article>
              ))}
              {!applications.length ? <p className="p-5 text-sm text-slate-500">{text.noApplications}</p> : null}
            </div>
          </section>
        </div>

        <footer className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span>Role-based RLS</span>
          <Languages className="ml-2 h-4 w-4 text-blue-600" />
          <span>한국어 · English · සිංහල</span>
          <Building2 className="ml-2 h-4 w-4 text-violet-600" />
          <span>{organizationName}</span>
        </footer>
      </div>
    </main>
  )
}
