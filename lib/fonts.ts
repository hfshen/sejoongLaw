import { Inter, Playfair_Display, Noto_Sans_KR, Noto_Serif_SC } from "next/font/google"

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
  preload: false, // 사용되지 않을 수 있으므로 preload 비활성화
})

export const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
  preload: true,
})

// 중국어 폰트 (FangSong이 없는 환경에서는 Noto Serif SC로 안정적으로 표시)
export const notoSerifSC = Noto_Serif_SC({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-noto-serif-sc",
  display: "swap",
  preload: true,
})

