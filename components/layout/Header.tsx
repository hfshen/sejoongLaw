"use client"

import Link from "next/link"
import Image from "next/image"
import { useLocale } from "next-intl"
import { FadeIn } from "@/components/ui/animations"
import Navigation from "./Navigation"
import LanguageSelector from "@/components/ui/LanguageSelector"
import SearchBar from "@/components/search/SearchBar"
import { Menu } from "lucide-react"
import { useState } from "react"

export default function Header() {
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white/95 backdrop-blur-sm sticky top-0 z-[100] shadow-premium border-b border-gray-100">
      <FadeIn>
        <div className="max-w-7xl mx-auto container-padding">
          <div className="flex items-center justify-between h-14 md:h-20">
            {/* 로고 */}
            <Link
              href={`/${locale}`}
              className="flex items-center transition-transform hover:scale-105 flex-shrink-0"
            >
              <Image
                src="/SJ_logo.svg"
                alt="법무법인 세중"
                width={220}
                height={66}
                className="h-8 md:h-12 w-auto"
                priority
              />
            </Link>

            {/* 데스크톱: 검색바 */}
            <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8">
              <SearchBar className="w-full" />
            </div>

            {/* 오른쪽: 언어 선택기, 전화번호, 햄버거 메뉴 */}
            <div className="flex items-center space-x-2 md:space-x-4">
              {/* 데스크톱: 전화번호 */}
              <a
                href="tel:03180448805"
                className="text-secondary hover:text-primary font-semibold transition-colors text-sm md:text-base hidden lg:block"
              >
                031-8044-8805
              </a>
              
              {/* 언어 선택기 */}
              <LanguageSelector />
              
              {/* 모바일: 햄버거 메뉴 */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-secondary hover:text-primary transition-colors"
                aria-label="메뉴 열기"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* 데스크톱 네비게이션 */}
        <div className="hidden md:block">
          <Navigation />
        </div>
        
        {/* 모바일 네비게이션 */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <Navigation isMobileOpen={isMobileMenuOpen} onMobileClose={() => setIsMobileMenuOpen(false)} />
          </div>
        )}
      </FadeIn>
    </header>
  )
}

