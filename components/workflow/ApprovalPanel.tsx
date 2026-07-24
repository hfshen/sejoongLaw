"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Clock, MessageSquare, X } from "lucide-react"
import { Badge } from "@/components/ui/Badge"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import Textarea from "@/components/ui/Textarea"

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

export default function ApprovalPanel({
  documentId,
  versionId,
}: ApprovalPanelProps) {
  const [sourceStatus, setSourceStatus] = useState<ApprovalStatus | null>(null)
  const [translationStatuses, setTranslationStatuses] = useState<
    Record<string, ApprovalStatus>
  >({})
  const [loading, setLoading] = useState(true)
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

  const fetchApprovalStatus = useCallback(async () => {
    setLoading(true)
    try {
      const sourceResponse = await fetch(
        `/api/documents/${documentId}/approve?versionId=${encodeURIComponent(versionId)}&targetLang=source`,
        { cache: "no-store" }
      )
      if (!sourceResponse.ok) {
        throw new Error(`Unable to load source approval: ${sourceResponse.status}`)
      }
      const sourceData = await sourceResponse.json()
      if (sourceData.success) setSourceStatus(sourceData.data.status)

      const languages = ["en", "si", "ta"]
      const entries = await Promise.all(
        languages.map(async (language) => {
          const response = await fetch(
            `/api/documents/${documentId}/approve?versionId=${encodeURIComponent(versionId)}&targetLang=${language}`,
            { cache: "no-store" }
          )
          if (!response.ok) return null
          const data = await response.json()
          return data.success
            ? ([language, data.data.status] as const)
            : null
        })
      )

      setTranslationStatuses(
        Object.fromEntries(
          entries.filter(
            (entry): entry is readonly [string, ApprovalStatus] => entry !== null
          )
        )
      )
    } catch (error) {
      console.error("Failed to fetch approval status", error)
    } finally {
      setLoading(false)
    }
  }, [documentId, versionId])

  useEffect(() => {
    void fetchApprovalStatus()
  }, [fetchApprovalStatus])

  const handleApprove = async (
    targetLang: string,
    decision: "approved" | "rejected"
  ) => {
    setSubmitting((previous) => ({ ...previous, [targetLang]: true }))
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          versionId,
          targetLang,
          decision,
          comment: comments[targetLang] || undefined,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.error || "승인 제출에 실패했습니다.")
      }

      setComments((previous) => ({ ...previous, [targetLang]: "" }))
      await fetchApprovalStatus()
    } catch (error) {
      console.error("Failed to submit approval", error)
      alert(error instanceof Error ? error.message : "승인 제출에 실패했습니다.")
    } finally {
      setSubmitting((previous) => ({ ...previous, [targetLang]: false }))
    }
  }

  const getStatusBadge = (status: ApprovalStatus | null) => {
    if (!status) return null

    if (status.approved) {
      return (
        <Badge
          variant="default"
          className="bg-green-100 text-green-800 border-green-300"
        >
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
      <Badge
        variant="secondary"
        className="bg-yellow-100 text-yellow-800 border-yellow-300"
      >
        <Clock className="w-3 h-3 mr-1" />
        대기 중
      </Badge>
    )
  }

  const getLanguageLabel = (language: string) => {
    const labels: Record<string, string> = {
      source: "원문 (한국어)",
      en: "영어",
      si: "싱할라어",
      ta: "타밀어",
    }
    return labels[language] || language
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            승인 상태를 불러오는 중...
          </div>
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
        <div className="border-b pb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-lg">
              {getLanguageLabel("source")}
            </h4>
            {getStatusBadge(sourceStatus)}
          </div>

          {sourceStatus?.pending && (
            <div className="mt-4 space-y-3">
              <Textarea
                value={comments.source}
                onChange={(event) =>
                  setComments((previous) => ({
                    ...previous,
                    source: event.target.value,
                  }))
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
                      {approval.decision === "approved" ? "✓" : "✗"}{" "}
                      {approval.role}
                    </span>
                    <span className="text-gray-500 text-xs">
                      {new Date(approval.created_at).toLocaleString("ko-KR")}
                    </span>
                  </div>
                  {approval.comment && (
                    <p className="text-gray-600 mt-2 text-xs">
                      {approval.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <h4 className="font-medium text-lg">번역본</h4>
          {Object.entries(translationStatuses).map(([language, status]) => (
            <div key={language} className="border-b pb-6 last:border-b-0">
              <div className="flex items-center justify-between mb-4">
                <h5 className="font-medium">{getLanguageLabel(language)}</h5>
                {getStatusBadge(status)}
              </div>

              {status.pending && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={comments[language]}
                    onChange={(event) =>
                      setComments((previous) => ({
                        ...previous,
                        [language]: event.target.value,
                      }))
                    }
                    placeholder="의견을 입력하세요 (선택사항)"
                    className="w-full"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(language, "approved")}
                      disabled={submitting[language]}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {submitting[language] ? "처리 중..." : "승인"}
                    </Button>
                    <Button
                      onClick={() => handleApprove(language, "rejected")}
                      disabled={submitting[language]}
                      variant="destructive"
                    >
                      {submitting[language] ? "처리 중..." : "거부"}
                    </Button>
                  </div>
                </div>
              )}

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
                          {approval.decision === "approved" ? "✓" : "✗"}{" "}
                          {approval.role}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {new Date(approval.created_at).toLocaleString("ko-KR")}
                        </span>
                      </div>
                      {approval.comment && (
                        <p className="text-gray-600 mt-2 text-xs">
                          {approval.comment}
                        </p>
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
