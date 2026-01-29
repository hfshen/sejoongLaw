"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Textarea from "@/components/ui/Textarea"
import { Badge } from "@/components/ui/Badge"
import { Check, X, Clock, MessageSquare } from "lucide-react"

interface ApprovalPanelProps {
  documentId: string
  versionId: string
}

interface Approval {
  id: string
  target_lang: string
  role: string
  decision: "approved" | "rejected"
  comment: string | null
  created_at: string
}

interface ApprovalStatus {
  approved: boolean
  rejected: boolean
  pending: boolean
  approvals: Approval[]
}

export default function ApprovalPanel({ documentId, versionId }: ApprovalPanelProps) {
  const [sourceStatus, setSourceStatus] = useState<ApprovalStatus | null>(null)
  const [translationStatuses, setTranslationStatuses] = useState<
    Record<string, ApprovalStatus>
  >({})
  const [loading, setLoading] = useState(true)
  
  // 각 언어별로 독립적인 comment 상태 관리
  const [comments, setComments] = useState<Record<string, string>>({
    source: "",
    en: "",
    si: "",
    ta: "",
  })
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({
    source: false,
    en: false,
    si: false,
    ta: false,
  })

  useEffect(() => {
    fetchApprovalStatus()
  }, [documentId, versionId])

  const fetchApprovalStatus = async () => {
    try {
      // Fetch source approval status
      const sourceRes = await fetch(
        `/api/documents/${documentId}/approve?versionId=${versionId}&targetLang=source`
      )
      const sourceData = await sourceRes.json()
      if (sourceData.success) {
        setSourceStatus(sourceData.data.status)
      }

      // Fetch translation approval statuses
      const langs = ["en", "si", "ta"]
      const statuses: Record<string, ApprovalStatus> = {}

      for (const lang of langs) {
        try {
          const res = await fetch(
            `/api/documents/${documentId}/approve?versionId=${versionId}&targetLang=${lang}`
          )
          const data = await res.json()
          if (data.success) {
            statuses[lang] = data.data.status
          }
        } catch (error) {
          console.error(`Failed to fetch ${lang} approval status`, error)
        }
      }

      setTranslationStatuses(statuses)
    } catch (error) {
      console.error("Failed to fetch approval status", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (targetLang: string, decision: "approved" | "rejected") => {
    setSubmitting((prev) => ({ ...prev, [targetLang]: true }))
    try {
      const res = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId,
          targetLang,
          decision,
          comment: comments[targetLang] || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setComments((prev) => ({ ...prev, [targetLang]: "" }))
        await fetchApprovalStatus()
      } else {
        alert(data.error || "승인 제출에 실패했습니다.")
      }
    } catch (error) {
      console.error("Failed to submit approval", error)
      alert("승인 제출에 실패했습니다.")
    } finally {
      setSubmitting((prev) => ({ ...prev, [targetLang]: false }))
    }
  }

  const getStatusBadge = (status: ApprovalStatus | null) => {
    if (!status) return null
    
    if (status.approved) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
          <Check className="w-3 h-3 mr-1" />
          승인됨
        </Badge>
      )
    }
    if (status.rejected) {
      return (
        <Badge variant="destructive">
          <X className="w-3 h-3 mr-1" />
          거부됨
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        <Clock className="w-3 h-3 mr-1" />
        대기 중
      </Badge>
    )
  }

  const getLanguageLabel = (lang: string) => {
    const labels: Record<string, string> = {
      source: "원문 (한국어)",
      en: "영어",
      si: "싱할라어",
      ta: "타밀어",
    }
    return labels[lang] || lang
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">승인 상태를 불러오는 중...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">승인 상태</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Source Document Approval */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-lg">{getLanguageLabel("source")}</h4>
            {getStatusBadge(sourceStatus)}
          </div>

          {sourceStatus && sourceStatus.pending && (
            <div className="mt-4 space-y-3">
              <Textarea
                value={comments.source}
                onChange={(e) =>
                  setComments((prev) => ({ ...prev, source: e.target.value }))
                }
                placeholder="의견을 입력하세요 (선택사항)"
                className="w-full"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove("source", "approved")}
                  disabled={submitting.source}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {submitting.source ? "처리 중..." : "승인"}
                </Button>
                <Button
                  onClick={() => handleApprove("source", "rejected")}
                  disabled={submitting.source}
                  variant="destructive"
                >
                  {submitting.source ? "처리 중..." : "거부"}
                </Button>
              </div>
            </div>
          )}

          {/* Approval History */}
          {sourceStatus && sourceStatus.approvals.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                승인 이력
              </h5>
              {sourceStatus.approvals.map((approval) => (
                <div
                  key={approval.id}
                  className={`p-3 rounded-lg text-sm ${
                    approval.decision === "approved"
                      ? "bg-green-50 border border-green-200"
                      : "bg-red-50 border border-red-200"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium">
                      {approval.decision === "approved" ? "✓" : "✗"} {approval.role}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(approval.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  {approval.comment && (
                    <p className="text-gray-600 mt-2 text-xs">{approval.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Translation Approvals */}
        <div className="space-y-6">
          <h4 className="font-medium text-lg">번역본</h4>
          {Object.entries(translationStatuses).map(([lang, status]) => (
            <div key={lang} className="border-b pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium">{getLanguageLabel(lang)}</h5>
                {getStatusBadge(status)}
              </div>

              {status.pending && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={comments[lang]}
                    onChange={(e) =>
                      setComments((prev) => ({ ...prev, [lang]: e.target.value }))
                    }
                    placeholder="의견을 입력하세요 (선택사항)"
                    className="w-full"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(lang, "approved")}
                      disabled={submitting[lang]}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {submitting[lang] ? "처리 중..." : "승인"}
                    </Button>
                    <Button
                      onClick={() => handleApprove(lang, "rejected")}
                      disabled={submitting[lang]}
                      variant="destructive"
                    >
                      {submitting[lang] ? "처리 중..." : "거부"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Approval History */}
              {status.approvals.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    승인 이력
                  </h5>
                  {status.approvals.map((approval) => (
                    <div
                      key={approval.id}
                      className={`p-3 rounded-lg text-sm ${
                        approval.decision === "approved"
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">
                          {approval.decision === "approved" ? "✓" : "✗"} {approval.role}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(approval.created_at).toLocaleString("ko-KR")}
                        </span>
                      </div>
                      {approval.comment && (
                        <p className="text-gray-600 mt-2 text-xs">{approval.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
