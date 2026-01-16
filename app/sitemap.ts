import { MetadataRoute } from "next"
import { locales } from "@/lib/i18n"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  const routes = [
    "",
    "/ansan",
    "/headquarter",
    "/uijeongbu",
    "/consultation",
    "/cases",
    "/about/greeting",
    "/about/members",
    "/about/location",
    "/litigation/real-estate",
    "/litigation/divorce",
    "/litigation/inheritance",
    "/litigation/traffic",
    "/litigation/industrial",
    "/litigation/insurance",
    "/corporate/advisory",
    "/immigration/visa",
    "/immigration/non-immigrant",
    "/immigration/immigrant",
    "/foreigner/visa",
    "/foreigner/stay",
    "/board",
  ]

  const sitemapEntries: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    routes.forEach((route) => {
      sitemapEntries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      })
    })
  })

  return sitemapEntries
}

