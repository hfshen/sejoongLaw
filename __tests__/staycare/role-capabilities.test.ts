import {
  getStayCareRoleCapabilities,
  getStayCareRoleLabel,
  isStayCareRole,
  stayCareRoles,
} from "@/lib/staycare/role-capabilities"

describe("StayCare role capabilities", () => {
  it("defines all ten product roles", () => {
    expect(stayCareRoles).toHaveLength(10)
    for (const role of stayCareRoles) {
      expect(isStayCareRole(role)).toBe(true)
      expect(getStayCareRoleLabel(role, "ko")).toBeTruthy()
      expect(getStayCareRoleLabel(role, "en")).toBeTruthy()
      expect(getStayCareRoleLabel(role, "si")).toBeTruthy()
    }
  })

  it("keeps auditors strictly read-only", () => {
    const auditor = getStayCareRoleCapabilities("auditor")
    expect(auditor.workspace).toBe("staff")
    expect(auditor.readOnly).toBe(true)
    expect(auditor.canManageApplications).toBe(false)
    expect(auditor.canManageDocuments).toBe(false)
    expect(auditor.canManageTickets).toBe(false)
    expect(auditor.canManageWorkers).toBe(false)
    expect(auditor.canSeeEnvironment).toBe(true)
  })

  it("limits provider agents to assigned provider work", () => {
    const provider = getStayCareRoleCapabilities("provider_agent")
    expect(provider.workspace).toBe("partner")
    expect(provider.canRespondAsProvider).toBe(true)
    expect(provider.canSeePrivateWorkerData).toBe(false)
    expect(provider.canManageWorkers).toBe(false)
    expect(provider.canManageDocuments).toBe(false)
  })

  it("keeps employers and institutions in summary-only partner workspaces", () => {
    const employer = getStayCareRoleCapabilities("employer_admin")
    const institution = getStayCareRoleCapabilities("institution_admin")

    expect(employer.workspace).toBe("partner")
    expect(employer.readOnly).toBe(true)
    expect(employer.canSeeEmployerSummary).toBe(true)
    expect(employer.canSeePrivateWorkerData).toBe(false)

    expect(institution.workspace).toBe("partner")
    expect(institution.readOnly).toBe(true)
    expect(institution.canSeeInstitutionSummary).toBe(true)
    expect(institution.canSeePrivateWorkerData).toBe(false)
  })

  it("separates internal operational focus", () => {
    const admin = getStayCareRoleCapabilities("sejoong_admin")
    const lawyer = getStayCareRoleCapabilities("sejoong_lawyer")
    const immigration = getStayCareRoleCapabilities("immigration_manager")
    const operator = getStayCareRoleCapabilities("operator_agent")

    expect(admin.canSeeEnvironment).toBe(true)
    expect(admin.canManageWorkers).toBe(true)

    expect(lawyer.canSeeLegalQueue).toBe(true)
    expect(lawyer.canManageWorkers).toBe(false)

    expect(immigration.canSeeImmigrationQueue).toBe(true)
    expect(immigration.canManageWorkers).toBe(true)

    expect(operator.canSeeOperationsQueue).toBe(true)
    expect(operator.canSeeLegalQueue).toBe(false)
  })
})
