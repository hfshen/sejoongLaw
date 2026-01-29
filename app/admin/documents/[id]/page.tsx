"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import DocumentForm from "@/components/admin/DocumentForm"
import { type DocumentType } from "@/lib/documents/templates"
import { Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/Toast"
import type { Document } from "@/lib/types/admin"
import Button from "@/components/ui/Button"
import DocumentViewer from "@/components/workflow/DocumentViewer"
import ApprovalPanel from "@/components/workflow/ApprovalPanel"
import AuditTrail from "@/components/workflow/AuditTrail"
import ExportButton from "@/components/workflow/ExportButton"
import Tabs from "@/components/ui/Tabs"

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [caseName, setCaseName] = useState<string>("")
  const [locale, setLocale] = useState<"ko" | "en" | "zh-CN" | "si" | "ta">(
    (searchParams.get("locale") as "ko" | "en" | "zh-CN" | "si" | "ta") || "ko"
  )
  const [currentVersionId, setCurrentVersionId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"edit" | "workflow">("edit")

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/documents/${id}`)
        const data = await response.json()
        if (response.ok) {
          // 새로운 API 응답 형식 지원: { success: true, data: { document: {...} } }
          const responseData = data.data || data
          const document = responseData.document
          setDocument(document)
          if (document?.locale) {
            setLocale(document.locale)
          }

          // Get current version ID if available
          if (document?.current_version_id) {
            setCurrentVersionId(document.current_version_id)
          } else {
            // Try to get the latest version
            try {
              const versionsRes = await fetch(`/api/documents/${id}/versions`)
              const versionsData = await versionsRes.json()
              if (versionsData.success && versionsData.data?.versions?.length > 0) {
                const latestVersion = versionsData.data.versions[0]
                setCurrentVersionId(latestVersion.id)
              }
            } catch {
              // Ignore error
            }
          }

          // 케이스 연결 서류라면 케이스 이름을 추가로 가져와서 name을 고정시키기 위해 사용
          if (document?.is_case_linked && document?.case_id) {
            try {
              const caseRes = await fetch(`/api/cases/${document.case_id}`)
              const caseJson = await caseRes.json()
              const payload = caseJson?.data ?? caseJson
              const caseRecord = payload?.case
              setCaseName(caseRecord?.case_name || "")
            } catch {
              setCaseName("")
            }
          } else {
            setCaseName("")
          }
        } else {
          // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
          const errorMessage = data.error || data.data?.error || "서류를 찾을 수 없습니다."
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (error) {
        const errorMessage = "서류를 불러오는 중 오류가 발생했습니다."
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchDocument()
    }
  }, [id])

  // Refresh document data when tab changes to workflow
  useEffect(() => {
    if (activeTab === "workflow" && id && !currentVersionId && document) {
      // Try to fetch versions again
      const fetchVersions = async () => {
        try {
          const versionsRes = await fetch(`/api/documents/${id}/versions`)
          const versionsData = await versionsRes.json()
          
          if (versionsData.success && versionsData.data?.versions?.length > 0) {
            const latestVersion = versionsData.data.versions[0]
            setCurrentVersionId(latestVersion.id)
            
            // Update document's current_version_id if not set
            if (!(document as any).current_version_id) {
              const updateRes = await fetch(`/api/documents/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  document_type: document.document_type,
                  name: document.name,
                  date: document.date,
                  data: document.data,
                  locale: document.locale,
                }),
              })
              if (updateRes.ok) {
                // Refresh document data
                const docRes = await fetch(`/api/documents/${id}`)
                const docData = await docRes.json()
                if (docData.success || docData.data?.document) {
                  const updatedDoc = docData.data?.document || docData.document
                  setDocument(updatedDoc)
                  if (updatedDoc.current_version_id) {
                    setCurrentVersionId(updatedDoc.current_version_id)
                  }
                }
              }
            }
          } else {
            // No versions found - trigger version creation by updating document
            // This will automatically create a version
            try {
              const updateRes = await fetch(`/api/documents/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  document_type: document.document_type,
                  name: document.name,
                  date: document.date,
                  data: document.data,
                  locale: document.locale,
                }),
              })
              
              if (updateRes.ok) {
                // Wait a bit and refresh
                setTimeout(async () => {
                  const docRes = await fetch(`/api/documents/${id}`)
                  const docData = await docRes.json()
                  if (docData.success || docData.data?.document) {
                    const updatedDoc = docData.data?.document || docData.document
                    setDocument(updatedDoc)
                    if (updatedDoc.current_version_id) {
                      setCurrentVersionId(updatedDoc.current_version_id)
                    } else {
                      // Try fetching versions again
                      const versionsRes2 = await fetch(`/api/documents/${id}/versions`)
                      const versionsData2 = await versionsRes2.json()
                      if (versionsData2.success && versionsData2.data?.versions?.length > 0) {
                        const latestVersion = versionsData2.data.versions[0]
                        setCurrentVersionId(latestVersion.id)
                      }
                    }
                  }
                }, 1000)
              }
            } catch (error) {
              console.error("Failed to create version:", error)
            }
          }
        } catch (error) {
          console.error("Failed to fetch versions:", error)
        }
      }
      fetchVersions()
    }
  }, [activeTab, id, currentVersionId, document])

  const handleLocaleChange = (newLocale: "ko" | "en" | "zh-CN" | "si" | "ta") => {
    setLocale(newLocale)
    router.push(`/admin/documents/${id}?locale=${newLocale}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary mb-2">
            {error || "서류를 찾을 수 없습니다"}
          </h2>
          <Button onClick={() => router.push("/admin/documents")}>
            목록으로 돌아가기
          </Button>
        </div>
      </div>
    )
  }

  const tabs = [
    {
      id: "edit",
      label: "문서 편집",
      content: (
        <DocumentForm
          documentId={id}
          documentType={document.document_type as DocumentType}
          initialData={document}
          isCaseLinked={document.is_case_linked}
          caseName={caseName}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
      ),
    },
    {
      id: "workflow",
      label: "워크플로우",
      content: currentVersionId ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">문서 워크플로우</h2>
            <ExportButton documentId={id} versionId={currentVersionId} />
          </div>
          <DocumentViewer documentId={id} versionId={currentVersionId} />
          <ApprovalPanel documentId={id} versionId={currentVersionId} />
          {document.case_id && <AuditTrail caseId={document.case_id} />}
        </div>
      ) : (
        <div className="p-6 text-center text-gray-500">
          <p>문서 버전이 없습니다. 먼저 문서를 저장하여 버전을 생성하세요.</p>
        </div>
      ),
    },
  ]

  return (
    <div>
      {document.is_case_linked && document.case_id && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-800">
                이 서류는 케이스와 연결되어 있습니다. 케이스 정보가 변경되면 자동으로 업데이트됩니다.
              </p>
            </div>
            <Link href={`/admin/cases/${document.case_id}`}>
              <Button variant="outline" size="sm">
                케이스 보기
              </Button>
            </Link>
          </div>
        </div>
      )}
      <Tabs tabs={tabs} defaultTab="edit" />
    </div>
  )
}
