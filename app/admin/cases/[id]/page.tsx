"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import Link from "next/link"
import CaseForm, { type CaseFormData } from "@/components/admin/CaseForm"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft, Edit, Download, Trash2, FileArchive } from "lucide-react"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import { toast } from "@/components/ui/Toast"
import JSZip from "jszip"
import { generateDocumentImage } from "@/lib/documents/image-generator"

interface Case {
  id: string
  case_number: string | null
  case_name: string
  case_data: any
  created_at: string
  updated_at: string
}

interface Document {
  id: string
  document_type: DocumentType
  name: string
  date: string
  locale: string
  created_at: string
}

export default function CaseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)

  type TabKey = "overview" | "documents" | "data"
  const tabFromUrl = (searchParams.get("tab") as TabKey) || "overview"
  const [activeTab, setActiveTab] = useState<TabKey>(tabFromUrl)

  useEffect(() => {
    const next = (searchParams.get("tab") as TabKey) || "overview"
    setActiveTab(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const fetchCase = useCallback(async () => {
    if (!caseId) return
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/cases/${caseId}`)
      const data = await response.json()
      if (response.ok) {
        // 새로운 API 응답 형식 지원: { success: true, data: { case: {...}, documents: [...] } }
        const responseData = data.data || data
        setCaseData(responseData.case)
        setDocuments(responseData.documents || [])
      } else {
        const errorMessage = data.error || "케이스를 찾을 수 없습니다."
        setError(errorMessage)
        toast.error(errorMessage)
        router.push("/admin/cases")
      }
    } catch (error) {
      const errorMessage = "케이스 조회 중 오류가 발생했습니다."
      setError(errorMessage)
      toast.error(errorMessage)
      router.push("/admin/cases")
    } finally {
      setLoading(false)
    }
  }, [caseId, router])

  useEffect(() => {
    fetchCase()
  }, [fetchCase])

  const handleUpdate = async (formData: CaseFormData) => {
    try {
      setIsSubmitting(true)

      const updateData = {
        case_number: formData.case_number || null,
        case_name: formData.case_name,
        case_data: {
          deceased_name: formData.deceased_name,
          deceased_birthdate: formData.deceased_birthdate,
          deceased_address: formData.deceased_address,
          deceased_foreigner_id: formData.deceased_foreigner_id,
          incident_location: formData.incident_location,
          incident_time: formData.incident_time,
          party_a_nationality: formData.party_a_nationality,
          party_a_name: formData.party_a_name,
          party_a_birthdate: formData.party_a_birthdate,
          party_a_contact: formData.party_a_contact,
          party_a_relation: formData.party_a_relation,
          party_a_id_number: formData.party_a_id_number,
          party_a_address: formData.party_a_address,
          party_b_company_name: formData.party_b_company_name,
          party_b_representative: formData.party_b_representative,
          party_b_registration: formData.party_b_registration,
          party_b_contact: formData.party_b_contact,
          party_b_address: formData.party_b_address,
          case_number: formData.case_number,
          plaintiff: formData.plaintiff,
          defendant: formData.defendant,
        },
        update_linked_documents: true,
      }

      const response = await fetch(`/api/cases/${caseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchCase()
        setIsEditing(false)
        setActiveTab("overview")
        router.replace(`/admin/cases/${caseId}?tab=overview`, { scroll: false })
        toast.success("케이스 정보가 업데이트되었습니다. 연결된 서류들도 자동으로 업데이트되었습니다.")
      } else {
        const error = await response.json()
        // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
        const errorMessage = error.error || error.data?.error || "알 수 없는 오류가 발생했습니다."
        toast.error(`케이스 업데이트 실패: ${errorMessage}`)
      }
    } catch (error) {
      toast.error("케이스 업데이트 중 오류가 발생했습니다.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("케이스를 삭제하시겠습니까? 연결된 서류들의 케이스 연결이 해제됩니다.")) {
      return
    }

    try {
      const response = await fetch(`/api/cases/${caseId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("케이스가 삭제되었습니다.")
        router.push("/admin/cases")
      } else {
        const error = await response.json()
        // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
        const errorMessage = error.error || error.data?.error || "알 수 없는 오류가 발생했습니다."
        toast.error(`케이스 삭제 실패: ${errorMessage}`)
      }
    } catch (error) {
      toast.error("케이스 삭제 중 오류가 발생했습니다.")
    }
  }

  const handleAddDocuments = async (documentTypes: DocumentType[]) => {
    try {
      const response = await fetch(`/api/cases/${caseId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_types: documentTypes }),
      })

      if (response.ok) {
        await fetchCase()
        toast.success("서류가 생성되었습니다.")
      } else {
        const error = await response.json()
        // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
        const errorMessage = error.error || error.data?.error || "알 수 없는 오류가 발생했습니다."
        toast.error(`서류 생성 실패: ${errorMessage}`)
      }
    } catch (error) {
      toast.error("서류 생성 중 오류가 발생했습니다.")
    }
  }


  const handleDownloadAllDocuments = async () => {
    if (documents.length === 0) {
      toast.error("다운로드할 서류가 없습니다.")
      return
    }

    try {
      setIsDownloadingZip(true)
      
      // 진행 상황 토스트 생성 (자동 닫힘 방지)
      const progressToastId = toast.progress("서류 이미지를 생성 중입니다...")

      const zip = new JSZip()
      const locales: ("ko" | "en" | "zh-CN")[] = ["ko", "en", "zh-CN"]
      const localeNames = { ko: "한국어", en: "English", "zh-CN": "中文" }

      let processedCount = 0
      const totalCount = documents.length * locales.length
      let addedCount = 0

      // 각 문서에 대해
      for (const doc of documents) {
        // 각 언어에 대해
        for (const locale of locales) {
          try {
            // 문서 데이터 가져오기
            const docResponse = await fetch(`/api/documents/${doc.id}`)
            if (!docResponse.ok) {
              processedCount++
              toast.update(progressToastId, `진행 중... (${processedCount}/${totalCount})`)
              continue
            }

            const docJson = await docResponse.json()
            // API 표준 응답: { success: true, data: { document: ... } }
            // 레거시 응답도 방어: { document: ... }
            const apiPayload = docJson?.data ?? docJson
            const apiDocument = apiPayload?.document ?? docJson?.document

            if (!apiDocument) {
              processedCount++
              toast.update(progressToastId, `진행 중... (${processedCount}/${totalCount})`)
              continue
            }

            // 문서 데이터 준비 (name, date 포함)
            const documentData = {
              name: apiDocument.name || "",
              date: apiDocument.date || "",
              ...(apiDocument.data || {}),
            }

            // 이미지 생성
            const imageBlob = await generateDocumentImage(
              documentData,
              doc.document_type,
              locale
            )

            if (imageBlob) {
              const docTypeLabel = getDocumentTypeLabel(doc.document_type, "ko")
              const fileName = `${docTypeLabel}_${localeNames[locale]}.jpg`
              zip.file(fileName, imageBlob)
              addedCount++
            }

            processedCount++
            toast.update(progressToastId, `진행 중... (${processedCount}/${totalCount})`)
          } catch (error) {
            processedCount++
            toast.update(progressToastId, `진행 중... (${processedCount}/${totalCount})`)
          }
        }
      }

      // 진행 토스트 제거
      toast.remove(progressToastId)

      if (addedCount === 0) {
        toast.error("ZIP에 추가된 이미지가 없습니다. (서류 로딩/이미지 생성 실패)")
        return
      }

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${caseData?.case_name || "case"}_documents_${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("모든 서류가 ZIP 파일로 다운로드되었습니다.")
    } catch (error) {
      toast.error("ZIP 다운로드 중 오류가 발생했습니다.")
    } finally {
      setIsDownloadingZip(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary">로딩 중...</p>
      </div>
    )
  }

  if (error || !caseData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "케이스를 찾을 수 없습니다."}</p>
          <Button onClick={() => router.push("/admin/cases")}>목록으로 돌아가기</Button>
        </div>
      </div>
    )
  }

  const initialFormData = {
    case_number: caseData.case_number || "",
    case_name: caseData.case_name,
    deceased_name: caseData.case_data?.deceased_name || "",
    deceased_birthdate: caseData.case_data?.deceased_birthdate || "",
    deceased_address: caseData.case_data?.deceased_address || "",
    deceased_foreigner_id: caseData.case_data?.deceased_foreigner_id || "",
    incident_location: caseData.case_data?.incident_location || "",
    incident_time: caseData.case_data?.incident_time || "",
    party_a_nationality: caseData.case_data?.party_a_nationality || "",
    party_a_name: caseData.case_data?.party_a_name || "",
    party_a_birthdate: caseData.case_data?.party_a_birthdate || "",
    party_a_contact: caseData.case_data?.party_a_contact || "",
    party_a_relation: caseData.case_data?.party_a_relation || "",
    party_a_id_number: caseData.case_data?.party_a_id_number || "",
    party_a_address: caseData.case_data?.party_a_address || "",
    party_b_company_name: caseData.case_data?.party_b_company_name || "",
    party_b_representative: caseData.case_data?.party_b_representative || "",
    party_b_registration: caseData.case_data?.party_b_registration || "",
    party_b_contact: caseData.case_data?.party_b_contact || "",
    party_b_address: caseData.case_data?.party_b_address || "",
    plaintiff: caseData.case_data?.plaintiff || "",
    defendant: caseData.case_data?.defendant || "",
  }

  const goTab = (tab: TabKey) => {
    setIsEditing(false)
    setActiveTab(tab)
    router.replace(`/admin/cases/${caseId}?tab=${tab}`, { scroll: false })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/admin/cases">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              목록으로
            </Button>
          </Link>
          <div className="min-w-0">
            <h2 className="text-2xl font-bold text-secondary truncate">{caseData.case_name}</h2>
            {caseData.case_number ? (
              <p className="text-sm text-text-secondary truncate">사건번호: {caseData.case_number}</p>
            ) : (
              <p className="text-sm text-text-secondary truncate">사건번호: -</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                  goTab("data")
                }}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                수정
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 탭 */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-2">
          {(
            [
              { key: "overview" as const, label: "개요" },
              { key: "documents" as const, label: `서류 (${documents.length})` },
              { key: "data" as const, label: "데이터/당사자" },
            ] as const
          ).map((t) => {
            const active = activeTab === t.key
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => goTab(t.key)}
                className={`px-4 py-2 -mb-px border-b-2 text-sm font-medium ${
                  active
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-secondary"
                }`}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 탭 컨텐츠 */}
      {activeTab === "overview" && !isEditing && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>케이스 개요</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-text-secondary">케이스 이름</p>
                  <p className="font-semibold">{caseData.case_name}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">사건번호</p>
                  <p className="font-semibold">{caseData.case_number || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary">생성된 서류</p>
                  <p className="font-semibold">{documents.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "documents" && !isEditing && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>서류</CardTitle>
                <div className="flex items-center gap-2">
                  {documents.length > 0 && (
                    <Button
                      onClick={handleDownloadAllDocuments}
                      disabled={isDownloadingZip}
                      className="flex items-center gap-2"
                    >
                      <FileArchive className="w-4 h-4" />
                      {isDownloadingZip ? "생성 중..." : "모든 서류 ZIP 다운로드"}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <p className="text-text-secondary">연결된 서류가 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-semibold">
                          {getDocumentTypeLabel(doc.document_type, "ko")}
                        </p>
                        <p className="text-sm text-text-secondary">
                          생성일: {new Date(doc.created_at).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                      <Link href={`/admin/documents/${doc.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          열기
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "data" && (
        <div className="space-y-6">
          <CaseForm
            initialData={initialFormData}
            onSubmit={handleUpdate}
            isSubmitting={isSubmitting}
          />
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(false)
                goTab("overview")
              }}
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

