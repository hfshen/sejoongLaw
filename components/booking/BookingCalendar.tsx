"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { Calendar, Clock, User, Phone, Mail, Video } from "lucide-react"
import { useLocale } from "next-intl"
import { format, addDays, isSameDay, startOfDay } from "date-fns"
import { ko } from "date-fns/locale"

const bookingSchema = z.object({
  date: z.date(),
  time: z.string().min(1, "시간을 선택해주세요"),
  service: z.string().min(1, "서비스를 선택해주세요"),
  name: z.string().min(2, "이름을 입력해주세요"),
  phone: z.string().min(10, "연락처를 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  consultationType: z.enum(["in-person", "online"]),
  message: z.string().optional(),
})

type BookingFormData = z.infer<typeof bookingSchema>

const timeSlots = [
  "09:00",
  "10:00",
  "11:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
]

const services = [
  "부동산 분쟁",
  "이혼 소송",
  "상속 분쟁",
  "비자 신청",
  "기업 자문",
  "기타",
]

export default function BookingCalendar() {
  const locale = useLocale()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [availableSlots, setAvailableSlots] = useState<string[]>(timeSlots)
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // 선택된 날짜의 예약된 시간 조회
  useEffect(() => {
    const fetchBookedSlots = async () => {
      if (selectedDate) {
        try {
          const dateStr = format(selectedDate, "yyyy-MM-dd")
          const response = await fetch(`/api/booking?date=${dateStr}`)
          const data = await response.json()
          
          if (response.ok) {
            setBookedSlots(data.bookedTimes || [])
            // 예약된 시간 제외
            setAvailableSlots(
              timeSlots.filter((slot) => !(data.bookedTimes || []).includes(slot))
            )
          } else {
            // 에러가 발생해도 빈 배열로 처리하여 캘린더가 작동하도록 함
            console.warn("Failed to fetch booked slots:", data.error)
            setBookedSlots([])
            setAvailableSlots(timeSlots)
          }
        } catch (error) {
          console.error("Failed to fetch booked slots:", error)
          // 에러 발생 시 모든 시간을 사용 가능한 것으로 표시
          setBookedSlots([])
          setAvailableSlots(timeSlots)
        }
      }
    }
    fetchBookedSlots()
  }, [selectedDate])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: new Date(),
      consultationType: "in-person",
    },
  })

  const selectedTime = watch("time")
  const consultationType = watch("consultationType")

  // 다음 30일 생성
  const availableDates = Array.from({ length: 30 }, (_, i) =>
    addDays(new Date(), i)
  )

  const onSubmit = async (data: BookingFormData) => {
    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          date: data.date.toISOString().split("T")[0],
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert(
          `예약이 완료되었습니다!\n\n예약 정보:\n- 날짜: ${format(data.date, "yyyy년 MM월 dd일", { locale: ko })}\n- 시간: ${data.time}\n- 상담 방식: ${data.consultationType === "in-person" ? "방문 상담" : "온라인 상담"}\n\n확인 이메일을 발송했습니다.`
        )
        window.location.reload()
      } else {
        const errorMessage = result.error || "예약에 실패했습니다."
        throw new Error(errorMessage)
      }
    } catch (error: any) {
      console.error("Booking error:", error)
      alert(`예약 중 오류가 발생했습니다: ${error.message || "알 수 없는 오류"}\n\n전화로 직접 예약하시려면 031-8044-8805로 연락주세요.`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          상담 예약
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              날짜 선택
            </label>
            <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
              {availableDates.map((date) => {
                const isSelected = isSameDay(date, selectedDate)
                const isPast = date < startOfDay(new Date())
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date)
                      setValue("date", date)
                    }}
                    disabled={isPast}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all
                      ${isSelected
                        ? "bg-primary text-white"
                        : isPast
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-gray-100 text-secondary hover:bg-gray-200"}
                    `}
                  >
                    <div>{format(date, "d", { locale: ko })}</div>
                    <div className="text-xs">
                      {format(date, "EEE", { locale: ko })}
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Time Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              시간 선택
            </label>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => {
                const isBooked = bookedSlots.includes(time)
                const isSelected = selectedTime === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => !isBooked && setValue("time", time)}
                    disabled={isBooked}
                    className={`
                      p-3 rounded-lg text-sm font-medium transition-all
                      ${isSelected
                        ? "bg-primary text-white"
                        : isBooked
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed line-through"
                          : "bg-gray-100 text-secondary hover:bg-gray-200"}
                    `}
                    title={isBooked ? "이미 예약된 시간입니다" : ""}
                  >
                    <Clock className="w-4 h-4 mx-auto mb-1" />
                    {time}
                    {isBooked && (
                      <span className="block text-xs mt-1">예약완료</span>
                    )}
                  </button>
                )
              })}
            </div>
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

          {/* Consultation Type */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-3">
              상담 방식
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setValue("consultationType", "in-person")}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${consultationType === "in-person"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"}
                `}
              >
                <User className="w-5 h-5 mb-2 text-primary" />
                <div className="font-semibold">방문 상담</div>
                <div className="text-xs text-text-secondary">
                  사무실 방문 상담
                </div>
              </button>
              <button
                type="button"
                onClick={() => setValue("consultationType", "online")}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${consultationType === "online"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-primary/50"}
                `}
              >
                <Video className="w-5 h-5 mb-2 text-primary" />
                <div className="font-semibold">온라인 상담</div>
                <div className="text-xs text-text-secondary">
                  화상 통화 상담
                </div>
              </button>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              상담 서비스 *
            </label>
            <select
              {...register("service")}
              className="premium-input"
            >
              <option value="">서비스를 선택해주세요</option>
              {services.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="text-red-500 text-sm mt-1">
                {errors.service.message}
              </p>
            )}
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                이름 *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register("name")}
                  className="premium-input pl-10"
                  placeholder="홍길동"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                연락처 *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                <input
                  {...register("phone")}
                  className="premium-input pl-10"
                  placeholder="010-1234-5678"
                />
              </div>
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
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
              <input
                {...register("email")}
                type="email"
                className="premium-input pl-10"
                placeholder="example@email.com"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">
              상담 내용 (선택)
            </label>
            <textarea
              {...register("message")}
              className="premium-textarea"
              placeholder="상담하고 싶은 내용을 간단히 적어주세요"
              rows={4}
            />
          </div>

          <Button type="submit" className="w-full" size="lg">
            예약 완료
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

