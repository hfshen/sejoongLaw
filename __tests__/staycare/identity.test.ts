jest.mock("server-only", () => ({}))

import {
  generateInviteCode,
  normalizeContactIdentity,
  normalizeInviteCode,
  normalizeRosterName,
} from "@/lib/staycare/identity"

describe("StayCare Sri Lanka identity helpers", () => {
  test("normalizes printed invite codes", () => {
    expect(normalizeInviteCode("ab12-cd34 ef56")).toBe("AB12CD34EF56")
  })

  test("normalizes passport English names consistently", () => {
    expect(normalizeRosterName("Perera, Nimal A.")).toBe("PERERANIMALA")
  })

  test("normalizes international phone numbers and email", () => {
    expect(normalizeContactIdentity("+94 (77) 123-4567")).toBe("+94771234567")
    expect(normalizeContactIdentity(" USER@Example.COM ")).toBe("user@example.com")
  })

  test("creates human-readable high-entropy invite codes", () => {
    expect(generateInviteCode()).toMatch(/^[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/)
  })
})
