import {
  annualMembership,
  calculateUnitEconomics,
  DEFAULT_ANNUAL_FEE,
  DEFAULT_DIRECT_COST_RATE,
  DEFAULT_MEMBER_COUNT,
  payerLabels,
} from "@/lib/staycare/commercial-model"

describe("StayCare commercial model", () => {
  it("calculates the 200-member annual model", () => {
    const result = calculateUnitEconomics({
      memberCount: DEFAULT_MEMBER_COUNT,
      annualFee: DEFAULT_ANNUAL_FEE,
      directCostRate: DEFAULT_DIRECT_COST_RATE,
    })

    expect(result.annualRevenue).toBe(200_000_000)
    expect(result.annualDirectCost).toBe(50_000_000)
    expect(result.annualOperationsBudget).toBe(150_000_000)
    expect(result.revenuePerMemberPerMonth).toBe(83_333)
    expect(result.operationsBudgetPerMember).toBe(750_000)
  })

  it("clamps direct cost rate to the approved 20-30 percent band", () => {
    const below = calculateUnitEconomics({ memberCount: 200, annualFee: 1_000_000, directCostRate: 0.1 })
    const above = calculateUnitEconomics({ memberCount: 200, annualFee: 1_000_000, directCostRate: 0.5 })

    expect(below.annualDirectCost).toBe(40_000_000)
    expect(above.annualDirectCost).toBe(60_000_000)
  })

  it("supports employer, worker and sponsor payment responsibility", () => {
    expect(Object.keys(payerLabels).sort()).toEqual(["employer", "sponsor", "worker"])
  })

  it("keeps sustainable annual service limits explicit", () => {
    expect(annualMembership.included).toContain("예약형 비대면 상담 연 12회, 회당 최대 30분")
    expect(annualMembership.included).toContain("전화·화상 통역 연 180분")
    expect(annualMembership.included).toContain("계약 사업장 권역 내 현장지원 연 2회, 회당 최대 2시간")
    expect(annualMembership.separatelyQuoted.length).toBeGreaterThan(0)
  })
})
