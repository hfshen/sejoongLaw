"use client"

import { FormEvent, useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, PhoneCall, ShieldCheck } from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import { createClient } from "@/lib/supabase/client"

export default function StayCareIdentityCenter({
  locale,
  memberNo,
  currentPhone,
  currentEmail,
}: {
  locale: string
  memberNo: string
  currentPhone?: string | null
  currentEmail?: string | null
}) {
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [purpose, setPurpose] = useState<"korea_active" | "sri_lanka_predeparture">("korea_active")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function requestChange(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    try {
      const normalized = phone.replace(/[\s()-]/g, "")
      const prefix = purpose === "korea_active" ? "+82" : "+94"
      if (!normalized.startsWith(prefix)) throw new Error(`Use an international number beginning with ${prefix}.`)
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ phone: normalized })
      if (updateError) throw updateError
      setPhone(normalized)
      setSent(true)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to send phone verification")
    } finally {
      setLoading(false)
    }
  }

  async function verifyChange(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    setError("")
    try {
      const supabase = createClient()
      const { error: verifyError } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: "phone_change",
      })
      if (verifyError) throw verifyError
      const response = await fetch("/api/staycare/identity/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ purpose }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Unable to synchronize the phone")
      setSuccess(`Verified contact saved: ${data.phone}`)
      setSent(false)
      setOtp("")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to verify the phone")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        title="연락수단·계정 승계 센터"
        purpose="스리랑카 +94 번호로 시작한 계정을 한국 입국 후 +82 번호로 이어 사용하고, 연락수단 변경 이력을 근로자 ID에 연결합니다."
        boundary="전화번호는 영구 회원번호가 아닙니다. StayCare 회원번호는 유지되고 검증된 전화번호만 교체 가능한 로그인·연락수단으로 기록됩니다."
        items={[
          { label: "출국 전", description: "+94 번호를 사전 연락수단으로 유지" },
          { label: "입국 후", description: "+82 번호 OTP 검증 후 주 연락수단 전환" },
          { label: "중복 방지", description: "동일 번호와 근로자 ID 연결 이력 관리" },
          { label: "복구", description: "이메일과 기존 검증수단을 함께 유지" },
        ]}
      />

      <div className="mx-auto max-w-3xl px-4 py-10">
        <Link href={`/${locale}/staycare/app`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
          <ArrowLeft className="h-4 w-4" /> 근로자 앱으로 돌아가기
        </Link>
        <section className="mt-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-10">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-800">
              <PhoneCall className="h-6 w-6" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{memberNo}</p>
              <h1 className="text-2xl font-black">Verified contact continuity</h1>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">Current phone</p>
              <p className="mt-1 font-bold">{currentPhone || "Not registered"}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs font-black text-slate-500">Recovery email</p>
              <p className="mt-1 break-all font-bold">{currentEmail || "Not registered"}</p>
            </div>
          </div>

          {!sent ? (
            <form onSubmit={requestChange} className="mt-7 space-y-5">
              <label className="block">
                <span className="text-sm font-black">Contact purpose</span>
                <select
                  value={purpose}
                  onChange={(event) => setPurpose(event.target.value as typeof purpose)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5"
                >
                  <option value="korea_active">Korea active phone (+82)</option>
                  <option value="sri_lanka_predeparture">Sri Lanka pre-departure phone (+94)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm font-black">New verified phone</span>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  type="tel"
                  inputMode="tel"
                  placeholder={purpose === "korea_active" ? "+82 10 1234 5678" : "+94 77 123 4567"}
                  required
                  className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3.5 outline-none focus:border-blue-600"
                />
              </label>
              <button disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-700 px-5 py-4 font-black text-white disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Send verification code
              </button>
            </form>
          ) : (
            <form onSubmit={verifyChange} className="mt-7 space-y-5">
              <p className="rounded-2xl bg-blue-50 p-4 text-sm font-semibold text-blue-900">
                Enter the six-digit code sent to {phone}.
              </p>
              <input
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-center font-mono text-2xl tracking-[0.35em]"
              />
              <button disabled={loading} className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-4 font-black text-white disabled:opacity-50">
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                Verify and save contact
              </button>
              <button type="button" onClick={() => setSent(false)} className="w-full py-2 text-sm font-black text-slate-500">
                Change number
              </button>
            </form>
          )}

          {error ? <p className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
          {success ? <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{success}</p> : null}
        </section>
      </div>
    </main>
  )
}
