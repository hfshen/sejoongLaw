export const stayCareApplicationStatuses = [
  "draft",
  "submitted",
  "reviewing",
  "waiting_worker",
  "waiting_authority",
  "waiting_provider",
  "approved",
  "fulfilled",
  "rejected",
  "cancelled",
] as const

export type StayCareApplicationStatus =
  (typeof stayCareApplicationStatuses)[number]

const staffTransitions: Record<StayCareApplicationStatus, StayCareApplicationStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: [
    "reviewing",
    "waiting_worker",
    "waiting_authority",
    "waiting_provider",
    "approved",
    "rejected",
    "cancelled",
  ],
  reviewing: [
    "waiting_worker",
    "waiting_authority",
    "waiting_provider",
    "approved",
    "rejected",
    "cancelled",
  ],
  waiting_worker: ["reviewing", "waiting_authority", "waiting_provider", "approved", "rejected", "cancelled"],
  waiting_authority: ["reviewing", "waiting_worker", "waiting_provider", "approved", "rejected", "cancelled"],
  waiting_provider: ["reviewing", "waiting_worker", "approved", "fulfilled", "rejected", "cancelled"],
  approved: ["waiting_provider", "fulfilled", "cancelled"],
  fulfilled: [],
  rejected: [],
  cancelled: [],
}

const providerTransitions: Record<StayCareApplicationStatus, StayCareApplicationStatus[]> = {
  draft: [],
  submitted: ["waiting_worker", "approved", "fulfilled", "rejected"],
  reviewing: ["waiting_worker", "approved", "fulfilled", "rejected"],
  waiting_worker: ["approved", "fulfilled", "rejected"],
  waiting_authority: [],
  waiting_provider: ["waiting_worker", "approved", "fulfilled", "rejected"],
  approved: ["fulfilled", "rejected"],
  fulfilled: [],
  rejected: [],
  cancelled: [],
}

export function isStayCareApplicationStatus(
  value: unknown
): value is StayCareApplicationStatus {
  return (
    typeof value === "string" &&
    stayCareApplicationStatuses.includes(value as StayCareApplicationStatus)
  )
}

export function canTransitionApplication(
  actor: "staff" | "provider",
  current: StayCareApplicationStatus,
  next: StayCareApplicationStatus
) {
  if (current === next) return true
  const transitions = actor === "provider" ? providerTransitions : staffTransitions
  return transitions[current].includes(next)
}

export function transitionErrorMessage(
  current: StayCareApplicationStatus,
  next: StayCareApplicationStatus
) {
  if (["fulfilled", "rejected", "cancelled"].includes(current)) {
    return `Application is terminal in ${current} status and cannot move to ${next}`
  }
  return `Application cannot move directly from ${current} to ${next}`
}
