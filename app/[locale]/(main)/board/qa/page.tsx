import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function QAPage() {
  const t = await getTranslations()
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">{t("board.qa.title")}</h1>
      <div className="bg-white rounded-lg shadow-md p-8">
        <p className="text-text-secondary mb-6">
          {t("board.qa.description")}
        </p>
        <Link
          href="/board/write?category=qa"
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors"
        >
          {t("board.qa.button")}
        </Link>
      </div>
    </div>
  )
}

