import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getBoardPosts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("board_posts")
    .select("*")
    .eq("category", "cases")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(10)

  if (error) {
    console.error("Error fetching board posts:", error)
    return []
  }

  return data || []
}

export default async function BoardPage() {
  const posts = await getBoardPosts()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">최근업무사례</h1>
      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            등록된 업무사례가 없습니다.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-secondary mb-2">
                {post.title}
              </h2>
              <p className="text-text-secondary line-clamp-2">
                {post.content}
              </p>
              <p className="text-sm text-text-secondary mt-4">
                {new Date(post.created_at).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

