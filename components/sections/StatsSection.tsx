"use client"

import { motion } from "framer-motion"
import { StatCard } from "@/components/ui/StatCard"
import { Award, Users, Briefcase, TrendingUp } from "lucide-react"

interface Stat {
  value: number
  label: string
  icon: React.ReactNode
  suffix?: string
}

const stats: Stat[] = [
  {
    value: 15,
    label: "년 이상의 경력",
    icon: <Award className="w-full h-full" />,
    suffix: "+",
  },
  {
    value: 1000,
    label: "건 이상의 성공 사례",
    icon: <Briefcase className="w-full h-full" />,
    suffix: "+",
  },
  {
    value: 5000,
    label: "명 이상의 만족한 고객",
    icon: <Users className="w-full h-full" />,
    suffix: "+",
  },
  {
    value: 95,
    label: "% 이상의 승소율",
    icon: <TrendingUp className="w-full h-full" />,
    suffix: "%",
  },
]

export default function StatsSection() {
  return (
    <section className="section-padding bg-background-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">법무법인 세중의 성과</h2>
          <p className="body-text max-w-2xl mx-auto">
            오랜 경험과 전문성을 바탕으로 고객의 권리를 보호하고 최상의 결과를 만들어냅니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index}>
              <StatCard
                value={stat.value}
                suffix={stat.suffix}
                label={stat.label}
                icon={stat.icon}
                delay={index * 0.1}
                animate={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

