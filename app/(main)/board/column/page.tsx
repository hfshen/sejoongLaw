import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export const dynamic = 'force-dynamic'

async function getColumns() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("board_posts")
    .select("*")
    .eq("category", "column")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(20)

  if (error) {
    console.error("Error fetching columns:", error)
    return []
  }

  return data || []
}

export default async function ColumnPage() {
  const columns = await getColumns()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">세중 칼럼</h1>
      {columns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">등록된 칼럼이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {columns.map((column) => (
            <Link
              key={column.id}
              href={`/board/${column.id}`}
              className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-bold text-secondary mb-2">
                {column.title}
              </h2>
              <p className="text-text-secondary line-clamp-2">
                {column.content}
              </p>
              <p className="text-sm text-text-secondary mt-4">
                {new Date(column.created_at).toLocaleDateString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

