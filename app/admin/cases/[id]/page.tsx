"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import CaseForm, { type CaseFormData } from "@/components/admin/CaseForm"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft, Edit, Download, Trash2, FileArchive } from "lucide-react"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import { toast } from "@/components/ui/Toast"
import JSZip from "jszip"
import html2canvas from "html2canvas"

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
  const caseId = params.id as string

  const [caseData, setCaseData] = useState<Case | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDownloadingZip, setIsDownloadingZip] = useState(false)

  useEffect(() => {
    if (caseId) {
      fetchCase()
    }
  }, [caseId])

  const fetchCase = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/cases/${caseId}`)
      const data = await response.json()
      if (response.ok) {
        setCaseData(data.case)
        setDocuments(data.documents || [])
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
  }

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
        toast.success("케이스 정보가 업데이트되었습니다. 연결된 서류들도 자동으로 업데이트되었습니다.")
      } else {
        const error = await response.json()
        toast.error(`케이스 업데이트 실패: ${error.error || "알 수 없는 오류가 발생했습니다."}`)
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
        toast.error(`케이스 삭제 실패: ${error.error || "알 수 없는 오류가 발생했습니다."}`)
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
        toast.error(`서류 생성 실패: ${error.error || "알 수 없는 오류가 발생했습니다."}`)
      }
    } catch (error) {
      toast.error("서류 생성 중 오류가 발생했습니다.")
    }
  }

  const generateDocumentImage = async (
    docData: any,
    docType: DocumentType,
    locale: "ko" | "en" | "zh-CN"
  ): Promise<Blob | null> => {
    try {
      // 임시 컨테이너 생성
      const tempContainer = document.createElement("div")
      tempContainer.style.position = "absolute"
      tempContainer.style.left = "-9999px"
      tempContainer.style.top = "0"
      tempContainer.style.width = "794px"
      tempContainer.style.height = "1123px"
      tempContainer.style.backgroundColor = "#ffffff"
      tempContainer.setAttribute("data-preview-id", "document-preview")
      document.body.appendChild(tempContainer)

      // React를 사용하여 DocumentPreview 렌더링
      const { createRoot } = await import("react-dom/client")
      const React = await import("react")
      const DocumentPreview = (await import("@/components/admin/DocumentPreview")).default

      const root = createRoot(tempContainer)
      await new Promise<void>((resolve) => {
        root.render(
          React.createElement(DocumentPreview, {
            documentType: docType,
            data: docData,
            locale: locale,
          })
        )
        // 렌더링 완료 대기
        setTimeout(resolve, 1000)
      })

      // 폰트 로딩 대기
      await document.fonts.ready
      await new Promise((resolve) => setTimeout(resolve, 500))

      // 이미지 로딩 대기
      const images = tempContainer.querySelectorAll("img")
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve) => {
              if (img.complete) {
                resolve(null)
              } else {
                img.onload = () => resolve(null)
                img.onerror = () => resolve(null)
                setTimeout(() => resolve(null), 5000)
              }
            })
        )
      )

      // html2canvas로 캡처
      const canvas = await html2canvas(tempContainer, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794,
        height: 1123,
      })

      // Canvas를 Blob으로 변환
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            root.unmount()
            document.body.removeChild(tempContainer)
            resolve(blob)
          },
          "image/jpeg",
          1.0
        )
      })
    } catch (error) {
      console.error("Error generating document image:", error)
      return null
    }
  }

  const handleDownloadAllDocuments = async () => {
    if (documents.length === 0) {
      toast.error("다운로드할 서류가 없습니다.")
      return
    }

    try {
      setIsDownloadingZip(true)
      toast.success("서류 이미지를 생성 중입니다. 잠시만 기다려주세요...")

      const zip = new JSZip()
      const locales: ("ko" | "en" | "zh-CN")[] = ["ko", "en", "zh-CN"]
      const localeNames = { ko: "한국어", en: "English", "zh-CN": "中文" }

      let processedCount = 0
      const totalCount = documents.length * locales.length

      // 각 문서에 대해
      for (const doc of documents) {
        // 각 언어에 대해
        for (const locale of locales) {
          try {
            // 문서 데이터 가져오기
            const docResponse = await fetch(`/api/documents/${doc.id}`)
            if (!docResponse.ok) {
              processedCount++
              continue
            }

            const docData = await docResponse.json()
            if (!docData.document) {
              processedCount++
              continue
            }

            // 이미지 생성
            const imageBlob = await generateDocumentImage(
              docData.document.data || {},
              doc.document_type,
              locale
            )

            if (imageBlob) {
              const docTypeLabel = getDocumentTypeLabel(doc.document_type, "ko")
              const fileName = `${docTypeLabel}_${localeNames[locale]}.jpg`
              zip.file(fileName, imageBlob)
            }

            processedCount++
            toast.success(`진행 중... (${processedCount}/${totalCount})`)
          } catch (error) {
            console.error(`Error generating image for document ${doc.id} (${locale}):`, error)
            processedCount++
          }
        }
      }

      // ZIP 파일 생성 및 다운로드
      const zipBlob = await zip.generateAsync({ type: "blob" })
      const url = window.URL.createObjectURL(zipBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${caseData.case_name || "case"}_documents_${new Date().toISOString().split("T")[0]}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("모든 서류가 ZIP 파일로 다운로드되었습니다.")
    } catch (error) {
      console.error("ZIP 다운로드 오류:", error)
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
              <h2 className="text-xl font-bold text-secondary">{caseData.case_name}</h2>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
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
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isEditing ? (
          <div className="space-y-6">
            <CaseForm
              initialData={initialFormData}
              onSubmit={handleUpdate}
              isSubmitting={isSubmitting}
            />
            <div className="flex justify-end gap-4">
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                취소
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 케이스 정보 표시 */}
            <Card>
              <CardHeader>
                <CardTitle>케이스 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-text-secondary">케이스 이름</p>
                    <p className="font-semibold">{caseData.case_name}</p>
                  </div>
                  {caseData.case_number && (
                    <div>
                      <p className="text-sm text-text-secondary">사건번호</p>
                      <p className="font-semibold">{caseData.case_number}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 연결된 서류 목록 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>연결된 서류 ({documents.length}개)</CardTitle>
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
      </main>
    </div>
  )
}

