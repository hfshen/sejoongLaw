"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Loader2, CheckCircle, XCircle, Lock } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"

interface AcceptInviteFormData {
  password: string
  confirmPassword: string
  name?: string
  phone?: string
}

export default function AcceptInvitePage({ params }: { params: { token: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [invitation, setInvitation] = useState<{
    email: string
    role: string
    expires_at: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<AcceptInviteFormData>()

  const password = watch("password")

  useEffect(() => {
    const verifyToken = async () => {
      try {
        setLoading(true)
        setError(null)

        // Verify token by checking invitation (we'll create a simple GET endpoint or check client-side)
        // For now, we'll just show the form and verify on submit
        // In production, you might want to verify the token first

        setLoading(false)
      } catch (err: any) {
        setError(err.message || "초대 링크를 확인하는데 실패했습니다.")
        setLoading(false)
      }
    }

    if (params.token) {
      verifyToken()
    }
  }, [params.token])

  const onSubmit = async (data: AcceptInviteFormData) => {
    if (data.password !== data.confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/accept-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          password: data.password,
          name: data.name || undefined,
          phone: data.phone || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "초대 수락에 실패했습니다.")
      }

      toast.success("초대가 수락되었습니다. 로그인 페이지로 이동합니다.")
      
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/login")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "초대 수락에 실패했습니다.")
      toast.error(err.message || "초대 수락에 실패했습니다.")
      console.error("Accept invite error:", err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">초대 링크를 확인하는 중...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-secondary mb-2">초대 링크 오류</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Button onClick={() => router.push("/auth/login")}>
                로그인 페이지로 이동
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">초대 수락</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            계정을 활성화하기 위해 비밀번호를 설정해주세요
          </p>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "비밀번호는 필수입니다.",
                    minLength: {
                      value: 8,
                      message: "비밀번호는 최소 8자 이상이어야 합니다.",
                    },
                  })}
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-10"
                  placeholder="비밀번호를 입력하세요"
                />
                <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <input
                {...register("confirmPassword", {
                  required: "비밀번호 확인은 필수입니다.",
                  validate: (value) =>
                    value === password || "비밀번호가 일치하지 않습니다.",
                })}
                type="password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="비밀번호를 다시 입력하세요"
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 이름 (선택) */}
            <div>
              <label className="block text-sm font-medium mb-2">이름</label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="이름을 입력하세요 (선택사항)"
              />
            </div>

            {/* 전화번호 (선택) */}
            <div>
              <label className="block text-sm font-medium mb-2">전화번호</label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="전화번호를 입력하세요 (선택사항)"
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
              <p className="font-medium mb-1">비밀번호 요구사항:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>최소 8자 이상</li>
                <li>대소문자, 숫자, 특수문자 조합 권장</li>
              </ul>
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  처리 중...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  초대 수락 및 계정 활성화
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
