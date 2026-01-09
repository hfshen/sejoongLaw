"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Lock, Key, Mail } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [email, setEmail] = useState("")
  const [showResendLink, setShowResendLink] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    // URL 해시에서 access_token 또는 에러 추출
    if (typeof window !== "undefined") {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get("access_token")
      const error = params.get("error")
      const errorDescription = params.get("error_description")
      
      if (error) {
        // 에러가 있는 경우
        if (error === "access_denied" && errorDescription?.includes("expired")) {
          setError("비밀번호 재설정 링크가 만료되었습니다. 새로운 링크를 요청해주세요.")
        } else {
          setError(errorDescription || "비밀번호 재설정 링크가 유효하지 않습니다.")
        }
      } else if (token) {
        setAccessToken(token)
      } else {
        setError("유효하지 않은 비밀번호 재설정 링크입니다.")
        setShowResendLink(true)
      }
      
      // 에러가 있으면 재전송 링크 표시
      if (error) {
        setShowResendLink(true)
      }
    }
  }, [])

  const handleResendLink = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.")
      return
    }

    setResendLoading(true)
    setError("")

    try {
      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      })

      if (resetError) {
        setError(resetError.message || "비밀번호 재설정 링크 전송에 실패했습니다.")
      } else {
        setResendSuccess(true)
        setError("")
      }
    } catch (err) {
      setError("비밀번호 재설정 링크 전송 중 오류가 발생했습니다.")
      console.error("Resend link error:", err)
    }

    setResendLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)

    if (!password || !confirmPassword) {
      setError("비밀번호를 입력해주세요.")
      return
    }

    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.")
      return
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }

    if (!accessToken) {
      setError("유효하지 않은 토큰입니다.")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      
      // 세션 설정
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: "",
      })

      if (sessionError) {
        setError("세션 설정에 실패했습니다. 링크가 만료되었을 수 있습니다.")
        setLoading(false)
        return
      }

      // 비밀번호 업데이트
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      })

      if (updateError) {
        setError(updateError.message || "비밀번호 변경에 실패했습니다.")
        setLoading(false)
        return
      }

      // 성공
      setSuccess(true)
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push("/admin/login")
      }, 2000)
    } catch (err) {
      setError("비밀번호 변경 중 오류가 발생했습니다.")
      console.error("Reset password error:", err)
    }

    setLoading(false)
  }

  if (!accessToken && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">로딩 중...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Key className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-secondary">
            비밀번호 재설정
          </CardTitle>
          <p className="text-sm text-text-secondary mt-2">
            새로운 비밀번호를 입력해주세요
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다...
              </div>
            </div>
          ) : showResendLink ? (
            <div className="space-y-4">
              {resendSuccess ? (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  비밀번호 재설정 링크가 이메일로 전송되었습니다. 이메일을 확인해주세요.
                </div>
              ) : (
                <>
                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                      {error}
                    </div>
                  )}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary mb-2">
                      이메일 주소
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="등록된 이메일을 입력하세요"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <Button
                    onClick={handleResendLink}
                    className="w-full"
                    disabled={resendLoading}
                  >
                    {resendLoading ? (
                      "전송 중..."
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        비밀번호 재설정 링크 재전송
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/login")}
                    className="w-full"
                  >
                    로그인 페이지로 돌아가기
                  </Button>
                </>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-secondary mb-2">
                  새 비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="새 비밀번호를 입력하세요 (최소 6자)"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-secondary mb-2">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  minLength={6}
                  autoComplete="new-password"
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
                  "비밀번호 변경 중..."
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    비밀번호 변경
                  </>
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

