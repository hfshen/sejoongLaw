import {
  getPhaseSteps,
  journeyPhases,
  journeySteps,
  oneStopServices,
  t,
} from "@/lib/staycare/lifecycle-model"
import { integrationDescriptors } from "@/lib/staycare/integrations"

describe("StayCare Sri Lanka-to-Korea lifecycle", () => {
  it("covers preparation through return in eight ordered phases", () => {
    expect(journeyPhases.map((phase) => phase.id)).toEqual([
      "prepare",
      "official",
      "preDeparture",
      "arrival",
      "settlement",
      "living",
      "renewal",
      "return",
    ])
    expect(journeyPhases.map((phase) => phase.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it("provides Korean, English and Sinhala for every phase and step", () => {
    for (const phase of journeyPhases) {
      expect(t(phase.title, "ko")).toBeTruthy()
      expect(t(phase.title, "en")).toBeTruthy()
      expect(t(phase.title, "si")).toBeTruthy()
    }

    for (const step of journeySteps) {
      expect(t(step.title, "ko")).toBeTruthy()
      expect(t(step.title, "en")).toBeTruthy()
      expect(t(step.title, "si")).toBeTruthy()
    }
  })

  it("separates official government processes from Sejoong one-stop services", () => {
    const officialSteps = journeySteps.filter((step) => step.official)
    const privateSteps = journeySteps.filter((step) => !step.official)

    expect(officialSteps.length).toBeGreaterThan(0)
    expect(privateSteps.length).toBeGreaterThan(0)
    expect(officialSteps.some((step) => step.id === "eps-topik")).toBe(true)
    expect(privateSteps.some((step) => step.id === "sim-preorder")).toBe(true)
  })

  it("includes telecom, remittance, immigration, AI and return-home services", () => {
    const categories = new Set(oneStopServices.map((service) => service.category))

    expect(categories.has("telecom")).toBe(true)
    expect(categories.has("remittance")).toBe(true)
    expect(categories.has("immigration")).toBe(true)
    expect(categories.has("translation")).toBe(true)
    expect(categories.has("return")).toBe(true)
  })

  it("does not model StayCare as the money transmitter", () => {
    const remittance = oneStopServices.find((service) => service.id === "remittance")
    expect(remittance?.ownership).toContain("partner")
    expect(remittance?.legalBoundary?.ko).toContain("직접 보유·환전·송금하지 않습니다")

    const integration = integrationDescriptors.find((item) => item.id === "licensed-remittance")
    expect(integration?.status).toBe("partner_required")
    expect(integration?.requiredContract).toContain("등록 소액해외송금업자")
  })

  it("contains actionable post-visa and return steps", () => {
    expect(getPhaseSteps("preDeparture").map((step) => step.id)).toEqual(
      expect.arrayContaining(["digital-profile", "device-check", "sim-preorder", "arrival-handover"])
    )
    expect(getPhaseSteps("return").map((step) => step.id)).toEqual(
      expect.arrayContaining(["return-plan", "insurance-claims", "service-closure", "final-remittance", "departure-records"])
    )
  })
})
