"use client"

import { useTranslations, useLocale } from "next-intl"
import { ServiceCard } from "@/components/ui/ServiceCard"
import { motion } from "framer-motion"
import {
  Scale,
  Building2,
  Plane,
  Users,
  FileText,
  Briefcase,
} from "lucide-react"

export default function ServicesSection() {
  const t = useTranslations()
  const locale = useLocale()

  const services = [
    {
      title: t("nav.litigation"),
      description: "부동산, 이혼, 상속, 교통사고 등 다양한 소송 업무를 전문적으로 처리합니다.",
      href: `/${locale}/litigation/real-estate`,
      icon: <Scale className="w-full h-full" />,
    },
    {
      title: t("nav.corporate"),
      description: "기업의 법률 자문, M&A, 해외투자 등 기업 관련 법률 서비스를 제공합니다.",
      href: `/${locale}/corporate/advisory`,
      icon: <Building2 className="w-full h-full" />,
    },
    {
      title: t("nav.immigration"),
      description: "비자 신청, 이민 상담, 비자 거절 대응 등 해외이주 관련 법률 서비스를 제공합니다.",
      href: `/${locale}/immigration/visa`,
      icon: <Plane className="w-full h-full" />,
    },
    {
      title: t("nav.foreigner"),
      description: "재한 외국인을 위한 비자, 체류허가, 투자 관련 법률 서비스를 제공합니다.",
      href: `/${locale}/foreigner/visa`,
      icon: <Users className="w-full h-full" />,
    },
  ]

  return (
    <section id="services" className="section-padding bg-background">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">주요 서비스</h2>
          <p className="body-text max-w-2xl mx-auto">
            다양한 법률 분야에서 전문적인 서비스를 제공하여 고객의 권리를 보호하고 최상의 결과를 만들어냅니다.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service.href}
              title={service.title}
              description={service.description}
              href={service.href}
              icon={service.icon}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

