import Link from "next/link"

export default function HeadquarterPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-secondary mb-4">본사</h1>
          <p className="text-xl text-text-secondary">
            서울시 서초구 서초대로 272, 10층
          </p>
          <p className="text-lg text-primary font-medium mt-2">
            대표전화: 02) 591-0372
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Link
            href="/litigation/real-estate"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">
              부동산분쟁
            </h2>
            <p className="text-text-secondary">부동산 관련 법률 서비스</p>
          </Link>
          <Link
            href="/litigation/divorce"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">
              이혼/국제이혼
            </h2>
            <p className="text-text-secondary">이혼 관련 법률 서비스</p>
          </Link>
          <Link
            href="/litigation/inheritance"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">
              상속분쟁
            </h2>
            <p className="text-text-secondary">상속 관련 법률 서비스</p>
          </Link>
          <Link
            href="/litigation/traffic"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">교통사고</h2>
            <p className="text-text-secondary">교통사고 관련 법률 서비스</p>
          </Link>
          <Link
            href="/litigation/industrial"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">산업재해</h2>
            <p className="text-text-secondary">산업재해 관련 법률 서비스</p>
          </Link>
          <Link
            href="/litigation/insurance"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-bold text-secondary mb-2">보험소송</h2>
            <p className="text-text-secondary">보험 관련 법률 서비스</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

