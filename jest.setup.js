// Jest 테스트 환경 설정

import "@testing-library/jest-dom"

// 전역 모킹 설정
global.fetch = jest.fn()

// Next.js router 모킹
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    }
  },
  usePathname() {
    return "/"
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

