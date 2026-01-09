// Admin 관련 타입 정의

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

export interface Case {
  id: string
  case_number: string | null
  case_name: string
  case_data: CaseData
  created_at: string
  updated_at: string
}

export interface CaseFormData {
  case_number?: string
  case_name: string
  // 사망자 정보
  deceased_name?: string
  deceased_birthdate?: string
  deceased_address?: string
  deceased_foreigner_id?: string
  incident_location?: string
  incident_time?: string
  // 유가족 대표 정보
  party_a_nationality?: string
  party_a_name?: string
  party_a_birthdate?: string
  party_a_contact?: string
  party_a_relation?: string
  party_a_id_number?: string
  party_a_address?: string
  // 가해자 회사 정보
  party_b_company_name?: string
  party_b_representative?: string
  party_b_registration?: string
  party_b_contact?: string
  party_b_address?: string
  // 사건 정보
  plaintiff?: string
  defendant?: string
}

export interface Document {
  id: string
  document_type: string
  name: string
  date: string
  locale: string
  data: Record<string, any>
  case_id: string | null
  is_case_linked: boolean
  created_at: string
  updated_at: string
}

export interface DocumentFormData {
  name: string
  date: string
  [key: string]: any
}

