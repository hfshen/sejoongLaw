import {
  canTransitionApplication,
  transitionErrorMessage,
} from "@/lib/staycare/application-status"
import {
  actorRoleForTenant,
  organizationIdsForCapability,
  tenantIdsForCapability,
} from "@/lib/staycare/authorization"

const memberships = [
  {
    tenant_id: "tenant-admin",
    organization_id: "org-sejoong",
    role: "sejoong_admin",
  },
  {
    tenant_id: "tenant-audit",
    organization_id: "org-audit",
    role: "auditor",
  },
  {
    tenant_id: "tenant-provider",
    organization_id: "org-provider",
    role: "provider_agent",
  },
]

describe("StayCare commercial authorization", () => {
  it("does not extend an admin capability into an auditor tenant", () => {
    expect(tenantIdsForCapability(memberships, "canManageApplications")).toEqual([
      "tenant-admin",
      "tenant-provider",
    ])
    expect(tenantIdsForCapability(memberships, "canManageWorkers")).toEqual([
      "tenant-admin",
    ])
  })

  it("returns only provider organizations for provider responses", () => {
    expect(
      organizationIdsForCapability(memberships, "canRespondAsProvider")
    ).toEqual(["org-provider"])
  })

  it("records the actor role for the actual target tenant", () => {
    expect(
      actorRoleForTenant(
        memberships,
        "tenant-admin",
        "canManageApplications"
      )
    ).toBe("sejoong_admin")
    expect(
      actorRoleForTenant(
        memberships,
        "tenant-audit",
        "canManageApplications"
      )
    ).toBe("staff")
  })
})

describe("StayCare application lifecycle", () => {
  it("allows controlled staff and provider progress", () => {
    expect(canTransitionApplication("staff", "submitted", "reviewing")).toBe(true)
    expect(
      canTransitionApplication("staff", "waiting_provider", "fulfilled")
    ).toBe(true)
    expect(
      canTransitionApplication("provider", "waiting_provider", "waiting_worker")
    ).toBe(true)
    expect(canTransitionApplication("provider", "approved", "fulfilled")).toBe(true)
  })

  it("prevents arbitrary jumps and terminal-state reopening", () => {
    expect(canTransitionApplication("provider", "submitted", "cancelled")).toBe(false)
    expect(canTransitionApplication("staff", "fulfilled", "reviewing")).toBe(false)
    expect(canTransitionApplication("staff", "rejected", "approved")).toBe(false)
    expect(transitionErrorMessage("fulfilled", "reviewing")).toContain("terminal")
  })

  it("keeps idempotent updates valid", () => {
    expect(canTransitionApplication("staff", "reviewing", "reviewing")).toBe(true)
    expect(canTransitionApplication("provider", "approved", "approved")).toBe(true)
  })
})
