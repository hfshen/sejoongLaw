"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginButton() {
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [step, setStep] = useState<"phone" | "verify">("phone")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSendCode = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      if (response.ok) {
        setStep("verify")
      } else {
        alert("인증번호 발송에 실패했습니다.")
      }
    } catch (error) {
      alert("인증번호 발송에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/sms/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      })

      if (response.ok) {
        // 인증 성공 후 로그인 처리
        router.refresh()
      } else {
        alert("인증번호가 일치하지 않습니다.")
      }
    } catch (error) {
      alert("인증번호 확인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleKakaoLogin = () => {
    window.location.href = "/api/auth/kakao"
  }

  const handleNaverLogin = () => {
    window.location.href = "/api/auth/naver"
  }

  if (step === "phone") {
    return (
      <div className="space-y-4">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="전화번호를 입력하세요"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
        <button
          onClick={handleSendCode}
          disabled={loading}
          className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
        >
          {loading ? "발송 중..." : "인증번호 발송"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleKakaoLogin}
            className="flex-1 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-opacity-90"
          >
            카카오 로그인
          </button>
          <button
            onClick={handleNaverLogin}
            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
          >
            네이버 로그인
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="인증번호를 입력하세요"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <button
        onClick={handleVerifyCode}
        disabled={loading}
        className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
      >
        {loading ? "확인 중..." : "인증번호 확인"}
      </button>
      <button
        onClick={() => setStep("phone")}
        className="w-full text-text-secondary hover:text-primary"
      >
        다시 전화번호 입력
      </button>
    </div>
  )
}

