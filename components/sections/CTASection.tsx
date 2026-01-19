"use client"

import { motion } from "framer-motion"
import { useLocale, useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import { Phone, Mail } from "lucide-react"

export default function CTASection() {
  const locale = useLocale()
  const t = useTranslations()

  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-accent text-white relative overflow-hidden">
      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-3 md:mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl mb-6 md:mb-8 opacity-90">
              {t("cta.description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 md:gap-3 justify-center items-center mb-6 md:mb-8">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100"
                onClick={() => {
                  window.location.href = `/${locale}/booking`
                }}
              >
                {t("cta.booking")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                onClick={() => {
                  window.location.href = `/${locale}/consultation`
                }}
              >
                {t("cta.consultation")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                onClick={() => {
                  window.location.href = "tel:03180448805"
                }}
              >
                <Phone className="w-5 h-5 mr-2" />
                {t("cta.phone")}
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-6 justify-center items-center text-sm md:text-base lg:text-lg">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 md:w-5 md:h-5" />
                <span>{t("cta.email")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 md:w-5 md:h-5" />
                <span>{t("cta.phone")}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

