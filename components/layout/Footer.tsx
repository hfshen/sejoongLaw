"use client"

import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import { FadeIn } from "@/components/ui/animations"
import { Lock } from "lucide-react"

export default function Footer() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <footer className="bg-secondary text-white" role="contentinfo">
      <FadeIn>
        <div className="max-w-7xl mx-auto container-padding py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-base md:text-lg lg:text-xl font-bold mb-2 md:mb-3">{t("footer.firmName")}</h3>
              <div className="mt-2 md:mt-3 space-y-1">
                <p className="text-xs text-gray-300 leading-tight">{t("common.address")}</p>
                <p className="text-xs text-gray-300">{t("footer.phone")}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">{t("nav.about")}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link
                    href={`/${locale}/about/greeting`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("about.greeting")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/about/members`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("about.members")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/about/location`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("about.location")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">{t("network.title")}</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <span className="text-accent font-bold">{t("footer.branches.ansan.name")}</span>
                  <p className="text-gray-400 text-xs mt-1">{t("footer.branches.ansan.address")}</p>
                </li>
                <li>
                  <Link
                    href={`/${locale}/headquarter`}
                    className="text-gray-300 font-semibold hover:text-accent transition-colors"
                  >
                    {t("footer.branches.seoul.name")}
                  </Link>
                  <p className="text-gray-400 text-xs mt-1">{t("footer.branches.seoul.address")}</p>
                </li>
                <li>
                  <Link
                    href={`/${locale}/uijeongbu`}
                    className="text-gray-300 font-semibold hover:text-accent transition-colors"
                  >
                    {t("footer.branches.uijeongbu.name")}
                  </Link>
                  <p className="text-gray-400 text-xs mt-1">{t("footer.branches.uijeongbu.address")}</p>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">Links</h4>
              <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm">
                <li>
                  <Link
                    href={`/${locale}/board`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("nav.board")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/privacy-policy`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("footer.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    {t("footer.emailRejection")}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-700 text-center">
            <p className="text-xs md:text-sm text-gray-300 mb-2">{t("footer.copyright")}</p>
            <div className="text-xs text-gray-400 flex items-center justify-center gap-2">
              <span>Powered by</span>
              <a
                href="https://lolovely.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors underline"
                onClick={(e) => e.stopPropagation()}
              >
                lolovely
              </a>
              <span className="mx-1">|</span>
              <a
                href="/admin/login"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  // 즉시 페이지 이동
                  window.location.assign("/admin/login")
                }}
                className="hover:text-accent transition-colors inline-flex items-center"
                aria-label="Admin Login"
              >
                <Lock className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </FadeIn>
    </footer>
  )
}

