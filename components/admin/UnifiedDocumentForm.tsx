"use client"

import { useForm } from "react-hook-form"
import { useEffect, useMemo, useCallback, useRef, useState } from "react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { CourtAutocomplete } from "@/components/admin/CourtAutocomplete"
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import {
  collectFieldsFromDocumentTypes,
  groupFieldsByUnifiedGroup,
  getGroupLabel,
  type UnifiedField,
} from "@/lib/documents/field-collector"
import type { CaseFormData } from "@/lib/types/admin"

// CaseFormData를 확장하여 동적 필드 포함
type UnifiedFormData = CaseFormData & Record<string, any>

interface UnifiedDocumentFormProps {
  documentTypes: DocumentType[]
  onSubmit: (data: Partial<UnifiedFormData>) => void | Promise<void>
  onCancel?: () => void
  isSubmitting?: boolean
  initialData?: Partial<UnifiedFormData>
}

export default function UnifiedDocumentForm({
  documentTypes,
  onSubmit,
  onCancel,
  isSubmitting = false,
  initialData = {},
}: UnifiedDocumentFormProps) {
  // 선택한 서류 타입들에서 필요한 모든 필드 수집
  const fields = useMemo(
    () => collectFieldsFromDocumentTypes(documentTypes),
    [documentTypes]
  )

  // 필드를 그룹별로 분류
  const groupedFields = useMemo(
    () => groupFieldsByUnifiedGroup(fields),
    [fields]
  )

  // 체크박스 상태 관리
  const [checkboxStates, setCheckboxStates] = useState<Record<string, string[]>>(() => {
    const states: Record<string, string[]> = {}
    fields.forEach((field) => {
      if (field.type === "checkbox") {
        states[field.key] = initialData[field.key] || []
      }
    })
    return states
  })

  // react-hook-form 초기화
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: initialData,
  })

  const watchedValues = watch()

  const sanitizePersonName = (v: string) => v.replace(/[^A-Za-z가-힣ㄱ-ㅎㅏ-ㅣ\\s]/g, "")
  const formatForeignerId = (v: string) => {
    const digits = (v || "").replace(/[^0-9]/g, "").slice(0, 13)
    if (digits.length <= 6) return digits
    return `${digits.slice(0, 6)}-${digits.slice(6)}`
  }
  const formatBizReg = (v: string) => {
    const digits = (v || "").replace(/[^0-9]/g, "").slice(0, 10)
    if (digits.length <= 3) return digits
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`
  }

  const deceasedAddress = (watchedValues as any)?.deceased_address || ""
  const deceasedBirthdate = (watchedValues as any)?.deceased_birthdate || ""
  const deceasedForeignerId = (watchedValues as any)?.deceased_foreigner_id || ""
  const deceasedName = (watchedValues as any)?.deceased_name || ""
  const incidentLocation = (watchedValues as any)?.incident_location || ""
  const partyAAddress = (watchedValues as any)?.party_a_address || ""
  const partyAName = (watchedValues as any)?.party_a_name || ""
  const partyARelation = (watchedValues as any)?.party_a_relation || ""
  const partyARelationOther = (watchedValues as any)?.party_a_relation_other || ""
  const partyAId = (watchedValues as any)?.party_a_id_number || ""

  const partyA2Name = (watchedValues as any)?.party_a_2_name || ""
  const partyA2Relation = (watchedValues as any)?.party_a_2_relation || ""
  const partyA2RelationOther = (watchedValues as any)?.party_a_2_relation_other || ""
  const partyA2Id = (watchedValues as any)?.party_a_2_id_number || ""

  const partyBCompany = (watchedValues as any)?.party_b_company_name || ""
  const [incidentSame, setIncidentSame] = useState(false)
  const [showPartyA2, setShowPartyA2] = useState(false)
  const [partyA2AddressSame, setPartyA2AddressSame] = useState(true)

  // 섹션 접기/펼치기(PC 폼 스크롤 피로도 완화)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    // 기본적으로 자주 안 건드리는 섹션은 접어두기
    tasks: true,
    special: true,
    insurance: true,
    general: true,
  })
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const isFieldHidden = (key: string) =>
    [
      "insured_name",
      "insured_registration",
      "insured_birthdate",
      "insured_address",
      "beneficiary_name",
      "policyholder_registration",
      "beneficiary_registration",
      "heir_1_name",
      "heir_1_id",
      "heir_1_relation",
      "heir_2_name",
      "heir_2_id",
      "heir_2_relation",
    ].includes(key)

  const getValueByKey = (key: string) => {
    if (!key) return ""
    if (key.includes(".")) {
      const [p, c] = key.split(".")
      const obj = (watchedValues as any)?.[p] || {}
      return obj?.[c] || ""
    }
    return (watchedValues as any)?.[key] || ""
  }

  const isFieldVisibleInForm = (groupName: string, f: UnifiedField) => {
    if (isFieldHidden(f.key)) return false
    if (groupName === "case") return f.key === "case_number" || f.key === "court"
    if (groupName === "insurance")
      return ["recipient_company", "insurance_product", "policyholder", "contract_date_1", "contract_date_2"].includes(f.key)
    return true
  }

  const requiredVisibleFields = useMemo(() => {
    const out: UnifiedField[] = []
    Object.entries(groupedFields).forEach(([groupName, groupFields]) => {
      groupFields.forEach((f) => {
        if (!f.required) return
        if (!isFieldVisibleInForm(groupName, f)) return
        out.push(f)
      })
    })
    return out
  }, [groupedFields])

  const missingRequired = useMemo(() => {
    return requiredVisibleFields.filter((f) => {
      const v = getValueByKey(f.key)
      return !String(v || "").trim()
    })
  }, [requiredVisibleFields, watchedValues])

  const filledRequiredCount = Math.max(0, requiredVisibleFields.length - missingRequired.length)
  const progressPct =
    requiredVisibleFields.length === 0 ? 100 : Math.round((filledRequiredCount / requiredVisibleFields.length) * 100)

  const jumpToGroup = (groupName: string) => {
    setCollapsed((prev) => ({ ...prev, [groupName]: false }))
    setTimeout(() => {
      const el = groupRefs.current[groupName]
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  // "주소/생년월일/거소신고번호"는 동일값으로 문서 필드에도 자동 반영
  useEffect(() => {
    // 보험 서류(피보험자) 주소/생년월일은 사망자 정보와 동일하게 사용
    setValue("insured_name", deceasedName, { shouldDirty: true })
    setValue("insured_address", deceasedAddress, { shouldDirty: true })
    setValue("insured_birthdate", deceasedBirthdate, { shouldDirty: true })
    // 거소신고번호 = 외국인등록번호
    setValue("insured_registration", formatForeignerId(deceasedForeignerId), { shouldDirty: true })

    // 보험: 수익자 성명은 가해자 회사(상호)와 동일
    setValue("beneficiary_name", partyBCompany, { shouldDirty: true })

    // 보험: 법정상속인 1/2는 유가족 정보와 동일
    const rel1 = partyARelation === "기타" ? partyARelationOther : partyARelation
    const rel2 = partyA2Relation === "기타" ? partyA2RelationOther : partyA2Relation
    setValue("heir_1_name", partyAName, { shouldDirty: true })
    setValue("heir_1_id", partyAId, { shouldDirty: true })
    setValue("heir_1_relation", rel1 || "", { shouldDirty: true })
    setValue("heir_2_name", partyA2Name, { shouldDirty: true })
    setValue("heir_2_id", partyA2Id, { shouldDirty: true })
    setValue("heir_2_relation", rel2 || "", { shouldDirty: true })

    if (incidentSame) {
      setValue("incident_location", deceasedAddress, { shouldDirty: true })
    }

    if (partyA2AddressSame) {
      setValue("party_a_2_address", partyAAddress, { shouldDirty: true })
    }
  }, [
    deceasedName,
    deceasedAddress,
    deceasedBirthdate,
    deceasedForeignerId,
    partyBCompany,
    partyAName,
    partyARelation,
    partyARelationOther,
    partyAId,
    partyA2Name,
    partyA2Relation,
    partyA2RelationOther,
    partyA2Id,
    partyAAddress,
    partyA2AddressSame,
    incidentSame,
    setValue,
  ])

  // 필드 렌더링 함수 (메모이제이션)
  const renderField = useCallback((field: UnifiedField) => {
    const fieldName = field.key
    const isRequired = field.required
    const usedInLabel =
      field.unifiedGroup === "general" && field.type === "date" && field.usedIn?.length
        ? ` (${field.usedIn.map((t) => getDocumentTypeLabel(t, "ko")).join(", ")})`
        : ""
    
    // 중첩 필드 (예: special_authority.withdrawal_of_suit) 처리
    const isNested = fieldName.includes(".")
    if (isNested) {
      const [parentKey, childKey] = fieldName.split(".")
      const parentValue = watchedValues[parentKey] || {}
      const currentValue = parentValue[childKey] || ""
      
      // select 타입의 중첩 필드 처리
      if (field.type === "select") {
        const isSpecialAuthorityField = parentKey === "special_authority"
        
        return (
          <div key={fieldName}>
            <div className="flex items-center gap-2 mb-1">
              <label className="block text-sm font-medium flex-1">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              {isSpecialAuthorityField && (
                <div className="flex gap-1">
                  {field.options?.map((option) => {
                    const isSelected = currentValue === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setValue(parentKey, {
                            ...parentValue,
                            [childKey]: option.value,
                          })
                        }}
                        className={`px-3 py-1 rounded border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-gray-300 bg-white text-secondary hover:border-primary hover:bg-gray-50"
                        }`}
                      >
                        {option.label.ko}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {!isSpecialAuthorityField && (
              <select
                value={currentValue}
                onChange={(e) => {
                  setValue(parentKey, {
                    ...parentValue,
                    [childKey]: e.target.value,
                  })
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">선택하세요</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label.ko}
                  </option>
                ))}
              </select>
            )}
            {errors[parentKey] && typeof errors[parentKey] === 'object' && childKey in (errors[parentKey] as any) && (
              <p className="text-red-500 text-sm mt-1">
                {(errors[parentKey] as any)[childKey]?.message as string}
              </p>
            )}
          </div>
        )
      }
      
      // 중첩 필드가 select가 아닌 경우는 일반 필드로 처리하지 않음
      return null
    }

    switch (field.type) {
      case "text":
        // 유가족 2명 입력은 + 버튼을 눌렀을 때만 표시
        if (
          fieldName === "party_a_2_name" ||
          fieldName === "party_a_2_id_number" ||
          fieldName === "party_a_2_address" ||
          fieldName === "party_a_2_relation_other"
        ) {
          if (!showPartyA2) return <input key={fieldName} type="hidden" {...register(fieldName)} />
        }

        // 관계(기타)는 토글 UI에서 함께 처리하므로 별도 입력은 숨김(값만 유지)
        if (fieldName === "party_a_relation_other") {
          return <input key={fieldName} type="hidden" {...register(fieldName)} />
        }

        // 보험 중복 필드들은 자동으로 채우므로 UI에서 숨김
        if (
          fieldName === "beneficiary_name" ||
          fieldName === "policyholder_registration" ||
          fieldName === "beneficiary_registration" ||
          fieldName === "heir_1_name" ||
          fieldName === "heir_1_id" ||
          fieldName === "heir_1_relation" ||
          fieldName === "heir_2_name" ||
          fieldName === "heir_2_id" ||
          fieldName === "heir_2_relation"
        ) {
          return <input key={fieldName} type="hidden" {...register(fieldName)} />
        }
        // UI에서 제거하지만 값은 자동 동기화로 채움
        if (
          fieldName === "insured_name" ||
          fieldName === "insured_registration" ||
          fieldName === "insured_birthdate" ||
          fieldName === "insured_address"
        ) {
          return <input key={fieldName} type="hidden" {...register(fieldName)} />
        }

        if (fieldName === "court") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <input
                type="hidden"
                {...register(fieldName, {
                  required: isRequired ? `${field.label.ko}을(를) 입력하세요` : false,
                })}
              />
              <CourtAutocomplete
                label={field.label.ko}
                required={isRequired}
                value={value}
                placeholder={field.label.ko}
                errorText={errors[fieldName] ? (errors[fieldName]?.message as string) : undefined}
                onChange={(next) => setValue(fieldName, next)}
              />
            </div>
          )
        }

        // 주소지: 도로명주소 팝업 검색 지원
        if (fieldName === "deceased_address") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <input type="hidden" {...register(fieldName)} />
              <AddressAutocomplete
                label={field.label.ko}
                value={value}
                onChange={(next) => setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })}
              />
            </div>
          )
        }

        // 가해자 회사 주소: 도로명주소 자동완성 적용
        if (fieldName === "party_b_address") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <input type="hidden" {...register(fieldName)} />
              <AddressAutocomplete
                label={field.label.ko}
                value={value}
                onChange={(next) => setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })}
              />
            </div>
          )
        }

        // 유가족 본국 주소: 한 줄 입력 (추가 유가족은 상동 지원)
        if (fieldName === "party_a_address") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-1">{field.label.ko}</label>
              <input type="hidden" {...register(fieldName)} />
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(fieldName, e.target.value, { shouldDirty: true, shouldTouch: true })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={field.label.ko}
              />
            </div>
          )
        }

        if (fieldName === "party_a_2_address") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <div className="flex items-center justify-between gap-2 mb-1">
                <label className="block text-sm font-medium flex-1">{field.label.ko}</label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={partyA2AddressSame}
                    onChange={(e) => {
                      const next = e.target.checked
                      setPartyA2AddressSame(next)
                      if (next) setValue("party_a_2_address", partyAAddress, { shouldDirty: true, shouldTouch: true })
                    }}
                  />
                  상동
                </label>
              </div>
              <input type="hidden" {...register(fieldName)} />
              <input
                type="text"
                value={value}
                disabled={partyA2AddressSame}
                onChange={(e) => setValue(fieldName, e.target.value, { shouldDirty: true, shouldTouch: true })}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${partyA2AddressSame ? "bg-gray-50 text-gray-700" : ""}`}
                placeholder={field.label.ko}
              />
            </div>
          )
        }

        // 사건발생위치: 상동(주소지) 지원
        if (fieldName === "incident_location") {
          return (
            <div key={fieldName}>
              <div className="flex items-center gap-2 mb-1">
                <label className="block text-sm font-medium flex-1">
                  {field.label.ko}
                  {isRequired && <span className="text-red-500 ml-1">*</span>}
                </label>
                <label className="flex items-center gap-2 text-sm text-text-secondary">
                  <input
                    type="checkbox"
                    checked={incidentSame}
                    onChange={(e) => {
                      const next = e.target.checked
                      setIncidentSame(next)
                      if (next) setValue("incident_location", deceasedAddress, { shouldDirty: true, shouldTouch: true })
                    }}
                  />
                  상동
                </label>
                <button
                  type="button"
                  className="px-2 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    setIncidentSame(true)
                    setValue("incident_location", deceasedAddress, { shouldDirty: true, shouldTouch: true })
                  }}
                >
                  상동
                </button>
              </div>
              <input type="hidden" {...register(fieldName)} />
              <input
                type="text"
                value={incidentLocation}
                onChange={(e) => setValue(fieldName, e.target.value, { shouldDirty: true, shouldTouch: true })}
                disabled={incidentSame}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${incidentSame ? "bg-gray-50 text-gray-700" : ""}`}
                placeholder={field.label.ko}
              />
            </div>
          )
        }

        // 성명 특수문자 제한: 망인/피보험자
        if (fieldName === "deceased_name" || fieldName === "insured_name") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-1">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const next = sanitizePersonName(e.target.value)
                  setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={field.label.ko}
              />
              {errors[fieldName] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[fieldName]?.message as string}
                </p>
              )}
            </div>
          )
        }

        // 유가족 성명도 특수문자 제한 (갑/추가)
        if (fieldName === "party_a_name" || fieldName === "party_a_2_name") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-1">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  const next = sanitizePersonName(e.target.value)
                  setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })
                }}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={field.label.ko}
              />
              {errors[fieldName] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[fieldName]?.message as string}
                </p>
              )}
            </div>
          )
        }

        // 외국인등록번호 포맷: 6자리-7자리
        if (fieldName === "deceased_foreigner_id") {
          const value = formatForeignerId((watchedValues as any)[fieldName] || "")
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-1">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input type="hidden" {...register(fieldName)} />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={value}
                onChange={(e) => {
                  const next = formatForeignerId(e.target.value)
                  setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })
                }}
                placeholder="000000-0000000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )
        }

        // 사업자등록번호 포맷: 000-00-00000 (숫자만 입력)
        if (fieldName === "party_b_registration") {
          const value = formatBizReg((watchedValues as any)[fieldName] || "")
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-1">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input type="hidden" {...register(fieldName)} />
              <input
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={value}
                onChange={(e) => {
                  const next = formatBizReg(e.target.value)
                  setValue(fieldName, next, { shouldDirty: true, shouldTouch: true })
                }}
                placeholder="000-00-00000"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )
        }

        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label.ko}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              {...register(fieldName, {
                required: isRequired ? `${field.label.ko}을(를) 입력하세요` : false,
              })}
              type="text"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={field.label.ko}
            />
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        )

      case "date":
        // 생년월일 아이콘 클릭(=포커스) 시 기본 2000-01-01을 가리키도록 값 세팅
        // (브라우저 date picker의 "표시 월"만 제어는 불가하므로, 비어있을 때만 기본값을 채움)
        const dateValue = (watchedValues as any)[fieldName] || ""
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label.ko}
              {usedInLabel}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input type="hidden" {...register(fieldName)} />
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setValue(fieldName, e.target.value, { shouldDirty: true, shouldTouch: true })}
              onFocus={() => {
                const cur = (watchedValues as any)[fieldName] || ""
                if (!cur) setValue(fieldName, "2000-01-01", { shouldDirty: true, shouldTouch: true })
              }}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        )

      case "textarea":
        // 유가족 주소/가해자 주소는 커스텀 입력으로 처리
        if (fieldName === "party_a_address" || fieldName === "party_a_2_address" || fieldName === "party_b_address") {
          return null
        }
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label.ko}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              {...register(fieldName, {
                required: isRequired ? `${field.label.ko}을(를) 입력하세요` : false,
              })}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={field.label.ko}
            />
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        )

      case "select":
        // 성별은 남/여 토글 형태
        if (fieldName === "insured_gender") {
          const value = (watchedValues as any)[fieldName] || ""
          return (
            <div key={fieldName}>
              <label className="block text-sm font-medium mb-2">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input type="hidden" {...register(fieldName)} />
              <div className="flex gap-2">
                {field.options?.map((opt) => {
                  const selected = value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setValue(fieldName, opt.value, { shouldDirty: true, shouldTouch: true })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white text-secondary hover:border-primary"
                      }`}
                    >
                      {opt.label.ko}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        }

        // 관계: 부/모 토글 + 기타 입력 (1명/2명 공통)
        if (fieldName === "party_a_relation" || fieldName === "party_a_2_relation") {
          if (fieldName === "party_a_2_relation" && !showPartyA2) {
            return <input key={fieldName} type="hidden" {...register(fieldName)} />
          }

          const value = (watchedValues as any)[fieldName] || ""
          const otherKey = fieldName === "party_a_relation" ? "party_a_relation_other" : "party_a_2_relation_other"
          const otherValue = (watchedValues as any)[otherKey] || ""
          const options = field.options || [
            { value: "부", label: { ko: "부", en: "Father", "zh-CN": "父" } },
            { value: "모", label: { ko: "모", en: "Mother", "zh-CN": "母" } },
            { value: "기타", label: { ko: "기타", en: "Other", "zh-CN": "其他" } },
          ]

          return (
            <div key={fieldName} className="sm:col-span-2 lg:col-span-4">
              <label className="block text-sm font-medium mb-2">
                {field.label.ko}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
              <input type="hidden" {...register(fieldName)} />
              <input type="hidden" {...register(otherKey)} />
              <div className="flex gap-2">
                {options.map((opt) => {
                  const selected = value === opt.value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setValue(fieldName, opt.value, { shouldDirty: true, shouldTouch: true })
                        if (opt.value !== "기타") setValue(otherKey, "", { shouldDirty: true, shouldTouch: true })
                      }}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                        selected
                          ? "border-primary bg-primary text-white"
                          : "border-gray-300 bg-white text-secondary hover:border-primary"
                      }`}
                    >
                      {opt.label.ko}
                    </button>
                  )
                })}
              </div>
              {value === "기타" && (
                <div className="mt-3">
                  <label className="block text-sm font-medium mb-1">기타 관계</label>
                  <input
                    type="text"
                    value={otherValue}
                    onChange={(e) => setValue(otherKey, e.target.value, { shouldDirty: true, shouldTouch: true })}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="관계를 입력하세요"
                  />
                </div>
              )}
            </div>
          )
        }

        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-1">
              {field.label.ko}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              {...register(fieldName, {
                required: isRequired ? `${field.label.ko}을(를) 선택하세요` : false,
              })}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">선택하세요</option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label.ko}
                </option>
              ))}
            </select>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        )

      case "checkbox":
        // 체크박스는 여러 개 선택 가능 (배열로 저장)
        const currentCheckboxValues = checkboxStates[fieldName] || []
        
        return (
          <div key={fieldName}>
            <label className="block text-sm font-medium mb-2">
              {field.label.ko}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  const all = (field.options || []).map((o) => o.value)
                  setCheckboxStates((prev) => ({ ...prev, [fieldName]: all }))
                  setValue(fieldName, all, { shouldDirty: true, shouldTouch: true })
                }}
              >
                전체 선택
              </button>
              <button
                type="button"
                className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                onClick={() => {
                  setCheckboxStates((prev) => ({ ...prev, [fieldName]: [] }))
                  setValue(fieldName, [], { shouldDirty: true, shouldTouch: true })
                }}
              >
                전체 해제
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {field.options?.map((option) => {
                const checkboxValue = option.value
                const isChecked = currentCheckboxValues.includes(checkboxValue)
                
                return (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...currentCheckboxValues, checkboxValue]
                          : currentCheckboxValues.filter((v) => v !== checkboxValue)
                        setCheckboxStates((prev) => ({
                          ...prev,
                          [fieldName]: newValues,
                        }))
                        setValue(fieldName, newValues)
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm">{option.label.ko}</span>
                  </label>
                )
              })}
              {/* 숨겨진 입력 필드로 실제 값 저장 */}
              <input
                type="hidden"
                {...register(fieldName)}
                value={JSON.stringify(currentCheckboxValues)}
              />
            </div>
            {errors[fieldName] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[fieldName]?.message as string}
              </p>
            )}
          </div>
        )

      default:
        return null
    }
  }, [watchedValues, register, setValue, errors, checkboxStates, setCheckboxStates])

  // 그룹별 필드 렌더링 (메모이제이션)
  const renderGroup = useCallback((groupName: string, groupFields: UnifiedField[]) => {
    if (groupFields.length === 0) return null

    const isSpecial = groupName === "special"
    const specialChildren = isSpecial
      ? groupFields
          .map((f) => f.key)
          .filter((k) => k.startsWith("special_authority."))
          .map((k) => k.split(".")[1])
      : []

    const isCollapsed = !!collapsed[groupName]

    return (
      <div
        key={groupName}
        ref={(el) => {
          groupRefs.current[groupName] = el
        }}
      >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle>{getGroupLabel(groupName)}</CardTitle>
              {groupName === "general" && (
                <div className="text-xs text-text-secondary mt-1">일자(날짜) 입력은 전부 선택사항입니다.</div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(groupName === "tasks" || groupName === "special" || groupName === "insurance" || groupName === "general") && (
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setCollapsed((p) => ({ ...p, [groupName]: !p[groupName] }))}
                >
                  {isCollapsed ? "펼치기" : "접기"}
                </button>
              )}

              {groupName === "party_a" && (
                <button
                  type="button"
                  className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                  onClick={() => setShowPartyA2((v) => !v)}
                >
                  {showPartyA2 ? "추가 유가족 제거" : "+ 유가족 추가(부/모)"}
                </button>
              )}

              {isSpecial && specialChildren.length > 0 && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      const cur = (watchedValues as any).special_authority || {}
                      const next: Record<string, "O" | "X"> = { ...cur }
                      specialChildren.forEach((k) => (next[k] = "O"))
                      setValue("special_authority", next, { shouldDirty: true, shouldTouch: true })
                    }}
                  >
                    전체 O
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={() => {
                      const cur = (watchedValues as any).special_authority || {}
                      const next: Record<string, "O" | "X"> = { ...cur }
                      specialChildren.forEach((k) => (next[k] = "X"))
                      setValue("special_authority", next, { shouldDirty: true, shouldTouch: true })
                    }}
                  >
                    전체 X
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        {!isCollapsed && (
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupFields
              // 사건 정보: 사건/법원만 유지
              .filter((field) => {
                if (groupName !== "case") return true
                return field.key === "case_number" || field.key === "court"
              })
              // 보험 정보: 필요한 것만 노출 (중복/불필요 제거)
              .filter((field) => {
                if (groupName !== "insurance") return true
                return ["recipient_company", "insurance_product", "policyholder", "contract_date_1", "contract_date_2"].includes(field.key)
              })
              .map((field) => {
                const key = field.key

                // 기본 span
                let spanClass = ""

                if (groupName === "deceased") {
                  if (key === "deceased_name") spanClass = "lg:col-span-2"
                  else if (key === "insured_gender") spanClass = "lg:col-span-1"
                  else if (key === "deceased_birthdate") spanClass = "lg:col-span-1"
                  else if (key === "deceased_address") spanClass = "sm:col-span-2 lg:col-span-4"
                  else if (key === "incident_location" || key === "incident_time") spanClass = "lg:col-span-2"
                  else if (key === "deceased_foreigner_id") spanClass = "lg:col-span-2"
                }

                if (groupName === "party_a") {
                  if (key === "party_a_name") spanClass = "lg:col-span-2"
                  else if (key === "party_a_relation" || key === "party_a_birthdate") spanClass = "lg:col-span-1"
                  else if (key === "party_a_nationality" || key === "party_a_passport") spanClass = "lg:col-span-1"
                  else if (key === "party_a_id_number") spanClass = "lg:col-span-2"
                  else if (key === "party_a_contact" || key === "party_a_address") spanClass = "lg:col-span-2"

                  if (key === "party_a_2_name") spanClass = "lg:col-span-2"
                  else if (key === "party_a_2_relation" || key === "party_a_2_birthdate") spanClass = "lg:col-span-1"
                  else if (key === "party_a_2_nationality" || key === "party_a_2_passport") spanClass = "lg:col-span-1"
                  else if (key === "party_a_2_id_number") spanClass = "lg:col-span-2"
                  else if (key === "party_a_2_contact" || key === "party_a_2_address") spanClass = "lg:col-span-2"
                }

                if (groupName === "party_b") {
                  if (key === "party_b_company_name" || key === "party_b_representative") spanClass = "lg:col-span-2"
                  else if (key === "party_b_registration" || key === "party_b_contact") spanClass = "lg:col-span-2"
                  else if (key === "party_b_address") spanClass = "sm:col-span-2 lg:col-span-4"
                }

                if (groupName === "tasks") {
                  // 위임업무는 2열로 보이지만, 카드 폭은 그대로 유지
                  if (field.type === "checkbox") spanClass = "sm:col-span-2 lg:col-span-4"
                }

                if (groupName === "general") {
                  // 일반 정보(날짜)는 한 줄 전체로
                  if (field.type === "date") spanClass = "lg:col-span-2"
                }

                // 기본적으로 textarea/checkbox/법원은 full-span
                const isFull = field.type === "textarea" || field.type === "checkbox" || key === "court"
                const finalClass = isFull ? "sm:col-span-2 lg:col-span-4" : spanClass

                return (
                  <div key={field.key} className={finalClass || ""}>
                    {renderField(field)}
                  </div>
                )
            })}
          </div>
        </CardContent>
        )}
      </Card>
      </div>
    )
  }, [renderField, showPartyA2, watchedValues, setValue, collapsed])

  if (documentTypes.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        서류를 선택하면 입력 폼이 표시됩니다.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      {/* 상단 요약(진행률/누락) */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-secondary">
              필수 입력 {filledRequiredCount}/{requiredVisibleFields.length} · 진행률 {progressPct}%
            </div>
            <div className="text-xs text-text-secondary mt-1">
              빠르게 이동:{" "}
              {(["deceased", "party_a", "party_b", "case", "insurance", "tasks", "special", "general"] as const)
                .filter((g) => groupedFields[g]?.length)
                .map((g) => (
                  <button
                    key={g}
                    type="button"
                    className="underline underline-offset-2 mr-2"
                    onClick={() => jumpToGroup(g)}
                  >
                    {getGroupLabel(g)}
                  </button>
                ))}
            </div>
          </div>
          <div className="w-full lg:w-72">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-2 bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
            {missingRequired.length > 0 && (
              <div className="text-xs text-red-600 mt-2">
                미입력 필수: {missingRequired.slice(0, 3).map((f) => f.label.ko).join(", ")}
                {missingRequired.length > 3 ? ` 외 ${missingRequired.length - 3}개` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {Object.entries(groupedFields).map(([groupName, groupFields]) =>
        // UI 중복 제거: 피보험자 주소/생년월일/거소신고번호는 상단 사망자 정보와 동일하게 자동 반영됨
        renderGroup(
          groupName,
          groupFields.filter((f) =>
            !["insured_name", "insured_registration", "insured_birthdate", "insured_address"].includes(f.key)
          )
        )
      )}

      {/* 하단 고정 액션바: 저장/취소 */}
      <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-3 bg-background/95 backdrop-blur border-t border-gray-200">
        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || !onCancel}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting} className="px-6">
            {isSubmitting ? "저장 중..." : "케이스 생성 및 서류 생성"}
          </Button>
        </div>
      </div>
    </form>
  )
}

