import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const sql = readFileSync(
  resolve(process.cwd(), "supabase/sql/staycare_demo_seed.sql"),
  "utf8"
)
const executableSql = sql
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .replace(/--.*$/gm, "")

describe("StayCare demo SQL seed", () => {
  it("never mutates Supabase-managed Auth tables directly", () => {
    expect(executableSql).not.toMatch(/insert\s+into\s+(?:public\.)?auth\.users/i)
    expect(executableSql).not.toMatch(/update\s+(?:public\.)?auth\.users/i)
    expect(executableSql).not.toMatch(/delete\s+from\s+(?:public\.)?auth\.users/i)
    expect(executableSql).not.toMatch(/insert\s+into\s+(?:public\.)?auth\.identities/i)
  })

  it("resets only the isolated demo tenant", () => {
    expect(executableSql).toContain("WHERE slug = 'sejoong-staycare-demo'")
    expect(executableSql).not.toMatch(/delete\s+from\s+public\.staycare_tenants\s*;/i)
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
    expect(executableSql).toContain("Missing Supabase Auth users")
  })

  it("seeds the three expected surfaces and lifecycle records", () => {
    expect(executableSql).toContain("'worker'")
    expect(executableSql).toContain("'sejoong_admin'")
    expect(executableSql).toContain("'employer_admin'")
    expect(executableSql).toContain("'institution_admin'")
    expect(executableSql).toContain("'provider_agent'")
    expect(executableSql).toContain("'telecom-esim'")
    expect(executableSql).toContain("'lk-remittance'")
    expect(executableSql).toContain("'stay-administration'")
    expect(executableSql).toContain("'return-support'")
  })

  it("contains a transaction and final verification query", () => {
    expect(sql).toMatch(/^--[\s\S]*\nBEGIN;/)
    expect(executableSql).toContain("COMMIT;")
    expect(sql).toContain("Expected: 1 tenant, 10 memberships, 3 workers, 4 applications, 5 services")
  })
})
