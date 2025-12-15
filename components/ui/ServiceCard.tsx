"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./Card"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface ServiceCardProps {
  title: string
  description: string
  href: string
  icon?: React.ReactNode
  delay?: number
  className?: string
}

export function ServiceCard({
  title,
  description,
  href,
  icon,
  delay = 0,
  className,
}: ServiceCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <Link href={href} className="block h-full">
        <Card hover className={cn("h-full flex flex-col", className)}>
          <CardHeader>
            {icon && (
              <div className="text-primary text-4xl mb-4 group-hover:scale-110 transition-transform">
                {icon}
              </div>
            )}
            <CardTitle>{title}</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow">
            <CardDescription>{description}</CardDescription>
          </CardContent>
          <CardFooter>
            <div className="flex items-center text-primary font-semibold group-hover:gap-2 transition-all">
              자세히 보기
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  )
}

