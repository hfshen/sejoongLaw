export default function UijeongbuPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-secondary mb-4">
            의정부 지점
          </h1>
          <p className="text-xl text-text-secondary">
            이혼/상속 전문센터, 부동산 전문센터
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              이혼/상속 전문센터
            </h2>
            <p className="text-text-secondary mb-4">
              의정부 지역의 이혼 및 상속 관련 법률 서비스를 전문적으로 제공합니다.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              부동산 전문센터
            </h2>
            <p className="text-text-secondary mb-4">
              의정부 지역의 부동산 관련 법률 서비스를 전문적으로 제공합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

