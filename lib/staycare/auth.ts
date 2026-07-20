import "server-only"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const stayCareStaffRoles = [
  "sejoong_admin",
  "sejoong_lawyer",
  "immigration_manager",
  "operator_manager",
  "operator_agent",
  "auditor",
] as const

export const stayCareExternalRoles = [
  "employer_admin",
  "institution_admin",
  "provider_agent",
] as const

export async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) return null
  return { supabase, user }
}

export async function resolveStayCareDestination(locale = "ko") {
  const context = await getAuthenticatedUser()
  if (!context) return null

  const { data: worker, error: workerError } = await context.supabase
    .from("staycare_workers")
    .select("id")
    .eq("auth_user_id", context.user.id)
    .maybeSingle()

  if (workerError) throw workerError
  if (worker) return `/${locale}/staycare/app`

  const { data: memberships, error: membershipError } = await context.supabase
    .from("staycare_memberships")
    .select("role")
    .eq("user_id", context.user.id)
    .eq("status", "active")

  if (membershipError) throw membershipError
  const roles = new Set((memberships || []).map((membership) => String(membership.role)))

  if (stayCareStaffRoles.some((role) => roles.has(role))) {
    return `/${locale}/staycare/admin`
  }

  if (stayCareExternalRoles.some((role) => roles.has(role))) {
    return `/${locale}/staycare/portal`
  }

  return `/${locale}/staycare/app`
}

export async function requireAuthenticatedUser(locale = "ko") {
  const context = await getAuthenticatedUser()
  if (!context) redirect(`/${locale}/staycare/login`)
  return context
}

export async function getWorkerContext() {
  const context = await getAuthenticatedUser()
  if (!context) return null

  const { data: worker, error: workerError } = await context.supabase
    .from("staycare_workers")
    .select(
      "id, tenant_id, member_no, full_name, full_name_en, preferred_language, visa_type, occupation, status, current_phase, profile_completion, expected_arrival_date, visa_expires_at, passport_expires_at, phone_number, next_action, next_action_due_at"
    )
    .eq("auth_user_id", context.user.id)
    .maybeSingle()

  if (workerError) throw workerError

  return {
    ...context,
    worker,
  }
}

export async function requireWorkerContext(locale = "ko") {
  const context = await getWorkerContext()
  if (!context) redirect(`/${locale}/staycare/login`)
  return context
}

export async function getStaffContext() {
  const context = await getAuthenticatedUser()
  if (!context) return null

  const { data: memberships, error } = await context.supabase
    .from("staycare_memberships")
    .select("tenant_id, organization_id, role, status")
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .in("role", [...stayCareStaffRoles])

  if (error) throw error
  if (!memberships?.length) return null

  return {
    ...context,
    memberships,
  }
}

export async function requireStaffContext(locale = "ko") {
  const context = await getStaffContext()
  if (!context) {
    const destination = await resolveStayCareDestination(locale)
    redirect(destination || `/${locale}/staycare/login`)
  }
  return context
}

export async function getExternalPortalContext() {
  const context = await getAuthenticatedUser()
  if (!context) return null

  const { data: memberships, error } = await context.supabase
    .from("staycare_memberships")
    .select("tenant_id, organization_id, role, status")
    .eq("user_id", context.user.id)
    .eq("status", "active")
    .in("role", [...stayCareExternalRoles])

  if (error) throw error
  if (!memberships?.length) return null

  return {
    ...context,
    memberships,
  }
}

export async function requireExternalPortalContext(locale = "ko") {
  const context = await getExternalPortalContext()
  if (!context) {
    const destination = await resolveStayCareDestination(locale)
    redirect(destination || `/${locale}/staycare/login`)
  }
  return context
}
