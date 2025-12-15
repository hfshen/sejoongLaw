"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { motion } from "framer-motion"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { FileText, Download, Mail, CheckCircle } from "lucide-react"
import { useLocale } from "next-intl"

const documentSchema = z.object({
  documentType: z.string().min(1, "문서 유형을 선택해주세요"),
  name: z.string().min(2, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z.string().min(10, "연락처를 입력해주세요"),
  details: z.record(z.string(), z.string()),
})

type DocumentFormData = z.infer<typeof documentSchema>

const documentTemplates = [
  {
    id: "consultation-request",
    name: "상담 신청서",
    fields: [
      { key: "service", label: "상담 서비스", type: "select", options: ["부동산", "이혼", "상속", "비자", "기업자문"] },
      { key: "purpose", label: "상담 목적", type: "textarea" },
    ],
  },
  {
    id: "contract-review",
    name: "계약서 검토 요청서",
    fields: [
      { key: "contractType", label: "계약 유형", type: "select", options: ["매매", "임대차", "근로", "기타"] },
      { key: "contractDetails", label: "계약 내용", type: "textarea" },
    ],
  },
  {
    id: "certificate-request",
    name: "증명서 요청서",
    fields: [
      { key: "certificateType", label: "증명서 유형", type: "select", options: ["등기부등본", "건축물대장", "기타"] },
      { key: "purpose", label: "용도", type: "textarea" },
    ],
  },
]

export default function DocumentGenerator() {
  const locale = useLocale()
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const template = documentTemplates.find((t) => t.id === selectedTemplate)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema),
  })

  const onSubmit = async (data: DocumentFormData) => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          ...data,
        }),
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${template?.name || "document"}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setGenerated(true)
      } else {
        throw new Error("문서 생성에 실패했습니다.")
      }
    } catch (error) {
      console.error("Document generation error:", error)
      alert("문서 생성 중 오류가 발생했습니다. 다시 시도해주세요.")
    } finally {
      setIsGenerating(false)
    }
  }

  if (generated) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-secondary mb-2">
              문서가 생성되었습니다
            </h3>
            <p className="body-text mb-6">
              문서가 다운로드되었습니다. 이메일로도 발송되었습니다.
            </p>
            <Button onClick={() => setGenerated(false)}>
              새 문서 생성
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          법률 문서 생성
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedTemplate ? (
          <div className="space-y-4">
            <p className="body-text">
              생성할 문서 유형을 선택해주세요.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {documentTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id)
                    setValue("documentType", template.id)
                  }}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <FileText className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold text-lg mb-2">
                    {template.name}
                  </h3>
                  <p className="text-sm text-text-secondary">
                    {template.name}를 자동으로 생성합니다.
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">
                이름 *
              </label>
              <input
                {...register("name")}
                className="premium-input"
                placeholder="홍길동"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
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

            {template?.fields.map((field) => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-secondary mb-2">
                  {field.label} *
                </label>
                {field.type === "select" ? (
                  <select
                    {...register(`details.${field.key}`)}
                    className="premium-input"
                  >
                    <option value="">선택해주세요</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    {...register(`details.${field.key}`)}
                    className="premium-textarea"
                    rows={4}
                    placeholder={`${field.label}을 입력해주세요`}
                  />
                )}
              </div>
            ))}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedTemplate(null)}
              >
                취소
              </Button>
              <Button type="submit" isLoading={isGenerating} className="flex-1">
                <Download className="w-5 h-5 mr-2" />
                문서 생성 및 다운로드
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}

