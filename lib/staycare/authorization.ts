import "server-only"
import {
  getStayCareRoleCapabilities,
  isStayCareRole,
  type StayCareRole,
  type StayCareRoleCapabilities,
} from "@/lib/staycare/role-capabilities"

export interface StayCareMembershipLike {
  tenant_id: unknown
  organization_id?: unknown
  role: unknown
}

export type StayCareCapabilityKey = {
  [Key in keyof StayCareRoleCapabilities]: StayCareRoleCapabilities[Key] extends boolean
    ? Key
    : never
}[keyof StayCareRoleCapabilities]

export function tenantIdsForCapability(
  memberships: StayCareMembershipLike[],
  capability: StayCareCapabilityKey
) {
  return Array.from(
    new Set(
      memberships
        .filter(
          (membership) =>
            isStayCareRole(membership.role) &&
            getStayCareRoleCapabilities(membership.role)[capability]
        )
        .map((membership) => String(membership.tenant_id))
    )
  )
}

export function membershipsForRole(
  memberships: StayCareMembershipLike[],
  role: StayCareRole
) {
  return memberships.filter((membership) => membership.role === role)
}

export function actorRoleForTenant(
  memberships: StayCareMembershipLike[],
  tenantId: string,
  capability?: StayCareCapabilityKey
): StayCareRole | "staff" {
  const membership = memberships.find((candidate) => {
    if (String(candidate.tenant_id) !== tenantId || !isStayCareRole(candidate.role)) {
      return false
    }
    return capability
      ? getStayCareRoleCapabilities(candidate.role)[capability]
      : true
  })
  return membership && isStayCareRole(membership.role) ? membership.role : "staff"
}

export function organizationIdsForCapability(
  memberships: StayCareMembershipLike[],
  capability: StayCareCapabilityKey
) {
  return Array.from(
    new Set(
      memberships
        .filter(
          (membership) =>
            isStayCareRole(membership.role) &&
            getStayCareRoleCapabilities(membership.role)[capability]
        )
        .map((membership) => membership.organization_id)
        .filter(Boolean)
        .map(String)
    )
  )
}
