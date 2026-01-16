import { locales } from "@/lib/i18n"

interface StructuredDataProps {
  type: "Organization" | "LegalService" | "WebSite"
  locale?: string
}

export function StructuredData({ type, locale = "ko" }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"

  const organization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "법무법인 세중",
    alternateName: "Sejoong Law Firm",
    url: baseUrl,
    logo: `${baseUrl}/SJ_logo.svg`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+82-31-8044-8805",
        email: "contact@sejoonglaw.kr",
        contactType: "customer service",
        areaServed: "KR",
        availableLanguage: locales,
      },
    ],
    address: [
      {
        "@type": "PostalAddress",
        name: "안산지사",
        streetAddress: "원곡로 45, 세중빌딩 2층",
        addressLocality: "단원구",
        addressRegion: "안산시",
        addressRegion2: "경기도",
        postalCode: "15418",
        addressCountry: "KR",
      },
      {
        "@type": "PostalAddress",
        name: "본사",
        streetAddress: "서초대로 272, 10층",
        addressLocality: "서초구",
        addressRegion: "서울",
        postalCode: "06578",
        addressCountry: "KR",
      },
    ],
    sameAs: [
      // Add social media links if available
    ],
  }

  const legalService = {
    "@context": "https://schema.org",
    "@type": "LegalService",
    name: "법무법인 세중",
    description:
      "부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인",
    url: baseUrl,
    areaServed: {
      "@type": "Country",
      name: "South Korea",
    },
    serviceType: [
      "부동산 분쟁",
      "이혼 소송",
      "상속 분쟁",
      "비자 신청",
      "기업 자문",
    ],
  }

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "법무법인 세중",
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  }

  const data =
    type === "Organization"
      ? organization
      : type === "LegalService"
        ? legalService
        : website

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

