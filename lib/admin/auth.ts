import {
  getCurrentUserProfile,
  type UserProfile,
  type UserRole,
} from "@/lib/auth/role-guard"

export const BACKOFFICE_ROLES: readonly UserRole[] = [
  "admin",
  "korea_agent",
  "translator",
  "foreign_lawyer",
  "family_viewer",
]

export async function getAuthenticatedBackofficeProfile(
  requiredRoles: readonly UserRole[] = BACKOFFICE_ROLES
): Promise<UserProfile | null> {
  const profile = await getCurrentUserProfile()
  if (!profile || profile.status !== "active") return null
  if (!requiredRoles.includes(profile.role)) return null
  return profile
}

/**
 * Backward-compatible authentication guard for existing admin-area routes.
 * Pass an explicit role list for sensitive endpoints, for example ["admin"].
 */
export async function isAdminAuthenticated(
  requiredRoles: readonly UserRole[] = BACKOFFICE_ROLES
): Promise<boolean> {
  return Boolean(await getAuthenticatedBackofficeProfile(requiredRoles))
}

export async function isPlatformAdminAuthenticated(): Promise<boolean> {
  return isAdminAuthenticated(["admin"])
}
