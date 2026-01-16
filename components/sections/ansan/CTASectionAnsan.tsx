"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Button from "@/components/ui/Button"
import { Phone, Calendar, MessageSquare } from "lucide-react"

export default function CTASectionAnsan() {
  const t = useTranslations("ansan.cta")

  return (
    <section className="relative py-12 md:py-20 lg:py-32 bg-gradient-to-br from-primary via-primary/95 to-primary/90 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-3 md:mb-4">
              {t("title")}
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12">
              {t("subtitle")}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center"
          >
            <motion.a
              href="/consultation"
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="secondary"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 bg-white text-primary hover:bg-gray-100 shadow-xl"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 mr-2 inline" />
                {t("consultation")}
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
                className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 border-2 border-white text-white hover:bg-white/10"
              >
                <Phone className="w-4 h-4 md:w-5 md:h-5 mr-2 inline" />
                {t("call")}
              </Button>
            </motion.a>
            <motion.a
              href="/consultation"
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="lg"
                className="text-base md:text-lg px-6 md:px-8 py-3 md:py-4 text-white hover:bg-white/10"
              >
                <MessageSquare className="w-4 h-4 md:w-5 md:h-5 mr-2 inline" />
                {t("inquiry")}
              </Button>
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
