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
      const existingField = fieldMap.get(field.key)
      
      if (existingField) {
        // 이미 존재하는 필드면 usedIn에 추가
        if (!existingField.usedIn.includes(docType)) {
          existingField.usedIn.push(docType)
        }
        // required가 하나라도 true면 required로 설정
        if (field.required) {
          existingField.required = true
        }
      } else {
        // 새로운 필드면 추가
        const unifiedGroup = mapGroupToUnifiedGroup(field.group || "")
        fieldMap.set(field.key, {
          ...field,
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

