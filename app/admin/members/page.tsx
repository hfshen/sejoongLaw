import { createClient } from "@/lib/supabase/server"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"

async function getMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    return []
  }

  return data || []
}

export default async function AdminMembersPage() {
  const isAdmin = await isAdminAuthenticated()
  
  if (!isAdmin) {
    redirect("/admin/login")
  }
  const members = await getMembers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-secondary">구성원 관리</h1>
        <Link
          href="/admin/members/new"
          className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          새 구성원 추가
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            {member.profile_image_url && (
              <div className="mb-4">
                <Image
                  src={member.profile_image_url}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-full mx-auto object-cover"
                />
              </div>
            )}
            <h2 className="text-xl font-bold text-secondary mb-2">
              {member.name}
            </h2>
            {member.position && (
              <p className="text-primary font-medium mb-2">
                {member.position}
              </p>
            )}
            <Link
              href={`/admin/members/${member.id}`}
              className="text-primary hover:underline text-sm"
            >
              수정
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

