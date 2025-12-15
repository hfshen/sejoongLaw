import Link from "next/link"

export const dynamic = 'force-dynamic'

export default function HomePage() {
  const branches = [
    {
      name: "본사",
      path: "/headquarter",
      description: "서울시 서초구 서초대로 272, 10층",
    },
    {
      name: "의정부 지점",
      path: "/uijeongbu",
      description: "의정부 이혼/상속 전문센터",
    },
    {
      name: "안산 지점",
      path: "/ansan",
      description: "안산 변호사업 관련 서비스",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-secondary mb-4">
            법무법인 세중
          </h1>
          <p className="text-xl text-text-secondary">
            SEJOONG LAW FIRM
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {branches.map((branch) => (
            <Link
              key={branch.path}
              href={branch.path}
              className="group bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors">
                {branch.name}
              </h2>
              <p className="text-text-secondary">{branch.description}</p>
              <div className="mt-6 text-primary font-medium group-hover:underline">
                자세히 보기 →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

