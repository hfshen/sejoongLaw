"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import ServiceCard from "@/components/ui/ServiceCard"
import {
  Globe,
  Heart,
  Shield,
  DollarSign,
  Scale,
} from "lucide-react"

export default function ServicesGridSection() {
  const t = useTranslations("ansan.services")

  const services = useMemo(() => [
    {
      key: "immigration",
      icon: <Globe className="w-8 h-8 text-primary" />,
    },
    {
      key: "family",
      icon: <Heart className="w-8 h-8 text-primary" />,
    },
    {
      key: "compensation",
      icon: <Shield className="w-8 h-8 text-primary" />,
    },
    {
      key: "labor",
      icon: <DollarSign className="w-8 h-8 text-primary" />,
    },
    {
      key: "litigation",
      icon: <Scale className="w-8 h-8 text-primary" />,
    },
  ], [])

  return (
    <section
      id="services"
      className="relative py-12 md:py-20 bg-white"
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto px-4">
          {services.map((service, index) => (
            <ServiceCard
              key={service.key}
              title={t(`${service.key}.title`)}
              description={t(`${service.key}.description`)}
              icon={service.icon}
              delay={index * 0.1}
              href={`/${service.key === "immigration" ? "foreigner" : service.key === "family" ? "litigation/divorce" : service.key === "compensation" ? "litigation/insurance" : service.key === "labor" ? "litigation/industrial" : "litigation"}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
