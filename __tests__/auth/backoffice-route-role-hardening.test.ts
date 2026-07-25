import fs from "fs"
import path from "path"

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

const memberMutationRoutes = [
  "app/api/members/route.ts",
  "app/api/members/[id]/route.ts",
  "app/api/members/upload-image/route.ts",
]

const caseRoutes = [
  "app/api/cases/route.ts",
  "app/api/cases/[id]/route.ts",
  "app/api/cases/[id]/documents/route.ts",
  "app/api/cases/[id]/audit/route.ts",
  "app/api/cases/[id]/download-zip/route.ts",
]

describe("backoffice member and case authorization", () => {
  test.each(memberMutationRoutes)("%s uses an explicit admin profile guard", (file) => {
    const code = source(file)
    expect(code).toContain('getAuthenticatedBackofficeProfile(["admin"])')
    expect(code).not.toContain("isAdminAuthenticated()")
  })

  test("member mutations validate trusted origins and image bytes", () => {
    for (const file of memberMutationRoutes) {
      expect(source(file)).toContain("requireTrustedOrigin(request)")
    }

    const upload = source("app/api/members/upload-image/route.ts")
    expect(upload).toContain("detectImageFormat")
    expect(upload).toContain("randomUUID")
    expect(upload).not.toContain("file.name.replace")
  })

  test("member and case pages have server-side role boundaries", () => {
    expect(source("app/admin/members/layout.tsx")).toContain("requireAdmin")
    const casesLayout = source("app/admin/cases/layout.tsx")
    expect(casesLayout).toContain("requireRole")
    expect(casesLayout).toContain('"korea_agent"')
  })

  test.each(caseRoutes)("%s no longer relies on the broad legacy guard", (file) => {
    const code = source(file)
    expect(code).not.toContain("isAdminAuthenticated()")
  })

  test("case collection validates search and compensates failed document creation", () => {
    const route = source("app/api/cases/route.ts")
    expect(route).toContain("normalizeCaseSearch")
    expect(route).toContain("CASE_SORT_COLUMNS")
    expect(route).toContain("createdCaseId")
    expect(route).toContain('from("cases").delete()')
    expect(route).not.toContain("admin_session")
  })

  test("case updates compensate linked document failures", () => {
    const route = source("app/api/cases/[id]/route.ts")
    expect(route).toContain("previousCase")
    expect(route).toContain("linkedDocuments")
    expect(route).toContain("Rolled back case")
    expect(route).toContain('getAuthenticatedBackofficeProfile(["admin"])')
  })

  test("case document generation validates allowed types and duplicates", () => {
    const route = source("app/api/cases/[id]/documents/route.ts")
    expect(route).toContain("DOCUMENT_TYPES")
    expect(route).toContain("duplicateTypes")
    expect(route).toContain("requireTrustedOrigin(request)")
  })
})
