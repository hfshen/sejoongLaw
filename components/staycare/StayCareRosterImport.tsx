"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardPaste, Download, Loader2, UploadCloud } from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"

const sample = `fullName,fullNameEn,dateOfBirth,officialReferenceNo,visaType,occupation,expectedArrivalDate,siteName,subcontractorName,department,jobCode,shiftCode,teamCode,dormitoryName,roomReference
නිමල් පෙරේරා,NIMAL PERERA,1995-04-12,EPS-LK-0001,E-9,WELDER,2026-09-10,Geoje Shipyard,Partner A,Hull,WELDER-A,DAY,T01,Dorm A,301-1`

function parseDelimited(text: string) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error("Include a header and at least one worker row.")
  const delimiter = lines[0].includes("\t") ? "\t" : ","
  const headers = lines[0].split(delimiter).map((value) => value.trim())
  const required = ["fullName", "fullNameEn", "dateOfBirth"]
  for (const column of required) {
    if (!headers.includes(column)) throw new Error(`Missing required column: ${column}`)
  }
  return lines.slice(1).map((line) => {
    const values = line.split(delimiter).map((value) => value.trim())
    return Object.fromEntries(headers.map((header, index) => [header, values[index] || ""]))
  })
}

export default function StayCareRosterImport({
  locale,
  tenantId,
}: {
  locale: string
  tenantId: string
}) {
  const [raw, setRaw] = useState(sample)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<null | {
    imported: Array<Record<string, unknown>>
    failed: Array<{ row: number; name: string; error: string }>
  }>(null)
  const previewCount = useMemo(() => {
    try {
      return parseDelimited(raw).length
    } catch {
      return 0
    }
  }, [raw])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)
    const form = new FormData(event.currentTarget)
    try {
      const rows = parseDelimited(raw)
      const scheduledArrival = String(form.get("scheduledArrivalAt") || "")
      const response = await fetch("/api/staycare/admin/roster/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId,
          cohort: {
            code: form.get("cohortCode"),
            name: form.get("cohortName"),
            targetHeadcount: Number(form.get("targetHeadcount") || rows.length),
            visaPath: form.get("visaPath"),
          },
          batch: form.get("batchCode")
            ? {
                code: form.get("batchCode"),
                sequenceNo: Number(form.get("sequenceNo") || 1),
                flightNumber: form.get("flightNumber"),
                scheduledArrivalAt: scheduledArrival ? new Date(scheduledArrival).toISOString() : "",
                arrivalAirport: form.get("arrivalAirport"),
                arrivalTerminal: form.get("arrivalTerminal"),
                busReference: form.get("busReference"),
                leadName: form.get("leadName"),
                leadPhone: form.get("leadPhone"),
              }
            : undefined,
          rosterVersion: form.get("rosterVersion"),
          rows,
        }),
      })
      const data = await response.json()
      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || "Unable to import the roster")
      }
      setResult({ imported: data.imported || [], failed: data.failed || [] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to import the roster")
    } finally {
      setLoading(false)
    }
  }

  function downloadInvites() {
    if (!result?.imported.length) return
    const headers = ["memberNo", "fullNameEn", "inviteCode", "expiresAt", "batchCode"]
    const csv = [
      headers.join(","),
      ...result.imported.map((row) =>
        headers.map((key) => JSON.stringify(row[key] ?? "")).join(",")
      ),
    ].join("\n")
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "staycare-worker-invites.csv"
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        title="공식 근로자 명부·입국차수 등록"
        purpose="SLBFE·송출기관·교육기관·고용주로부터 검증된 명부를 Cohort와 입국차수로 묶고 근로자별 1회용 초대코드를 발급합니다."
        boundary="이 화면은 민간 모집을 수행하지 않습니다. 적법한 공식 채널에서 확정·검증된 명부만 가져오며, 초대코드는 본인 계정 Claim 용도로만 사용합니다."
        items={[
          { label: "Cohort", description: "2,000명 사업 전체 또는 계약 단위" },
          { label: "Arrival batch", description: "항공편·공항·버스·인솔자 단위" },
          { label: "Roster", description: "공식참조번호·영문명·생년월일" },
          { label: "Invite", description: "90일 만료 1회용 QR·코드" },
        ]}
        links={[
          { href: `/${locale}/staycare/admin/control-tower`, label: "Control Tower" },
          { href: `/${locale}/staycare/notes`, label: "화면 용도 안내" },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href={`/${locale}/staycare/admin`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
          <ArrowLeft className="h-4 w-4" /> 통합 운영센터
        </Link>
        <form onSubmit={submit} className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h1 className="text-2xl font-black">Cohort & arrival batch</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field name="cohortCode" label="Cohort code" placeholder="SLK-SHIP-2026" required />
              <Field name="cohortName" label="Cohort name" placeholder="Sri Lanka Shipyard 2,000" required />
              <Field name="targetHeadcount" label="Target headcount" type="number" defaultValue="2000" required />
              <Field name="visaPath" label="Visa path" placeholder="E-9 manufacturing" />
              <Field name="batchCode" label="Arrival batch code" placeholder="WAVE-01" />
              <Field name="sequenceNo" label="Sequence" type="number" defaultValue="1" />
              <Field name="flightNumber" label="Flight" placeholder="UL470" />
              <Field name="scheduledArrivalAt" label="Scheduled arrival" type="datetime-local" />
              <Field name="arrivalAirport" label="Arrival airport" placeholder="ICN" />
              <Field name="arrivalTerminal" label="Terminal" placeholder="T1" />
              <Field name="busReference" label="Bus reference" placeholder="BUS-01~05" />
              <Field name="leadName" label="Arrival lead" placeholder="Operations lead" />
              <Field name="leadPhone" label="Lead phone" placeholder="+82..." />
              <Field name="rosterVersion" label="Roster version" defaultValue="v1" required />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Paste CSV or TSV roster</h2>
                <p className="mt-1 text-sm text-slate-500">Preview: {previewCount} workers · maximum 500 per import</p>
              </div>
              <button type="button" onClick={() => setRaw(sample)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">
                <ClipboardPaste className="h-4 w-4" /> Load sample
              </button>
            </div>
            <textarea
              value={raw}
              onChange={(event) => setRaw(event.target.value)}
              rows={18}
              spellCheck={false}
              className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-200 outline-none focus:border-blue-600"
            />
            {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
            <button disabled={loading || !previewCount} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-50">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
              Import roster and issue invitation codes
            </button>
          </section>
        </form>

        {result ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">Import result</h2>
                <p className="mt-1 text-sm text-slate-500">Imported {result.imported.length} · Failed {result.failed.length}</p>
              </div>
              <button onClick={downloadInvites} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white">
                <Download className="h-4 w-4" /> Download invitation CSV
              </button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">Member</th><th className="p-3">Name</th><th className="p-3">Invite</th><th className="p-3">Expires</th></tr></thead>
                <tbody>{result.imported.map((row, index) => <tr key={String(row.workerId || index)} className="border-b"><td className="p-3 font-mono text-xs">{String(row.memberNo)}</td><td className="p-3 font-bold">{String(row.fullNameEn)}</td><td className="p-3 font-mono font-black text-blue-800">{String(row.inviteCode)}</td><td className="p-3 text-xs">{String(row.expiresAt)}</td></tr>)}</tbody>
              </table>
            </div>
            {result.failed.length ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {result.failed.map((item) => <p key={`${item.row}-${item.name}`}>Row {item.row} · {item.name}: {item.error}</p>)}
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
    </main>
  )
}

function Field({
  name,
  label,
  type = "text",
  placeholder,
  defaultValue,
  required = false,
}: {
  name: string
  label: string
  type?: string
  placeholder?: string
  defaultValue?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-wide text-slate-600">{label}</span>
      <input name={name} type={type} placeholder={placeholder} defaultValue={defaultValue} required={required} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-blue-600" />
    </label>
  )
}
