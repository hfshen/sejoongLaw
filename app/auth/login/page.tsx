"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { Loader2, Mail, Lock, AlertCircle } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"
import { createClient } from "@supabase/supabase-js"

interface LoginFormData {
  email: string
  password: string
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
  const errorMessages: Record<string, string> = {
    account_inactive: "계정이 비활성화되었습니다. 관리자에게 문의하세요.",
    insufficient_permissions: "접근 권한이 없습니다.",
    session_error: "세션 오류가 발생했습니다. 다시 시도해주세요.",
  }

  const displayError = errorParam ? errorMessages[errorParam] || null : null

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase 설정이 올바르지 않습니다.")
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey)

      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (authError) {
        throw authError
      }

      if (!authData.user) {
        throw new Error("로그인에 실패했습니다.")
      }

      // Check user profile status
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("status, role")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.warn("Profile not found, redirecting anyway", { error: profileError })
      } else {
        if (profile.status !== "active") {
          await supabase.auth.signOut()
          throw new Error("계정이 비활성화되었습니다. 관리자에게 문의하세요.")
        }
      }

      toast.success("로그인되었습니다.")
      
      // Redirect based on role or to admin dashboard
      const redirectUrl = profile?.role === "admin" 
        ? "/admin/dashboard" 
        : "/admin/documents"
      
      router.push(redirectUrl)
      router.refresh()
    } catch (err: any) {
      const errorMessage =
        err.message || "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요."
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Login error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">로그인</CardTitle>
          <p className="text-center text-gray-600 mt-2">
            법무법인 세중 워크플로우 플랫폼
          </p>
        </CardHeader>
        <CardContent>
          {(error || displayError) && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error || displayError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  placeholder="이메일을 입력하세요"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "비밀번호는 필수입니다.",
                  })}
                  type="password"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pl-10"
                  placeholder="비밀번호를 입력하세요"
                />
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  로그인 중...
                </>
              ) : (
                "로그인"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>
              비밀번호를 잊으셨나요?{" "}
              <a
                href="/admin/reset-password"
                className="text-primary hover:underline"
              >
                비밀번호 재설정
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
