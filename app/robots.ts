import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/_next/",
          "/_vercel/",
          "/sw.js",
          "/manifest.webmanifest",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/admin/", "/_next/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

