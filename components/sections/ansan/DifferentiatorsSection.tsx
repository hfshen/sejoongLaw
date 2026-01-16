"use client"

import { useMemo } from "react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Layers, Handshake, Languages } from "lucide-react"

export default function DifferentiatorsSection() {
  const t = useTranslations("ansan.differentiators")

  const differentiators = useMemo(() => [
    {
      key: "oneStop",
      icon: <Layers className="w-12 h-12 text-primary" />,
    },
    {
      key: "practical",
      icon: <Handshake className="w-12 h-12 text-primary" />,
    },
    {
      key: "global",
      icon: <Languages className="w-12 h-12 text-primary" />,
    },
  ], [])

  return (
    <section
      id="differentiators"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 lg:gap-12 max-w-6xl mx-auto px-4">
          {differentiators.map((item, index) => (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-4 md:p-8 shadow-lg border border-gray-100 text-center"
            >
              <motion.div
                className="mb-6 flex justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                {item.icon}
              </motion.div>
              <h3 className="text-xl md:text-2xl font-bold text-secondary mb-3 md:mb-4">
                {t(`${item.key}.title`)}
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed">
                {t(`${item.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
