"use client"

import { useRouter } from "next/navigation"
import DocumentList from "@/components/admin/DocumentList"
import { LogOut } from "lucide-react"
import Button from "@/components/ui/Button"
import { toast } from "@/components/ui/Toast"

export default function DocumentsPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" })
      router.push("/admin/login")
      router.refresh()
    } catch (error) {
      toast.error("로그아웃 중 오류가 발생했습니다.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h2 className="text-xl font-bold text-secondary">서류 관리 시스템</h2>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DocumentList />
      </main>
    </div>
  )
}

