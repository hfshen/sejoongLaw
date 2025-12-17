"use client"

import { Badge } from "@/components/ui/Badge"

export default function MembersHero() {
  return (
    <section className="section-padding-sm bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>
      <div className="container-max relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <Badge variant="primary" className="mb-6 text-sm md:text-base">
            법인소개
          </Badge>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-secondary mb-6">
            구성원 소개
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
            법무법인 세중의 전문 변호사들은 다양한 법률 분야에서 풍부한 경험과
            전문성을 바탕으로 고객의 권리를 보호합니다.
          </p>
        </div>
      </div>
    </section>
  )
}

