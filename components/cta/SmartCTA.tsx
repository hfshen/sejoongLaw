"use client"

import { useState, useEffect, useRef } from "react"
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

const STORAGE_KEY = "smart-cta-dismissed"
const DISMISS_DURATION = 10 * 60 * 1000 // 10분

export default function SmartCTA({
  variant = "floating",
  position = "bottom-right",
}: SmartCTAProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showExitIntent, setShowExitIntent] = useState(false)
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()
  const locale = useLocale()

  // 닫은 상태 확인
  const isDismissed = () => {
    if (typeof window === "undefined") return false
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (!dismissed) return false
    
    const dismissedTime = parseInt(dismissed, 10)
    const now = Date.now()
    
    // 10분이 지나면 다시 표시 가능
    return now - dismissedTime < DISMISS_DURATION
  }

  // 닫기 처리
  const handleClose = () => {
    setIsVisible(false)
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, Date.now().toString())
    }
  }

  useEffect(() => {
    // 이미 닫혀있으면 표시하지 않음
    if (isDismissed()) {
      return
    }

    // 페이지 로드 후 3초 대기 후 스크롤 감지 시작
    const timer = setTimeout(() => {
      // 스크롤이 멈췄는지 감지하는 타이머
      let scrollEndTimer: NodeJS.Timeout | null = null
      
      const handleScroll = () => {
        // 이미 표시되어 있거나 닫혀있으면 무시
        if (isVisible || isDismissed()) {
          return
        }

        const scrollPercentage =
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) *
          100
        
        // 스크롤이 30% 이상이면 스크롤 종료 감지 시작
        if (scrollPercentage > 30) {
          // 기존 타이머들 취소
          if (scrollEndTimer) {
            clearTimeout(scrollEndTimer)
          }
          if (scrollTimerRef.current) {
            clearTimeout(scrollTimerRef.current)
          }
          
          // 스크롤이 멈춘 후 5초 뒤에 표시
          scrollEndTimer = setTimeout(() => {
            if (!isDismissed() && !isVisible) {
              scrollTimerRef.current = setTimeout(() => {
                if (!isDismissed() && !isVisible) {
                  setIsVisible(true)
                }
              }, 5000) // 스크롤 멈춘 후 5초 지연
            }
          }, 200) // 스크롤이 200ms 멈추면 스크롤 종료로 간주
        }
      }

      window.addEventListener("scroll", handleScroll, { passive: true })
      
      // 초기 체크
      handleScroll()

      return () => {
        window.removeEventListener("scroll", handleScroll)
        if (scrollTimerRef.current) {
          clearTimeout(scrollTimerRef.current)
        }
        if (scrollEndTimer) {
          clearTimeout(scrollEndTimer)
        }
      }
    }, 3000) // 3초 대기

    // 출구 인텐트 감지
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !showExitIntent && !isDismissed()) {
        setShowExitIntent(true)
      }
    }

    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      clearTimeout(timer)
      document.removeEventListener("mouseleave", handleMouseLeave)
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
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
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed ${position === "bottom-right" ? "bottom-4 right-4 md:bottom-6 md:right-6" : "bottom-4 left-1/2 -translate-x-1/2"} z-50`}
        >
          <div className="bg-white rounded-lg shadow-premium-lg border border-gray-200 p-4 md:p-5 max-w-[280px] md:max-w-sm relative">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-text-secondary hover:text-secondary transition-colors"
              aria-label="닫기"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-sm md:text-base text-secondary mb-1.5 pr-6">
              {getTimeBasedMessage()}
            </h3>
            <p className="text-xs md:text-sm text-text-secondary mb-3">
              무료 상담으로 시작하세요
            </p>
            <div className="flex flex-col gap-2">
              <Link
                href={`/${locale}/consultation`}
                className="premium-button px-3 py-2 text-xs md:text-sm w-full text-center"
                onClick={handleClose}
              >
                상담 신청하기
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs md:text-sm"
                onClick={() => (window.location.href = "tel:03180448805")}
              >
                <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1.5" />
                전화 상담
              </Button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
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
            className="bg-white rounded-xl shadow-premium-lg p-8 max-w-md w-full relative"
          >
            <button
              onClick={() => {
                setShowExitIntent(false)
                if (typeof window !== "undefined") {
                  localStorage.setItem(STORAGE_KEY, Date.now().toString())
                }
              }}
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
              <Link
                href={`/${locale}/consultation`}
                className="premium-button w-full text-center flex items-center justify-center"
              >
                <Calendar className="w-5 h-5 mr-2" />
                무료 상담 신청
              </Link>
              <a
                href="tel:03180448805"
                className="premium-button-outline w-full text-center flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-2" />
                전화 상담: 031-8044-8805
              </a>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  return null
}

