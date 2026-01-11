// 케이스 관련 커스텀 훅

import { useState, useCallback } from "react"
import { toast } from "@/components/ui/Toast"
import type { CaseData } from "@/lib/types/admin"

interface Case {
  id: string
  case_number: string | null
  case_name: string
  case_data: CaseData
  created_at: string
  updated_at: string
}

interface UseCasesOptions {
  caseNumber?: string
  caseName?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
}

export function useCases(options: UseCasesOptions = {}) {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCases = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (options.caseNumber) params.append("case_number", options.caseNumber)
      if (options.caseName) params.append("case_name", options.caseName)
      params.append("sortBy", options.sortBy || "created_at")
      params.append("sortOrder", options.sortOrder || "desc")
      if (options.search) params.append("search", options.search)

      const response = await fetch(`/api/cases?${params.toString()}`)
      const data = await response.json()

      if (response.ok) {
        setCases(data.cases || [])
      } else {
        const errorMessage = data.error || "케이스 목록을 불러오는데 실패했습니다."
        setError(errorMessage)
        toast.error(errorMessage)
      }
    } catch (error) {
      const errorMessage = "케이스 목록을 불러오는 중 오류가 발생했습니다."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [options])

  return { cases, loading, error, fetchCases }
}

