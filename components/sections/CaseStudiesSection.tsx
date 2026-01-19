"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { useLocale, useTranslations } from "next-intl"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Card3DLight } from "@/components/3d/Card3D"

interface CaseStudy {
  id: string
  title: string
  category: string
  description: string
  result: string
  image?: string
}

export default function CaseStudiesSection() {
  const locale = useLocale()
  const t = useTranslations()
  
  const caseStudies: CaseStudy[] = [
    {
      id: "1",
      title: t("caseStudies.cases.1.title"),
      category: t("caseStudies.cases.1.category"),
      description: t("caseStudies.cases.1.description"),
      result: t("caseStudies.cases.1.result"),
      image: "/images/cases/case-1.svg",
    },
    {
      id: "2",
      title: t("caseStudies.cases.2.title"),
      category: t("caseStudies.cases.2.category"),
      description: t("caseStudies.cases.2.description"),
      result: t("caseStudies.cases.2.result"),
      image: "/images/cases/case-2.svg",
    },
    {
      id: "3",
      title: t("caseStudies.cases.3.title"),
      category: t("caseStudies.cases.3.category"),
      description: t("caseStudies.cases.3.description"),
      result: t("caseStudies.cases.3.result"),
      image: "/images/cases/case-3.svg",
    },
    {
      id: "4",
      title: t("caseStudies.cases.4.title"),
      category: t("caseStudies.cases.4.category"),
      description: t("caseStudies.cases.4.description"),
      result: t("caseStudies.cases.4.result"),
      image: "/images/cases/case-4.svg",
    },
  ]

  const categories = [
    t("caseStudies.categories.all"),
    t("caseStudies.categories.realEstate"),
    t("caseStudies.categories.divorce"),
    t("caseStudies.categories.visa"),
    t("caseStudies.categories.corporate")
  ]
  
  const [selectedCategory, setSelectedCategory] = useState(t("caseStudies.categories.all"))

  const filteredCases =
    selectedCategory === t("caseStudies.categories.all")
      ? caseStudies
      : caseStudies.filter((c) => c.category === selectedCategory)

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">{t("caseStudies.title")}</h2>
          <p className="body-text max-w-2xl mx-auto">
            {t("caseStudies.description")}
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-text-secondary hover:bg-gray-200"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCases.map((caseStudy, index) => (
            <motion.div
              key={caseStudy.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card3DLight className="h-full">
                <Link href={`/${locale}/cases/${caseStudy.id}`}>
                  <Card hover className="h-full flex flex-col overflow-hidden">
                    {/* Image */}
                    {caseStudy.image && (
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={caseStudy.image}
                          alt={caseStudy.title}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      </div>
                    )}
                    <CardHeader>
                      <Badge variant="primary" className="mb-3">
                        {caseStudy.category}
                      </Badge>
                      <CardTitle className="text-xl">{caseStudy.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardDescription className="mb-4">
                        {caseStudy.description}
                      </CardDescription>
                      <div className="bg-primary/5 p-3 rounded-lg">
                        <p className="text-sm font-semibold text-primary">
                          {caseStudy.result}
                        </p>
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                      <div className="flex items-center text-primary font-semibold">
                        {t("caseStudies.viewMore")}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </div>
                    </div>
                  </Card>
                </Link>
              </Card3DLight>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={`/${locale}/cases`}
            className="premium-button-outline inline-flex items-center"
          >
            {t("caseStudies.viewAll")}
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}

