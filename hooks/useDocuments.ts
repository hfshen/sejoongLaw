// 문서 관련 커스텀 훅

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/Toast"
import type { DocumentType } from "@/lib/documents/templates"
import type { DocumentData } from "@/lib/types/documents"

interface Document {
  id: string
  document_type: DocumentType
  name: string
  date: string
  locale: string
  data: DocumentData
  case_id: string | null
  is_case_linked: boolean
  created_at: string
  updated_at: string
}

interface UseDocumentsOptions {
  documentType?: DocumentType
  name?: string
  date?: string
  locale?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  caseLinked?: boolean
}

export function useDocuments(options: UseDocumentsOptions = {}) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (options.documentType) params.append("type", options.documentType)
      if (options.name) params.append("name", options.name)
      if (options.date) params.append("date", options.date)
      params.append("locale", options.locale || "ko")
      params.append("sortBy", options.sortBy || "created_at")
      params.append("sortOrder", options.sortOrder || "desc")
      if (options.search) params.append("search", options.search)
      if (options.caseLinked !== undefined) {
        params.append("case_linked", options.caseLinked ? "true" : "false")
      }

      const response = await fetch(`/api/documents?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setDocuments(data.documents || [])
      } else {
        const errorMessage = data.error || "서류 목록을 불러오는데 실패했습니다."
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = "서류 목록을 불러오는 중 오류가 발생했습니다."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options])

  return { documents, loading, error, fetchDocuments }
}

