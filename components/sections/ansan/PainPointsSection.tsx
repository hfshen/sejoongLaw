"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import PainPointCard from "@/components/ui/PainPointCard"
import {
  AlertCircle,
  FileQuestion,
  Car,
  Wallet,
  Gavel,
} from "lucide-react"

export default function PainPointsSection() {
  const t = useTranslations("ansan.painPoints")

  const icons = useMemo(() => [
    <AlertCircle key="alert" className="w-6 h-6" />,
    <FileQuestion key="file" className="w-6 h-6" />,
    <Car key="car" className="w-6 h-6" />,
    <Wallet key="wallet" className="w-6 h-6" />,
    <Gavel key="gavel" className="w-6 h-6" />,
  ], [])

  return (
    <section
      id="pain-points"
      className="relative py-12 md:py-20 bg-gradient-to-b from-white to-gray-50"
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
          <p className="text-base md:text-lg text-text-secondary max-w-2xl mx-auto px-4">
            이런 상황이라면 세중이 도와드립니다
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-3 md:mt-4" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <PainPointCard
              key={index}
              title={t(`items.${index}.title`)}
              description={t(`items.${index}.description`)}
              icon={icons[index]}
              index={index}
              delay={index * 0.1}
              className={index >= 3 ? "md:col-span-2 lg:col-span-1" : ""}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
