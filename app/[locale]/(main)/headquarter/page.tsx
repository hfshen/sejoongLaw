"use client"

import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import { FadeInUp, StaggerContainer, StaggerItem } from "@/components/ui/animations"

export default function HeadquarterPage() {
  const t = useTranslations()
  const locale = useLocale()

  const services = [
    {
      path: `/${locale}/litigation/real-estate`,
      title: t("litigation.realEstate"),
      description: "Real estate related legal services",
    },
    {
      path: `/${locale}/litigation/divorce`,
      title: t("litigation.divorce"),
      description: "Divorce related legal services",
    },
    {
      path: `/${locale}/litigation/inheritance`,
      title: t("litigation.inheritance"),
      description: "Inheritance related legal services",
    },
    {
      path: `/${locale}/litigation/traffic`,
      title: t("litigation.traffic"),
      description: "Traffic accident related legal services",
    },
    {
      path: `/${locale}/litigation/industrial`,
      title: t("litigation.industrial"),
      description: "Industrial accident related legal services",
    },
    {
      path: `/${locale}/litigation/insurance`,
      title: t("litigation.insurance"),
      description: "Insurance related legal services",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto container-padding section-padding">
        <FadeInUp>
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-secondary mb-6">
              {t("branches.headquarter")}
            </h1>
            <p className="text-xl text-text-secondary mb-2">
              {t("common.address")}
            </p>
            <p className="text-lg text-primary font-semibold">
              {t("common.phone")}
            </p>
          </div>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <StaggerItem key={service.path}>
              <Link href={service.path} className="premium-card">
                <h2 className="text-2xl font-bold text-secondary mb-3 hover:text-primary transition-colors">
                  {service.title}
                </h2>
                <p className="text-text-secondary">{service.description}</p>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  )
}

