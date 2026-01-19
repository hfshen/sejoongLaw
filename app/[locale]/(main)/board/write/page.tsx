"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"

export default function WritePage() {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "cases"
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/board", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category }),
      })

      if (response.ok) {
        router.push("/board")
      } else {
        alert(t("board.write.error"))
      }
    } catch (error) {
      alert(t("board.write.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-secondary mb-8">{t("board.write.title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            {t("board.write.titleLabel")}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-secondary mb-2">
            {t("board.write.contentLabel")}
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? t("board.write.submitting") : t("board.write.submit")}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-200 text-secondary px-6 py-2 rounded-lg hover:bg-gray-300"
          >
            {t("board.write.cancel")}
          </button>
        </div>
      </form>
    </div>
  )
}

