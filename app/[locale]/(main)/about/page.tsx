import { redirect } from "next/navigation"
import { getLocale } from "next-intl/server"

export default async function AboutPage() {
  const locale = await getLocale()
  // 법인소개 메인 페이지는 인사말 페이지로 리다이렉트
  redirect(`/${locale}/about/greeting`)
}

