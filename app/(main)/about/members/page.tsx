import { createClient } from "@/lib/supabase/server"
import Image from "next/image"

async function getMembers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Error fetching members:", error)
    return []
  }

  return data || []
}

export default async function MembersPage() {
  const members = await getMembers()

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-12">구성원소개</h1>
      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">
            구성원 정보가 등록되지 않았습니다.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                          width={128}
                          height={128}
                          className="w-32 h-32 rounded-full mx-auto object-cover"
                        />
                      </div>
                    )}
              <h2 className="text-2xl font-bold text-secondary mb-2">
                {member.name}
              </h2>
              {member.position && (
                <p className="text-primary font-medium mb-4">
                  {member.position}
                </p>
              )}
              {member.introduction && (
                <p className="text-text-secondary mb-4">
                  {member.introduction}
                </p>
              )}
              {member.specialties && member.specialties.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold text-secondary mb-2">전문분야</h3>
                  <ul className="list-disc list-inside text-text-secondary">
                    {member.specialties.map((specialty: string, index) => (
                      <li key={index}>{specialty}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

