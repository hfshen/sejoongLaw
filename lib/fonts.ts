import { Inter, Playfair_Display, Noto_Sans_KR } from "next/font/google"

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  preload: true,
})

export const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: true,
})

export const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: true,
})

// FangSong은 Google Fonts에 없으므로 CSS에서 직접 로드
// 중국어 폰트는 CSS에서 @font-face로 로드

