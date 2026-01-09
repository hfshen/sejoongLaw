// Case to Document data mapping utilities

import type { DocumentType } from "./templates"

export interface CaseData {
  // 사망자 정보
  deceased_name?: string
  deceased_birthdate?: string
  deceased_address?: string
  deceased_foreigner_id?: string
  incident_location?: string
  incident_time?: string

  // 유가족 대표 정보 (갑)
  party_a_name?: string
  party_a_birthdate?: string
  party_a_contact?: string
  party_a_relation?: string
  party_a_id_number?: string
  party_a_address?: string
  party_a_nationality?: string

  // 가해자 회사 정보 (을)
  party_b_company_name?: string
  party_b_representative?: string
  party_b_registration?: string
  party_b_contact?: string
  party_b_address?: string

  // 사건 정보
  case_number?: string
  plaintiff?: string
  defendant?: string
}

/**
 * 케이스 정보를 서류 타입별 데이터로 변환
 */
export function mapCaseToDocument(
  caseData: CaseData,
  documentType: DocumentType,
  additionalData: Record<string, any> = {}
): Record<string, any> {
  const baseData: Record<string, any> = {
    ...additionalData,
  }

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = new Date().toISOString().split("T")[0]

  switch (documentType) {
    case "agreement":
      // 합의서: 케이스 정보 직접 매핑
      return {
        ...baseData,
        deceased_name: caseData.deceased_name || "",
        deceased_birthdate: caseData.deceased_birthdate || "",
        deceased_address: caseData.deceased_address || "",
        deceased_foreigner_id: caseData.deceased_foreigner_id || "",
        incident_location: caseData.incident_location || "",
        incident_time: caseData.incident_time || "",
        party_a_nationality: caseData.party_a_nationality || "",
        party_a_name: caseData.party_a_name || "",
        party_a_birthdate: caseData.party_a_birthdate || "",
        party_a_contact: caseData.party_a_contact || "",
        party_a_relation: caseData.party_a_relation || "",
        party_a_id_number: caseData.party_a_id_number || "",
        party_a_address: caseData.party_a_address || "",
        party_b_company_name: caseData.party_b_company_name || "",
        party_b_representative: caseData.party_b_representative || "",
        party_b_registration: caseData.party_b_registration || "",
        party_b_contact: caseData.party_b_contact || "",
        party_b_address: caseData.party_b_address || "",
        agreement_date: baseData.agreement_date || today,
        signature_date: baseData.signature_date || today,
      }

    case "power_of_attorney":
      // 위임장: principal_* → party_a_* 매핑
      return {
        ...baseData,
        principal_name: caseData.party_a_name || "",
        principal_birthdate: caseData.party_a_birthdate || "",
        principal_id_number: caseData.party_a_id_number || "",
        principal_address: caseData.party_a_address || "",
        power_date: baseData.power_date || today,
      }

    case "attorney_appointment":
      // 변호인선임서: appointer_* → party_a_* 매핑
      return {
        ...baseData,
        case_number: caseData.case_number || "",
        appointer_name: caseData.party_a_name || "",
        appointer_id_number: caseData.party_a_id_number || "",
        appointer_relation: caseData.party_a_relation || "",
        appointment_date: baseData.appointment_date || today,
      }

    case "litigation_power":
      // 소송위임장: principal_* → party_a_*, case 정보 매핑
      return {
        ...baseData,
        case_number: caseData.case_number || "",
        plaintiff: caseData.plaintiff || "",
        defendant: caseData.defendant || "",
        principal_name: caseData.party_a_name || "",
        principal_id_number: caseData.party_a_id_number || "",
        power_date: baseData.power_date || today,
      }

    case "insurance_consent":
      // 사망보험금지급동의: insured_* → deceased_* 매핑
      return {
        ...baseData,
        insured_name: caseData.deceased_name || "",
        insured_birthdate: caseData.deceased_birthdate || "",
        insured_address: caseData.deceased_address || "",
        sender_company: caseData.party_b_company_name || "",
        sender_registration: caseData.party_b_registration || "",
        sender_address: caseData.party_b_address || "",
        consent_date: baseData.consent_date || today,
        contract_date_1: baseData.contract_date_1 || today,
        contract_date_2: baseData.contract_date_2 || today,
      }

    default:
      return baseData
  }
}

/**
 * 케이스 정보 업데이트 시 서류 데이터 업데이트
 * 기존 서류 데이터를 유지하면서 케이스에서 매핑되는 필드만 업데이트
 */
export function updateDocumentFromCase(
  existingDocumentData: Record<string, any>,
  caseData: CaseData,
  documentType: DocumentType
): Record<string, any> {
  const mappedData = mapCaseToDocument(caseData, documentType)
  
  // 기존 데이터와 매핑된 데이터를 병합
  // 매핑된 필드는 케이스 데이터로 덮어쓰고, 나머지는 기존 데이터 유지
  return {
    ...existingDocumentData,
    ...mappedData,
  }
}

