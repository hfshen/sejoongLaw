"use client"

import { Card, CardContent } from "@/components/ui/Card"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import DocumentPreview from "./DocumentPreview"
import Button from "@/components/ui/Button"

interface DocumentSelectorProps {
  selectedTypes: DocumentType[]
  onSelectionChange: (types: DocumentType[]) => void
}

const documentTypes: DocumentType[] = [
  "agreement",
  "power_of_attorney",
  "attorney_appointment",
  "litigation_power",
  "insurance_consent",
  "agreement_old",
  "power_of_attorney_old",
  "attorney_appointment_old",
  "litigation_power_old",
  "insurance_consent_old",
]

// 각 문서 타입별 샘플 데이터
const getSampleData = (type: DocumentType) => {
  const baseData = {
    name: "샘플",
    agreement_date: new Date().toISOString().split("T")[0],
    signature_date: new Date().toISOString().split("T")[0],
  }

  switch (type) {
    case "agreement":
      return {
        ...baseData,
        deceased_name: "홍길동",
        party_a_name: "김철수",
        party_b_company_name: "ABC회사",
      }
    case "power_of_attorney":
      return {
        ...baseData,
        principal_name: "김철수",
        power_date: new Date().toISOString().split("T")[0],
      }
    case "attorney_appointment":
      return {
        ...baseData,
        appointer_name: "김철수",
        case_number: "2024가단1234",
        appointment_date: new Date().toISOString().split("T")[0],
      }
    case "litigation_power":
      return {
        ...baseData,
        case_number: "2024가단1234",
        plaintiff: "김철수",
        defendant: "ABC회사",
        principal_name: "김철수",
        power_date: new Date().toISOString().split("T")[0],
      }
    case "insurance_consent":
      return {
        ...baseData,
        insured_name: "홍길동",
        sender_company: "법무법인 세중",
        consent_date: new Date().toISOString().split("T")[0],
      }
    default:
      return baseData
  }
}

export default function DocumentSelector({
  selectedTypes,
  onSelectionChange,
}: DocumentSelectorProps) {
  const allSelected = selectedTypes.length === documentTypes.length

  const toggleSelection = (type: DocumentType) => {
    if (selectedTypes.includes(type)) {
      onSelectionChange(selectedTypes.filter((t) => t !== type))
    } else {
      onSelectionChange([...selectedTypes, type])
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">생성할 서류 선택</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSelectionChange(allSelected ? [] : [...documentTypes])}
          >
            {allSelected ? "전체 해제" : "모두 선택"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {documentTypes.map((type) => {
          const isSelected = selectedTypes.includes(type)
          return (
            <Card
              key={type}
              hover
              className={`cursor-pointer overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => toggleSelection(type)}
            >
              <CardContent className="p-0">
                {/* 체크박스 */}
                <div className="absolute top-2 right-2 z-10">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelection(type)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 text-primary rounded border-gray-300 focus:ring-primary"
                  />
                </div>

                {/* 썸네일 미리보기 */}
                <div
                  className="bg-gray-50 border-b border-gray-200 relative overflow-hidden"
                  style={{ aspectRatio: "794 / 1123" }}
                >
                  <div
                    style={{
                      transform: "scale(0.18)",
                      transformOrigin: "top left",
                      width: "794px",
                      height: "1123px",
                    }}
                  >
                    <DocumentPreview
                      documentType={type}
                      data={getSampleData(type)}
                      locale="ko"
                    />
                  </div>
                </div>

                {/* 서류 정보 */}
                <div className="p-3">
                  <h3 className="text-sm font-bold text-secondary leading-snug">
                    {getDocumentTypeLabel(type, "ko")}
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    {getDocumentTypeLabel(type, "en")}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {selectedTypes.length > 0 && (
        <p className="mt-4 text-sm text-text-secondary">
          {selectedTypes.length}개의 서류가 선택되었습니다.
        </p>
      )}
    </div>
  )
}

