"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Lock, LogIn } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // 서버 API를 통해서만 인증 (Supabase 인증은 서버에서 처리)
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // 로그인 성공 후 페이지 새로고침하여 쿠키 반영
        window.location.href = "/admin/documents"
      } else {
        // 에러 메시지를 더 자세히 표시
        if (data.error) {
          if (data.error.includes("Invalid login credentials")) {
            setError("이메일 또는 비밀번호가 올바르지 않습니다.")
          } else if (data.error.includes("Email not confirmed")) {
            setError("이메일 인증이 완료되지 않았습니다. 이메일을 확인해주세요.")
          } else if (data.error.includes("User not found")) {
            setError("등록되지 않은 이메일입니다.")
          } else {
            setError(data.error || "로그인에 실패했습니다.")
          }
        } else {
          setError("로그인에 실패했습니다.")
        }
      }
    } catch (err) {
      setError("로그인 중 오류가 발생했습니다. 다시 시도해주세요.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-secondary">
            관리자 로그인
          </CardTitle>
          <p className="text-sm text-text-secondary mt-2">
            서류 관리 시스템에 접속하세요
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                이메일
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="이메일을 입력하세요"
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="비밀번호를 입력하세요"
                required
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "로그인 중..."
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  로그인
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

