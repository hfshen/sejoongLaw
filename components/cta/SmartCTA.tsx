"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useLocale } from "next-intl"
import Button from "@/components/ui/Button"
import Link from "next/link"
import { X, Phone, Mail, Calendar } from "lucide-react"

interface SmartCTAProps {
  variant?: "floating" | "banner" | "popup"
  position?: "bottom-right" | "bottom-center" | "top"
}

export default function SmartCTA({
  variant = "floating",
  position = "bottom-right",
}: SmartCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const pathname = usePathname()
  const locale = useLocale()

  useEffect(() => {
    // 스크롤 위치 기반 표시
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) *
        100
      if (scrollPercentage > 30 && !isVisible) {
        setIsVisible(true)
      }
    }

    // 출구 인텐트 감지
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent) {
        setShowExitIntent(true)
      }
    }

    window.addEventListener("scroll", handleScroll)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("scroll", handleScroll)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isVisible, showExitIntent])

  // 시간대별 메시지
  const getTimeBasedMessage = () => {
    const hour = new Date().getHours()
    if (hour >= 9 && hour < 12) {
      return "오늘 아침, 법률 상담을 시작하세요"
    } else if (hour >= 12 && hour < 18) {
      return "지금 바로 전문 변호사와 상담하세요"
    } else {
      return "내일을 위한 상담, 오늘 신청하세요"
    }
  }

  if (variant === "floating" && isVisible) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className={`fixed ${position === "bottom-right" ? "bottom-6 right-6" : "bottom-6 left-1/2 -translate-x-1/2"} z-50`}
      >
        <div className="bg-white rounded-xl shadow-premium-lg border border-gray-200 p-6 max-w-sm">
          <h3 className="font-bold text-lg text-secondary mb-2">
            {getTimeBasedMessage()}
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            무료 상담으로 시작하세요
          </p>
          <div className="flex flex-col gap-2">
            <Button
              size="sm"
              className="w-full"
              asChild
            >
              <Link href={`/${locale}/consultation`}>상담 신청하기</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = "tel:025910372")}
            >
              <Phone className="w-4 h-4 mr-2" />
              전화 상담
            </Button>
          </div>
        </div>
      </motion.div>
    )
  }

  if (variant === "popup" && showExitIntent) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowExitIntent(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl shadow-premium-lg p-8 max-w-md w-full"
          >
            <button
              onClick={() => setShowExitIntent(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-secondary"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-secondary mb-4">
              잠깐! 상담 신청 전에
            </h2>
            <p className="body-text mb-6">
              전문 변호사와의 무료 상담으로 법률 문제를 해결하세요.
            </p>
            <div className="space-y-3">
              <Button className="w-full" asChild>
                <Link href={`/${locale}/consultation`}>
                  <Calendar className="w-5 h-5 mr-2" />
                  무료 상담 신청
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="tel:025910372">
                  <Phone className="w-5 h-5 mr-2" />
                  전화 상담: 02) 591-0372
                </a>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}

