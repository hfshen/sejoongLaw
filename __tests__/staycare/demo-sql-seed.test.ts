import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const sql = readFileSync(
  resolve(process.cwd(), "supabase/sql/staycare_demo_seed.sql"),
  "utf8"
)

describe("StayCare demo SQL seed", () => {
  it("never mutates Supabase-managed Auth tables directly", () => {
    expect(sql).not.toMatch(/insert\s+into\s+(?:public\.)?auth\.users/i)
    expect(sql).not.toMatch(/update\s+(?:public\.)?auth\.users/i)
    expect(sql).not.toMatch(/delete\s+from\s+(?:public\.)?auth\.users/i)
    expect(sql).not.toMatch(/insert\s+into\s+(?:public\.)?auth\.identities/i)
  })

  it("resets only the isolated demo tenant", () => {
    expect(sql).toContain("WHERE slug = 'sejoong-staycare-demo'")
    expect(sql).not.toMatch(/delete\s+from\s+public\.staycare_tenants\s*;/i)
    expect(sql).toContain("It never deletes the production `sejoong-staycare` tenant")
  })

  it("requires every role-based demo account before writing data", () => {
    const emails = [
      "demo.worker@sejoonglaw.kr",
      "demo.admin@sejoonglaw.kr",
      "demo.lawyer@sejoonglaw.kr",
      "demo.immigration@sejoonglaw.kr",
      "demo.operator.manager@sejoonglaw.kr",
      "demo.operator.agent@sejoonglaw.kr",
      "demo.employer@sejoonglaw.kr",
      "demo.institution@sejoonglaw.kr",
      "demo.provider@sejoonglaw.kr",
      "demo.auditor@sejoonglaw.kr",
    ]

    for (const email of emails) {
      expect(sql).toContain(email)
    }
    expect(sql).toContain("Missing Supabase Auth users")
  })

  it("seeds the three expected surfaces and lifecycle records", () => {
    expect(sql).toContain("'worker'")
    expect(sql).toContain("'sejoong_admin'")
    expect(sql).toContain("'employer_admin'")
    expect(sql).toContain("'institution_admin'")
    expect(sql).toContain("'provider_agent'")
    expect(sql).toContain("'telecom-esim'")
    expect(sql).toContain("'lk-remittance'")
    expect(sql).toContain("'stay-administration'")
    expect(sql).toContain("'return-support'")
  })

  it("contains a transaction and final verification query", () => {
    expect(sql).toMatch(/^--[\s\S]*\nBEGIN;/)
    expect(sql).toContain("COMMIT;")
    expect(sql).toContain("Expected: 1 tenant, 10 memberships, 3 workers, 4 applications, 5 services")
  })
})
