"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface SearchResult {
  title: string
  description: string
  url: string
  category: string
}

export default function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  useEffect(() => {
    if (query.length > 2) {
      setIsLoading(true)
      // Simulate search - replace with actual search API
      setTimeout(() => {
        const mockResults: SearchResult[] = [
          {
            title: "부동산 분쟁",
            description: "부동산 관련 법률 서비스",
            url: `/${locale}/litigation/real-estate`,
            category: "소송업무",
          },
          {
            title: "이혼 소송",
            description: "이혼 및 재산분할 관련 서비스",
            url: `/${locale}/litigation/divorce`,
            category: "소송업무",
          },
        ].filter((r) =>
          r.title.toLowerCase().includes(query.toLowerCase()) ||
          r.description.toLowerCase().includes(query.toLowerCase())
        )
        setResults(mockResults)
        setIsLoading(false)
      }, 300)
    } else {
      setResults([])
    }
  }, [query, locale])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query)}`)
      setIsOpen(false)
      setQuery("")
    }
  }

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            placeholder="검색..."
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent bg-white"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                setResults([])
                inputRef.current?.focus()
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      <AnimatePresence>
        {isOpen && (query.length > 2 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-premium-lg border border-gray-200 z-50 max-h-96 overflow-y-auto"
          >
            {isLoading ? (
              <div className="p-4 text-center text-text-secondary" role="status" aria-live="polite">
                검색 중...
              </div>
            ) : results.length > 0 ? (
              <div id="search-results" className="py-2" role="listbox">
                {results.map((result, index) => (
                  <a
                    key={index}
                    href={result.url}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors focus-ring rounded"
                    onClick={() => setIsOpen(false)}
                    role="option"
                    tabIndex={0}
                  >
                    <div className="font-semibold text-secondary mb-1">
                      {result.title}
                    </div>
                    <div className="text-sm text-text-secondary mb-1">
                      {result.description}
                    </div>
                    <div className="text-xs text-text-muted">{result.category}</div>
                  </a>
                ))}
                <div className="border-t border-gray-200 px-4 py-2">
                  <button
                    onClick={handleSubmit}
                    className="text-sm text-primary font-semibold w-full text-left"
                  >
                    전체 결과 보기
                  </button>
                </div>
              </div>
            ) : query.length > 2 ? (
              <div className="p-4 text-center text-text-secondary">
                검색 결과가 없습니다.
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

