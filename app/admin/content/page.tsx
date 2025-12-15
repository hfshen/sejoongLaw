import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

async function getPageContents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("page_contents")
    .select("*")
    .order("section", { ascending: true })
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching page contents:", error)
    return []
  }

  return data || []
}

export default async function AdminContentPage() {
  const contents = await getPageContents()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">콘텐츠 관리</h1>
        <Link
          href="/admin/content/new"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          새 콘텐츠 추가
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                경로
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                제목
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                섹션
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                지점
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contents.map((content) => (
              <tr key={content.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {content.route_path}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link
                    href={`/admin/content/${content.id}`}
                    className="text-primary hover:underline"
                  >
                    {content.title}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {content.section || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {content.branch || "all"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(content.updated_at).toLocaleDateString("ko-KR")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <Link
                    href={`/admin/content/${content.id}`}
                    className="text-primary hover:underline"
                  >
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

