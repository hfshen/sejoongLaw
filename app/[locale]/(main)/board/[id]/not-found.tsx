import { getTranslations } from "next-intl/server"

export default async function NotFound() {
  const t = await getTranslations()
  
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-4">{t("notFound.board.title")}</h1>
      <p className="text-text-secondary">{t("notFound.board.message")}</p>
    </div>
  )
}

