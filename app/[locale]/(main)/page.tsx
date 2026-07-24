import { Metadata } from "next"
import dynamic from "next/dynamic"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { ArrowRight, ShieldCheck } from "lucide-react"

// Hero 섹션만 동적 로드 (가장 큰 컴포넌트)
const HeroSectionAnsan = dynamic(
  () => import("@/components/sections/ansan/HeroSectionAnsan"),
  {
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-secondary">Loading...</div>
      </div>
    ),
    ssr: true, // SSR 활성화로 초기 로딩 개선
  }
)

// 나머지 섹션들은 정적 import로 변경 (번들 크기가 작은 경우)
import IntroductionSection from "@/components/sections/ansan/IntroductionSection"
import ServicesGridSection from "@/components/sections/ansan/ServicesGridSection"
import PainPointsSection from "@/components/sections/ansan/PainPointsSection"
import DifferentiatorsSection from "@/components/sections/ansan/DifferentiatorsSection"
import ContactSectionAnsan from "@/components/sections/ansan/ContactSectionAnsan"
import CTASectionAnsan from "@/components/sections/ansan/CTASectionAnsan"

type StayCareEntryCopy = {
  eyebrow: string
  title: string
  description: string
  button: string
}

const stayCareEntryCopy: Record<string, StayCareEntryCopy> = {
  ko: {
    eyebrow: "외국인 체류·생활 통합 지원",
    title: "StayCare로 체류 업무를 더 간편하게",
    description:
      "비자, 서류, 일정, 생활 지원을 한 곳에서 확인하고 관리하세요.",
    button: "StayCare 바로가기",
  },
  en: {
    eyebrow: "Integrated immigration & living support",
    title: "Manage your stay more easily with StayCare",
    description:
      "Track visas, documents, schedules, and daily-life support in one place.",
    button: "Open StayCare",
  },
  "zh-CN": {
    eyebrow: "外国人居留与生活综合支持",
    title: "使用 StayCare，更轻松地管理居留事务",
    description: "在一个平台查看并管理签证、材料、日程和生活支持。",
    button: "进入 StayCare",
  },
  "zh-TW": {
    eyebrow: "外國人居留與生活整合支援",
    title: "使用 StayCare，更輕鬆管理居留事務",
    description: "在同一平台查看並管理簽證、文件、行程與生活支援。",
    button: "進入 StayCare",
  },
  ja: {
    eyebrow: "外国人の在留・生活を総合支援",
    title: "StayCareで在留手続きをもっと簡単に",
    description:
      "ビザ、書類、スケジュール、生活支援を一か所で確認・管理できます。",
    button: "StayCareを開く",
  },
  vi: {
    eyebrow: "Hỗ trợ tích hợp về cư trú và đời sống",
    title: "Quản lý việc cư trú dễ dàng hơn với StayCare",
    description:
      "Theo dõi thị thực, hồ sơ, lịch trình và hỗ trợ đời sống tại một nơi.",
    button: "Mở StayCare",
  },
  th: {
    eyebrow: "บริการสนับสนุนการพำนักและการใช้ชีวิตแบบครบวงจร",
    title: "จัดการเรื่องการพำนักได้ง่ายขึ้นด้วย StayCare",
    description:
      "ติดตามวีซ่า เอกสาร กำหนดการ และการช่วยเหลือด้านชีวิตประจำวันได้ในที่เดียว",
    button: "เข้าสู่ StayCare",
  },
  id: {
    eyebrow: "Dukungan terpadu untuk izin tinggal dan kehidupan",
    title: "Kelola urusan tinggal lebih mudah dengan StayCare",
    description:
      "Pantau visa, dokumen, jadwal, dan dukungan kehidupan dalam satu tempat.",
    button: "Buka StayCare",
  },
  tl: {
    eyebrow: "Pinagsamang suporta sa pananatili at pang-araw-araw na buhay",
    title: "Mas madaling pamahalaan ang pananatili gamit ang StayCare",
    description:
      "Subaybayan ang visa, mga dokumento, iskedyul, at suporta sa pamumuhay sa iisang lugar.",
    button: "Buksan ang StayCare",
  },
  ru: {
    eyebrow: "Комплексная поддержка пребывания и повседневной жизни",
    title: "Управляйте вопросами пребывания проще со StayCare",
    description:
      "Следите за визами, документами, расписанием и бытовой поддержкой в одном месте.",
    button: "Открыть StayCare",
  },
  mn: {
    eyebrow: "Оршин суух болон амьдралын нэгдсэн дэмжлэг",
    title: "StayCare ашиглан оршин суух ажлаа илүү хялбар удирдаарай",
    description:
      "Виз, бичиг баримт, хуваарь болон амьдралын дэмжлэгээ нэг дороос хянаж удирдана.",
    button: "StayCare нээх",
  },
  es: {
    eyebrow: "Apoyo integral para residencia y vida diaria",
    title: "Gestiona tu estancia más fácilmente con StayCare",
    description:
      "Consulta y gestiona visados, documentos, calendarios y apoyo diario en un solo lugar.",
    button: "Abrir StayCare",
  },
  fr: {
    eyebrow: "Accompagnement intégré pour le séjour et la vie quotidienne",
    title: "Gérez votre séjour plus facilement avec StayCare",
    description:
      "Suivez visas, documents, échéances et services du quotidien au même endroit.",
    button: "Ouvrir StayCare",
  },
  de: {
    eyebrow: "Integrierte Unterstützung für Aufenthalt und Alltag",
    title: "Aufenthaltsangelegenheiten einfacher mit StayCare verwalten",
    description:
      "Visa, Dokumente, Termine und Alltagshilfen zentral einsehen und verwalten.",
    button: "StayCare öffnen",
  },
  ar: {
    eyebrow: "دعم متكامل للإقامة والحياة اليومية",
    title: "أدر شؤون إقامتك بسهولة أكبر مع StayCare",
    description:
      "تابع التأشيرات والمستندات والمواعيد وخدمات الحياة اليومية في مكان واحد.",
    button: "فتح StayCare",
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ansan.metadata")
  const tCommon = await getTranslations("common")

  return {
    title: `${t("title")} | ${tCommon("title")}`,
    description: t("description"),
    keywords: t("keywords")
      .split(",")
      .map((keyword) => keyword.trim()),
    openGraph: {
      title: `${t("title")} | ${tCommon("title")}`,
      description: t("ogDescription"),
      type: "website",
      images: [
        {
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL || "https://sejoonglaw.com"
          }/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: t("ogImageAlt"),
        },
      ],
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
    alternates: {
      canonical: "/",
    },
  }
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const copy = stayCareEntryCopy[locale] || stayCareEntryCopy.ko

  return (
    <>
      <HeroSectionAnsan />
      <IntroductionSection />
      <ServicesGridSection />
      <PainPointsSection />
      <DifferentiatorsSection />
      <ContactSectionAnsan />
      <CTASectionAnsan />

      <section
        className="bg-slate-950 px-4 py-8 md:py-12"
        aria-labelledby="staycare-entry-title"
      >
        <div className="container-max">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-primary/40 px-6 py-7 shadow-2xl md:px-10 md:py-9">
            <div
              className="absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/25 blur-3xl"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-24 left-1/3 h-40 w-40 rounded-full bg-accent/20 blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/80 md:text-sm">
                  <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
                  {copy.eyebrow}
                </div>
                <h2
                  id="staycare-entry-title"
                  className="text-2xl font-bold tracking-tight text-white md:text-3xl"
                >
                  {copy.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70 md:text-base">
                  {copy.description}
                </p>
              </div>

              <Link
                href={`/${locale}/staycare`}
                className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-bold text-slate-950 shadow-lg transition duration-200 hover:-translate-y-0.5 hover:bg-gray-100 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:w-auto"
                aria-label={copy.button}
              >
                {copy.button}
                <ArrowRight
                  className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
