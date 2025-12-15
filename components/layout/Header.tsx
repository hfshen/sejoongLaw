"use client"

import Link from "next/link"
import Image from "next/image"
import { useLocale } from "next-intl"
import { FadeIn } from "@/components/ui/animations"
import Navigation from "./Navigation"
import LanguageSelector from "@/components/ui/LanguageSelector"
import SearchBar from "@/components/search/SearchBar"

export default function Header() {
  const locale = useLocale()

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-premium border-b border-gray-100">
      <FadeIn>
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-24">
            <Link
              href={`/${locale}`}
              className="flex items-center transition-transform hover:scale-105"
            >
              <Image
                src="/SJ_logo.svg"
                alt="법무법인 세중"
                width={220}
                height={66}
                className="h-auto"
                priority
              />
            </Link>
            <div className="flex items-center space-x-4 flex-1 max-w-md mx-8">
              <SearchBar className="w-full" />
            </div>
            <div className="flex items-center space-x-6">
              <a
                href="tel:025910372"
                className="text-secondary hover:text-primary font-semibold transition-colors text-lg hidden md:block"
              >
                02) 591-0372
              </a>
              <LanguageSelector />
            </div>
          </div>
        </div>
        <Navigation />
      </FadeIn>
    </header>
  )
}

