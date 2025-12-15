import createMiddleware from "next-intl/middleware"
import { routing } from "./lib/routing"

export default createMiddleware(routing)

export const config = {
  matcher: [
    // 모든 경로를 매칭하되, 다음은 제외:
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
}

