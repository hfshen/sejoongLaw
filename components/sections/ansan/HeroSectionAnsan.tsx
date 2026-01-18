"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import { ChevronDown, Phone } from "lucide-react"
import { useState, useEffect } from "react"
import Image from "next/image"
import ParticleBackground from "@/components/3d/ParticleBackground"

export default function HeroSectionAnsan() {
  const t = useTranslations("ansan.hero")
  const tCommon = useTranslations("ansan")
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const scrollToNext = () => {
    const nextSection = document.getElementById("introduction")
    nextSection?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Particle Background */}
      <ParticleBackground />
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/80 to-accent/10" />
        <Image
          src="/images/hero/background-law.svg"
          alt={tCommon("imageAlt.background")}
          fill
          className="object-cover opacity-30"
          priority
        />
      </div>
      
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
            {/* Logo Section with 3D Effect */}
            <motion.div
              className="mb-8 flex justify-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              <div className="relative perspective-1000">
                <motion.div
                  className="relative w-64 h-20 md:w-80 md:h-24 lg:w-96 lg:h-28"
                  whileHover={{ 
                    scale: 1.05,
                    rotateY: 5,
                    rotateX: -5,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <Image
                    src="/SJ_logo.svg"
                    alt={tCommon("imageAlt.logo")}
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
                {/* 3D Glow Effect */}
                <motion.div
                  className="absolute -inset-8 bg-primary/20 rounded-3xl blur-2xl -z-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>

            {/* Main Slogan */}
            <motion.h1
              className="hero-title gradient-text mb-4 md:mb-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {t("slogan")}
            </motion.h1>
            
            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <motion.a
                href="/consultation"
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                >
                  {t("cta.consultation")}
                </Button>
              </motion.a>
              <motion.a
                href="tel:031-8044-8805"
                className="inline-block"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-3 md:py-4"
                >
                  <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 inline" />
                  {t("cta.call")}
                </Button>
              </motion.a>
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
        transition={{ duration: 0.8, delay: 0.7 }}
        aria-label={t("scrollIndicator")}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-text-secondary" />
        </motion.div>
      </motion.button>
    </section>
  )
}
