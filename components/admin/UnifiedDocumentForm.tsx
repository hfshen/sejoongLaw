"use client"

import { useForm } from "react-hook-form"
import { useMemo } from "react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import type { DocumentType } from "@/lib/documents/templates"
import {
  collectFieldsFromDocumentTypes,
  groupFieldsByUnifiedGroup,
  getGroupLabel,
  type UnifiedField,
} from "@/lib/documents/field-collector"
import { useState } from "react"

interface UnifiedDocumentFormProps {
  documentTypes: DocumentType[]
  onSubmit: (data: Record<string, any>) => void | Promise<void>
  isSubmitting?: boolean
  initialData?: Record<string, any>
}

export default function UnifiedDocumentForm({
  documentTypes,
  onSubmit,
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

  // 필드 렌더링 함수
  const renderField = (field: UnifiedField) => {
    const fieldName = field.key
    const isRequired = field.required
    
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
            {errors[parentKey]?.[childKey] && (
              <p className="text-red-500 text-sm mt-1">
                {errors[parentKey]?.[childKey]?.message as string}
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
              type="date"
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
            <div className="space-y-2">
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
  }

  // 그룹별 필드 렌더링
  const renderGroup = (groupName: string, groupFields: UnifiedField[]) => {
    if (groupFields.length === 0) return null

    return (
      <Card key={groupName}>
        <CardHeader>
          <CardTitle>{getGroupLabel(groupName)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {groupFields.map((field) => renderField(field))}
        </CardContent>
      </Card>
    )
  }

  if (documentTypes.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        서류를 선택하면 입력 폼이 표시됩니다.
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {Object.entries(groupedFields).map(([groupName, groupFields]) =>
        renderGroup(groupName, groupFields)
      )}

      <div className="flex justify-end gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? "저장 중..." : "케이스 생성 및 서류 생성"}
        </Button>
      </div>
    </form>
  )
}

