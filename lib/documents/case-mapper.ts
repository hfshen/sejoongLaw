// Case to Document data mapping utilities

import type { DocumentType } from "./templates"

export interface CaseData {
  // 사망자 정보
  deceased_name?: string
  deceased_birthdate?: string
  deceased_address?: string
  deceased_foreigner_id?: string
  deceased_gender?: string
  incident_location?: string
  incident_time?: string

  // 유가족 대표 정보 (갑)
  party_a_name?: string
  party_a_birthdate?: string
  party_a_contact?: string
  party_a_relation?: string
  party_a_relation_other?: string
  party_a_id_number?: string
  party_a_address?: string
  party_a_nationality?: string
  party_a_passport?: string

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

  // 사건 정보
  case_number?: string
  plaintiff?: string
  defendant?: string
  victim?: string
  court?: string
  
  // 보험 정보
  insurance_product?: string
  policyholder?: string
  recipient_company?: string
  
  // 법정상속인 정보
  heir_1_name?: string
  heir_1_id?: string
  heir_2_name?: string
  heir_2_id?: string
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
    case "agreement_old":
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
        party_a_relation_other: caseData.party_a_relation_other || "",
        party_a_id_number: caseData.party_a_id_number || "",
        party_a_address: caseData.party_a_address || "",
        party_a_2_name: caseData.party_a_2_name || "",
        party_a_2_relation: caseData.party_a_2_relation || "",
        party_a_2_relation_other: caseData.party_a_2_relation_other || "",
        party_a_2_id_number: caseData.party_a_2_id_number || "",
        party_a_2_address: caseData.party_a_2_address || "",
        party_b_company_name: caseData.party_b_company_name || "",
        party_b_representative: caseData.party_b_representative || "",
        party_b_registration: caseData.party_b_registration || "",
        party_b_contact: caseData.party_b_contact || "",
        party_b_address: caseData.party_b_address || "",
        agreement_date: baseData.agreement_date || today,
        signature_date: baseData.signature_date || today,
      }

    case "power_of_attorney":
    case "power_of_attorney_old":
      // 위임장: principal_* → party_a_* 매핑
      return {
        ...baseData,
        principal_name: caseData.party_a_name || "",
        principal_birthdate: caseData.party_a_birthdate || "",
        principal_passport: caseData.party_a_passport || "",
        principal_id_number: caseData.party_a_id_number || "",
        principal_address: caseData.party_a_address || "",
        power_date: baseData.power_date || today,
      }

    case "attorney_appointment":
    case "attorney_appointment_old":
      // 변호인선임서: appointer_* → party_a_* 매핑
      return {
        ...baseData,
        case_number: caseData.case_number || "",
        victim: caseData.victim || caseData.deceased_name || "",
        appointer_name: caseData.party_a_name || "",
        appointer_id_number: caseData.party_a_id_number || "",
        appointer_relation:
          (caseData.party_a_relation || "") === "기타"
            ? (caseData.party_a_relation_other || "")
            : (caseData.party_a_relation || ""),
        appointer_address: caseData.party_a_address || "",
        court: caseData.court || "",
        appointment_date: baseData.appointment_date || today,
      }

    case "litigation_power":
    case "litigation_power_old":
      // 소송위임장: principal_* → party_a_*, case 정보 매핑
      return {
        ...baseData,
        case_number: caseData.case_number || "",
        plaintiff: caseData.plaintiff || "",
        defendant: caseData.defendant || "",
        principal_name: caseData.party_a_name || "",
        principal_id_number: caseData.party_a_id_number || "",
        court: caseData.court || "",
        power_date: baseData.power_date || today,
      }

    case "insurance_consent":
    case "insurance_consent_old":
      // 사망보험금지급동의: insured_* → deceased_* 매핑, heir_* → party_a_* 매핑
      return {
        ...baseData,
        recipient_company: caseData.recipient_company || "삼성화재해상보험주식회사",
        sender_company: caseData.party_b_company_name || "",
        sender_registration: caseData.party_b_registration || "",
        sender_address: caseData.party_b_address || "",
        insured_name: caseData.deceased_name || "",
        insured_registration: caseData.deceased_foreigner_id || "",
        insured_birthdate: caseData.deceased_birthdate || "",
        insured_gender: caseData.deceased_gender || "",
        insured_address: caseData.deceased_address || "",
        insurance_product: caseData.insurance_product || "",
        policyholder: caseData.policyholder || "",
        heir_1_name: caseData.heir_1_name || caseData.party_a_name || "",
        heir_1_id: caseData.heir_1_id || caseData.party_a_id_number || "",
        heir_2_name: caseData.heir_2_name || caseData.party_a_2_name || "",
        heir_2_id: caseData.heir_2_id || caseData.party_a_2_id_number || "",
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

