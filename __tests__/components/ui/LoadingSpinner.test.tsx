// LoadingSpinner 컴포넌트 테스트

import { render, screen } from "@testing-library/react"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

describe("LoadingSpinner", () => {
  it("기본 크기로 렌더링되어야 함", () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole("status", { hidden: true })
    expect(spinner).toBeInTheDocument()
  })

  it("텍스트가 있을 때 표시되어야 함", () => {
    render(<LoadingSpinner text="로딩 중..." />)
    expect(screen.getByText("로딩 중...")).toBeInTheDocument()
  })

  it("크기 prop에 따라 다른 크기로 렌더링되어야 함", () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByRole("status", { hidden: true })
    expect(spinner.querySelector("svg")).toHaveClass("w-4", "h-4")

    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByRole("status", { hidden: true })
    expect(spinner.querySelector("svg")).toHaveClass("w-12", "h-12")
  })
})

