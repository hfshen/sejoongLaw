"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"

interface DocumentFiltersProps {
  onFilterChange: (filters: FilterState) => void
  onSearch: (search: string) => void
}

export interface FilterState {
  type: DocumentType | ""
  name: string
  date: string
  locale: string
  sortBy: string
  sortOrder: "asc" | "desc"
  caseLinked?: "all" | "linked" | "unlinked"
}

const documentTypes: DocumentType[] = [
  "agreement",
  "power_of_attorney",
  "attorney_appointment",
  "litigation_power",
  "insurance_consent",
  "agreement_old",
  "power_of_attorney_old",
  "attorney_appointment_old",
  "litigation_power_old",
  "insurance_consent_old",
]

export default function DocumentFilters({
  onFilterChange,
  onSearch,
}: DocumentFiltersProps) {
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
  const [showFilters, setShowFilters] = useState(false)

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      type: "",
      name: "",
      date: "",
      locale: "ko",
      sortBy: "created_at",
      sortOrder: "desc",
      caseLinked: "all",
    }
    setFilters(clearedFilters)
    setSearchTerm("")
    onFilterChange(clearedFilters)
    onSearch("")
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {/* 검색바 */}
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="이름 또는 내용으로 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <Button type="submit">검색</Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            필터
          </Button>
        </div>
      </form>

      {/* 필터 패널 */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                서류 유형
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">전체</option>
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {getDocumentTypeLabel(type, "ko")}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                이름
              </label>
              <input
                type="text"
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
                placeholder="이름으로 필터링..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                일자
              </label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => handleFilterChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                언어
              </label>
              <select
                value={filters.locale}
                onChange={(e) => handleFilterChange("locale", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="ko">한국어</option>
                <option value="en">English</option>
                <option value="zh-CN">简体中文</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                정렬 기준
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="created_at">생성일</option>
                <option value="date">일자</option>
                <option value="name">이름</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                정렬 순서
              </label>
              <select
                value={filters.sortOrder}
                onChange={(e) =>
                  handleFilterChange("sortOrder", e.target.value as "asc" | "desc")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                케이스 연결
              </label>
              <select
                value={filters.caseLinked || "all"}
                onChange={(e) =>
                  handleFilterChange("caseLinked", e.target.value as "all" | "linked" | "unlinked")
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="linked">케이스 연결됨</option>
                <option value="unlinked">케이스 미연결</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="outline" onClick={clearFilters}>
              <X className="w-4 h-4 mr-2" />
              필터 초기화
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

