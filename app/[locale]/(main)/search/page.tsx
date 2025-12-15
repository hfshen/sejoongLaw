"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import { Card, CardContent } from "@/components/ui/Card"
import SearchBar from "@/components/search/SearchBar"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [results, setResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (query) {
      setIsLoading(true)
      // Implement actual search logic
      setTimeout(() => {
        setResults([])
        setIsLoading(false)
      }, 500)
    }
  }, [query])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background section-padding">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="section-title">검색 결과</h1>
              <div className="mt-6">
                <SearchBar />
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-text-secondary">검색 중...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <h3 className="card-title mb-2">{result.title}</h3>
                      <p className="body-text">{result.description}</p>
                      <a
                        href={result.url}
                        className="text-primary font-semibold mt-4 inline-block"
                      >
                        자세히 보기 →
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : query ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-text-secondary text-lg">
                    &quot;{query}&quot;에 대한 검색 결과가 없습니다.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-text-secondary text-lg">
                    검색어를 입력해주세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

