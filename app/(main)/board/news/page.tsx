import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

async function getNews() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("news_articles")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching news:", error)
    return []
  }

  return data || []
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">최신뉴스</h1>
      {news.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">등록된 뉴스가 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {news.map((article) => (
            <div
              key={article.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-secondary mb-2">
                {article.title}
              </h2>
              {article.content && (
                <p className="text-text-secondary line-clamp-2 mb-4">
                  {article.content}
                </p>
              )}
              <div className="flex justify-between items-center">
                {article.source && (
                  <p className="text-sm text-text-secondary">출처: {article.source}</p>
                )}
                {article.published_at && (
                  <p className="text-sm text-text-secondary">
                    {new Date(article.published_at).toLocaleDateString("ko-KR")}
                  </p>
                )}
              </div>
              {article.url && (
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline mt-2 inline-block"
                >
                  원문 보기 →
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

