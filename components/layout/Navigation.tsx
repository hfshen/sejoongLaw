"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Menu, X, ChevronDown } from "lucide-react"

interface NavigationProps {
  isMobileOpen?: boolean
  onMobileClose?: () => void
}

export default function Navigation(props?: NavigationProps) {
  const { isMobileOpen, onMobileClose } = props || {}
  const pathname = usePathname()
  const locale = useLocale()
  const t = useTranslations()
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(isMobileOpen || false)

  // 외부에서 제어되는 경우
  const mobileMenuOpen = isMobileOpen !== undefined ? isMobileOpen : isMobileMenuOpen
  const handleMobileClose = () => {
    if (onMobileClose) {
      onMobileClose()
    } else {
      setIsMobileMenuOpen(false)
    }
  }

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
        { path: `/${locale}/litigation/real-estate`, label: t("litigation.realEstate") },
        { path: `/${locale}/litigation/divorce`, label: t("litigation.divorce") },
        { path: `/${locale}/litigation/inheritance`, label: t("litigation.inheritance") },
        { path: `/${locale}/litigation/traffic`, label: t("litigation.traffic") },
        { path: `/${locale}/litigation/industrial`, label: t("litigation.industrial") },
        { path: `/${locale}/litigation/insurance`, label: t("litigation.insurance") },
        { path: `/${locale}/litigation/tax`, label: t("litigation.tax") },
        { path: `/${locale}/litigation/general`, label: t("litigation.general") },
      ],
    },
    {
      path: `/${locale}/corporate`,
      label: t("nav.corporate"),
      children: [
        { path: `/${locale}/corporate/advisory`, label: t("corporate.advisory") },
        { path: `/${locale}/corporate/m-a`, label: t("corporate.mna") },
        { path: `/${locale}/corporate/overseas`, label: t("corporate.overseas") },
        { path: `/${locale}/corporate/finance`, label: t("corporate.finance") },
        { path: `/${locale}/corporate/indirect`, label: t("corporate.indirect") },
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
    {
      path: `/${locale}`,
      label: t("branches.title"),
      children: [
        { path: `/${locale}/headquarter`, label: t("branches.headquarter") },
        { path: `/${locale}/uijeongbu`, label: t("branches.uijeongbu") },
        { path: `/${locale}/ansan`, label: t("branches.ansan") },
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
    <nav className="bg-white/80 backdrop-blur-sm border-t border-gray-100 relative z-[99]">
      <div className="max-w-7xl mx-auto container-padding">
        {/* Desktop Navigation */}
        <div className="hidden md:flex justify-between items-center h-16">
          <div className="flex items-center space-x-1">
            {menuStructure.map((menu) => (
              <div key={menu.path} className="relative group">
                <Link
                  href={menu.path}
                  className={`px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg focus-ring flex items-center gap-1 ${
                    isActive(menu.path)
                      ? "text-primary bg-primary/10"
                      : "text-secondary hover:text-primary hover:bg-gray-50"
                  }`}
                >
                  {menu.label}
                  {menu.children && (
                    <ChevronDown className="w-3 h-3 opacity-60" />
                  )}
                </Link>
                {menu.children && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {menu.children.map((child) => (
                        <div key={child.path}>
                          {child.children ? (
                            <div className="relative group/sub">
                              <Link
                                href={child.path}
                                className={`block px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                  isActive(child.path)
                                    ? "text-primary bg-primary/5 font-semibold"
                                    : "text-secondary hover:text-primary hover:bg-gray-50"
                                }`}
                              >
                                <span>{child.label}</span>
                                <ChevronDown className="w-3 h-3 opacity-60" />
                              </Link>
                              <div className="absolute left-full top-0 ml-1 w-56 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 z-50">
                                <div className="py-2">
                                  {child.children.map((subChild) => (
                                    <Link
                                      key={subChild.path}
                                      href={subChild.path}
                                      className={`block px-4 py-2 text-sm transition-colors ${
                                        isActive(subChild.path)
                                          ? "text-primary bg-primary/5 font-semibold"
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
                              className={`block px-4 py-2 text-sm transition-colors ${
                                isActive(child.path)
                                  ? "text-primary bg-primary/5 font-semibold"
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

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-200 bg-white">
            {menuStructure.map((menu) => (
              <div key={menu.path} className="border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <Link
                    href={menu.path}
                    className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
                      isActive(menu.path)
                        ? "text-primary bg-primary/10"
                        : "text-secondary"
                    }`}
                    onClick={() => !menu.children && handleMobileClose()}
                  >
                    {menu.label}
                  </Link>
                  {menu.children && (
                    <button
                      onClick={() => handleMenuToggle(menu.path)}
                      className="px-4 py-3"
                      aria-label={t("common.openSubmenu")}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform text-secondary ${
                          openMenu === menu.path ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  )}
                </div>
                {menu.children && openMenu === menu.path && (
                  <div className="bg-gray-50">
                    {menu.children.map((child) => (
                      <div key={child.path}>
                        {child.children ? (
                          <div>
                            <div className="flex items-center justify-between">
                              <Link
                                href={child.path}
                                className="flex-1 px-8 py-2 text-sm text-secondary"
                                onClick={() => !child.children && handleMobileClose()}
                              >
                                {child.label}
                              </Link>
                              {child.children && (
                                <button
                                  onClick={() =>
                                    setOpenMenu(
                                      openMenu === `${menu.path}-${child.path}`
                                        ? menu.path
                                        : `${menu.path}-${child.path}`
                                    )
                                  }
                                  className="px-4 py-2"
                                  aria-label={t("common.openSubmenu")}
                                >
                                  <ChevronDown
                                    className={`w-4 h-4 transition-transform text-secondary ${
                                      openMenu === `${menu.path}-${child.path}`
                                        ? "rotate-180"
                                        : ""
                                    }`}
                                  />
                                </button>
                              )}
                            </div>
                            {openMenu === `${menu.path}-${child.path}` && (
                              <div className="bg-gray-100">
                                {child.children.map((subChild) => (
                                  <Link
                                    key={subChild.path}
                                    href={subChild.path}
                                    className={`block px-12 py-2 text-sm transition-colors ${
                                      isActive(subChild.path)
                                        ? "text-primary font-semibold"
                                        : "text-secondary"
                                    }`}
                                    onClick={() => handleMobileClose()}
                                  >
                                    {subChild.label}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={child.path}
                            className={`block px-8 py-2 text-sm transition-colors ${
                              isActive(child.path)
                                ? "text-primary font-semibold"
                                : "text-secondary"
                            }`}
                            onClick={() => handleMobileClose()}
                          >
                            {child.label}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

