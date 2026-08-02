"use client"

import { FormEvent, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ClipboardPaste, Download, Loader2, UploadCloud } from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const sample = `fullName,fullNameEn,dateOfBirth,officialReferenceNo,visaType,occupation,expectedArrivalDate,siteName,subcontractorName,department,jobCode,shiftCode,teamCode,dormitoryName,roomReference
නිමල් පෙරේරා,NIMAL PERERA,1995-04-12,EPS-LK-0001,E-9,WELDER,2026-09-10,Geoje Shipyard,Partner A,Hull,WELDER-A,DAY,T01,Dorm A,301-1`

const copy = {
  ko: {
    back: "통합 운영센터",
    cohortTitle: "Cohort 및 입국차수",
    cohortCode: "Cohort 코드",
    cohortName: "Cohort 이름",
    target: "목표 인원",
    visa: "비자 경로",
    batch: "입국차수 코드",
    sequence: "순번",
    flight: "항공편",
    arrival: "예정 도착일시",
    airport: "도착 공항",
    terminal: "터미널",
    bus: "버스 참조번호",
    lead: "입국 인솔자",
    leadPhone: "인솔자 전화번호",
    version: "명부 버전",
    paste: "CSV 또는 TSV 명부 붙여넣기",
    preview: (count: number) => `미리보기: ${count}명 · 1회 최대 500명`,
    sample: "샘플 불러오기",
    import: "명부 등록 및 초대코드 발급",
    result: "등록 결과",
    resultSummary: (ok: number, failed: number) => `등록 ${ok}명 · 실패 ${failed}명`,
    download: "초대코드 CSV 다운로드",
    member: "회원번호",
    name: "이름",
    invite: "초대코드",
    expires: "만료일",
    row: "행",
    headerError: "헤더와 근로자 1명 이상의 행을 포함하세요.",
    missing: (column: string) => `필수 열 누락: ${column}`,
    importError: "명부를 등록할 수 없습니다.",
  },
  en: {
    back: "Operations center",
    cohortTitle: "Cohort and arrival batch",
    cohortCode: "Cohort code",
    cohortName: "Cohort name",
    target: "Target headcount",
    visa: "Visa path",
    batch: "Arrival batch code",
    sequence: "Sequence",
    flight: "Flight",
    arrival: "Scheduled arrival",
    airport: "Arrival airport",
    terminal: "Terminal",
    bus: "Bus reference",
    lead: "Arrival lead",
    leadPhone: "Lead phone",
    version: "Roster version",
    paste: "Paste CSV or TSV roster",
    preview: (count: number) => `Preview: ${count} workers · maximum 500 per import`,
    sample: "Load sample",
    import: "Import roster and issue invitation codes",
    result: "Import result",
    resultSummary: (ok: number, failed: number) => `Imported ${ok} · Failed ${failed}`,
    download: "Download invitation CSV",
    member: "Member",
    name: "Name",
    invite: "Invite",
    expires: "Expires",
    row: "Row",
    headerError: "Include a header and at least one worker row.",
    missing: (column: string) => `Missing required column: ${column}`,
    importError: "Unable to import the roster.",
  },
  si: {
    back: "මෙහෙයුම් මධ්‍යස්ථානය",
    cohortTitle: "කණ්ඩායම සහ පැමිණීමේ වාරය",
    cohortCode: "කණ්ඩායම් කේතය",
    cohortName: "කණ්ඩායම් නම",
    target: "ඉලක්ක සේවක සංඛ්‍යාව",
    visa: "වීසා මාර්ගය",
    batch: "පැමිණීමේ වාර කේතය",
    sequence: "අනුපිළිවෙළ",
    flight: "ගුවන් යානය",
    arrival: "නියමිත පැමිණීම",
    airport: "පැමිණීමේ ගුවන් තොටුපළ",
    terminal: "පර්යන්තය",
    bus: "බස් යොමුව",
    lead: "පැමිණීමේ භාරකරු",
    leadPhone: "භාරකරුගේ දුරකථනය",
    version: "ලැයිස්තු අනුවාදය",
    paste: "CSV හෝ TSV ලැයිස්තුව අලවන්න",
    preview: (count: number) => `පෙරදසුන: සේවකයින් ${count} · වරකට උපරිම 500`,
    sample: "උදාහරණය පූරණය කරන්න",
    import: "ලැයිස්තුව ඇතුළත් කර ආරාධනා කේත නිකුත් කරන්න",
    result: "ඇතුළත් කිරීමේ ප්‍රතිඵලය",
    resultSummary: (ok: number, failed: number) => `ඇතුළත් ${ok} · අසාර්ථක ${failed}`,
    download: "ආරාධනා CSV බාගන්න",
    member: "සාමාජිකයා",
    name: "නම",
    invite: "ආරාධනාව",
    expires: "කල් ඉකුත්වීම",
    row: "පේළිය",
    headerError: "ශීර්ෂයක් සහ අවම වශයෙන් එක් සේවක පේළියක් ඇතුළත් කරන්න.",
    missing: (column: string) => `අවශ්‍ය තීරුව නොමැත: ${column}`,
    importError: "ලැයිස්තුව ඇතුළත් කළ නොහැක.",
  },
  ta: {
    back: "செயல்பாட்டு மையம்",
    cohortTitle: "குழு மற்றும் வருகைத் தொகுதி",
    cohortCode: "குழு குறியீடு",
    cohortName: "குழு பெயர்",
    target: "இலக்கு எண்ணிக்கை",
    visa: "விசா பாதை",
    batch: "வருகைத் தொகுதி குறியீடு",
    sequence: "வரிசை",
    flight: "விமானம்",
    arrival: "திட்டமிட்ட வருகை",
    airport: "வருகை விமான நிலையம்",
    terminal: "முனையம்",
    bus: "பஸ் குறிப்பெண்",
    lead: "வருகை பொறுப்பாளர்",
    leadPhone: "பொறுப்பாளர் தொலைபேசி",
    version: "பட்டியல் பதிப்பு",
    paste: "CSV அல்லது TSV பட்டியலை ஒட்டவும்",
    preview: (count: number) => `முன்னோட்டம்: ${count} தொழிலாளர்கள் · ஒருமுறை அதிகபட்சம் 500`,
    sample: "மாதிரியை ஏற்றவும்",
    import: "பட்டியலை இறக்குமதி செய்து அழைப்புக் குறியீடுகளை வழங்கவும்",
    result: "இறக்குமதி முடிவு",
    resultSummary: (ok: number, failed: number) => `இறக்குமதி ${ok} · தோல்வி ${failed}`,
    download: "அழைப்பு CSV-ஐ பதிவிறக்கவும்",
    member: "உறுப்பினர்",
    name: "பெயர்",
    invite: "அழைப்பு",
    expires: "காலாவதி",
    row: "வரி",
    headerError: "தலைப்பும் குறைந்தது ஒரு தொழிலாளர் வரியும் சேர்க்கவும்.",
    missing: (column: string) => `தேவையான நெடுவரிசை இல்லை: ${column}`,
    importError: "பட்டியலை இறக்குமதி செய்ய முடியவில்லை.",
  },
} as const

function parseDelimited(text: string, language: StayCarePreferredLanguage) {
  const t = copy[language]
  const lines = text.trim().split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) throw new Error(t.headerError)
  const delimiter = lines[0].includes("\t") ? "\t" : ","
  const headers = lines[0].split(delimiter).map((value) => value.trim())
  const required = ["fullName", "fullNameEn", "dateOfBirth"]
  for (const column of required) {
    if (!headers.includes(column)) throw new Error(t.missing(column))
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
  const initialLanguage: StayCarePreferredLanguage =
    locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language } = useStayCareLanguage(initialLanguage)
  const t = copy[language]
  const [raw, setRaw] = useState(sample)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState<null | {
    imported: Array<Record<string, unknown>>
    failed: Array<{ row: number; name: string; error: string }>
  }>(null)
  const previewCount = useMemo(() => {
    try {
      return parseDelimited(raw, language).length
    } catch {
      return 0
    }
  }, [raw, language])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError("")
    setResult(null)
    const form = new FormData(event.currentTarget)
    try {
      const rows = parseDelimited(raw, language)
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
        throw new Error(data.error || t.importError)
      }
      setResult({ imported: data.imported || [], failed: data.failed || [] })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t.importError)
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

  const note = {
    title: {
      ko: "공식 근로자 명부·입국차수 등록",
      en: "Official worker roster and arrival-batch registration",
      si: "නිල සේවක ලැයිස්තුව සහ පැමිණීමේ වාර ලියාපදිංචිය",
      ta: "அதிகாரப்பூர்வ தொழிலாளர் பட்டியல் மற்றும் வருகைத் தொகுதி பதிவு",
    },
    purpose: {
      ko: "SLBFE·송출기관·교육기관·고용주로부터 검증된 명부를 Cohort와 입국차수로 묶고 근로자별 1회용 초대코드를 발급합니다.",
      en: "Group verified rosters from SLBFE, sending institutions, training institutions and employers into cohorts and arrival batches, then issue one-time invitation codes.",
      si: "SLBFE, යැවීමේ ආයතන, පුහුණු ආයතන සහ සේවායෝජකයන්ගෙන් තහවුරු කළ ලැයිස්තු කණ්ඩායම් සහ පැමිණීමේ වාර ලෙස සකස් කර එක්වරක් භාවිත කරන ආරාධනා කේත නිකුත් කරයි.",
      ta: "SLBFE, அனுப்பும் நிறுவனம், பயிற்சி நிறுவனம் மற்றும் முதலாளியிடமிருந்து சரிபார்க்கப்பட்ட பட்டியல்களை குழு மற்றும் வருகைத் தொகுதிகளாக அமைத்து ஒருமுறை பயன்படும் அழைப்புக் குறியீடுகளை வழங்குகிறது.",
    },
    boundary: {
      ko: "이 화면은 민간 모집을 수행하지 않습니다. 적법한 공식 채널에서 확정·검증된 명부만 가져오며, 초대코드는 본인 계정 Claim 용도로만 사용합니다.",
      en: "This screen does not recruit workers. Import only rosters confirmed through lawful official channels; invitation codes are only for claiming the correct account.",
      si: "මෙම පිටුව පුද්ගලික බඳවාගැනීම් නොකරයි. නීත්‍යානුකූල නිල මාර්ගයෙන් තහවුරු කළ ලැයිස්තු පමණක් ගෙන ආරාධනා කේත ගිණුම claim කිරීම සඳහා පමණක් භාවිත කරයි.",
      ta: "இந்த திரை தனியார் ஆட்சேர்ப்பை நடத்தாது. சட்டபூர்வ அதிகாரப்பூர்வ சேனலில் உறுதிசெய்யப்பட்ட பட்டியல்களை மட்டும் இறக்குமதி செய்யவும்; அழைப்புக் குறியீடு சரியான கணக்கை claim செய்வதற்கே பயன்படும்.",
    },
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        initialLanguage={initialLanguage}
        title={note.title}
        purpose={note.purpose}
        boundary={note.boundary}
        items={[
          { label: "Cohort", description: { ko: "2,000명 사업 전체 또는 계약 단위", en: "Whole 2,000-worker program or contract unit", si: "සේවක 2,000 වැඩසටහන හෝ ගිවිසුම් ඒකකය", ta: "2,000 தொழிலாளர் திட்டம் அல்லது ஒப்பந்த அலகு" } },
          { label: "Arrival batch", description: { ko: "항공편·공항·버스·인솔자 단위", en: "Flight, airport, bus and escort unit", si: "ගුවන් යානය, ගුවන් තොටුපළ, බස් සහ භාරකරු ඒකකය", ta: "விமானம், விமான நிலையம், பஸ் மற்றும் பொறுப்பாளர் அலகு" } },
          { label: "Roster", description: { ko: "공식참조번호·영문명·생년월일", en: "Official reference, passport English name and date of birth", si: "නිල යොමුව, ඉංග්‍රීසි නම සහ උපන්දිනය", ta: "அதிகாரப்பூர்வ குறிப்பு, ஆங்கிலப் பெயர் மற்றும் பிறந்த தேதி" } },
          { label: "Invite", description: { ko: "90일 만료 1회용 QR·코드", en: "Single-use QR/code expiring in 90 days", si: "දින 90කින් කල් ඉකුත් වන එක්වර QR/කේතය", ta: "90 நாட்களில் காலாவதியாகும் ஒருமுறை QR/குறியீடு" } },
        ]}
        links={[
          { href: `/${locale}/staycare/admin/control-tower`, label: "Control Tower" },
          { href: `/${locale}/staycare/notes`, label: { ko: "화면 용도 안내", en: "Page-purpose guide", si: "පිටු අරමුණු මාර්ගෝපදේශය", ta: "பக்க பயன்பாட்டு வழிகாட்டி" } },
        ]}
      />

      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link href={`/${locale}/staycare/admin`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600">
          <ArrowLeft className="h-4 w-4" /> {t.back}
        </Link>
        <form onSubmit={submit} className="mt-5 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <h1 className="text-2xl font-black">{t.cohortTitle}</h1>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field name="cohortCode" label={t.cohortCode} placeholder="SLK-SHIP-2026" required />
              <Field name="cohortName" label={t.cohortName} placeholder="Sri Lanka Shipyard 2,000" required />
              <Field name="targetHeadcount" label={t.target} type="number" defaultValue="2000" required />
              <Field name="visaPath" label={t.visa} placeholder="E-9 manufacturing" />
              <Field name="batchCode" label={t.batch} placeholder="WAVE-01" />
              <Field name="sequenceNo" label={t.sequence} type="number" defaultValue="1" />
              <Field name="flightNumber" label={t.flight} placeholder="UL470" />
              <Field name="scheduledArrivalAt" label={t.arrival} type="datetime-local" />
              <Field name="arrivalAirport" label={t.airport} placeholder="ICN" />
              <Field name="arrivalTerminal" label={t.terminal} placeholder="T1" />
              <Field name="busReference" label={t.bus} placeholder="BUS-01~05" />
              <Field name="leadName" label={t.lead} placeholder="Operations lead" />
              <Field name="leadPhone" label={t.leadPhone} placeholder="+82..." />
              <Field name="rosterVersion" label={t.version} defaultValue="v1" required />
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{t.paste}</h2>
                <p className="mt-1 text-sm text-slate-500">{t.preview(previewCount)}</p>
              </div>
              <button type="button" onClick={() => setRaw(sample)} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black">
                <ClipboardPaste className="h-4 w-4" /> {t.sample}
              </button>
            </div>
            <textarea value={raw} onChange={(event) => setRaw(event.target.value)} rows={18} spellCheck={false} className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-xs leading-6 text-emerald-200 outline-none focus:border-blue-600" />
            {error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p> : null}
            <button disabled={loading || !previewCount} className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-5 py-4 font-black text-white disabled:opacity-50">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
              {t.import}
            </button>
          </section>
        </form>

        {result ? (
          <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-2xl font-black">{t.result}</h2>
                <p className="mt-1 text-sm text-slate-500">{t.resultSummary(result.imported.length, result.failed.length)}</p>
              </div>
              <button onClick={downloadInvites} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-black text-white">
                <Download className="h-4 w-4" /> {t.download}
              </button>
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-3">{t.member}</th><th className="p-3">{t.name}</th><th className="p-3">{t.invite}</th><th className="p-3">{t.expires}</th></tr></thead>
                <tbody>{result.imported.map((row, index) => <tr key={String(row.workerId || index)} className="border-b"><td className="p-3 font-mono text-xs">{String(row.memberNo)}</td><td className="p-3 font-bold">{String(row.fullNameEn)}</td><td className="p-3 font-mono font-black text-blue-800">{String(row.inviteCode)}</td><td className="p-3 text-xs">{String(row.expiresAt)}</td></tr>)}</tbody>
              </table>
            </div>
            {result.failed.length ? (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {result.failed.map((item) => <p key={`${item.row}-${item.name}`}>{t.row} {item.row} · {item.name}: {item.error}</p>)}
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
