import { createClient } from "@/lib/supabase/server"

async function getStats() {
  const supabase = await createClient()
  const [
    { count: inquiriesCount },
    { count: postsCount },
    { count: membersCount },
    { count: newsCount },
  ] = await Promise.all([
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("board_posts")
      .select("*", { count: "exact", head: true }),
    supabase.from("members").select("*", { count: "exact", head: true }),
    supabase.from("news_articles").select("*", { count: "exact", head: true }),
  ])

  return {
    inquiries: inquiriesCount || 0,
    posts: postsCount || 0,
    members: membersCount || 0,
    news: newsCount || 0,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">관리자 대시보드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">
            문의사항
          </h2>
          <p className="text-3xl font-bold text-primary">{stats.inquiries}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">
            게시글
          </h2>
          <p className="text-3xl font-bold text-primary">{stats.posts}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">
            구성원
          </h2>
          <p className="text-3xl font-bold text-primary">{stats.members}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-secondary mb-2">뉴스</h2>
          <p className="text-3xl font-bold text-primary">{stats.news}</p>
        </div>
      </div>
    </div>
  )
}

