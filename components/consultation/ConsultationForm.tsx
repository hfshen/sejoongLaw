"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Button from "@/components/ui/Button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import { useTranslations, useLocale } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"

const consultationSchema = z.object({
  service: z.string().min(1, "서비스를 선택해주세요"),
  name: z.string().min(2, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z.string().min(10, "연락처를 입력해주세요"),
  subject: z.string().min(5, "제목을 입력해주세요"),
  message: z.string().min(10, "상담 내용을 입력해주세요"),
  files: z.array(z.instanceof(File)).optional(),
})

type ConsultationFormData = z.infer<typeof consultationSchema>

const services = [
  "소송업무",
  "기업자문",
  "해외이주",
  "외국인센터",
  "기타",
]

export default function ConsultationForm() {
  const t = useTranslations()
  const locale = useLocale()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
  })

  const selectedService = watch("service")

  const onSubmit = async (data: ConsultationFormData) => {
    setIsSubmitting(true)
    try {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        if (key === "files" && value) {
          ;(value as File[]).forEach((file) => {
            formData.append("files", file)
          })
        } else {
          formData.append(key, value as string)
        }
      })

      const response = await fetch("/api/consultation", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setSubmitted(true)
      } else {
        throw new Error("상담 신청에 실패했습니다.")
      }
    } catch (error) {
      console.error("Error submitting consultation:", error)
      alert("상담 신청 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="text-center">
        <CardContent className="py-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">
              상담 신청이 완료되었습니다
            </h3>
            <p className="body-text">
              빠른 시일 내에 연락드리겠습니다.
            </p>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>무료 상담 신청</CardTitle>
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <label htmlFor="service-select" className="block text-sm font-medium text-secondary mb-2">
                    상담 서비스 선택 *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="service-select">
                    {services.map((service) => (
                      <button
                        key={service}
                        type="button"
                        role="radio"
                        aria-checked={selectedService === service}
                        onClick={() => {
                          setValue("service", service)
                          setStep(2)
                        }}
                        className={`p-4 rounded-lg border-2 transition-all text-left focus-ring ${
                          selectedService === service
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-primary/50"
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                  {errors.service && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.service.message}
                    </p>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary mb-2">
                      이름 *
                    </label>
                    <input
                      id="name"
                      {...register("name")}
                      className="premium-input"
                      placeholder="홍길동"
                      aria-invalid={errors.name ? "true" : "false"}
                      aria-describedby={errors.name ? "name-error" : undefined}
                    />
                    {errors.name && (
                      <p id="name-error" className="text-red-500 text-sm mt-1" role="alert">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      연락처 *
                    </label>
                    <input
                      {...register("phone")}
                      className="premium-input"
                      placeholder="010-1234-5678"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    이메일 *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    className="premium-input"
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    이전
                  </Button>
                  <Button type="button" onClick={() => setStep(3)}>
                    다음
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    제목 *
                  </label>
                  <input
                    {...register("subject")}
                    className="premium-input"
                    placeholder="상담 제목을 입력해주세요"
                  />
                  {errors.subject && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.subject.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    상담 내용 *
                  </label>
                  <textarea
                    {...register("message")}
                    className="premium-textarea"
                    placeholder="상담 내용을 자세히 입력해주세요"
                    rows={6}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.message.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    관련 문서 (선택)
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || [])
                      setValue("files", files)
                    }}
                    className="premium-input"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                  >
                    이전
                  </Button>
                  <Button type="submit" isLoading={isSubmitting}>
                    상담 신청하기
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </CardContent>
    </Card>
  )
}

