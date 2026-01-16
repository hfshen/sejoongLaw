import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"
import { locales, type Locale } from "@/lib/i18n"
import LocaleAttributes from "@/components/layout/LocaleAttributes"
import { StructuredData } from "@/components/seo/StructuredData"
import AnalyticsProvider from "@/components/analytics/AnalyticsProvider"
import { Analytics } from "@vercel/analytics/next"
import type { Metadata } from "next"

// WeChatMeta를 동적으로 로드 (클라이언트 컴포넌트이므로)
const WeChatMeta = dynamic(() => import("@/components/seo/WeChatMeta"), {
  ssr: false,
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  return {
    title: {
      default: "법무법인 세중 | 전문 법률 서비스",
      template: "%s | 법무법인 세중",
    },
    description:
      "법무법인 세중은 부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인입니다.",
    keywords: [
      "법무법인",
      "변호사",
      "법률 서비스",
      "부동산 분쟁",
      "이혼 소송",
      "비자 신청",
      "기업 자문",
    ],
    authors: [{ name: "법무법인 세중" }],
    creator: "법무법인 세중",
    publisher: "법무법인 세중",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, `/${loc}`])
      ),
    },
    openGraph: {
      type: "website",
      locale: locale,
      url: `${baseUrl}/${locale}`,
      title: "법무법인 세중 | 전문 법률 서비스",
      description:
        "법무법인 세중은 부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인입니다.",
      siteName: "법무법인 세중",
      images: [
        {
          url: `${baseUrl}/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: "법무법인 세중",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "법무법인 세중 | 전문 법률 서비스",
      description:
        "법무법인 세중은 부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인입니다.",
      images: [`${baseUrl}/og-image.jpg`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_VERIFICATION,
      other: {
        "naver-site-verification": process.env.NAVER_VERIFICATION || "",
      },
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale as Locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <>
      <StructuredData type="Organization" locale={locale} />
      <StructuredData type="LegalService" locale={locale} />
      <StructuredData type="WebSite" locale={locale} />
      <AnalyticsProvider>
        <NextIntlClientProvider messages={messages}>
          <Suspense fallback={null}>
            <WeChatMeta />
          </Suspense>
          <LocaleAttributes />
          {children}
        </NextIntlClientProvider>
      </AnalyticsProvider>
      <Analytics />
    </>
  )
}

