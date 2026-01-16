"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import Link from "next/link"

interface ServiceCardProps {
  title: string
  description: string
  icon: ReactNode
  href?: string
  delay?: number
  className?: string
}

export default function ServiceCard({
  title,
  description,
  icon,
  href,
  delay = 0,
  className = "",
}: ServiceCardProps) {
  const cardContent = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{
        y: -8,
        rotateY: 5,
        rotateX: -5,
        transition: { duration: 0.3 },
      }}
      className={`
        group relative h-full
        bg-white rounded-2xl shadow-lg
        p-4 md:p-8 border border-gray-100
        cursor-pointer overflow-hidden
        transform-gpu
        ${className}
      `}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Icon container */}
      <div className="relative z-10 mb-6">
        <motion.div
          className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl md:text-2xl font-bold text-secondary mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {/* Arrow indicator */}
      <motion.div
        className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"
        initial={{ x: 0, opacity: 0.5 }}
        whileHover={{ x: 4, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <svg
          className="w-5 h-5 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </motion.div>

      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href} className="block h-full">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
