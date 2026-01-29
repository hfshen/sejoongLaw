"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Mail, User, Globe, Building } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"

interface InviteFormData {
  email: string
  name: string
  role: "korea_agent" | "translator" | "foreign_lawyer" | "family_viewer" | "admin"
  country?: string
  organization?: string
}

const roleOptions = [
  { value: "korea_agent", label: "한국 에이전트" },
  { value: "translator", label: "번역가" },
  { value: "foreign_lawyer", label: "해외 변호사" },
  { value: "family_viewer", label: "유가족" },
  { value: "admin", label: "관리자" },
]

export default function InviteUserPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<InviteFormData>({
    defaultValues: {
      role: "foreign_lawyer",
    },
  })

  const onSubmit = async (data: InviteFormData) => {
    setSubmitting(true)
    try {
      const response = await fetch("/api/admin/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage =
          errorData.error || errorData.details || `사용자 초대 실패 (${response.status})`
        toast.error(errorMessage)
        console.error("User invite error:", errorData)
        return
      }

      toast.success("사용자 초대가 완료되었습니다. 초대 이메일이 발송되었습니다.")
      router.push("/admin/users")
    } catch (error) {
      toast.error("사용자 초대에 실패했습니다.")
      console.error("User invite form submission error:", error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로
        </Button>
        <h1 className="text-2xl font-bold text-secondary">사용자 초대</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>초대 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("email", {
                    required: "이메일은 필수입니다.",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "올바른 이메일 형식이 아닙니다.",
                    },
                  })}
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  placeholder="user@example.com"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("name", { required: "이름은 필수입니다." })}
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  placeholder="이름을 입력하세요"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                역할 <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role", { required: "역할은 필수입니다." })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* 국가 */}
            <div>
              <label className="block text-sm font-medium mb-2">국가</label>
              <div className="relative">
                <input
                  {...register("country")}
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  placeholder="예: LK, KR"
                />
                <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                ISO 3166-1 alpha-2 코드 (예: LK=스리랑카, KR=한국)
              </p>
            </div>

            {/* 조직 */}
            <div>
              <label className="block text-sm font-medium mb-2">조직</label>
              <div className="relative">
                <input
                  {...register("organization")}
                  type="text"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  placeholder="조직명을 입력하세요"
                />
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <p className="font-medium mb-2">초대 안내:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>초대 이메일이 발송됩니다</li>
                <li>초대 링크는 7일간 유효합니다</li>
                <li>초대 수락 시 비밀번호를 설정할 수 있습니다</li>
              </ul>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={submitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    초대 중...
                  </>
                ) : (
                  "초대 발송"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
