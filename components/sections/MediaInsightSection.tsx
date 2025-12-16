"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileText, Award, Newspaper, ArrowRight } from "lucide-react"
import Link from "next/link"

interface MediaArticle {
  id: string
  type: "column" | "case" | "news"
  title: string
  excerpt?: string
  published_at: string | null
  author_id: string | null
  view_count: number
}

export default function MediaInsightSection() {
  const t = useTranslations()
  const locale = useLocale()
  const [activeTab, setActiveTab] = useState<"column" | "case" | "news">("column")
  const [articles, setArticles] = useState<MediaArticle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchArticles() {
      try {
        // 환경 변수 확인
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.warn("Supabase credentials not configured")
          setArticles([])
          setLoading(false)
          return
        }

        const supabase = createClient()
        
        // 먼저 메인 아티클 조회
        const { data: articlesData, error: articlesError } = await supabase
          .from("media_articles")
          .select("id, type, published_at, author_id, view_count")
          .eq("type", activeTab)
          .order("published_at", { ascending: false })
          .limit(6)

        if (articlesError) {
          console.error("Error fetching articles:", articlesError)
          setArticles([])
          setLoading(false)
          return
        }

        if (!articlesData || articlesData.length === 0) {
          setArticles([])
          setLoading(false)
          return
        }

        // 각 아티클의 i18n 콘텐츠 조회
        const articleIds = articlesData.map((a) => a.id)
        const { data: i18nData, error: i18nError } = await supabase
          .from("media_articles_i18n")
          .select("article_id, title, excerpt")
          .in("article_id", articleIds)
          .eq("locale", locale)

        if (i18nError) {
          console.error("Error fetching i18n content:", i18nError)
          setArticles([])
          setLoading(false)
          return
        }

        // 데이터 병합
        const i18nMap = new Map(
          (i18nData || []).map((item) => [item.article_id, item])
        )

        const transformedArticles = articlesData.map((article) => {
          const i18n = i18nMap.get(article.id)
          return {
            id: article.id,
            type: article.type,
            title: i18n?.title || "",
            excerpt: i18n?.excerpt || "",
            published_at: article.published_at,
            author_id: article.author_id,
            view_count: article.view_count || 0,
          }
        })

        setArticles(transformedArticles)
        setLoading(false)
      } catch (error) {
        console.error("Error in fetchArticles:", error)
        setArticles([])
        setLoading(false)
      }
    }

    fetchArticles()
  }, [activeTab, locale])

  const tabs = [
    { key: "column" as const, label: t("media.column"), icon: <FileText className="w-5 h-5" /> },
    { key: "case" as const, label: t("media.case"), icon: <Award className="w-5 h-5" /> },
    { key: "news" as const, label: t("media.news"), icon: <Newspaper className="w-5 h-5" /> },
  ]

  return (
    <section className="section-padding bg-background-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{t("media.title")}</h2>
        </motion.div>

        {/* 탭 네비게이션 */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white rounded-lg p-1 shadow-md">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-md font-medium transition-all
                  ${
                    activeTab === tab.key
                      ? "bg-primary text-white shadow-sm"
                      : "text-text-secondary hover:text-secondary"
                  }
                `}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 아티클 그리드 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">로딩 중...</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">
              {t("media.noArticles", { defaultValue: "콘텐츠가 없습니다." })}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/${locale}/board/${article.id}`}>
                  <Card hover className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge
                          variant={
                            article.type === "column"
                              ? "primary"
                              : article.type === "case"
                              ? "success"
                              : "info"
                          }
                          className="text-xs"
                        >
                          {tabs.find((t) => t.key === article.type)?.label}
                        </Badge>
                        {article.view_count > 0 && (
                          <span className="text-xs text-text-secondary">
                            조회 {article.view_count}
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-secondary mb-3 line-clamp-2">
                        {article.title}
                      </h3>

                      {article.excerpt && (
                        <p className="text-sm text-text-secondary mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}

                      {article.published_at && (
                        <p className="text-xs text-text-secondary mb-4">
                          {new Date(article.published_at).toLocaleDateString(
                            locale === "ko" ? "ko-KR" : "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      )}

                      <div className="flex items-center text-primary font-medium text-sm mt-auto">
                        {t("media.readMore")}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* 더보기 링크 */}
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/board/${activeTab === "column" ? "column" : activeTab === "case" ? "news" : "news"}`}
            className="inline-flex items-center gap-2 text-primary font-medium hover:text-accent transition-colors"
          >
            {t("common.viewAll", { defaultValue: "전체 보기" })}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

