"use client"

import { motion } from "framer-motion"
import { Card, CardContent } from "./Card"
import { Quote } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestimonialCardProps {
  quote: string
  author: string
  role?: string
  company?: string
  rating?: number
  delay?: number
  className?: string
}

export function TestimonialCard({
  quote,
  author,
  role,
  company,
  rating = 5,
  delay = 0,
  className,
}: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className={cn("relative", className)}>
        <Quote className="absolute top-6 right-6 text-primary/20 w-16 h-16" />
        <CardContent>
          {rating > 0 && (
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn(
                    "w-5 h-5",
                    i < rating ? "text-accent fill-accent" : "text-gray-300"
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          )}
          <p className="body-text mb-6 relative z-10">{quote}</p>
          <div>
            <p className="font-semibold text-secondary">{author}</p>
            {(role || company) && (
              <p className="text-sm text-text-secondary">
                {role}
                {role && company && ", "}
                {company}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

