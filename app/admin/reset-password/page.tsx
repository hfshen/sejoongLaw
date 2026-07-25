"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { KeyRound, Loader2, Lock, Mail, ShieldCheck } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { classifyAuthFailure } from "@/lib/auth/redirects"
import { createClient } from "@/lib/supabase/client"

function recoveryMessage(reason: string | null) {
  if (reason === "otp_expired") {
    return "비밀번호 재설정 링크가 만료되었거나 이미 사용되었습니다. 새 링크를 요청해 주세요."
  }
  if (reason === "auth_callback_failed") {
    return "비밀번호 재설정 인증을 완료하지 못했습니다. 새 링크를 요청해 주세요."
  }
  return "유효한 비밀번호 재설정 세션을 확인할 수 없습니다."
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  useEffect(() => {
    let active = true

    const initialize = async () => {
      const query = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.slice(1))
      const reason =
        query.get("reason") ||
        classifyAuthFailure({
          error: query.get("error") || hash.get("error"),
          code: query.get("error_code") || hash.get("error_code"),
          description:
            query.get("error_description") || hash.get("error_description"),
        })

      if (reason) {
        if (!active) return
        setError(recoveryMessage(reason))
        setHasRecoverySession(false)
        setCheckingSession(false)
        window.history.replaceState({}, "", window.location.pathname)
        return
      }

      try {
        const supabase = createClient()
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (!active) return
        if (userError || !user) {
          setError(recoveryMessage(null))
          setHasRecoverySession(false)
        } else {
          setHasRecoverySession(true)
          setError("")
        }
      } catch {
        if (!active) return
        setError("인증 세션 확인 중 오류가 발생했습니다.")
        setHasRecoverySession(false)
      } finally {
        if (active) {
          setCheckingSession(false)
          window.history.replaceState({}, "", window.location.pathname)
        }
      }
    }

    void initialize()
    return () => {
      active = false
    }
  }, [])

  const handleResendLink = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("올바른 이메일 주소를 입력해 주세요.")
      return
    }

    setResendLoading(true)
    setError("")
    setResendSuccess(false)

    try {
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/auth/callback?flow=recovery&next=${encodeURIComponent(
        "/admin/reset-password"
      )}`
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo }
      )

      if (resetError) throw resetError
      setResendSuccess(true)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message.toLowerCase() : ""
      setError(
        message.includes("rate limit") || message.includes("too many")
          ? "재설정 메일 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
          : "비밀번호 재설정 메일을 보내지 못했습니다. 이메일 설정을 확인해 주세요."
      )
    } finally {
      setResendLoading(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")

    if (password.length < 8) {
      setError("비밀번호는 8자 이상이어야 합니다.")
      return
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.")
      return
    }
    if (!hasRecoverySession) {
      setError(recoveryMessage(null))
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      setSuccess(true)
      await supabase.auth.signOut()
      window.setTimeout(() => {
        router.replace("/auth/login?password_reset=success")
        router.refresh()
      }, 1200)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message.toLowerCase() : ""
      setError(
        message.includes("session") || message.includes("token")
          ? "재설정 세션이 만료되었습니다. 새 링크를 요청해 주세요."
          : "비밀번호 변경에 실패했습니다. 다시 시도해 주세요."
      )
      if (message.includes("session") || message.includes("token")) {
        setHasRecoverySession(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          재설정 세션을 확인하고 있습니다.
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            {hasRecoverySession ? (
              <KeyRound className="h-8 w-8 text-primary" />
            ) : (
              <Mail className="h-8 w-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold text-secondary">
            {hasRecoverySession ? "새 비밀번호 설정" : "재설정 링크 다시 받기"}
          </CardTitle>
          <p className="mt-2 text-sm text-text-secondary">
            {hasRecoverySession
              ? "새 비밀번호를 입력해 계정을 보호하세요."
              : "등록된 이메일로 새로운 재설정 링크를 보내드립니다."}
          </p>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                비밀번호가 변경되었습니다. 로그인 페이지로 이동합니다.
              </div>
            </div>
          ) : hasRecoverySession ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-secondary">
                  새 비밀번호
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="8자 이상 입력하세요"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-secondary">
                  비밀번호 확인
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="한 번 더 입력하세요"
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {error ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
                {loading ? "변경 중..." : "비밀번호 변경"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              {resendSuccess ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700">
                  재설정 메일을 보냈습니다. 가장 최근에 받은 메일의 링크를 사용해 주세요.
                </div>
              ) : null}
              {error ? (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              ) : null}
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-secondary">
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-primary"
                  placeholder="등록된 이메일을 입력하세요"
                  required
                  autoComplete="email"
                />
              </div>
              <Button onClick={handleResendLink} className="w-full" disabled={resendLoading}>
                {resendLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                {resendLoading ? "전송 중..." : "재설정 링크 보내기"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.replace("/auth/login")} className="w-full">
                로그인 페이지로 돌아가기
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
