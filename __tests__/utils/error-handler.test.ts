// 에러 핸들링 유틸리티 테스트

import { handleApiError } from "@/lib/utils/error-handler"

describe("handleApiError", () => {
  it("Error 인스턴스를 처리해야 함", () => {
    const error = new Error("Test error")
    expect(handleApiError(error)).toBe("Test error")
  })

  it("Supabase 로그인 에러를 한국어로 변환해야 함", () => {
    const error = new Error("Invalid login credentials")
    expect(handleApiError(error)).toBe("이메일 또는 비밀번호가 올바르지 않습니다.")
  })

  it("네트워크 에러를 한국어로 변환해야 함", () => {
    const error = new Error("Failed to fetch")
    expect(handleApiError(error)).toBe("네트워크 오류가 발생했습니다. 연결을 확인해주세요.")
  })

  it("알 수 없는 에러 타입을 처리해야 함", () => {
    expect(handleApiError(null)).toBe("알 수 없는 오류가 발생했습니다.")
    expect(handleApiError(undefined)).toBe("알 수 없는 오류가 발생했습니다.")
    expect(handleApiError("string error")).toBe("알 수 없는 오류가 발생했습니다.")
  })
})

