"use client"

import { useCallback } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { MapPin, Phone, Printer, Building2, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function ContactSectionAnsan() {
  const t = useTranslations("ansan.contact")
  const [copied, setCopied] = useState(false)

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [])

  return (
    <section
      id="contact"
      className="relative py-12 md:py-20 bg-gradient-to-b from-gray-50 to-background"
    >
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-secondary mb-3 md:mb-4">
            {t("title")}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto mt-3 md:mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 max-w-6xl mx-auto px-4">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-xl p-4 md:p-8 border border-gray-100"
          >
            <div className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary mb-1">{t("location.label")}</h3>
                  <p className="text-text-secondary">{t("location.address")}</p>
                  <button
                    onClick={() => copyToClipboard(t("location.address"))}
                    className="mt-2 text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        {t("copyAddress")}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary mb-2">{t("phone.label")}</h3>
                  <a
                    href={`tel:${t("phone.main").replace(/-/g, "")}`}
                    className="block text-lg text-primary hover:underline mb-1"
                  >
                    {t("phone.main")}
                  </a>
                  <a
                    href={`tel:${t("phone.office").replace(/-/g, "")}`}
                    className="block text-lg text-primary hover:underline"
                  >
                    {t("phone.office")}
                  </a>
                </div>
              </div>

              {/* Fax */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Printer className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary mb-1">{t("fax.label")}</h3>
                  <p className="text-lg text-text-secondary">{t("fax.number")}</p>
                </div>
              </div>

              {/* Headquarters */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-secondary mb-1">{t("headquarter.label")}</h3>
                  <p className="text-text-secondary">{t("headquarter.address")}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          >
            <div className="h-full min-h-[300px] md:min-h-[400px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3168.5!2d126.8!3d37.3!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzcsMTI2Ljgg0YHRgtC-0L_QtdC90Ywg0YHRgtC-0L_QtdC90Ywg0YHRgtC-0L_QtdC90Yw!5e0!3m2!1sko!2skr!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0"
                title="법률사무소 세중 안산지사 위치"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
