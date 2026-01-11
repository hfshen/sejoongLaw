// Field collector for unified document form
// Collects and merges fields from multiple document types

import type { DocumentType, FieldDefinition } from "./templates"
import { getTemplate } from "./templates"

export interface UnifiedField extends FieldDefinition {
  // 이 필드가 어떤 서류 타입들에서 사용되는지
  usedIn: DocumentType[]
  // 필드 그룹 (사망자, 유가족 대표, 가해자 회사, 사건 정보 등)
  unifiedGroup?: string
}

const KEY_ALIASES: Record<string, string> = {
  // 유가족(갑) = 위임인/선임인/원고(대리인) 등 동일 의미
  principal_name: "party_a_name",
  principal_birthdate: "party_a_birthdate",
  principal_passport: "party_a_passport",
  principal_id_number: "party_a_id_number",
  principal_address: "party_a_address",

  appointer_name: "party_a_name",
  appointer_id_number: "party_a_id_number",
  appointer_relation: "party_a_relation",

  // 가해자(을) = 보험 동의서 발신 정보(sender_*)
  sender_company: "party_b_company_name",
  sender_registration: "party_b_registration",
  sender_address: "party_b_address",
}

function normalizeFieldKey(key: string) {
  return KEY_ALIASES[key] || key
}

function mergeFieldDefinition(existing: UnifiedField, next: FieldDefinition) {
  // required가 하나라도 true면 required
  if (next.required) existing.required = true

  // textarea가 하나라도 있으면 textarea로 승격(주소 같은 필드)
  if (existing.type !== next.type) {
    if (existing.type === "textarea" || next.type === "textarea") {
      existing.type = "textarea"
    }
  }

  // options는 더 풍부한 쪽을 우선(없으면 채움)
  if ((!existing.options || existing.options.length === 0) && next.options && next.options.length > 0) {
    existing.options = next.options
  }
}

/**
 * 선택한 서류 타입들에서 필요한 모든 필드를 수집하고 중복 제거
 */
export function collectFieldsFromDocumentTypes(
  documentTypes: DocumentType[]
): UnifiedField[] {
  if (documentTypes.length === 0) {
    return []
  }

  // 필드 key를 기준으로 맵 생성 (중복 제거)
  const fieldMap = new Map<string, UnifiedField>()

  // 각 서류 타입별로 필드 수집
  documentTypes.forEach((docType) => {
    const template = getTemplate(docType)
    
    template.fields.forEach((field) => {
      const normalizedKey = normalizeFieldKey(field.key)
      const existingField = fieldMap.get(normalizedKey)
      
      if (existingField) {
        // 이미 존재하는 필드면 usedIn에 추가
        if (!existingField.usedIn.includes(docType)) {
          existingField.usedIn.push(docType)
        }
        mergeFieldDefinition(existingField, field)
      } else {
        // 새로운 필드면 추가
        const unifiedGroup = mapGroupToUnifiedGroup(field.group || "")
        fieldMap.set(normalizedKey, {
          ...field,
          key: normalizedKey,
          usedIn: [docType],
          unifiedGroup,
        })
      }
    })
  })

  // 배열로 변환하고 정렬
  const fields = Array.from(fieldMap.values())
  
  // 정렬: required 필드 우선, 그 다음 그룹별, 그 다음 key 순
  fields.sort((a, b) => {
    // required 필드 우선
    if (a.required && !b.required) return -1
    if (!a.required && b.required) return 1
    
    // 그룹별 정렬
    const groupOrder = getGroupOrder(a.unifiedGroup || "")
    const groupOrderB = getGroupOrder(b.unifiedGroup || "")
    if (groupOrder !== groupOrderB) {
      return groupOrder - groupOrderB
    }
    
    // 같은 그룹 내에서는 key 순
    return a.key.localeCompare(b.key)
  })

  return fields
}

/**
 * 필드 그룹을 통합 그룹으로 매핑
 */
function mapGroupToUnifiedGroup(group: string): string {
  // 사망자 관련
  if (group === "deceased" || group === "insured") {
    return "deceased"
  }
  
  // 유가족 대표 관련
  if (group === "party_a" || group === "principal" || group === "appointer") {
    return "party_a"
  }
  
  // 가해자 회사 관련
  if (group === "party_b" || group === "sender" || group === "recipient") {
    return "party_b"
  }
  
  // 사건 정보
  if (group === "case") {
    return "case"
  }
  
  // 변호인 정보
  if (group === "attorney") {
    return "attorney"
  }
  
  // 복 대리인
  if (group === "sub_attorney") {
    return "sub_attorney"
  }
  
  // 특수 권한
  if (group === "special") {
    return "special"
  }
  
  // 보험 관련
  if (group === "insurance" || group === "beneficiary" || group === "heirs") {
    return "insurance"
  }
  
  // 위임 업무
  if (group === "tasks") {
    return "tasks"
  }
  
  // 일반 (날짜 등)
  return "general"
}

/**
 * 그룹별 정렬 순서
 */
function getGroupOrder(group: string): number {
  const order: Record<string, number> = {
    deceased: 1,
    party_a: 2,
    party_b: 3,
    case: 4,
    attorney: 5,
    sub_attorney: 6,
    special: 7,
    insurance: 8,
    tasks: 9,
    general: 10,
  }
  
  return order[group] || 99
}

/**
 * 통합 필드들을 그룹별로 분류
 */
export function groupFieldsByUnifiedGroup(
  fields: UnifiedField[]
): Record<string, UnifiedField[]> {
  const grouped: Record<string, UnifiedField[]> = {}
  
  fields.forEach((field) => {
    const group = field.unifiedGroup || "general"
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(field)
  })
  
  return grouped
}

/**
 * 그룹 이름을 한국어로 변환
 */
export function getGroupLabel(group: string): string {
  const labels: Record<string, string> = {
    deceased: "사망자 정보",
    party_a: "유가족 대표 정보 (갑)",
    party_b: "가해자 회사 정보 (을)",
    case: "사건 정보",
    attorney: "변호인 정보",
    sub_attorney: "복 대리인 정보",
    special: "특수 권한",
    insurance: "보험 정보",
    tasks: "위임 업무",
    general: "일반 정보",
  }
  
  return labels[group] || group
}

