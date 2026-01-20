"use client"

import { useEffect, useState, useCallback, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Save, ArrowLeft, Loader2, Globe, Image as ImageIcon } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  getTemplate,
  getDocumentTypeLabel,
  type DocumentType,
  type FieldDefinition,
} from "@/lib/documents/templates"
import { format } from "date-fns"
import DocumentPreview from "./DocumentPreview"
import { toast } from "@/components/ui/Toast"
import type { DocumentData } from "@/lib/types/documents"
import { generateDocumentImage } from "@/lib/documents/image-generator"
import { CourtAutocomplete } from "@/components/admin/CourtAutocomplete"

interface DocumentFormData {
  name?: string
  date?: string
  [key: string]: any
}

interface DocumentFormProps {
  documentId?: string
  documentType: DocumentType
  initialData?: {
    name?: string
    date?: string
    data?: DocumentData
  }
  isCaseLinked?: boolean
  caseName?: string
  locale: "ko" | "en" | "zh-CN"
  onLocaleChange: (locale: "ko" | "en" | "zh-CN") => void
}

export default function DocumentForm({
  documentId,
  documentType,
  initialData,
  isCaseLinked = false,
  caseName,
  locale,
  onLocaleChange,
}: DocumentFormProps) {
  const router = useRouter()
  const template = getTemplate(documentType)
  const [saving, setSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewHostRef = useRef<HTMLDivElement | null>(null)
  const [previewScale, setPreviewScale] = useState(0.7)
  const A4_W = 794
  const A4_H = 1123

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      ...(initialData?.data || {}),
    },
  })

  // 케이스 연결 문서라면 name을 항상 케이스명으로 고정
  useEffect(() => {
    if (!isCaseLinked) return
    if (!caseName) return
    setValue("name" as any, caseName, { shouldDirty: true, shouldValidate: true })
  }, [caseName, isCaseLinked, setValue])

  useEffect(() => {
    const el = previewHostRef.current
    if (!el) return

    const update = () => {
      const w = el.clientWidth
      if (!w) return
      // 카드 내부 폭에 맞춰 스케일(최대 1)로 줄여서 "PDF 미리보기" 카드 밖으로 나가지 않게 함
      const s = Math.min(1, Math.max(0.2, w / A4_W))
      setPreviewScale(Number(s.toFixed(4)))
    }

    update()
    const ro = new ResizeObserver(() => update())
    ro.observe(el)
    return () => ro.disconnect()
  }, [A4_W])

  // 자동 저장 (debounce) - watch()를 subscription으로 사용하여 무한 루프 방지
  useEffect(() => {
    if (!documentId) return

    // watch()를 subscription으로 사용하여 값 변경 시에만 실행
    const subscription = watch((value, { name, type }) => {
      // 값이 실제로 변경되었을 때만 타이머 설정
      if (type === 'change' && name) {
        // 기존 타이머 취소
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }

        // 새로운 타이머 설정
        autoSaveTimerRef.current = setTimeout(async () => {
          try {
            // name과 date를 제외한 나머지 데이터만 저장
            const { name: _, date: __, ...restData } = value
            await fetch(`/api/documents/${documentId}/save`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: restData }),
            })
          } catch (error) {
            // 자동 저장 실패는 조용히 처리 (사용자에게 알리지 않음)
          }
        }, 2000) // 2초 후 자동 저장
      }
    })

    // cleanup 함수
    return () => {
      subscription.unsubscribe()
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]) // watch는 안정적인 함수이므로 의존성 배열에서 제외

  const onSubmit = async (formData: DocumentFormData) => {
    setSaving(true)
    try {
      // name과 date는 별도 필드로 처리
      const name =
        (isCaseLinked && caseName) ? caseName : (formData.name || initialData?.name || "무제")
      const date = formData.date || initialData?.date || new Date().toISOString().split("T")[0]
      
      // name과 date를 제외한 나머지 데이터
      const { name: _, date: __, ...restData } = formData
      
      const payload = {
        document_type: documentType,
        name,
        date,
        data: restData,
        locale,
      }

      if (documentId) {
        // 수정
        await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // 생성
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        // 새로운 API 응답 형식 지원: { success: true, data: { document: {...} } }
        const createdDocument = result?.data?.document || result?.document
        if (createdDocument?.id) {
          router.push(`/admin/documents/${createdDocument.id}`)
          return
        }
      }

      toast.success("저장되었습니다.")
    } catch (error) {
      toast.error("저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadJPEG = async () => {
    try {
      toast.success("이미지 생성 중입니다. 잠시만 기다려주세요...")

      const formData = watch()
      // name/date는 메타데이터이므로 실제 문서 data에서 제외
      const { name: _name, date: _date, ...docData } = formData as any

      const blob = await generateDocumentImage(docData, documentType, locale)
      if (!blob) {
        toast.error("이미지 생성에 실패했습니다.")
        return
      }

      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.download = `${initialData?.name || "document"}_${locale}_${new Date().toISOString().split("T")[0]}.jpg`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("이미지 다운로드가 완료되었습니다.")
    } catch (error) {
      console.error("Error downloading image:", error)
      toast.error("이미지 다운로드에 실패했습니다.")
    }
  }

  const renderField = useCallback((field: FieldDefinition) => {
    const fieldKey = field.key
    const label = field.label[locale]
    const isRequired = field.required

    switch (field.type) {
      case "text":
        if (fieldKey === "court") {
          const value = (watch(fieldKey as any) as string) || ""
          const hasError = Boolean((errors as any)[fieldKey])
          return (
            <div key={fieldKey}>
              <input
                type="hidden"
                {...register(fieldKey as any, { required: isRequired })}
              />
              <CourtAutocomplete
                label={label}
                required={isRequired}
                locale={locale}
                value={value}
                placeholder={label}
                errorText={hasError ? "필수 항목입니다." : undefined}
                onChange={(next) => {
                  setValue(fieldKey as any, next, { shouldDirty: true, shouldValidate: true, shouldTouch: true })
                }}
              />
            </div>
          )
        }
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register(fieldKey as any, { required: isRequired })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
            />
            {(errors as any)[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...register(fieldKey as any, { required: isRequired })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
            />
            {(errors as any)[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "date":
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register(fieldKey as any, { required: isRequired })}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
            />
            {(errors as any)[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "select":
        const isRelationField = fieldKey.includes("relation") && !fieldKey.includes("other")
        const isGenderField = fieldKey.includes("gender")
        const isSpecialAuthorityField = fieldKey.includes("special_authority")
        const selectedValue = (watch(fieldKey as any) as string) || ""
        const showOtherInput = isRelationField && selectedValue === "기타"
        
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-secondary flex-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </label>
              {isSpecialAuthorityField ? (
                // 기타 특별수권사항 토글 버튼 (O/X)
                <div className="flex gap-2 flex-shrink-0">
                  {field.options?.map((option) => {
                    const isSelected = selectedValue === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setValue(fieldKey as any, option.value, { shouldDirty: true, shouldValidate: true, shouldTouch: true })
                        }}
                        className={`px-4 py-1.5 rounded border-2 transition-all text-sm font-medium min-w-[80px] ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-gray-300 bg-white text-secondary hover:border-primary hover:bg-gray-50"
                        }`}
                      >
                        {option.label[locale]}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
            {isGenderField ? (
              // 성별 토글 버튼
              <div className="flex gap-2">
                {field.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue(fieldKey as any, option.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedValue === option.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-secondary hover:border-primary"
                    }`}
                  >
                    {option.label[locale]}
                  </button>
                ))}
              </div>
            ) : !isSpecialAuthorityField ? (
              // 일반 Select (기타 특별수권사항이 아닌 경우)
              <select
                {...register(fieldKey as any, { required: isRequired })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
                onChange={(e) => {
                  setValue(fieldKey as any, e.target.value)
                  if (!isRelationField || e.target.value !== "기타") {
                    setValue(`${fieldKey}_other` as any, "")
                  }
                }}
              >
                <option value="">선택하세요</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[locale]}
                  </option>
                ))}
              </select>
            ) : null}
            {showOtherInput && (
              <input
                {...register(`${fieldKey}_other` as any)}
                type="text"
                placeholder={locale === "ko" ? "관계를 입력하세요" : locale === "en" ? "Enter relation" : "请输入关系"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mt-2 bg-white text-secondary"
              />
            )}
            {(errors as any)[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "checkbox":
        const handleCheckAll = () => {
          field.options?.forEach((option) => {
            const optionKey = `${fieldKey}.${option.value}`
            setValue(optionKey as any, true)
          })
        }
        
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-secondary">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                onClick={handleCheckAll}
                className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                ALL
              </button>
            </div>
            <div className="space-y-2 border border-gray-200 rounded-lg p-4">
              {field.options?.map((option) => {
                const optionKey = `${fieldKey}.${option.value}`
                const watchedValue = watch(optionKey as any) as any
                const isChecked = watchedValue === true || watchedValue === "true" || watchedValue === "on"
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setValue(optionKey as any, e.target.checked)
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-secondary">{option.label[locale]}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }, [locale, register, watch, setValue, errors])

  // 그룹별로 필드 정리 (메모이제이션)
  const groupedFields = useMemo(() => {
    return template.fields.reduce((acc, field) => {
      const group = field.group || "general"
      if (!acc[group]) {
        acc[group] = []
      }
      acc[group].push(field)
      return acc
    }, {} as Record<string, FieldDefinition[]>)
  }, [template.fields])

  const groupLabels: Record<string, Record<"ko" | "en" | "zh-CN", string>> = {
    deceased: { ko: "고인 정보", en: "Deceased Information", "zh-CN": "死者信息" },
    party_a: { ko: "갑 (유가족 대표)", en: "Party A (Family Representative)", "zh-CN": "甲方（家属代表）" },
    party_b: { ko: "을 (사업장 대표)", en: "Party B (Company Representative)", "zh-CN": "乙方（公司代表）" },
    principal: { ko: "위임인", en: "Principal", "zh-CN": "委托人" },
    attorney: { ko: "수임인", en: "Attorney", "zh-CN": "受托人" },
    sub_attorney: { ko: "복 대리인", en: "Sub-Attorney", "zh-CN": "复代理人" },
    tasks: { ko: "위임업무", en: "Authorized Tasks", "zh-CN": "委托业务" },
    case: { ko: "사건 정보", en: "Case Information", "zh-CN": "案件信息" },
    appointer: { ko: "선임인", en: "Appointer", "zh-CN": "任命人" },
    authorized: { ko: "수권사항", en: "Authorized Actions", "zh-CN": "授权事项" },
    special: { ko: "기타 특별수권사항", en: "Special Authority", "zh-CN": "其他特别授权事项" },
    recipient: { ko: "수신 정보", en: "Recipient Information", "zh-CN": "收件信息" },
    insured: { ko: "피보험자 정보", en: "Insured Information", "zh-CN": "被保险人信息" },
    insurance: { ko: "보험계약 정보", en: "Insurance Contract", "zh-CN": "保险合同信息" },
    beneficiary: { ko: "수익자 정보", en: "Beneficiary Information", "zh-CN": "受益人信息" },
    heirs: { ko: "법정상속인 정보", en: "Legal Heirs", "zh-CN": "法定继承人信息" },
    general: { ko: "기본 정보", en: "General Information", "zh-CN": "基本信息" },
  }

  const fieldSpanClass = (field: FieldDefinition) => {
    if (field.type === "textarea") return "md:col-span-2"
    if (field.type === "checkbox") return "md:col-span-2"
    if (field.key === "court") return "md:col-span-2"
    // Special Authority 필드들은 전체 폭 사용
    if (field.key.startsWith("special_authority.")) return "md:col-span-2"
    return ""
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="sticky top-16 z-20 bg-background/95 backdrop-blur border-b border-gray-200 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-4 flex-shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/documents")}
            className="h-9 flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
          <div className="flex-shrink-0">
            <h1 className="text-2xl font-bold text-secondary">
              {getDocumentTypeLabel(documentType, locale)}
            </h1>
            <p className="text-sm text-text-secondary">
              {documentId ? "서류 편집" : "새 서류 작성"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
          {/* 언어 선택 */}
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg p-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => onLocaleChange("ko")}
              className={`px-2 py-1 rounded text-xs h-7 flex-shrink-0 ${
                locale === "ko"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              className={`px-2 py-1 rounded text-xs h-7 flex-shrink-0 ${
                locale === "en"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("zh-CN")}
              className={`px-2 py-1 rounded text-xs h-7 flex-shrink-0 ${
                locale === "zh-CN"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              中文
            </button>
          </div>

          {documentId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadJPEG}
              className="h-9 flex-shrink-0"
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">이미지 다운로드</span>
              <span className="sm:hidden">다운로드</span>
            </Button>
          )}
          <Button 
            type="button" 
            onClick={handleSubmit(onSubmit)} 
            disabled={saving}
            className="h-9 flex-shrink-0"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
        </div>
      </div>

      {/* 메인 레이아웃: 입력 폼과 미리보기 나란히 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 폼 */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      {isCaseLinked ? "케이스 이름" : "이름"} <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      defaultValue={initialData?.name}
                      readOnly={isCaseLinked}
                      className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                        isCaseLinked ? "bg-gray-50 text-gray-700" : "bg-white text-secondary"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      일자 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("date", { required: true })}
                      type="date"
                      defaultValue={initialData?.date || new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-secondary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 그룹별 필드 */}
            {Object.entries(groupedFields).map(([group, fields]) => {
              // special 그룹에 ALL - 해제 버튼 추가
              const isSpecialGroup = group === "special"
              const handleSelectAllO = () => {
                if (isSpecialGroup) {
                  fields.forEach((field) => {
                    if (field.type === "select") {
                      setValue(field.key as any, "O")
                    }
                  })
                }
              }
              const handleSelectAllX = () => {
                if (isSpecialGroup) {
                  fields.forEach((field) => {
                    if (field.type === "select") {
                      setValue(field.key as any, "X")
                    }
                  })
                }
              }
              
              return (
                <Card key={group}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {groupLabels[group]?.[locale] || group}
                      </CardTitle>
                      {isSpecialGroup && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllO}
                            className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                          >
                            ALL (O)
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectAllX}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            해제
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fields.map((field) => (
                        <div key={field.key} className={fieldSpanClass(field)}>
                          {renderField(field)}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </form>
        </div>

        {/* PDF 미리보기 */}
        <div className="sticky top-4 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>PDF 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="p-4 overflow-hidden">
              <div ref={previewHostRef} className="w-full">
                <div
                  className="mx-auto bg-white border border-gray-200 shadow-sm"
                  style={{
                    width: `${Math.round(A4_W * previewScale)}px`,
                    height: `${Math.round(A4_H * previewScale)}px`,
                    overflow: "hidden",
                  }}
                >
                  <div
                    id="preview-container"
                    style={{
                      width: `${A4_W}px`,
                      height: `${A4_H}px`,
                      transform: `scale(${previewScale})`,
                      transformOrigin: "top left",
                    }}
                  >
                    <DocumentPreview
                      ref={previewRef}
                      documentType={documentType}
                      data={watch()}
                      locale={locale}
                      data-preview-id="document-preview"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

