"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/Card"
import { MapPin, Phone, Building2 } from "lucide-react"
import KakaoMap from "@/components/maps/KakaoMap"
import Link from "next/link"

interface BranchInfo {
  key: string
  lat: number
  lng: number
}

export default function NetworkSection() {
  const t = useTranslations()

  const branches: BranchInfo[] = [
    {
      key: "seoul",
      lat: 37.5015,
      lng: 127.0037,
    },
    {
      key: "uijeongbu",
      lat: 37.7381,
      lng: 127.0476,
    },
    {
      key: "ansan",
      lat: 37.3219,
      lng: 126.8308,
    },
  ]

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">{t("network.title")}</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {branches.map((branch, index) => {
            const branchInfo = t.raw(`network.${branch.key}`) as {
              name: string
              nameKo: string
              address: string
              focus: string
              phone: string
            }

            return (
              <motion.div
                key={branch.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card hover className="h-full">
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold mb-2 text-secondary">
                        {branchInfo.name}
                      </h3>
                      <p className="text-sm text-text-secondary mb-4">
                        {branchInfo.nameKo}
                      </p>
                    </div>

                    <div className="mb-4">
                      <KakaoMap
                        lat={branch.lat}
                        lng={branch.lng}
                        name={branchInfo.nameKo}
                        className="w-full h-48 rounded-lg"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <MapPin className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text-secondary">
                          {branchInfo.address}
                        </p>
                      </div>

                      <div className="flex items-start">
                        <Building2 className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text-secondary">
                          <span className="font-semibold">{t("network.focus")}: </span>
                          {branchInfo.focus}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <Phone className="w-5 h-5 text-primary mr-2 flex-shrink-0" />
                        <Link
                          href={`tel:${branchInfo.phone.replace(/-/g, "")}`}
                          className="text-sm text-primary hover:underline font-semibold"
                        >
                          {branchInfo.phone}
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

