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
        <div className="max-w-7xl mx-auto container-padding py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold mb-4">{t("common.title")}</h3>
              <p className="text-sm text-gray-300">{t("common.subtitle")}</p>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-300">{t("common.address")}</p>
                <p className="text-sm text-gray-300">{t("common.phone")}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">{t("nav.about")}</h4>
              <ul className="space-y-3 text-sm">
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
              <h4 className="font-semibold mb-4 text-lg">{t("common.contact")}</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                {t("common.address")}
                <br />
                {t("common.phone")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-lg">Links</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href={`/${locale}/board`}
                    className="hover:text-accent transition-colors"
                  >
                    {t("nav.board")}
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-accent transition-colors">
                    Copyright Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-700 text-center text-sm text-gray-300">
            <p>
              Copyright SEJOONG LAW FIRM, 10th floor, korea IBS Bldg, 272,
              Seocho-daero, Seocho-gu, Seoul, Korea All rights reserved.
            </p>
          </div>
        </div>
      </FadeIn>
    </footer>
  )
}

