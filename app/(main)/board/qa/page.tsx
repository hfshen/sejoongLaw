import Link from "next/link"

export default function QAPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">온라인상담 Q/A</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-text-secondary mb-6">
          온라인상담 Q/A 게시판입니다. 문의사항을 남겨주시면 답변해드리겠습니다.
        </p>
        <Link
          href="/board/write?category=qa"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          문의하기
        </Link>
      </div>
    </div>
  )
}

