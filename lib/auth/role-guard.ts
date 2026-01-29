import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { redirect } from "next/navigation"
import logger from "@/lib/logger"

export type UserRole =
  | "korea_agent"
  | "translator"
  | "foreign_lawyer"
  | "family_viewer"
  | "admin"
  | "system"

export interface UserProfile {
  id: string
  email: string | null
  name: string | null
  role: UserRole
  status: "active" | "pending" | "suspended"
  country: string | null
  organization: string | null
}

/**
 * Get current user's profile with role
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Use service client to bypass RLS for profile lookup
    const serviceClient = getServiceClient()
    const { data: profile, error } = await serviceClient
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error || !profile) {
      logger.warn("Profile not found for user", { userId: user.id, error })
      return null
    }

    return {
      id: profile.id,
      email: profile.email,
      name: profile.name,
      role: (profile.role as UserRole) || "family_viewer",
      status: (profile.status as "active" | "pending" | "suspended") || "pending",
      country: profile.country,
      organization: profile.organization,
    }
  } catch (error) {
    logger.error("Error getting user profile", { error })
    return null
  }
}

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | null, requiredRoles: UserRole[]): boolean {
  if (!userRole) {
    return false
  }
  return requiredRoles.includes(userRole)
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole | null): boolean {
  return userRole === "admin"
}

/**
 * Check if user is active
 */
export function isActive(status: string | null): boolean {
  return status === "active"
}

/**
 * Require role - throws error or redirects if user doesn't have required role
 */
export async function requireRole(
  requiredRoles: UserRole[],
  redirectTo: string = "/auth/login"
): Promise<UserProfile> {
  const profile = await getCurrentUserProfile()

  if (!profile) {
    redirect(redirectTo)
  }

  if (!isActive(profile.status)) {
    redirect("/auth/login?error=account_inactive")
  }

  if (!hasRole(profile.role, requiredRoles)) {
    redirect("/auth/login?error=insufficient_permissions")
  }

  return profile
}

/**
 * Require admin - throws error or redirects if user is not admin
 */
export async function requireAdmin(
  redirectTo: string = "/auth/login"
): Promise<UserProfile> {
  return requireRole(["admin"], redirectTo)
}

/**
 * Get role-based dashboard URL
 */
export function getDashboardUrl(role: UserRole | null): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "korea_agent":
      return "/admin/cases"
    case "translator":
      return "/admin/documents"
    case "foreign_lawyer":
      return "/admin/documents"
    case "family_viewer":
      return "/admin/documents"
    default:
      return "/auth/login"
  }
}

/**
 * Check if user can access a resource based on role
 */
export function canAccessResource(
  userRole: UserRole | null,
  resourceRole: UserRole | UserRole[]
): boolean {
  if (!userRole) {
    return false
  }

  // Admin can access everything
  if (userRole === "admin") {
    return true
  }

  const allowedRoles = Array.isArray(resourceRole) ? resourceRole : [resourceRole]
  return allowedRoles.includes(userRole)
}
