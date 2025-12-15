"use client"

import { motion } from "framer-motion"
import { useTranslations, useLocale } from "next-intl"
import Button from "@/components/ui/Button"
import { ChevronDown } from "lucide-react"
import Image from "next/image"

export default function HeroSection() {
  const t = useTranslations()
  const locale = useLocale()

  const scrollToNext = () => {
    const nextSection = document.getElementById("services")
    nextSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/5" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5" />
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container-max relative z-10">
        <div className="text-center max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Logo Section */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="relative">
                <motion.div
                  className="relative w-64 h-20 md:w-80 md:h-24 lg:w-96 lg:h-28"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/SJ_logo.svg"
                    alt="법무법인 세중 로고"
                    fill
                    className="object-contain"
                    priority
                  />
                </motion.div>
                <motion.div
                  className="absolute -inset-4 bg-primary/10 rounded-2xl blur-xl -z-10"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              className="hero-title gradient-text mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t("common.title")}
            </motion.h1>
            
            {/* Subtitle */}
            <motion.p
              className="text-xl md:text-2xl lg:text-3xl text-text-secondary mb-4 font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {t("common.subtitle")}
            </motion.p>
            
            {/* Description */}
            <motion.p
              className="body-text text-lg md:text-xl mb-12 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              전문성과 신뢰로 고객의 권리를 보호하는 법무법인 세중입니다.
              <br />
              다양한 법률 분야에서 풍부한 경험과 노하우를 바탕으로 최상의 서비스를 제공합니다.
            </motion.p>
            
            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <Button
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={() => {
                  window.location.href = `/${locale}/booking`
                }}
              >
                온라인 예약하기
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={() => {
                  window.location.href = `/${locale}/consultation`
                }}
              >
                무료 상담 신청
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-lg px-8 py-6"
                onClick={scrollToNext}
              >
                서비스 알아보기
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        onClick={scrollToNext}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 focus-ring rounded-full p-2"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        aria-label="다음 섹션으로 스크롤"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-8 h-8 text-text-secondary" />
        </motion.div>
      </motion.button>
    </section>
  )
}

