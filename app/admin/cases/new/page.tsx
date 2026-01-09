"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import DocumentSelector from "@/components/admin/DocumentSelector"
import UnifiedDocumentForm from "@/components/admin/UnifiedDocumentForm"
import { type DocumentType } from "@/lib/documents/templates"
import Button from "@/components/ui/Button"
import { ArrowLeft, ChevronRight, ChevronLeft } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"

type Step = 1 | 2 | 3

export default function NewCasePage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [caseName, setCaseName] = useState("")
  const [caseNumber, setCaseNumber] = useState("")
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<DocumentType[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseName.trim()) {
      toast.error("케이스 이름을 입력하세요.")
      return
    }
    setStep(2)
  }

  const handleStep2Next = () => {
    if (selectedDocumentTypes.length === 0) {
      toast.error("최소 하나 이상의 서류를 선택하세요.")
      return
    }
    setStep(3)
  }

  const handleStep2Back = () => {
    setStep(1)
  }

  const handleUnifiedFormSubmit = async (formData: Record<string, any>) => {
    try {
      setIsSubmitting(true)

      // 통합 폼 데이터를 케이스 데이터로 변환
      const caseData = {
        case_number: caseNumber || null,
        case_name: caseName,
        case_data: {
          // 모든 필드를 case_data에 포함
          ...formData,
        },
        document_types: selectedDocumentTypes,
      }

      const response = await fetch("/api/cases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(caseData),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success("케이스가 성공적으로 생성되었습니다.")
        router.push(`/admin/cases/${data.case.id}`)
      } else {
        const error = await response.json()
        toast.error(`케이스 생성 실패: ${error.error || "알 수 없는 오류가 발생했습니다."}`)
      }
    } catch (error) {
      toast.error("케이스 생성 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStep3Back = () => {
    setStep(2)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin/cases">
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  목록으로
                </Button>
              </Link>
              <h2 className="text-xl font-bold text-secondary">새 케이스 생성</h2>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 진행 단계 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-white" : "bg-gray-200"}`}>
                1
              </div>
              <span className="font-medium">케이스 이름</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-white" : "bg-gray-200"}`}>
                2
              </div>
              <span className="font-medium">서류 선택</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-gray-400"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-white" : "bg-gray-200"}`}>
                3
              </div>
              <span className="font-medium">정보 입력</span>
            </div>
          </div>
        </div>

        {/* Step 1: 케이스 이름 입력 */}
        {step === 1 && (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    케이스 이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={caseName}
                    onChange={(e) => setCaseName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="예: 2024-001 사망사고"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">사건번호</label>
                  <input
                    type="text"
                    value={caseNumber}
                    onChange={(e) => setCaseNumber(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="예: 2024가단1234"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">다음</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 서류 선택 */}
        {step === 2 && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <DocumentSelector
                  selectedTypes={selectedDocumentTypes}
                  onSelectionChange={setSelectedDocumentTypes}
                />
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleStep2Back}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
              <Button onClick={handleStep2Next}>
                다음
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: 통합 입력 폼 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>케이스 이름:</strong> {caseName}
                {caseNumber && (
                  <>
                    <br />
                    <strong>사건번호:</strong> {caseNumber}
                  </>
                )}
                <br />
                <strong>선택한 서류:</strong> {selectedDocumentTypes.length}개
              </p>
            </div>
            <UnifiedDocumentForm
              documentTypes={selectedDocumentTypes}
              onSubmit={handleUnifiedFormSubmit}
              isSubmitting={isSubmitting}
            />
            <div className="flex justify-start">
              <Button variant="outline" onClick={handleStep3Back} disabled={isSubmitting}>
                <ChevronLeft className="w-4 h-4 mr-2" />
                이전
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

