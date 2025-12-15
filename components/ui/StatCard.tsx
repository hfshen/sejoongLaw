"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "./Card"
import { cn } from "@/lib/utils"
import { useInView } from "react-intersection-observer"
import { useEffect, useState } from "react"

interface StatCardProps {
  value: string | number
  label: string
  icon?: React.ReactNode
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
  animate?: boolean
}

export function StatCard({
  value,
  label,
  icon,
  delay = 0,
  className,
  suffix,
  prefix,
  animate = false,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 })

  useEffect(() => {
    if (!animate || typeof value !== "number" || !inView) {
      setDisplayValue(typeof value === "number" ? value : 0)
      return
    }

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0
    let step = 0

    const timer = setInterval(() => {
      step++
      current = Math.min(value, increment * step)
      setDisplayValue(Math.floor(current))

      if (step >= steps) {
        setDisplayValue(value)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [inView, value, animate])

  const finalValue = animate && typeof value === "number" ? displayValue : value

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
          <div className="text-4xl md:text-5xl font-bold text-primary mb-2" ref={ref}>
            {prefix}
            {typeof finalValue === "number" ? finalValue.toLocaleString() : finalValue}
            {suffix}
          </div>
          <p className="text-text-secondary text-lg">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

