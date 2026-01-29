"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import { Download, Loader2 } from "lucide-react"

interface ExportButtonProps {
  documentId: string
  versionId: string
  targetLangs?: string[]
}

export default function ExportButton({
  documentId,
  versionId,
  targetLangs = ["en"],
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    setError(null)

    try {
      const res = await fetch(`/api/documents/${documentId}/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId,
          targetLangs,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to export document")
      }

      // Get PDF blob
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `document-package-${versionId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      // Get QR code URL from headers
      const qrCodeUrl = res.headers.get("X-QR-Code-URL")
      if (qrCodeUrl) {
        console.log("QR Code URL:", qrCodeUrl)
        // Could show a modal with QR code here
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to export document")
      console.error("Export error", err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <Button
        onClick={handleExport}
        disabled={exporting}
        className="flex items-center gap-2"
      >
        {exporting ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Exporting...
          </>
        ) : (
          <>
            <Download size={16} />
            Export PDF Package
          </>
        )}
      </Button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  )
}
