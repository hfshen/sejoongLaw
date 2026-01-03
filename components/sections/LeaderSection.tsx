"use client"

import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/Card"
import { Card3DLight } from "@/components/3d/Card3D"

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
              {/* 저서 표지 이미지 with 3D Frame */}
              <Card3DLight className="aspect-[3/4]">
                <motion.div
                  className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-premium-lg border-4 border-primary/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/leader/book-cover.svg"
                    alt="출입국관리법-이론과 실제"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white font-semibold text-center">
                      《출입국관리법-이론과 실제》
                    </p>
                  </div>
                </motion.div>
              </Card3DLight>
              {/* 인물 사진 with 3D Frame */}
              <Card3DLight className="aspect-[3/4]">
                <motion.div
                  className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-premium-lg border-4 border-accent/20"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src="/images/leader/ceo-photo.svg"
                    alt="이상국 대표변호사"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-xs text-white font-semibold text-center">
                      이상국 대표변호사
                    </p>
                  </div>
                </motion.div>
              </Card3DLight>
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
                  &ldquo;{t("leader.ceoMessage")}&rdquo;
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
