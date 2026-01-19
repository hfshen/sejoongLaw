"use client"

import { TestimonialCard } from "@/components/ui/TestimonialCard"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

export default function TestimonialsSection() {
  const t = useTranslations()
  
  const testimonials = [
    {
      quote: t("testimonials.items.1.quote"),
      author: t("testimonials.items.1.author"),
      role: t("testimonials.items.1.role"),
      rating: 5,
    },
    {
      quote: t("testimonials.items.2.quote"),
      author: t("testimonials.items.2.author"),
      role: t("testimonials.items.2.role"),
      rating: 5,
    },
    {
      quote: t("testimonials.items.3.quote"),
      author: t("testimonials.items.3.author"),
      role: t("testimonials.items.3.role"),
      rating: 5,
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
          <h2 className="section-title">{t("testimonials.title")}</h2>
          <p className="body-text max-w-2xl mx-auto px-4">
            {t("testimonials.description")}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              quote={testimonial.quote}
              author={testimonial.author}
              role={testimonial.role}
              rating={testimonial.rating}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

