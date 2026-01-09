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

export default function EditDocumentPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = params.id as string
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locale, setLocale] = useState<"ko" | "en" | "zh-CN">(
    (searchParams.get("locale") as "ko" | "en" | "zh-CN") || "ko"
  )

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/documents/${id}`)
        const data = await response.json()
        if (response.ok) {
          setDocument(data.document)
          if (data.document.locale) {
            setLocale(data.document.locale)
          }
        } else {
          const errorMessage = data.error || "서류를 찾을 수 없습니다."
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

  const handleLocaleChange = (newLocale: "ko" | "en" | "zh-CN") => {
    setLocale(newLocale)
    router.push(`/admin/documents/${id}?locale=${newLocale}`, { scroll: false })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h2 className="text-xl font-bold text-secondary">서류 관리 시스템</h2>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <DocumentForm
          documentId={id}
          documentType={document.document_type as DocumentType}
          initialData={document}
          locale={locale}
          onLocaleChange={handleLocaleChange}
        />
      </main>
    </div>
  )
}
