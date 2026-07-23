export const stayCareRoles = [
  "worker",
  "sejoong_admin",
  "sejoong_lawyer",
  "immigration_manager",
  "operator_manager",
  "operator_agent",
  "employer_admin",
  "institution_admin",
  "provider_agent",
  "auditor",
] as const

export type StayCareRole = (typeof stayCareRoles)[number]

export interface StayCareRoleCapabilities {
  workspace: "worker" | "staff" | "partner"
  readOnly: boolean
  canManageApplications: boolean
  canManageDocuments: boolean
  canManageTickets: boolean
  canManageWorkers: boolean
  canSeeEnvironment: boolean
  canSeePrivateWorkerData: boolean
  canSeeLegalQueue: boolean
  canSeeImmigrationQueue: boolean
  canSeeOperationsQueue: boolean
  canRespondAsProvider: boolean
  canSeeEmployerSummary: boolean
  canSeeInstitutionSummary: boolean
}

const capabilities: Record<StayCareRole, StayCareRoleCapabilities> = {
  worker: {
    workspace: "worker",
    readOnly: false,
    canManageApplications: false,
    canManageDocuments: false,
    canManageTickets: false,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: false,
    canSeeOperationsQueue: false,
    canRespondAsProvider: false,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: false,
  },
  sejoong_admin: {
    workspace: "staff",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: true,
    canManageTickets: true,
    canManageWorkers: true,
    canSeeEnvironment: true,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: true,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: true,
    canRespondAsProvider: false,
    canSeeEmployerSummary: true,
    canSeeInstitutionSummary: true,
  },
  sejoong_lawyer: {
    workspace: "staff",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: true,
    canManageTickets: true,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: true,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: false,
    canRespondAsProvider: false,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: false,
  },
  immigration_manager: {
    workspace: "staff",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: true,
    canManageTickets: true,
    canManageWorkers: true,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: true,
    canRespondAsProvider: false,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: false,
  },
  operator_manager: {
    workspace: "staff",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: true,
    canManageTickets: true,
    canManageWorkers: true,
    canSeeEnvironment: true,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: true,
    canRespondAsProvider: false,
    canSeeEmployerSummary: true,
    canSeeInstitutionSummary: true,
  },
  operator_agent: {
    workspace: "staff",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: true,
    canManageTickets: true,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: true,
    canRespondAsProvider: false,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: false,
  },
  employer_admin: {
    workspace: "partner",
    readOnly: true,
    canManageApplications: false,
    canManageDocuments: false,
    canManageTickets: false,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: false,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: false,
    canSeeOperationsQueue: false,
    canRespondAsProvider: false,
    canSeeEmployerSummary: true,
    canSeeInstitutionSummary: false,
  },
  institution_admin: {
    workspace: "partner",
    readOnly: true,
    canManageApplications: false,
    canManageDocuments: false,
    canManageTickets: false,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: false,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: false,
    canSeeOperationsQueue: false,
    canRespondAsProvider: false,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: true,
  },
  provider_agent: {
    workspace: "partner",
    readOnly: false,
    canManageApplications: true,
    canManageDocuments: false,
    canManageTickets: false,
    canManageWorkers: false,
    canSeeEnvironment: false,
    canSeePrivateWorkerData: false,
    canSeeLegalQueue: false,
    canSeeImmigrationQueue: false,
    canSeeOperationsQueue: false,
    canRespondAsProvider: true,
    canSeeEmployerSummary: false,
    canSeeInstitutionSummary: false,
  },
  auditor: {
    workspace: "staff",
    readOnly: true,
    canManageApplications: false,
    canManageDocuments: false,
    canManageTickets: false,
    canManageWorkers: false,
    canSeeEnvironment: true,
    canSeePrivateWorkerData: true,
    canSeeLegalQueue: true,
    canSeeImmigrationQueue: true,
    canSeeOperationsQueue: true,
    canRespondAsProvider: false,
    canSeeEmployerSummary: true,
    canSeeInstitutionSummary: true,
  },
}

export function isStayCareRole(value: unknown): value is StayCareRole {
  return typeof value === "string" && stayCareRoles.includes(value as StayCareRole)
}

export function getStayCareRoleCapabilities(value: unknown): StayCareRoleCapabilities {
  return isStayCareRole(value) ? capabilities[value] : capabilities.worker
}

export function getStayCareRoleLabel(role: StayCareRole, language: "ko" | "en" | "si" = "ko") {
  const labels: Record<StayCareRole, Record<"ko" | "en" | "si", string>> = {
    worker: { ko: "근로자", en: "Worker", si: "සේවකයා" },
    sejoong_admin: { ko: "세중 총괄 관리자", en: "Sejoong administrator", si: "Sejoong පරිපාලක" },
    sejoong_lawyer: { ko: "세중 변호사", en: "Sejoong lawyer", si: "Sejoong නීතිඥ" },
    immigration_manager: { ko: "출입국 업무 관리자", en: "Immigration manager", si: "ආගමන කළමනාකරු" },
    operator_manager: { ko: "운영사 매니저", en: "Operations manager", si: "මෙහෙයුම් කළමනාකරු" },
    operator_agent: { ko: "운영사 담당자", en: "Operations agent", si: "මෙහෙයුම් නිලධාරියා" },
    employer_admin: { ko: "고용주 담당자", en: "Employer administrator", si: "සේවායෝජක පරිපාලක" },
    institution_admin: { ko: "스리랑카 현지기관", en: "Sri Lanka institution", si: "ශ්‍රී ලංකා ආයතනය" },
    provider_agent: { ko: "제휴 서비스사", en: "Service provider", si: "සේවා සපයන්නා" },
    auditor: { ko: "감사·품질관리", en: "Auditor", si: "විගණක" },
  }
  return labels[role][language]
}
