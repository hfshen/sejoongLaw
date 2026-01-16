"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export default function IntroductionSection() {
  const t = useTranslations("ansan.introduction")

  return (
    <section
      id="introduction"
      className="relative py-12 md:py-20 bg-gradient-to-b from-background to-white overflow-hidden"
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8 md:mb-12"
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-6">
              {t("title")}
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-4 md:p-8 lg:p-12 border border-gray-100"
          >
            <p className="text-base md:text-lg lg:text-xl text-text-secondary leading-relaxed whitespace-pre-line">
              {t("content")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
