import Link from "next/link"
import Button from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function NotFound({
  params,
}: {
  params: { locale: string }
}) {
  const t = await getTranslations()
  const locale = params.locale
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto container-padding">
        <h1 className="text-6xl font-bold text-primary mb-4">{t("notFound.case.title")}</h1>
        <h2 className="text-2xl font-bold text-secondary mb-4">
          {t("notFound.case.heading")}
        </h2>
        <p className="body-text mb-8">
          {t("notFound.case.description")}
        </p>
        <div className="flex gap-4 justify-center">
          <Link href={`/${locale}/cases`} className="premium-button inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            {t("notFound.case.backToCases")}
          </Link>
        </div>
      </div>
    </div>
  )
}

