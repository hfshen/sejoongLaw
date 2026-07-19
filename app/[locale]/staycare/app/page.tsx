import type { Metadata } from "next"
import { cookies } from "next/headers"
import StayCareOnboarding from "@/components/staycare/StayCareOnboarding"
import StayCareProductionApp, {
  type ProductionApplication,
  type ProductionDocument,
  type ProductionService,
  type ProductionStep,
  type ProductionWorker,
} from "@/components/staycare/StayCareProductionApp"
import { requireWorkerContext } from "@/lib/staycare/auth"
import { normalizeStayCareLanguage } from "@/lib/staycare/language"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Sejoong StayCare | Korea Life One-stop App",
  description: "Secure Sri Lanka-to-Korea preparation, life, stay, service and return management.",
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
    Array.isArray(query?.lang) ? query?.lang[0] : query?.lang
  )
  const cookieLanguage = normalizeStayCareLanguage(
    cookies().get("staycare_language")?.value
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

  const [stepsResult, servicesResult, documentsResult, applicationsResult] = await Promise.all([
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
        "id, code, category, name, description, available_from_phase, ownership, delivery_modes, required_data, integration_mode, legal_boundary"
      )
      .eq("tenant_id", context.worker.tenant_id)
      .eq("status", "active")
      .order("category", { ascending: true }),
    context.supabase
      .from("staycare_documents")
      .select(
        "id, document_type, original_filename, mime_type, byte_size, status, issue_date, expiry_date, created_at"
      )
      .eq("worker_id", context.worker.id)
      .neq("status", "deleted")
      .order("created_at", { ascending: false }),
    context.supabase
      .from("staycare_service_applications")
      .select(
        "id, application_no, status, language, submitted_at, fulfilled_at, created_at, service:staycare_service_catalog(code, category, name)"
      )
      .eq("worker_id", context.worker.id)
      .order("created_at", { ascending: false })
      .limit(100),
  ])

  const firstError = [stepsResult.error, servicesResult.error, documentsResult.error, applicationsResult.error].find(Boolean)
  if (firstError) throw firstError

  const worker = {
    ...context.worker,
    preferred_language: preferredLanguage,
  } as ProductionWorker

  return (
    <StayCareProductionApp
      locale={locale}
      userEmail={context.user.email}
      worker={worker}
      initialSteps={(stepsResult.data || []) as ProductionStep[]}
      services={(servicesResult.data || []) as ProductionService[]}
      documents={(documentsResult.data || []) as ProductionDocument[]}
      applications={(applicationsResult.data || []) as unknown as ProductionApplication[]}
    />
  )
}
