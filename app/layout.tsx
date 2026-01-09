import type { Metadata } from "next"
import { inter, playfair, notoSansKR } from "@/lib/fonts"
import PasswordResetRedirect from "@/components/auth/PasswordResetRedirect"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "법무법인 세중 | 전문 법률 서비스",
    template: "%s | 법무법인 세중",
  },
  description:
    "법무법인 세중은 부동산, 이혼, 상속, 비자, 기업자문 등 다양한 법률 서비스를 제공하는 전문 법무법인입니다.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"
  ),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${playfair.variable} ${notoSansKR.variable} antialiased`}
        suppressHydrationWarning
      >
        <PasswordResetRedirect />
        {children}
      </body>
    </html>
  )
}

