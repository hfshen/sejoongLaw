"use client"

import { useState, useEffect } from "react"
import Tabs from "@/components/ui/Tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileText, Globe, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface DocumentViewerProps {
  documentId: string
  versionId?: string
}

interface Segment {
  id: string
  seq: number
  key: string
  source_text: string
}

interface Translation {
  id: string
  segment_id: string
  target_lang: string
  translated_text: string
  status: string
}

export default function DocumentViewer({ documentId, versionId }: DocumentViewerProps) {
  const [segments, setSegments] = useState<Segment[]>([])
  const [translations, setTranslations] = useState<Record<string, Translation[]>>({})
  const [loading, setLoading] = useState(true)
  const [activeVersion, setActiveVersion] = useState(versionId)

  useEffect(() => {
    if (!activeVersion) return

    // Fetch segments and translations
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch segments
        const segmentsRes = await fetch(`/api/documents/${documentId}/versions?versionId=${activeVersion}`)
        const segmentsData = await segmentsRes.json()
        
        if (segmentsData.success && segmentsData.data?.segments) {
          const fetchedSegments = segmentsData.data.segments
          if (Array.isArray(fetchedSegments) && fetchedSegments.length > 0) {
            setSegments(fetchedSegments)
          } else {
            setSegments([])
          }
        } else {
          setSegments([])
        }

        // Fetch translations for each language automatically
        const langs = ["en", "si", "ta"]
        const translationsData: Record<string, Translation[]> = {}

        for (const lang of langs) {
          try {
            const transRes = await fetch(
              `/api/documents/${documentId}/translate?versionId=${activeVersion}&targetLang=${lang}`
            )
            const transData = await transRes.json()
            if (transData.success && transData.data?.translations) {
              translationsData[lang] = transData.data.translations
            } else {
              // If no translations exist, try to trigger auto-translation
              // This will happen automatically on save, but we can also trigger it here
              console.log(`No translations found for ${lang}, will be created on next save`)
            }
          } catch (error) {
            console.error(`Failed to fetch ${lang} translations`, error)
          }
        }

        setTranslations(translationsData)
      } catch (error) {
        console.error("Failed to fetch document data", error)
        setSegments([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [documentId, activeVersion])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            승인됨
          </Badge>
        )
      case "reviewed":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            검토 중
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            대기 중
          </Badge>
        )
    }
  }

  const getTranslationBySegmentId = (segmentId: string, lang: string): Translation | null => {
    const langTranslations = translations[lang] || []
    return langTranslations.find((t) => t.segment_id === segmentId) || null
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">문서를 불러오는 중...</div>
        </CardContent>
      </Card>
    )
  }

  const tabs = [
    {
      id: "ko",
      label: "한국어",
      content: (
        <div className="space-y-4">
          {segments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-1">세그먼트가 없습니다</p>
              <p className="text-sm text-gray-500">
                문서를 저장하면 자동으로 세그먼트가 생성됩니다.
              </p>
            </div>
          ) : (
            segments.map((segment) => (
              <div
                key={segment.id}
                className="p-5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      #{segment.seq}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">{segment.key}</span>
                  </div>
                </div>
                <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                  {segment.source_text}
                </p>
              </div>
            ))
          )}
        </div>
      ),
    },
    {
      id: "en",
      label: "English",
      content: (
        <div className="space-y-4">
          {segments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-1">번역이 없습니다</p>
              <p className="text-sm text-gray-500">
                원문 세그먼트가 생성된 후 번역을 진행할 수 있습니다.
              </p>
            </div>
          ) : (
            segments.map((segment) => {
              const translation = getTranslationBySegmentId(segment.id, "en")
              return (
                <div
                  key={segment.id}
                  className="p-5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{segment.seq}
                      </span>
                    </div>
                    {translation && getStatusBadge(translation.status)}
                  </div>
                  {translation ? (
                    <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {translation.translated_text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">번역 대기 중...</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      ),
    },
    {
      id: "si",
      label: "සිංහල",
      content: (
        <div className="space-y-4">
          {segments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-1">번역이 없습니다</p>
              <p className="text-sm text-gray-500">
                원문 세그먼트가 생성된 후 번역을 진행할 수 있습니다.
              </p>
            </div>
          ) : (
            segments.map((segment) => {
              const translation = getTranslationBySegmentId(segment.id, "si")
              return (
                <div
                  key={segment.id}
                  className="p-5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{segment.seq}
                      </span>
                    </div>
                    {translation && getStatusBadge(translation.status)}
                  </div>
                  {translation ? (
                    <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {translation.translated_text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">번역 대기 중...</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      ),
    },
    {
      id: "ta",
      label: "தமிழ்",
      content: (
        <div className="space-y-4">
          {segments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Globe className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium mb-1">번역이 없습니다</p>
              <p className="text-sm text-gray-500">
                원문 세그먼트가 생성된 후 번역을 진행할 수 있습니다.
              </p>
            </div>
          ) : (
            segments.map((segment) => {
              const translation = getTranslationBySegmentId(segment.id, "ta")
              return (
                <div
                  key={segment.id}
                  className="p-5 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        #{segment.seq}
                      </span>
                    </div>
                    {translation && getStatusBadge(translation.status)}
                  </div>
                  {translation ? (
                    <p className="text-base text-gray-900 leading-relaxed whitespace-pre-wrap">
                      {translation.translated_text}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">번역 대기 중...</p>
                  )}
                </div>
              )
            })
          )}
        </div>
      ),
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          문서 내용
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs tabs={tabs} defaultTab="ko" />
      </CardContent>
    </Card>
  )
}
