"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/Card"

export default function LeaderSection() {
  const t = useTranslations()

  return (
    <section className="section-padding bg-background">
      <div className="container-max">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* 좌측: 저서 표지 이미지 + 인물 사진 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* 저서 표지 이미지 placeholder */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-premium">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-sm text-secondary font-semibold mb-2">
                      《출입국관리법-이론과 실제》
                    </p>
                    <p className="text-xs text-text-secondary">
                      Placeholder
                    </p>
                  </div>
                </div>
              </div>
              {/* 인물 사진 placeholder */}
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-premium">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center p-4">
                    <p className="text-sm text-secondary font-semibold mb-2">
                      이상국 대표변호사
                    </p>
                    <p className="text-xs text-text-secondary">
                      Placeholder
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 우측: CEO MESSAGE */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Card className="h-full">
              <CardContent className="p-8 lg:p-12">
                <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-8">
                  {t("leader.title")}
                </h2>
                
                {/* CEO MESSAGE 인용구 */}
                <blockquote className="text-2xl md:text-3xl font-bold text-primary mb-8 leading-relaxed border-l-4 border-primary pl-6">
                  "{t("leader.ceoMessage")}"
                </blockquote>

                {/* 메시지 본문 */}
                <p className="body-text text-lg leading-relaxed mb-8">
                  {t("leader.message")}
                </p>

                {/* 서명 */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-xl font-semibold text-secondary">
                    {t("leader.name")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
