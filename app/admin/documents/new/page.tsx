"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import DocumentForm from "@/components/admin/DocumentForm"
import DocumentPreview from "@/components/admin/DocumentPreview"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import { Card, CardContent } from "@/components/ui/Card"

export default function NewDocumentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [locale, setLocale] = useState<"ko" | "en" | "zh-CN" | "si" | "ta">("ko")
  const [documentType, setDocumentType] = useState<DocumentType | null>(
    (searchParams.get("type") as DocumentType) || null
  )

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
          attorney_name: "이택기",
        }
      case "attorney_appointment":
        return {
          ...baseData,
          appointer_name: "김철수",
          case_number: "2024가단1234",
        }
      case "litigation_power":
        return {
          ...baseData,
          case_number: "2024가단1234",
          plaintiff: "김철수",
          defendant: "ABC회사",
        }
      case "insurance_consent":
        return {
          ...baseData,
          insured_name: "홍길동",
          sender_company: "법무법인 세중",
        }
      case "agreement_old":
        return {
          ...baseData,
          deceased_name: "홍길동",
          party_a_name: "김철수",
          party_b_company_name: "ABC회사",
        }
      case "power_of_attorney_old":
        return {
          ...baseData,
          principal_name: "김철수",
          attorney_name: "이택기",
        }
      case "attorney_appointment_old":
        return {
          ...baseData,
          appointer_name: "김철수",
          case_number: "2024가단1234",
          victim: "홍길동",
          court: "의정부지방법원",
        }
      case "litigation_power_old":
        return {
          ...baseData,
          case_number: "2024가단1234",
          plaintiff: "김철수",
          defendant: "ABC회사",
          court: "의정부지방법원",
        }
      case "insurance_consent_old":
        return {
          ...baseData,
          insured_name: "홍길동",
          sender_company: "법무법인 세중",
          recipient_company: "ABC보험",
        }
      default:
        return baseData
    }
  }

  if (documentType === null) {
    return (
      <div>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-secondary mb-2">서류 유형 선택</h1>
            <p className="text-text-secondary">작성할 서류의 유형을 선택하세요.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documentTypes.map((type) => (
              <Card
                key={type}
                hover
                className="cursor-pointer overflow-hidden"
                onClick={() => setDocumentType(type)}
              >
                <CardContent className="p-0">
                  {/* 썸네일 미리보기 */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200" style={{ height: "200px", overflow: "hidden" }}>
                    <div style={{ transform: "scale(0.25)", transformOrigin: "top left", width: "400%" }}>
                      <DocumentPreview
                        documentType={type}
                        data={getSampleData(type)}
                        locale="ko"
                      />
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-secondary mb-2">
                      {getDocumentTypeLabel(type, "ko")}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {getDocumentTypeLabel(type, "en")}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
      </div>
    )
  }

  return (
    <div>
      {documentType && (
        <DocumentForm
          documentType={documentType}
          locale={locale}
          onLocaleChange={setLocale}
        />
      )}
    </div>
  )
}

