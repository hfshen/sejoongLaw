"use client"

import { useEffect, useState } from "react"
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"

export type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

// Toast Context (간단한 전역 상태 관리)
let toastListeners: ((toasts: Toast[]) => void)[] = []
let globalToasts: Toast[] = []

function notifyListeners() {
  toastListeners.forEach((listener) => listener([...globalToasts]))
}

function addToast(message: string, type: ToastType = "info", duration: number = 5000) {
  const id = Math.random().toString(36).substring(7)
  const toast: Toast = { id, message, type, duration }
  globalToasts = [...globalToasts, toast]
  notifyListeners()

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  return id
}

function removeToast(id: string) {
  globalToasts = globalToasts.filter((t) => t.id !== id)
  notifyListeners()
}

// 전역 함수로 export
export const toast = {
  success: (message: string, duration?: number) => addToast(message, "success", duration),
  error: (message: string, duration?: number) => addToast(message, "error", duration),
  info: (message: string, duration?: number) => addToast(message, "info", duration),
  warning: (message: string, duration?: number) => addToast(message, "warning", duration),
}

// Toast Container Component
export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    toastListeners.push(listener)
    setToasts([...globalToasts])

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case "info":
      default:
        return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  const getBgColor = (type: ToastType) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800"
      case "error":
        return "bg-red-50 border-red-200 text-red-800"
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "info":
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] max-w-[500px] ${getBgColor(toast.type)} animate-in slide-in-from-right`}
        >
          {getIcon(toast.type)}
          <p className="flex-1 text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  )
}

