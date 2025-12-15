"use client"

import { motion } from "framer-motion"
import { useLocale } from "next-intl"
import Button from "@/components/ui/Button"
import { Phone, Mail } from "lucide-react"

export default function CTASection() {
  const locale = useLocale()

  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary-light to-accent text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="container-max relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              지금 바로 상담받으세요
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90">
              전문 변호사가 직접 상담해드립니다. 무료 상담으로 시작하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button
                size="lg"
                variant="secondary"
                className="w-full sm:w-auto bg-white text-primary hover:bg-gray-100"
                onClick={() => {
                  window.location.href = `/${locale}/consultation`
                }}
              >
                무료 상담 신청
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white text-white hover:bg-white/10"
                onClick={() => {
                  window.location.href = "tel:025910372"
                }}
              >
                <Phone className="w-5 h-5 mr-2" />
                02) 591-0372
              </Button>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-lg">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>consult@sejoonglaw.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>02) 591-0372</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

