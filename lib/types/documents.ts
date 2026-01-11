// Document data type definitions

import type { DocumentType } from "@/lib/documents/templates"

// 합의서 (Agreement)
export interface AgreementData {
  // 사망자 정보
  deceased_name?: string
  deceased_foreigner_id?: string
  deceased_birthdate?: string
  deceased_address?: string
  incident_location?: string
  incident_time?: string
  
  // 유가족 대표 정보 (갑)
  party_a_nationality?: string
  party_a_name?: string
  party_a_birthdate?: string
  party_a_contact?: string
  party_a_relation?: string
  party_a_relation_other?: string
  party_a_id_number?: string
  party_a_address?: string

  // 유가족 추가 1명
  party_a_2_name?: string
  party_a_2_relation?: string
  party_a_2_relation_other?: string
  party_a_2_id_number?: string
  party_a_2_address?: string
  
  // 가해자 회사 정보 (을)
  party_b_company_name?: string
  party_b_representative?: string
  party_b_registration?: string
  party_b_contact?: string
  party_b_address?: string
  
  // 일반 정보
  agreement_date?: string
  signature_date?: string
}

// 위임장 (Power of Attorney)
export interface PowerOfAttorneyData {
  // 위임인 정보
  principal_name?: string
  principal_birthdate?: string
  principal_passport?: string
  principal_id_number?: string
  principal_address?: string
  
  // 위임업무 (체크박스 배열)
  authorized_tasks?: string[] | Record<string, boolean>
  
  // 일반 정보
  power_date?: string
}

// 변호인선임서 (Attorney Appointment)
export interface AttorneyAppointmentData {
  // 사건 정보
  case_number?: string
  victim?: string
  
  // 선임인 정보
  appointer_name?: string
  appointer_id_number?: string
  appointer_relation?: string
  
  // 변호인 정보
  attorney_name?: string
  attorney_office?: string
  attorney_address?: string
  attorney_phone?: string
  attorney_fax?: string
  court?: string
  
  // 일반 정보
  appointment_date?: string
}

// 소송위임장 (Litigation Power)
export interface LitigationPowerData {
  // 사건 정보
  case_number?: string
  plaintiff?: string
  defendant?: string
  
  // 특별수권사항
  special_authority?: {
    withdrawal_of_suit?: "O" | "X"
    withdrawal_of_appeal?: "O" | "X"
    waiver_of_claim?: "O" | "X"
    admission_of_claim?: "O" | "X"
    withdrawal_from_suit?: "O" | "X"
  }
  
  // 위임인 정보
  principal_name?: string
  principal_id_number?: string
  
  // 변호인 정보
  court?: string
  
  // 일반 정보
  power_date?: string
}

// 사망보험금지급동의 (Insurance Consent)
export interface InsuranceConsentData {
  // 수신/발신 정보
  recipient_company?: string
  sender_company?: string
  sender_registration?: string
  sender_address?: string
  
  // 피보험자 정보
  insured_name?: string
  insured_registration?: string
  insured_birthdate?: string
  insured_gender?: "남" | "여"
  insured_address?: string
  
  // 보험계약 정보
  insurance_product?: string
  policyholder?: string
  policyholder_registration?: string
  contract_date_1?: string
  contract_date_2?: string
  
  // 수익자 정보
  beneficiary_name?: string
  beneficiary_registration?: string
  
  // 법정상속인 정보
  heir_1_name?: string
  heir_1_id?: string
  heir_1_relation?: string
  heir_2_name?: string
  heir_2_id?: string
  heir_2_relation?: string
  
  // 일반 정보
  consent_date?: string
}

// 문서 데이터 유니온 타입 (인덱스 시그니처 추가)
export type DocumentData = (
  | AgreementData
  | PowerOfAttorneyData
  | AttorneyAppointmentData
  | LitigationPowerData
  | InsuranceConsentData
) & Record<string, any>

// 문서 타입별 데이터 매핑
export type DocumentDataMap = {
  agreement: AgreementData
  power_of_attorney: PowerOfAttorneyData
  attorney_appointment: AttorneyAppointmentData
  litigation_power: LitigationPowerData
  insurance_consent: InsuranceConsentData
  // OLD-case 문서들은 동일한 데이터 타입 사용
  agreement_old: AgreementData
  power_of_attorney_old: PowerOfAttorneyData
  attorney_appointment_old: AttorneyAppointmentData
  litigation_power_old: LitigationPowerData
  insurance_consent_old: InsuranceConsentData
}

// 타입 가드 함수들
export function isAgreementData(data: DocumentData): data is AgreementData {
  return "deceased_name" in data || "party_a_name" in data || "party_b_company_name" in data
}

export function isPowerOfAttorneyData(data: DocumentData): data is PowerOfAttorneyData {
  return "principal_name" in data && "authorized_tasks" in data
}

export function isAttorneyAppointmentData(data: DocumentData): data is AttorneyAppointmentData {
  return "appointer_name" in data && "attorney_name" in data
}

export function isLitigationPowerData(data: DocumentData): data is LitigationPowerData {
  return "plaintiff" in data || "defendant" in data || "special_authority" in data
}

export function isInsuranceConsentData(data: DocumentData): data is InsuranceConsentData {
  return "insured_name" in data || "recipient_company" in data || "heir_1_name" in data
}

// 문서 타입에 따른 데이터 추출 헬퍼
export function getDocumentData<T extends DocumentType>(
  documentType: T,
  data: DocumentData
): DocumentDataMap[T] {
  return data as DocumentDataMap[T]
}

