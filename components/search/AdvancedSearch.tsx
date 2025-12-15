"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, Filter, X, Save } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  url: string
}

const searchResults: SearchResult[] = [
  {
    id: "1",
    title: "부동산 분쟁 해결",
    description: "부동산 매매, 임대차 관련 분쟁 해결 서비스",
    category: "소송업무",
    tags: ["부동산", "분쟁"],
    url: "/ko/litigation/real-estate",
  },
  {
    id: "2",
    title: "이혼 소송 절차",
    description: "이혼 소송의 전반적인 절차와 준비 서류 안내",
    category: "소송업무",
    tags: ["이혼", "소송"],
    url: "/ko/litigation/divorce",
  },
  {
    id: "3",
    title: "비자 신청 가이드",
    description: "한국 체류를 위한 비자 신청 절차와 필요 서류",
    category: "외국인센터",
    tags: ["비자", "신청"],
    url: "/ko/foreigner/visa",
  },
]

const categories = ["전체", "소송업무", "기업자문", "외국인센터", "해외이주"]
const regions = ["전체", "서울", "경기", "인천", "부산"]

export default function AdvancedSearch() {
  const locale = useLocale()
  const [query, setQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [selectedRegion, setSelectedRegion] = useState("전체")
  const [savedSearches, setSavedSearches] = useState<string[]>([])

  const filteredResults = useMemo(() => {
    return searchResults.filter((result) => {
      const matchesQuery =
        query === "" ||
        result.title.toLowerCase().includes(query.toLowerCase()) ||
        result.description.toLowerCase().includes(query.toLowerCase()) ||
        result.tags.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
      const matchesCategory =
        selectedCategory === "전체" || result.category === selectedCategory
      return matchesQuery && matchesCategory
    })
  }, [query, selectedCategory])

  const saveSearch = () => {
    if (query && !savedSearches.includes(query)) {
      setSavedSearches([...savedSearches, query])
      localStorage.setItem("savedSearches", JSON.stringify([...savedSearches, query]))
    }
  }

  return (
    <div className="container-max section-padding">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="section-title">고급 검색</h1>
          <p className="body-text">
            원하시는 정보를 빠르게 찾아보세요.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-12 pr-32 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
              <button
                onClick={saveSearch}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="검색 저장"
              >
                <Save className="w-5 h-5 text-text-secondary" />
              </button>
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              카테고리
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedCategory === category
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              지역
            </label>
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    selectedRegion === region
                      ? "bg-primary text-white"
                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                  )}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {filteredResults.map((result, index) => (
            <motion.div
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card hover>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {result.category}
                        </span>
                        {result.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-bold text-lg text-secondary mb-2">
                        {result.title}
                      </h3>
                      <p className="body-text mb-4">{result.description}</p>
                      <a
                        href={result.url}
                        className="text-primary hover:underline font-medium"
                      >
                        자세히 보기 →
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredResults.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-text-secondary">
                검색 결과가 없습니다. 다른 키워드로 검색해보세요.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

