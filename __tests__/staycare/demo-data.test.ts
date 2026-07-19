import {
  demoSubscriptions,
  demoTasks,
  demoTickets,
  demoWorkers,
} from "@/lib/staycare/demo-data"

describe("StayCare demo data", () => {
  const workerIds = new Set(demoWorkers.map((worker) => worker.id))

  it("uses unique worker identifiers", () => {
    expect(workerIds.size).toBe(demoWorkers.length)
  })

  it("keeps checklist and risk scores within valid ranges", () => {
    demoWorkers.forEach((worker) => {
      expect(worker.checklistProgress).toBeGreaterThanOrEqual(0)
      expect(worker.checklistProgress).toBeLessThanOrEqual(100)
      expect(worker.riskScore).toBeGreaterThanOrEqual(0)
      expect(worker.riskScore).toBeLessThanOrEqual(100)
    })
  })

  it("does not create orphaned tasks, tickets or subscriptions", () => {
    demoTasks.forEach((task) => expect(workerIds.has(task.workerId)).toBe(true))
    demoTickets.forEach((ticket) => expect(workerIds.has(ticket.workerId)).toBe(true))
    demoSubscriptions.forEach((subscription) =>
      expect(workerIds.has(subscription.workerId)).toBe(true)
    )
  })

  it("requires an escalation target for P0 and P1 tickets", () => {
    demoTickets
      .filter((ticket) => ticket.priority === "P0" || ticket.priority === "P1")
      .forEach((ticket) => expect(ticket.escalationTarget).toBeTruthy())
  })

  it("keeps subscription support usage measurable", () => {
    demoSubscriptions.forEach((subscription) => {
      expect(subscription.includedSupportMinutes).toBeGreaterThan(0)
      expect(subscription.usedSupportMinutes).toBeGreaterThanOrEqual(0)
    })
  })
})
