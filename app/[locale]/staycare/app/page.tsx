import type { Metadata } from "next"
import { cookies } from "next/headers"
import StayCareOnboarding from "@/components/staycare/StayCareOnboarding"
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
    normalizeStayCareLanguage(context.worker?.preferred_language) ||
    (locale === "en" ? "en" : "ko")

  if (!context.worker) {
    return (
      <StayCareOnboarding
        locale={preferredLanguage}
        email={context.user.email}
      />
    )
  }

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
    <StayCareWorkerWorkspace
      locale={locale}
      userEmail={context.user.email}
      worker={worker}
      initialSteps={(stepsResult.data || []) as WorkerWorkspaceStep[]}
      services={(servicesResult.data || []) as WorkerWorkspaceService[]}
      initialDocuments={
        (documentsResult.data || []) as WorkerWorkspaceDocument[]
      }
      initialApplications={
        (applicationsResult.data || []) as unknown as WorkerWorkspaceApplication[]
      }
      initialNotifications={
        (notificationsResult.data || []) as WorkerWorkspaceNotification[]
      }
      initialTickets={
        (ticketsResult.data || []) as unknown as WorkerWorkspaceTicket[]
      }
      returnPlan={
        (returnPlanResult.data || null) as WorkerWorkspaceReturnPlan | null
      }
    />
  )
}
