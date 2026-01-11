"use client"

// 에러 바운더리 컴포넌트

import React, { Component, ErrorInfo, ReactNode } from "react"
import Button from "./Button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-secondary mb-4">
              오류가 발생했습니다
            </h2>
            <p className="text-text-secondary mb-6">
              {this.state.error?.message || "예상치 못한 오류가 발생했습니다."}
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={this.handleReset}>다시 시도</Button>
              <Button
                onClick={() => window.location.href = "/admin"}
                variant="outline"
              >
                홈으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

