// 통일된 에러 핸들링 유틸리티

/**
 * 에러를 사용자 친화적인 메시지로 변환
 */
export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    // 일반적인 에러 메시지 처리
    const message = error.message
    
    // Supabase 에러 메시지 처리
    if (message.includes("Invalid login credentials")) {
      return "이메일 또는 비밀번호가 올바르지 않습니다."
    }
    if (message.includes("Email not confirmed")) {
      return "이메일 인증이 완료되지 않았습니다."
    }
    if (message.includes("User not found")) {
      return "등록되지 않은 사용자입니다."
    }
    if (message.includes("Failed to fetch")) {
      return "네트워크 오류가 발생했습니다. 연결을 확인해주세요."
    }
    
    return message
  }
  
  // 알 수 없는 에러 타입
  return "알 수 없는 오류가 발생했습니다."
}

/**
 * API 요청을 수행하고 에러를 통일된 방식으로 처리
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, options)
    const data = await response.json()
    
    if (!response.ok) {
      const errorMessage = data.error || handleApiError(new Error(`HTTP ${response.status}`))
      throw new Error(errorMessage)
    }
    
    return data
  } catch (error) {
    // fetch 자체가 실패한 경우 (네트워크 오류 등)
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error("네트워크 오류가 발생했습니다. 연결을 확인해주세요.")
    }
    
    // 이미 Error 인스턴스인 경우
    if (error instanceof Error) {
      throw error
    }
    
    // 그 외의 경우
    throw new Error(handleApiError(error))
  }
}

/**
 * 서버 사이드에서 사용하는 에러 핸들링
 * NextResponse를 반환하는 API 라우트에서 사용
 */
export function createErrorResponse(
  error: unknown,
  defaultMessage: string = "서버 오류가 발생했습니다.",
  statusCode: number = 500
): Response {
  const message = error instanceof Error ? error.message : defaultMessage
  return new Response(
    JSON.stringify({ error: message }),
    {
      status: statusCode,
      headers: { "Content-Type": "application/json" },
    }
  )
}

/**
 * NextResponse를 사용하는 경우 (Next.js API Route)
 * NextResponse는 호출하는 곳에서 import해야 함
 */
export function createNextErrorResponse(
  NextResponse: typeof import("next/server").NextResponse,
  error: unknown,
  defaultMessage: string = "서버 오류가 발생했습니다.",
  statusCode: number = 500
) {
  let message = defaultMessage
  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === "object" && "message" in error) {
    message = String(error.message)
  }
  return NextResponse.json(
    { error: message },
    { status: statusCode }
  )
}

