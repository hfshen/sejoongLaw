"use client"

import { useTranslations, useLocale } from "next-intl"
import Link from "next/link"
import { FadeIn } from "@/components/ui/animations"

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
              <p className="text-xs md:text-sm text-gray-300 mb-1.5">{t("footer.representative")}</p>
              <div className="mt-2 md:mt-3 space-y-1">
                <p className="text-xs text-gray-300 leading-tight">{t("common.address")}</p>
                <p className="text-xs text-gray-300">{t("footer.phone")}</p>
                <p className="text-xs text-gray-300">{t("footer.fax")}</p>
                <p className="text-xs text-gray-300">{t("footer.businessNumber")}</p>
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
              <h4 className="font-semibold mb-2 md:mb-3 text-sm md:text-base">{t("common.contact")}</h4>
              <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
                {t("common.address")}
                <br />
                {t("footer.phone")}
                <br />
                {t("footer.fax")}
              </p>
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
            <p className="text-xs text-gray-400">
              Powered by{" "}
              <a
                href="https://lolovely.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors underline"
              >
                lolovely
              </a>
            </p>
          </div>
        </div>
      </FadeIn>
    </footer>
  )
}

