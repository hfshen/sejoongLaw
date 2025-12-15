"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ThumbsUp, CheckCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { useLocale } from "next-intl"
import { cn } from "@/lib/utils"

interface Review {
  id: string
  author: string
  rating: number
  comment: string
  date: string
  verified: boolean
  helpful: number
}

const reviews: Review[] = [
  {
    id: "1",
    author: "김민준",
    rating: 5,
    comment: "부동산 분쟁 문제를 신속하게 해결해주셔서 감사합니다. 전문성과 친절함에 깊이 감사드립니다.",
    date: "2024-01-15",
    verified: true,
    helpful: 12,
  },
  {
    id: "2",
    author: "박선영",
    rating: 5,
    comment: "국제 이혼 소송으로 막막했는데, 세중 변호사님들의 세심한 조언과 탁월한 전략으로 좋은 결과를 얻었습니다.",
    date: "2024-01-10",
    verified: true,
    helpful: 8,
  },
  {
    id: "3",
    author: "이재현",
    rating: 5,
    comment: "기업 법률 자문은 역시 세중입니다. 항상 신뢰할 수 있는 파트너로서 든든하게 지원해주셔서 감사합니다.",
    date: "2024-01-05",
    verified: true,
    helpful: 15,
  },
]

export default function ReviewSystem() {
  const locale = useLocale()
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [name, setName] = useState("")

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length

  const handleSubmit = async () => {
    // API 호출로 리뷰 저장
    alert("리뷰가 등록되었습니다. 검토 후 게시됩니다.")
    setShowForm(false)
    setRating(0)
    setComment("")
    setName("")
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="text-center mb-12">
          <h2 className="section-title">고객 리뷰</h2>
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-5xl font-bold text-secondary">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-6 h-6",
                      star <= averageRating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <p className="text-sm text-text-secondary">
                {reviews.length}개의 리뷰
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        {showForm && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">리뷰 작성</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    평점
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className={cn(
                          "transition-colors",
                          star <= rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        )}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    이름
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="premium-input"
                    placeholder="이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    리뷰
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="premium-textarea"
                    rows={4}
                    placeholder="리뷰를 작성해주세요"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    취소
                  </Button>
                  <Button onClick={handleSubmit}>리뷰 등록</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews List */}
        <div className="space-y-6 mb-8">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-bold">
                          {review.author[0]}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{review.author}</h4>
                          {review.verified && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={cn(
                                "w-4 h-4",
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-text-secondary">
                      {review.date}
                    </span>
                  </div>
                  <p className="body-text mb-4">{review.comment}</p>
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      도움됨 ({review.helpful})
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!showForm && (
          <div className="text-center">
            <Button onClick={() => setShowForm(true)}>리뷰 작성하기</Button>
          </div>
        )}
      </div>
    </section>
  )
}

