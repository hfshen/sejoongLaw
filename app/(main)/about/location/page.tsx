export default function LocationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">오시는 길</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-secondary mb-4">본사</h2>
          <p className="text-lg text-text-secondary mb-2">
            서울시 서초구 서초대로 272, 10층
          </p>
          <p className="text-lg text-text-secondary mb-2">
            (서초동, 한국아이비에스빌딩)
          </p>
          <p className="text-lg text-primary font-medium">
            대표전화: 02) 591-0372
          </p>
        </div>
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-secondary mb-4">
            지하철 이용시
          </h3>
          <p className="text-text-secondary">
            지하철 2호선 서초역 하차 후 도보 5분
          </p>
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold text-secondary mb-4">
            버스 이용시
          </h3>
          <p className="text-text-secondary">
            간선: 146, 341, 362, 463, 641, 643
            <br />
            지선: 3412, 6411
          </p>
        </div>
        <div className="mt-8">
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-text-secondary">지도 영역 (구글 맵 연동 예정)</p>
          </div>
        </div>
      </div>
    </div>
  )
}

