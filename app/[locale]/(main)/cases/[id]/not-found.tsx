import Link from "next/link"
import Button from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto container-padding">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-secondary mb-4">
          케이스를 찾을 수 없습니다
        </h2>
        <p className="body-text mb-8">
          요청하신 성공 사례가 존재하지 않거나 삭제되었을 수 있습니다.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/ko/cases" className="premium-button inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            성공 사례 목록으로
          </Link>
        </div>
      </div>
    </div>
  )
}

