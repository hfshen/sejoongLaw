import { cookies } from "next/headers"

export async function isAdminAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")
    return session?.value === "authenticated"
  } catch (error) {
    // cookies() 호출 실패 시 (예: 서버 컴포넌트가 아닌 경우)
    return false
  }
}

