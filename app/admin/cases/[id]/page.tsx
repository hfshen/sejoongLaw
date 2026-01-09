"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import CaseForm from "@/components/admin/CaseForm"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { ArrowLeft, Edit, Download, Trash2 } from "lucide-react"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import { toast } from "@/components/ui/Toast"

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
                <CardTitle>연결된 서류 ({documents.length}개)</CardTitle>
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

