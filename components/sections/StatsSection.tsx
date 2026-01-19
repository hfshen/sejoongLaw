"use client"

import { motion } from "framer-motion"
import { StatCard } from "@/components/ui/StatCard"
import { Award, Users, Briefcase, TrendingUp } from "lucide-react"
import { useTranslations } from "next-intl"

interface Stat {
  value: number
  label: string
  icon: React.ReactNode
  suffix?: string
}

export default function StatsSection() {
  const t = useTranslations()
  
  const stats: Stat[] = [
    {
      value: 15,
      label: t("stats.items.experience"),
      icon: <Award className="w-full h-full" />,
      suffix: "+",
    },
    {
      value: 1000,
      label: t("stats.items.cases"),
      icon: <Briefcase className="w-full h-full" />,
      suffix: "+",
    },
    {
      value: 5000,
      label: t("stats.items.customers"),
      icon: <Users className="w-full h-full" />,
      suffix: "+",
    },
    {
      value: 95,
      label: t("stats.items.winRate"),
      icon: <TrendingUp className="w-full h-full" />,
      suffix: "%",
    },
  ]
  return (
    <section className="section-padding bg-background-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-16"
        >
          <h2 className="section-title">{t("stats.title")}</h2>
          <p className="body-text max-w-2xl mx-auto px-4">
            {t("stats.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              value={stat.value}
              suffix={stat.suffix}
              label={stat.label}
              icon={stat.icon}
              delay={index * 0.1}
              animate={true}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

