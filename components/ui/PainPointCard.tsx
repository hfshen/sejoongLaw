"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface PainPointCardProps {
  title: string
  description: string
  icon?: ReactNode
  index: number
  delay?: number
  className?: string
}

export default function PainPointCard({
  title,
  description,
  icon,
  index,
  delay = 0,
  className = "",
}: PainPointCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ x: 8, transition: { duration: 0.3 } }}
      className={`
        group relative
        bg-gradient-to-br from-white to-gray-50
        rounded-xl shadow-md
        p-4 md:p-6 border-l-4 border-primary
        cursor-pointer
        ${className}
      `}
    >
      {/* Number badge */}
      <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg shadow-lg">
        {index + 1}
      </div>

      {/* Content */}
      <div className="pt-4">
        {icon && (
          <div className="mb-4 text-primary opacity-60 group-hover:opacity-100 transition-opacity duration-300">
            {icon}
          </div>
        )}
        
        <h3 className="text-lg md:text-xl font-bold text-secondary mb-2 md:mb-3 group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-sm md:text-base text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100"
        initial={{ scale: 0 }}
        whileHover={{ scale: 1.5 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  )
}
