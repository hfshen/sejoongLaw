"use client"

import { TestimonialCard } from "@/components/ui/TestimonialCard"
import { motion } from "framer-motion"

const testimonials = [
  {
    quote:
      "법무법인 세중의 도움으로 복잡한 부동산 분쟁을 성공적으로 해결할 수 있었습니다. 전문성과 세심한 상담에 정말 감사드립니다.",
    author: "김○○",
    role: "부동산 분쟁 사건",
    rating: 5,
  },
  {
    quote:
      "이혼 상담부터 소송까지 전 과정을 신뢰하고 맡길 수 있었습니다. 변호사님의 전문적인 조언 덕분에 원하는 결과를 얻을 수 있었습니다.",
    author: "이○○",
    role: "이혼 소송 사건",
    rating: 5,
  },
  {
    quote:
      "비자 거절 당했을 때 법무법인 세중의 도움으로 재신청에 성공했습니다. 빠른 대응과 정확한 조언이 인상적이었습니다.",
    author: "박○○",
    role: "비자 신청 사건",
    rating: 5,
  },
]

export default function TestimonialsSection() {
  return (
    <section className="section-padding bg-background-alt">
      <div className="container-max">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="section-title">고객 후기</h2>
          <p className="body-text max-w-2xl mx-auto">
            법무법인 세중을 이용하신 고객들의 생생한 후기를 확인해보세요.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

