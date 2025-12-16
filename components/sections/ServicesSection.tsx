"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import Link from "next/link"
import {
  Plane,
  Home,
  BriefcaseBusiness,
  Gavel,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface PracticeArea {
  title: string
  description: string
  details: string[]
  icon: React.ReactNode
  isSpecialized?: boolean
  category: string
  gradient: string
}

export default function ServicesSection() {
  const t = useTranslations()
  const locale = useLocale()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const practiceAreas: PracticeArea[] = [
    {
      title: t("services.practiceAreas.immigration.title"),
      description: t("services.practiceAreas.immigration.description"),
      details: t.raw("services.practiceAreas.immigration.details") as string[],
      icon: <Plane className="w-full h-full" />,
      isSpecialized: true,
      category: "immigration",
      gradient: "from-blue-500/10 via-cyan-500/10 to-teal-500/10",
    },
    {
      title: t("services.practiceAreas.realEstate.title"),
      description: t("services.practiceAreas.realEstate.description"),
      details: t.raw("services.practiceAreas.realEstate.details") as string[],
      icon: <Home className="w-full h-full" />,
      isSpecialized: true,
      category: "real-estate",
      gradient: "from-amber-500/10 via-orange-500/10 to-red-500/10",
    },
    {
      title: t("services.practiceAreas.corporate.title"),
      description: t("services.practiceAreas.corporate.description"),
      details: t.raw("services.practiceAreas.corporate.details") as string[],
      icon: <BriefcaseBusiness className="w-full h-full" />,
      category: "corporate",
      gradient: "from-purple-500/10 via-pink-500/10 to-rose-500/10",
    },
    {
      title: t("services.practiceAreas.familyCriminal.title"),
      description: t("services.practiceAreas.familyCriminal.description"),
      details: t.raw("services.practiceAreas.familyCriminal.details") as string[],
      icon: <Gavel className="w-full h-full" />,
      category: "family-criminal",
      gradient: "from-indigo-500/10 via-blue-500/10 to-cyan-500/10",
    },
  ]

  return (
    <section id="services" className="section-padding bg-gradient-to-b from-background via-background-alt to-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container-max relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              {t("services.title")}
            </span>
            <Sparkles className="w-5 h-5 text-primary" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-4 md:mb-6">
            {t("services.title")}
          </h2>
          <p className="text-base md:text-lg text-text-secondary max-w-3xl mx-auto px-4 leading-relaxed">
            {t("services.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {practiceAreas.map((area, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="relative group"
            >
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card className="h-full relative overflow-hidden border-2 border-transparent group-hover:border-primary/20 transition-all duration-300 bg-white shadow-lg group-hover:shadow-2xl">
                  {/* Gradient background overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <CardContent className="p-6 md:p-8 relative z-10 h-full flex flex-col">
                    {/* Icon with background */}
                    <div className="mb-6">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-colors duration-300" />
                        <div className="relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300 shadow-lg">
                          {area.icon}
                        </div>
                        {area.isSpecialized && (
                          <motion.div
                            initial={{ scale: 0 }}
                            whileInView={{ scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                            className="absolute -top-2 -right-2"
                          >
                            <Badge variant="primary" className="text-xs font-bold shadow-lg">
                              {t("services.specialized")}
                            </Badge>
                          </motion.div>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-secondary group-hover:text-primary transition-colors duration-300">
                      {area.title}
                    </h3>
                    
                    {/* Description */}
                    <p className="text-sm md:text-base text-text-secondary mb-6 flex-grow leading-relaxed">
                      {area.description}
                    </p>

                    {/* Details on hover */}
                    <AnimatePresence>
                      {hoveredIndex === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-gray-200 group-hover:border-primary/30 transition-colors">
                            <ul className="space-y-2.5">
                              {area.details.map((detail, detailIndex) => (
                                <motion.li
                                  key={detailIndex}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: detailIndex * 0.05 }}
                                  className="text-sm md:text-base text-text-secondary flex items-start group/item"
                                >
                                  <span className="text-primary mr-2.5 font-bold group-hover/item:scale-125 transition-transform">•</span>
                                  <span>{detail}</span>
                                </motion.li>
                              ))}
                            </ul>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Link button */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 + 0.4 }}
                      className="mt-6 pt-4 border-t border-gray-100"
                    >
                      <Link
                        href={`/${locale}/${area.category}`}
                        className="inline-flex items-center gap-2 text-primary font-semibold text-sm md:text-base group/link hover:gap-3 transition-all duration-300"
                      >
                        <span>자세히 보기</span>
                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                      </Link>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

