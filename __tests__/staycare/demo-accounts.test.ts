import {
  getStayCareDemoAccount,
  getStayCareDemoTargetPath,
  stayCareDemoAccounts,
  stayCareDemoPassword,
  stayCareDemoTenantSlug,
} from "@/lib/staycare/demo-accounts"

describe("StayCare demo accounts", () => {
  it("defines one isolated account for every supported demo role", () => {
    expect(stayCareDemoAccounts).toHaveLength(10)
    expect(new Set(stayCareDemoAccounts.map((account) => account.email)).size).toBe(10)
    expect(new Set(stayCareDemoAccounts.map((account) => account.role)).size).toBe(10)
    expect(stayCareDemoTenantSlug).toBe("sejoong-staycare-demo")
    expect(stayCareDemoTenantSlug).not.toBe("sejoong-staycare")
  })

  it("uses a visible but non-trivial shared demo password", () => {
    expect(stayCareDemoPassword.length).toBeGreaterThanOrEqual(16)
    expect(stayCareDemoPassword).toMatch(/[A-Z]/)
    expect(stayCareDemoPassword).toMatch(/[a-z]/)
    expect(stayCareDemoPassword).toMatch(/[0-9]/)
    expect(stayCareDemoPassword).toMatch(/[^A-Za-z0-9]/)
  })

  it("routes worker, internal staff and external organizations to separate surfaces", () => {
    const worker = getStayCareDemoAccount("worker")
    const admin = getStayCareDemoAccount("sejoong-admin")
    const employer = getStayCareDemoAccount("employer")

    expect(worker?.target).toBe("app")
    expect(admin?.target).toBe("admin")
    expect(employer?.target).toBe("portal")
    expect(getStayCareDemoTargetPath(worker!, "ko", "si")).toBe("/ko/staycare/app?lang=si")
  })

  it("provides Korean, English and Sinhala labels for every account", () => {
    for (const account of stayCareDemoAccounts) {
      expect(account.label.ko).toBeTruthy()
      expect(account.label.en).toBeTruthy()
      expect(account.label.si).toBeTruthy()
      expect(account.description.ko).toBeTruthy()
      expect(account.description.en).toBeTruthy()
      expect(account.description.si).toBeTruthy()
    }
  })
})
