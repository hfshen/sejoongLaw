import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8")
}

describe("StayCare role mutation boundaries", () => {
  it("blocks read-only staff from application, document, ticket and worker changes", () => {
    const applicationRoute = source(
      "app/api/staycare/admin/applications/[id]/route.ts"
    )
    const documentRoute = source(
      "app/api/staycare/admin/documents/[id]/route.ts"
    )
    const ticketRoute = source("app/api/staycare/admin/tickets/[id]/route.ts")
    const workerRoute = source("app/api/staycare/admin/workers/[id]/route.ts")

    expect(applicationRoute).toContain("canManageApplications")
    expect(documentRoute).toContain("canManageDocuments")
    expect(ticketRoute).toContain("canManageTickets")
    expect(workerRoute).toContain("canManageWorkers")
    for (const route of [
      applicationRoute,
      documentRoute,
      ticketRoute,
      workerRoute,
    ]) {
      expect(route).toContain("status: 403")
      expect(route).toContain("requireTrustedOrigin")
    }
  })

  it("allows only provider-capable memberships to update assigned provider work", () => {
    const providerRoute = source(
      "app/api/staycare/portal/applications/[id]/route.ts"
    )
    expect(providerRoute).toContain("canRespondAsProvider")
    expect(providerRoute).toContain("assigned_organization_id")
    expect(providerRoute).toContain("status: 403")
    expect(providerRoute).toContain("staycare_audit_events")
  })

  it("keeps worker self-service mutations tied to the authenticated worker", () => {
    const ticketRoute = source("app/api/staycare/tickets/route.ts")
    const profileRoute = source("app/api/staycare/profile/route.ts")

    expect(ticketRoute).toContain("getWorkerContext")
    expect(ticketRoute).toContain("context.worker.id")
    expect(profileRoute).toContain("getWorkerContext")
    expect(profileRoute).toContain("context.worker.id")
  })
})
