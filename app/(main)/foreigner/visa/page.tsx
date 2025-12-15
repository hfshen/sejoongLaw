import Link from "next/link"

export default function ForeignerVisaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">사증(VISA)</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/foreigner/visa/certificate"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold text-secondary mb-2">
            사증발급인정서
          </h2>
        </Link>
        <Link
          href="/foreigner/visa/types"
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-bold text-secondary mb-2">
            사증종류별 대상자
          </h2>
        </Link>
      </div>
    </div>
  )
}

