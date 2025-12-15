"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "./Card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function StatCard({
  value,
  label,
  icon,
  delay = 0,
  className,
  suffix,
  prefix,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn("text-center", className)}>
        <CardContent>
          {icon && (
            <div className="flex justify-center mb-4 text-primary text-4xl">
              {icon}
            </div>
          )}
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
            {prefix}
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </div>
          <p className="text-text-secondary text-lg">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

