import { MetadataRoute } from "next"
import { locales } from "@/lib/i18n"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  const routes = [
    "",
    "/consultation",
    "/cases",
    "/about/greeting",
    "/about/members",
    "/about/location",
    "/litigation/real-estate",
    "/litigation/divorce",
    "/litigation/inheritance",
    "/corporate/advisory",
    "/immigration/visa",
    "/foreigner/visa",
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

