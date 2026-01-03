"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/Card"
import { Award, Network, Globe } from "lucide-react"

export default function WhySejoongSection() {
  const t = useTranslations()

  const competencies = [
    {
      icon: <Award className="w-12 h-12" />,
      title: t("whySejoong.authority.title"),
      description: t("whySejoong.authority.description"),
    },
    {
      icon: <Network className="w-12 h-12" />,
      title: t("whySejoong.triNetwork.title"),
      description: t("whySejoong.triNetwork.description"),
    },
    {
      icon: <Globe className="w-12 h-12" />,
      title: t("whySejoong.globalStandard.title"),
      description: t("whySejoong.globalStandard.description"),
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
          <h2 className="section-title">{t("whySejoong.title")}</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {competencies.map((competency, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
              className="h-full"
            >
              <Card hover className="h-full transition-all duration-300 hover:shadow-xl">
                <CardContent className="p-6 md:p-8 lg:p-10 text-center">
                  <div className="flex justify-center mb-5 md:mb-6 text-primary">
                    <motion.div
                      className="relative perspective-1000"
                      whileHover={{
                        rotateY: 360,
                        rotateX: 15,
                        scale: 1.1,
                      }}
                      transition={{
                        rotateY: { duration: 0.8, ease: "easeInOut" },
                        rotateX: { duration: 0.3 },
                        scale: { duration: 0.3 },
                      }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 flex items-center justify-center bg-primary/10 rounded-full relative">
                        <motion.div
                          animate={{
                            rotateY: [0, 360],
                          }}
                          transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ transformStyle: "preserve-3d" }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full blur-xl opacity-50" />
                        </motion.div>
                        <div className="relative z-10">{competency.icon}</div>
                      </div>
                    </motion.div>
                  </div>
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-secondary mb-4 md:mb-5">
                    {competency.title}
                  </h3>
                  <p className="text-base md:text-lg lg:text-xl text-text-secondary leading-relaxed">
                    {competency.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
