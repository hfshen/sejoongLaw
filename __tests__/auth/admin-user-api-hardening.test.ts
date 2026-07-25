import fs from "fs"
import path from "path"

function source(relativePath: string) {
  return fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")
}

const userApiFiles = [
  "app/api/admin/users/route.ts",
  "app/api/admin/users/[id]/route.ts",
  "app/api/admin/users/invite/route.ts",
]

describe("admin user API hardening", () => {
  test.each(userApiFiles)("%s requires the platform admin role", (file) => {
    const code = source(file)
    expect(code).toContain('getAuthenticatedBackofficeProfile(["admin"])')
    expect(code).not.toContain("isAdminAuthenticated()")
  })

  test("all user mutations validate request origin", () => {
    for (const file of userApiFiles) {
      const code = source(file)
      expect(code).toContain("requireTrustedOrigin(request)")
    }
  })

  test("role and status changes protect the final active administrator", () => {
    const collectionRoute = source("app/api/admin/users/route.ts")
    const userRoute = source("app/api/admin/users/[id]/route.ts")

    expect(collectionRoute).toContain("activeAdminCount")
    expect(collectionRoute).toContain("현재 로그인한 관리자 자신의")
    expect(userRoute).toContain("activeAdminCount")
    expect(userRoute).toContain("현재 로그인한 관리자 자신의")
  })

  test("invitation creation avoids unsupported auth lookup and rolls back failures", () => {
    const inviteRoute = source("app/api/admin/users/invite/route.ts")

    expect(inviteRoute).not.toContain("getUserByEmail")
    expect(inviteRoute).toContain("rollbackInvitation")
    expect(inviteRoute).toContain("deleteUser")
  })
})
