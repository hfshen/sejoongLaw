"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useLocale } from "next-intl"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface CaseStudy {
  id: string
  title: string
  category: string
  description: string
  result: string
  image?: string
}

const caseStudies: CaseStudy[] = [
  {
    id: "1",
    title: "부동산 분쟁 소송 승소",
    category: "부동산",
    description: "복잡한 부동산 계약 분쟁에서 고객의 권리를 보호하고 승소를 이끌어냈습니다.",
    result: "배상금 50% 증가, 소송 기간 30% 단축",
  },
  {
    id: "2",
    title: "이혼 재산분할 성공",
    category: "이혼",
    description: "공정한 재산분할을 통해 고객의 권익을 최대한 보호했습니다.",
    result: "고객 만족도 95%, 재산분할 합의 성공",
  },
  {
    id: "3",
    title: "비자 거절 재신청 성공",
    category: "비자",
    description: "비자 거절 후 재신청을 통해 성공적으로 비자를 발급받았습니다.",
    result: "재신청 성공률 100%, 처리 기간 단축",
  },
  {
    id: "4",
    title: "기업 M&A 법률 자문",
    category: "기업자문",
    description: "대규모 기업 인수합병(M&A) 과정에서 전문적인 법률 자문을 제공했습니다.",
    result: "거래 성공, 법적 리스크 최소화",
  },
]

const categories = ["전체", "부동산", "이혼", "비자", "기업자문"]

export default function CaseStudiesSection() {
  const locale = useLocale()
  const [selectedCategory, setSelectedCategory] = useState("전체")

  const filteredCases =
    selectedCategory === "전체"
      ? caseStudies
      : caseStudies.filter((c) => c.category === selectedCategory)

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">성공 사례</h2>
          <p className="body-text max-w-2xl mx-auto">
            법무법인 세중의 전문성과 노하우로 만들어낸 성공 사례를 확인해보세요.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCases.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/${locale}/cases/${caseStudy.id}`}>
                <Card hover className="h-full flex flex-col">
                  <CardHeader>
                    <Badge variant="primary" className="mb-3">
                      {caseStudy.category}
                    </Badge>
                    <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardDescription className="mb-4">
                      {caseStudy.description}
                    </CardDescription>
                    <div className="bg-primary/5 p-3 rounded-lg">
                      <p className="text-sm font-semibold text-primary">
                        {caseStudy.result}
                      </p>
                    </div>
                  </CardContent>
                  <div className="p-6 pt-0">
                    <div className="flex items-center text-primary font-semibold">
                      자세히 보기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/${locale}/cases`}
            className="premium-button-outline inline-flex items-center"
          >
            모든 사례 보기
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

