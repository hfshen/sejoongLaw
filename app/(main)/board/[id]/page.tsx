import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

async function getPost(id: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 관리자만 조회 가능
  if (!user) {
    return null
  }

  const { data: admin } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (!admin) {
    return null
  }

  const { data, error } = await supabase
    .from("board_posts")
    .select("*, profiles(name, email)")
    .eq("id", id)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function BoardPostPage({
  params,
}: {
  params: { id: string }
}) {
  const post = await getPost(params.id)

  if (!post) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">{post.title}</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <p className="text-sm text-text-secondary">
            작성자: {post.profiles?.name || post.profiles?.email || "익명"}
          </p>
          <p className="text-sm text-text-secondary">
            작성일: {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>
        <div className="prose prose-lg max-w-none">
          <p className="whitespace-pre-wrap text-text-secondary">
            {post.content}
          </p>
        </div>
      </div>
    </div>
  )
}

