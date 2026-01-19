import { getTranslations } from "next-intl/server"

export default async function UijeongbuPage() {
  const t = await getTranslations()
  
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-secondary mb-4">
            {t("uijeongbu.title")}
          </h1>
          <p className="text-xl text-text-secondary">
            {t("uijeongbu.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {t("uijeongbu.divorce.title")}
            </h2>
            <p className="text-text-secondary mb-4">
              {t("uijeongbu.divorce.description")}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              {t("uijeongbu.realEstate.title")}
            </h2>
            <p className="text-text-secondary mb-4">
              {t("uijeongbu.realEstate.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

