"use client"

import Link from "next/link"
import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { AlertCircle, CheckCircle2, Loader2, Lock, Mail } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"
import { safeInternalPath } from "@/lib/auth/redirects"

type LoginFormData = {
  email: string
  password: string
}

type LoginResponse = {
  success?: boolean
  redirectTo?: string
  error?: string
}

function friendlyLoginError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes("invalid login credentials")) {
    return "이메일 또는 비밀번호가 올바르지 않습니다."
  }
  if (normalized.includes("email not confirmed")) {
    return "이메일 인증이 완료되지 않았습니다. 받은편지함을 확인해 주세요."
  }
  if (normalized.includes("account suspended")) {
    return "정지된 계정입니다. 관리자에게 문의하세요."
  }
  if (normalized.includes("account inactive")) {
    return "아직 활성화되지 않은 계정입니다. 관리자에게 문의하세요."
  }
  if (normalized.includes("insufficient permissions")) {
    return "워크플로우 시스템 접근 권한이 없습니다."
  }
  if (normalized.includes("rate limit") || normalized.includes("too many")) {
    return "로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요."
  }
  return message || "로그인에 실패했습니다."
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>()

  const errorParam = searchParams.get("error")
  const passwordReset = searchParams.get("password_reset") === "success"
  const requestedNext = safeInternalPath(searchParams.get("next"), "")
  const errorMessages: Record<string, string> = {
    account_inactive: "계정이 비활성화되었습니다. 관리자에게 문의하세요.",
    insufficient_permissions: "접근 권한이 없습니다.",
    session_error: "인증 세션을 만들지 못했습니다. 다시 로그인해 주세요.",
    profile_missing: "사용자 권한 정보가 없습니다. 관리자에게 문의하세요.",
  }
  const displayError = errorParam ? errorMessages[errorParam] || null : null

  const onSubmit = async (form: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password,
          next: requestedNext || undefined,
        }),
      })
      const result = (await response.json()) as LoginResponse

      if (!response.ok || !result.success || !result.redirectTo) {
        throw new Error(result.error || "로그인에 실패했습니다.")
      }

      toast.success("로그인되었습니다.")
      router.replace(result.redirectTo)
      router.refresh()
    } catch (caught) {
      const message = friendlyLoginError(
        caught instanceof Error ? caught.message : "로그인에 실패했습니다."
      )
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">로그인</CardTitle>
          <p className="mt-2 text-center text-gray-600">
            법무법인 세중 워크플로우 플랫폼
          </p>
        </CardHeader>
        <CardContent>
          {passwordReset ? (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              <p className="text-sm text-emerald-700">
                비밀번호가 변경되었습니다. 새 비밀번호로 로그인해 주세요.
              </p>
            </div>
          ) : null}

          {error || displayError ? (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error || displayError}</p>
            </div>
          ) : null}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                이메일 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="email"
                  {...register("email", {
                    required: "이메일은 필수입니다.",
                    maxLength: {
                      value: 320,
                      message: "이메일이 너무 깁니다.",
                    },
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "올바른 이메일 형식이 아닙니다.",
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="이메일을 입력하세요"
                />
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.email ? (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  {...register("password", {
                    required: "비밀번호는 필수입니다.",
                    maxLength: {
                      value: 200,
                      message: "비밀번호가 너무 깁니다.",
                    },
                  })}
                  type="password"
                  autoComplete="current-password"
                  className="w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="비밀번호를 입력하세요"
                />
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              </div>
              {errors.password ? (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            비밀번호를 잊으셨나요?{" "}
            <Link href="/admin/reset-password" className="text-primary hover:underline">
              비밀번호 재설정
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
