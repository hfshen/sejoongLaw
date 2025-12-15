"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"

export default function Navigation() {
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const menuStructure = [
    {
      path: `/${locale}/about`,
      label: t("nav.about"),
      children: [
        { path: `/${locale}/about/greeting`, label: t("about.greeting") },
        { path: `/${locale}/about/members`, label: t("about.members") },
        { path: `/${locale}/about/location`, label: t("about.location") },
      ],
    },
    {
      path: `/${locale}/litigation`,
      label: t("nav.litigation"),
      children: [
        {
          path: `/${locale}/litigation/real-estate`,
          label: t("litigation.realEstate"),
        },
        { path: `/${locale}/litigation/divorce`, label: t("litigation.divorce") },
        {
          path: `/${locale}/litigation/inheritance`,
          label: t("litigation.inheritance"),
        },
        { path: `/${locale}/litigation/traffic`, label: t("litigation.traffic") },
        {
          path: `/${locale}/litigation/industrial`,
          label: t("litigation.industrial"),
        },
        {
          path: `/${locale}/litigation/insurance`,
          label: t("litigation.insurance"),
        },
        { path: `/${locale}/litigation/tax`, label: t("litigation.tax") },
        {
          path: `/${locale}/litigation/general`,
          label: t("litigation.general"),
        },
      ],
    },
    {
      path: `/${locale}/corporate`,
      label: t("nav.corporate"),
      children: [
        {
          path: `/${locale}/corporate/advisory`,
          label: t("corporate.advisory"),
        },
        { path: `/${locale}/corporate/m-a`, label: t("corporate.mna") },
        {
          path: `/${locale}/corporate/overseas`,
          label: t("corporate.overseas"),
        },
        { path: `/${locale}/corporate/finance`, label: t("corporate.finance") },
        {
          path: `/${locale}/corporate/indirect`,
          label: t("corporate.indirect"),
        },
      ],
    },
    {
      path: `/${locale}/immigration`,
      label: t("nav.immigration"),
      children: [
        { path: `/${locale}/immigration/visa`, label: t("immigration.visa") },
        {
          path: `/${locale}/immigration/non-immigrant`,
          label: t("immigration.nonImmigrant"),
        },
        {
          path: `/${locale}/immigration/immigrant`,
          label: t("immigration.immigrant"),
        },
        {
          path: `/${locale}/immigration/refusal`,
          label: t("immigration.refusal"),
        },
        { path: `/${locale}/immigration/waiver`, label: t("immigration.waiver") },
        {
          path: `/${locale}/immigration/success`,
          label: t("immigration.success"),
        },
      ],
    },
    {
      path: `/${locale}/foreigner`,
      label: t("nav.foreigner"),
      children: [
        {
          path: `/${locale}/foreigner/visa`,
          label: t("foreigner.visa"),
          children: [
            {
              path: `/${locale}/foreigner/visa/certificate`,
              label: t("foreigner.certificate"),
            },
            {
              path: `/${locale}/foreigner/visa/types`,
              label: t("foreigner.types"),
            },
          ],
        },
        { path: `/${locale}/foreigner/stay`, label: t("foreigner.stay") },
        {
          path: `/${locale}/foreigner/immigration`,
          label: t("foreigner.immigration"),
        },
        {
          path: `/${locale}/foreigner/investment`,
          label: t("foreigner.investment"),
        },
        {
          path: `/${locale}/foreigner/overseas-korean`,
          label: t("foreigner.overseasKorean"),
        },
      ],
    },
    {
      path: `/${locale}/board`,
      label: t("nav.board"),
      children: [
        { path: `/${locale}/board`, label: t("board.cases") },
        { path: `/${locale}/board/qa`, label: t("board.qa") },
        { path: `/${locale}/board/column`, label: t("board.column") },
        { path: `/${locale}/board/news`, label: t("board.news") },
      ],
    },
  ]

  const isActive = (path: string) => {
    return pathname?.startsWith(path)
  }

  const handleMenuToggle = (path: string) => {
    setOpenMenu(openMenu === path ? null : path)
  }

  return (
    <nav className="bg-white/80 backdrop-blur-sm border-t border-gray-100">
      <div className="max-w-7xl mx-auto container-padding">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            {menuStructure.map((menu) => (
              <div key={menu.path} className="relative group">
                <button
                  onClick={() => handleMenuToggle(menu.path)}
                  className={`px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg focus-ring ${
                    isActive(menu.path)
                      ? "text-primary bg-primary/10"
                      : "text-secondary hover:text-primary hover:bg-gray-50"
                  }`}
                  aria-expanded={openMenu === menu.path}
                  aria-haspopup={menu.children ? "true" : "false"}
                >
                  {menu.label}
                </button>
                {menu.children && (
                  <div
                    className={`absolute left-0 mt-2 w-64 rounded-xl shadow-premium bg-white/95 backdrop-blur-sm border border-gray-100 z-50 overflow-hidden ${
                      openMenu === menu.path ? "block" : "hidden group-hover:block"
                    }`}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <div className="py-2">
                      {menu.children.map((child) => (
                        <div key={child.path}>
                          {child.children ? (
                            <div className="relative group/submenu">
                              <Link
                                href={child.path}
                                className={`block px-4 py-3 text-sm transition-colors ${
                                  isActive(child.path)
                                    ? "text-primary bg-primary/10 font-semibold"
                                    : "text-secondary hover:text-primary hover:bg-gray-50"
                                }`}
                              >
                                {child.label}
                              </Link>
                              <div className="absolute left-full top-0 ml-2 w-64 rounded-xl shadow-premium bg-white/95 backdrop-blur-sm border border-gray-100 hidden group-hover/submenu:block">
                                <div className="py-2">
                                  {child.children.map((subChild) => (
                                    <Link
                                      key={subChild.path}
                                      href={subChild.path}
                                      className={`block px-4 py-3 text-sm transition-colors ${
                                        isActive(subChild.path)
                                          ? "text-primary bg-primary/10 font-semibold"
                                          : "text-secondary hover:text-primary hover:bg-gray-50"
                                      }`}
                                    >
                                      {subChild.label}
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <Link
                              href={child.path}
                              className={`block px-4 py-3 text-sm transition-colors ${
                                isActive(child.path)
                                  ? "text-primary bg-primary/10 font-semibold"
                                  : "text-secondary hover:text-primary hover:bg-gray-50"
                              }`}
                            >
                              {child.label}
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

