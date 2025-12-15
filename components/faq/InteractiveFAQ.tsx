"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, Video, ThumbsUp, ThumbsDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { cn } from "@/lib/utils"

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  videoUrl?: string
  helpful?: number
  notHelpful?: number
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "상담 신청은 어떻게 하나요?",
    answer:
      "상담 신청은 웹사이트의 '무료 상담 신청' 페이지에서 온라인으로 가능하며, 전화(02) 591-0372)로도 직접 연락하실 수 있습니다. 온라인 예약 시스템을 통해 원하시는 날짜와 시간에 상담을 예약하실 수도 있습니다.",
    category: "일반",
    tags: ["상담", "예약"],
  },
  {
    id: "2",
    question: "수수료는 얼마인가요?",
    answer:
      "수수료는 사건의 복잡도, 소요 시간, 전문 분야에 따라 다릅니다. 초기 상담은 무료로 제공되며, 상담을 통해 정확한 견적을 안내해드립니다. 투명한 수수료 체계를 운영하고 있습니다.",
    category: "수수료",
    tags: ["수수료", "비용"],
  },
  {
    id: "3",
    question: "어떤 법률 서비스를 제공하나요?",
    answer:
      "법무법인 세중은 부동산 분쟁, 이혼 소송, 상속 분쟁, 비자 신청, 기업 자문 등 다양한 법률 서비스를 제공합니다. 각 분야별 전문 변호사가 최상의 서비스를 제공합니다.",
    category: "서비스",
    tags: ["서비스", "업무"],
  },
  {
    id: "4",
    question: "온라인 상담이 가능한가요?",
    answer:
      "네, 온라인 화상 상담이 가능합니다. 예약 시 '온라인 상담'을 선택하시면 화상 통화 링크가 이메일로 발송됩니다. 방문이 어려우신 경우 온라인 상담을 이용하실 수 있습니다.",
    category: "상담",
    tags: ["온라인", "화상"],
  },
  {
    id: "5",
    question: "상담 시간은 언제인가요?",
    answer:
      "상담 시간은 평일 오전 9시부터 오후 6시까지입니다. 온라인 예약 시스템을 통해 24시간 언제든지 상담을 예약하실 수 있으며, 긴급한 경우 전화로 문의해주세요.",
    category: "일반",
    tags: ["시간", "영업"],
  },
  {
    id: "6",
    question: "이혼 소송은 얼마나 걸리나요?",
    answer:
      "이혼 소송 기간은 사건의 복잡도와 당사자 간 합의 여부에 따라 다릅니다. 일반적으로 합의 이혼의 경우 1-2개월, 재판 이혼의 경우 6개월에서 1년 정도 소요됩니다.",
    category: "이혼",
    tags: ["이혼", "소송"],
  },
]

const categories = ["전체", "일반", "수수료", "서비스", "상담", "이혼"]

export default function InteractiveFAQ() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("전체")
  const [openFAQ, setOpenFAQ] = useState<string | null>(null)
  const [helpfulFeedback, setHelpfulFeedback] = useState<Record<string, boolean>>({})

  const filteredFAQs = useMemo(() => {
    return faqs.filter((faq) => {
      const matchesCategory =
        selectedCategory === "전체" || faq.category === selectedCategory
      const matchesSearch =
        searchQuery === "" ||
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesCategory && matchesSearch
    })
  }, [searchQuery, selectedCategory])

  const handleHelpful = (faqId: string, isHelpful: boolean) => {
    setHelpfulFeedback((prev) => ({ ...prev, [faqId]: isHelpful }))
    // 실제로는 API 호출로 피드백 저장
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">자주 묻는 질문</h2>
          <p className="body-text max-w-2xl mx-auto">
            법무법인 세중에 대해 자주 묻는 질문과 답변을 확인하세요.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="질문을 검색하세요..."
              className="w-full pl-12 pr-4 py-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-6 py-2 rounded-full font-medium transition-all",
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="max-w-4xl mx-auto space-y-4">
          <AnimatePresence>
            {filteredFAQs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <button
                      onClick={() =>
                        setOpenFAQ(openFAQ === faq.id ? null : faq.id)
                      }
                      className="w-full text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="default">{faq.category}</Badge>
                            {faq.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs text-text-secondary bg-gray-100 px-2 py-1 rounded"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="font-bold text-lg text-secondary mb-2">
                            {faq.question}
                          </h3>
                        </div>
                        <ChevronDown
                          className={cn(
                            "w-5 h-5 text-text-secondary transition-transform flex-shrink-0",
                            openFAQ === faq.id && "transform rotate-180"
                          )}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {openFAQ === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-gray-200 mt-4">
                            <p className="body-text mb-4">{faq.answer}</p>
                            {faq.videoUrl && (
                              <div className="mb-4">
                                <a
                                  href={faq.videoUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-primary hover:underline"
                                >
                                  <Video className="w-4 h-4" />
                                  관련 영상 보기
                                </a>
                              </div>
                            )}
                            <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                              <span className="text-sm text-text-secondary">
                                이 답변이 도움이 되셨나요?
                              </span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleHelpful(faq.id, true)}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    helpfulFeedback[faq.id] === true
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                  )}
                                  aria-label="도움됨"
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleHelpful(faq.id, false)}
                                  className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    helpfulFeedback[faq.id] === false
                                      ? "bg-red-100 text-red-700"
                                      : "bg-gray-100 text-text-secondary hover:bg-gray-200"
                                  )}
                                  aria-label="도움 안됨"
                                >
                                  <ThumbsDown className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredFAQs.length === 0 && (
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
    </section>
  )
}

