export type StayCareRole =
  | "sejoong_admin"
  | "sejoong_lawyer"
  | "operator_manager"
  | "operator_agent"
  | "employer_admin"
  | "partner_specialist"
  | "worker"
  | "auditor"

export type WorkerLifecycle =
  | "invited"
  | "onboarding"
  | "active"
  | "paused"
  | "offboarding"
  | "closed"

export type VisaType = "E-9" | "E-7" | "E-10" | "E-7-4"
export type TaskStatus =
  | "queued"
  | "assigned"
  | "in_progress"
  | "waiting_member"
  | "waiting_partner"
  | "review_required"
  | "completed"
  | "cancelled"

export type TicketPriority = "P0" | "P1" | "P2" | "P3"
export type SubscriptionStatus =
  | "trial"
  | "active"
  | "past_due"
  | "grace_period"
  | "suspended"
  | "cancelled"

export interface StayCareWorker {
  id: string
  name: string
  nameEn: string
  nationality: string
  preferredLanguage: string
  visaType: VisaType
  lifecycle: WorkerLifecycle
  employer: string
  worksite: string
  role: string
  arrivalDate: string
  visaExpiresAt: string
  passportExpiresAt: string
  foreignerRegistration: "not_started" | "scheduled" | "submitted" | "issued"
  phoneStatus: "not_started" | "temporary" | "active"
  bankStatus: "not_started" | "prepared" | "active"
  insuranceStatus: "not_started" | "partial" | "complete"
  accommodation: string
  riskScore: number
  riskLabel: "low" | "medium" | "high"
  checklistProgress: number
  subscriptionId: string
  coordinator: string
  nextAction: string
  nextActionDue: string
  tags: string[]
}

export interface StayCareTask {
  id: string
  workerId: string
  title: string
  category:
    | "arrival"
    | "immigration"
    | "telecom"
    | "banking"
    | "insurance"
    | "accommodation"
    | "employment"
    | "legal"
  status: TaskStatus
  dueAt: string
  assignee: string
  organization: string
  evidenceRequired: boolean
  slaHours: number
}

export interface StayCareTicket {
  id: string
  workerId: string
  title: string
  category:
    | "legal"
    | "immigration"
    | "labor"
    | "medical"
    | "accommodation"
    | "communication"
    | "living"
  priority: TicketPriority
  status: "new" | "triaged" | "in_progress" | "waiting" | "resolved"
  openedAt: string
  firstResponseAt?: string
  owner: string
  escalationTarget?: string
  summary: string
}

export interface StayCareSubscription {
  id: string
  workerId: string
  plan: "Basic" | "Care" | "Care Plus" | "Employer Managed"
  billingCycle: "monthly" | "annual"
  payer: "worker" | "employer" | "sponsor"
  amount: number
  status: SubscriptionStatus
  startedAt: string
  renewsAt: string
  includedSupportMinutes: number
  usedSupportMinutes: number
}

export interface StayCarePartner {
  id: string
  name: string
  type:
    | "legal"
    | "immigration"
    | "labor"
    | "translation"
    | "telecom"
    | "medical"
    | "accommodation"
  region: string
  status: "active" | "onboarding" | "paused"
  slaHours: number
  openTasks: number
  rating: number
  contact: string
}

export interface StayCareAuditEvent {
  id: string
  occurredAt: string
  actor: string
  actorRole: StayCareRole
  action: string
  entity: string
  entityId: string
  reason: string
  severity: "info" | "warning" | "critical"
}

export interface StayCareKpi {
  label: string
  value: string
  delta: string
  tone: "neutral" | "positive" | "warning" | "critical"
}

export type StayCareView =
  | "overview"
  | "workers"
  | "onboarding"
  | "tasks"
  | "tickets"
  | "subscriptions"
  | "partners"
  | "audit"
