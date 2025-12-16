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
      <Card className={cn("text-center h-full transition-all duration-300 hover:shadow-lg", className)}>
        <CardContent className="p-5 md:p-6 lg:p-8">
          {icon && (
            <div className="flex justify-center mb-4 md:mb-5 text-primary">
              <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          <div className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-2 md:mb-3" ref={ref}>
            {prefix}
            {typeof finalValue === "number" ? finalValue.toLocaleString() : finalValue}
            {suffix}
          </div>
          <p className="text-text-secondary text-sm md:text-base lg:text-lg leading-relaxed font-medium">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

