import type { Metadata } from "next"
import { cookies } from "next/headers"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import StayCareWorkerWorkspace, {
  type WorkerWorkspaceApplication,
  type WorkerWorkspaceDocument,
  type WorkerWorkspaceNotification,
  type WorkerWorkspaceReturnPlan,
  type WorkerWorkspaceService,
  type WorkerWorkspaceStep,
  type WorkerWorkspaceTicket,
  type WorkerWorkspaceWorker,
} from "@/components/staycare/StayCareWorkerWorkspace"
import { requireWorkerContext } from "@/lib/staycare/auth"
import { normalizeStayCareLanguage } from "@/lib/staycare/language"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sejoong StayCare | Korea Life One-stop App",
  description:
    "Secure Sri Lanka-to-Korea preparation, life, stay, service and return management.",
  robots: { index: false, follow: false },
}

export default async function StayCareAppPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ lang?: string | string[] }>
}) {
  const { locale } = await params
  const query = searchParams ? await searchParams : undefined
  const queryLanguage = normalizeStayCareLanguage(
    Array.isArray(query?.lang) ? query.lang[0] : query?.lang
  )
  const cookieStore = await cookies()
  const cookieLanguage = normalizeStayCareLanguage(
    cookieStore.get("staycare_language")?.value
  )
  const context = await requireWorkerContext(locale)

  const preferredLanguage =
    queryLanguage ||
    cookieLanguage ||
    normalizeStayCareLanguage(context.worker.preferred_language) ||
    (locale === "en" ? "en" : "ko")

  const [
    stepsResult,
    servicesResult,
    documentsResult,
    applicationsResult,
    notificationsResult,
    ticketsResult,
    returnPlanResult,
  ] = await Promise.all([
    context.supabase
      .from("staycare_journey_steps")
      .select(
        "id, step_code, phase, title, description, responsibility, official_process, required, status, due_at, official_reference_url, data"
      )
      .eq("worker_id", context.worker.id)
      .order("created_at", { ascending: true }),
    context.supabase
      .from("staycare_service_catalog")
      .select(
        "id, code, category, name, description, delivery_modes, integration_mode, legal_boundary"
      )
      .eq("tenant_id", context.worker.tenant_id)
      .eq("status", "active")
      .order("category", { ascending: true }),
    context.supabase
      .from("staycare_documents")
      .select(
        "id, document_type, original_filename, mime_type, byte_size, status, rejection_reason, issue_date, expiry_date, created_at"
      )
      .eq("worker_id", context.worker.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, submitted_at, fulfilled_at, created_at, external_reference, rejected_reason, submitted_data, service:staycare_service_catalog(code, category, name), events:staycare_application_events(id, event_type, body, created_at)"
      )
      .eq("worker_id", context.worker.id)
      .order("created_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("staycare_notifications")
      .select("id, subject, body, read_at, created_at, metadata")
      .eq("worker_id", context.worker.id)
      .eq("channel", "in_app")
      .order("created_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("staycare_tickets")
      .select(
        "id, ticket_no, title, category, priority, status, description, worker_visible_summary, first_response_due_at, resolution_due_at, resolved_at, created_at, events:staycare_ticket_events(id, event_type, body, created_at)"
      )
      .eq("worker_id", context.worker.id)
      .order("created_at", { ascending: false })
      .limit(100),
    context.supabase
      .from("staycare_return_plans")
      .select(
        "expected_return_date, contract_end_date, final_salary_status, severance_status, insurance_claim_status, final_remittance_status, bank_closure_status, telecom_closure_status, accommodation_checkout_status, departure_record_status, reintegration_status, status"
      )
      .eq("worker_id", context.worker.id)
      .maybeSingle(),
  ])

  const firstError = [
    stepsResult.error,
    servicesResult.error,
    documentsResult.error,
    applicationsResult.error,
    notificationsResult.error,
    ticketsResult.error,
    returnPlanResult.error,
  ].find(Boolean)
  if (firstError) throw firstError

  const worker = {
    ...context.worker,
    preferred_language: preferredLanguage,
  } as WorkerWorkspaceWorker

  return (
    <>
      <StayCarePurposeNote
        compact
        initialLanguage={locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"}
        title={{ ko: "근로자 생애주기 앱", en: "Worker lifecycle app", si: "සේවක ජීවන චක්‍ර යෙදුම", ta: "தொழிலாளர் வாழ்க்கைச் சுழற்சி செயலி" }}
        purpose={{
          ko: "공식 선발 이후 출국 준비, 입국, 초기 90일 정착, 근로·체류, 사고·민원, 장기체류 준비와 귀국까지 개인별 다음 행동을 관리합니다.",
          en: "Manage each worker's next action from post-selection departure preparation through arrival, the first 90 days, work and stay, incidents, long-term preparation and return.",
          si: "නිල තේරීමෙන් පසු පිටත්වීම, පැමිණීම, පළමු දින 90, වැඩ හා රැඳී සිටීම, සිදුවීම්, දිගුකාලීන සූදානම සහ ආපසු යාම දක්වා ඊළඟ ක්‍රියා කළමනාකරණය කරයි.",
          ta: "அதிகாரப்பூர்வ தேர்வுக்குப் பிந்தைய புறப்பாட்டு தயாரிப்பிலிருந்து வருகை, முதல் 90 நாட்கள், வேலை மற்றும் தங்குதல், சம்பவங்கள், நீண்டகால தயாரிப்பு மற்றும் திரும்புதல் வரை ஒவ்வொரு தொழிலாளரின் அடுத்த நடவடிக்கையை நிர்வகிக்கிறது.",
        }}
        boundary={{
          ko: "정부·EPS의 승인과 법률·의료 판단을 대신하지 않습니다. 공식기관 상태, 세중 지원, 고용주 의무와 제휴서비스 책임을 구분해 표시합니다.",
          en: "It does not replace government or EPS approval, legal advice or medical judgment. Official status, Sejoong support, employer duties and provider responsibilities are shown separately.",
          si: "මෙය රජය හෝ EPS අනුමැතිය, නීතිමය උපදෙස් හෝ වෛද්‍ය තීරණ වෙනුවට නොවේ. නිල තත්ත්වය, Sejoong සහාය, සේවායෝජක වගකීම් සහ සේවා සපයන්නාගේ වගකීම් වෙන් කර පෙන්වයි.",
          ta: "இது அரசு அல்லது EPS அங்கீகாரம், சட்ட ஆலோசனை அல்லது மருத்துவ தீர்ப்பை மாற்றாது. அதிகாரப்பூர்வ நிலை, Sejoong ஆதரவு, முதலாளி கடமைகள் மற்றும் வழங்குநர் பொறுப்புகள் தனித்தனியாக காட்டப்படும்.",
        }}
        items={[
          { label: { ko: "오늘 할 일", en: "Today's actions", si: "අද කළ යුතු දේ", ta: "இன்றைய செயல்கள்" }, description: { ko: "기한과 위험도에 따라 우선순위 표시", en: "Prioritized by deadline and risk", si: "කාලසීමාව හා අවදානම අනුව ප්‍රමුඛතාව", ta: "காலக்கெடு மற்றும் ஆபத்தின் அடிப்படையில் முன்னுரிமை" } },
          { label: { ko: "내 서류", en: "My documents", si: "මගේ ලේඛන", ta: "என் ஆவணங்கள்" }, description: { ko: "여권·비자·계약·등록·보험 검수", en: "Passport, visa, contract, registration and insurance review", si: "ගමන් බලපත්‍ර, වීසා, ගිවිසුම්, ලියාපදිංචි හා රක්ෂණ පරීක්ෂාව", ta: "கடவுச்சீட்டு, விசா, ஒப்பந்தம், பதிவு மற்றும் காப்பீட்டு சரிபார்ப்பு" } },
          { label: { ko: "상담·사고", en: "Support and incidents", si: "සහාය හා සිදුවීම්", ta: "உதவி மற்றும் சம்பவங்கள்" }, description: { ko: "P0~P3 티켓과 사람 검토 연결", en: "P0-P3 tickets routed to human review", si: "P0-P3 ටිකට් මානව පරීක්ෂාවට යොමු කිරීම", ta: "P0-P3 கோரிக்கைகள் மனித மதிப்பாய்வுக்கு அனுப்பப்படும்" } },
          { label: { ko: "계정 연속성", en: "Account continuity", si: "ගිණුම් අඛණ්ඩතාව", ta: "கணக்கு தொடர்ச்சி" }, description: { ko: "+94에서 +82 번호로 연락수단 승계", en: "Carry contact identity from +94 to +82", si: "+94 සිට +82 දක්වා සම්බන්ධතා අඛණ්ඩතාව", ta: "+94 இலிருந்து +82 வரை தொடர்பு தொடர்ச்சி" } },
        ]}
        links={[
          { href: `/${locale}/staycare/account`, label: { ko: "전화번호·복구수단 관리", en: "Manage phone and recovery methods", si: "දුරකථන හා නැවත ලබාගැනීම කළමනාකරණය", ta: "தொலைபேசி மற்றும் மீட்பு முறைகளை நிர்வகிக்கவும்" } },
          { href: `/${locale}/staycare/notes`, label: { ko: "전체 화면 용도 보기", en: "View all page purposes", si: "සියලු පිටු අරමුණු බලන්න", ta: "அனைத்து பக்க பயன்பாடுகளையும் காண்க" } },
        ]}
      />
      <StayCareWorkerWorkspace
        locale={locale}
        userEmail={context.user.email}
        worker={worker}
        initialSteps={(stepsResult.data || []) as WorkerWorkspaceStep[]}
        services={(servicesResult.data || []) as WorkerWorkspaceService[]}
        initialDocuments={(documentsResult.data || []) as WorkerWorkspaceDocument[]}
        initialApplications={(applicationsResult.data || []) as unknown as WorkerWorkspaceApplication[]}
        initialNotifications={(notificationsResult.data || []) as WorkerWorkspaceNotification[]}
        initialTickets={(ticketsResult.data || []) as unknown as WorkerWorkspaceTicket[]}
        returnPlan={(returnPlanResult.data || null) as WorkerWorkspaceReturnPlan | null}
      />
    </>
  )
}
