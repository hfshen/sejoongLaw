"use client"

import { useEffect, useState, useMemo, useCallback, useRef } from "react"
import DocumentCard from "./DocumentCard"
import DocumentFilters, { type FilterState } from "./DocumentFilters"
import { Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import { type DocumentType } from "@/lib/documents/templates"
import { toast } from "@/components/ui/Toast"

interface Document {
  id: string
  document_type: DocumentType
  name: string
  date: string
  locale: string
  case_id: string | null
  is_case_linked: boolean
  created_at: string
}

export default function DocumentList() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    type: "",
    name: "",
    date: "",
    locale: "ko",
    sortBy: "created_at",
    sortOrder: "desc",
    caseLinked: "all",
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 검색어 debounce (300ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm])

  const fetchDocuments = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters.type) params.append("type", filters.type)
      if (filters.name) params.append("name", filters.name)
      if (filters.date) params.append("date", filters.date)
      params.append("locale", filters.locale)
      params.append("sortBy", filters.sortBy)
      params.append("sortOrder", filters.sortOrder)
      if (filters.caseLinked && filters.caseLinked !== "all") {
        params.append("case_linked", filters.caseLinked === "linked" ? "true" : "false")
      }
      if (debouncedSearchTerm) params.append("search", debouncedSearchTerm)

      const response = await fetch(`/api/documents?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        // 새로운 API 응답 형식 지원: { success: true, data: { documents: [...] } }
        const documents = data.data?.documents || data.documents || []
        setDocuments(documents)
      } else {
        // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
        const errorMessage = data.error || data.data?.error || "서류 목록을 불러오는데 실패했습니다."
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
  }, [filters, debouncedSearchTerm])

  useEffect(() => {
    fetchDocuments()
  }, [fetchDocuments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary mb-2">문서함(전체)</h1>
          <p className="text-text-secondary">
            총 {documents.length}개의 문서가 등록되어 있습니다.
          </p>
        </div>
        <Link href="/admin/documents/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            새 서류 작성
          </Button>
        </Link>
      </div>

      <DocumentFilters
        onFilterChange={setFilters}
        onSearch={setSearchTerm}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchDocuments}>다시 시도</Button>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-text-secondary mb-4">등록된 서류가 없습니다.</p>
          <Link href="/admin/documents/new">
            <Button>첫 서류 작성하기</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              id={doc.id}
              documentType={doc.document_type}
              name={doc.name}
              date={doc.date}
              locale={doc.locale}
              isCaseLinked={doc.is_case_linked}
              caseId={doc.case_id}
              createdAt={doc.created_at}
            />
          ))}
        </div>
      )}
    </div>
  )
}

