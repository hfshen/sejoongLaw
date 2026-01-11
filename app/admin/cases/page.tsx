"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Plus, Search, Calendar, FileText } from "lucide-react"
import { toast } from "@/components/ui/Toast"
import type { Case } from "@/lib/types/admin"

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchCases()
  }, [])

  const fetchCases = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/cases")
      const data = await response.json()
      if (response.ok) {
        // 새로운 API 응답 형식 지원: { success: true, data: { cases: [...] } }
        const cases = data.data?.cases || data.cases || []
        setCases(cases)
      } else {
        // 에러 응답 형식: { success: false, error: "..." } 또는 { error: "..." }
        const errorMessage = data.error || data.data?.error || "케이스 목록을 불러오는데 실패했습니다."
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
  }

  const filteredCases = cases.filter((caseItem) => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      caseItem.case_name.toLowerCase().includes(searchLower) ||
      (caseItem.case_number &&
        caseItem.case_number.toLowerCase().includes(searchLower))
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-secondary">케이스</h2>
          <p className="text-sm text-text-secondary">케이스를 검색/관리합니다.</p>
        </div>
        <Link href="/admin/cases/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            새 케이스
          </Button>
        </Link>
      </div>

        {/* 검색 */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="케이스 이름 또는 사건번호로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* 케이스 목록 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCases}>다시 시도</Button>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-text-secondary mb-4">
              {searchTerm ? "검색 결과가 없습니다." : "등록된 케이스가 없습니다."}
            </p>
            {!searchTerm && (
              <Link href="/admin/cases/new">
                <Button>첫 케이스 생성하기</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCases.map((caseItem) => (
              <Link key={caseItem.id} href={`/admin/cases/${caseItem.id}`}>
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-secondary mb-1">
                          {caseItem.case_name}
                        </h3>
                        {caseItem.case_number && (
                          <p className="text-sm text-text-secondary">
                            사건번호: {caseItem.case_number}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-text-secondary">
                      {caseItem.case_data?.deceased_name && (
                        <p>사망자: {caseItem.case_data.deceased_name}</p>
                      )}
                      {caseItem.case_data?.party_a_name && (
                        <p>유가족 대표: {caseItem.case_data.party_a_name}</p>
                      )}
                      {caseItem.case_data?.party_b_company_name && (
                        <p>가해자 회사: {caseItem.case_data.party_b_company_name}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(caseItem.created_at)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
    </div>
  )
}

