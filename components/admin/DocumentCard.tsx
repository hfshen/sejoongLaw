"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileText, Calendar, User, Globe, ArrowRight } from "lucide-react"
import { getDocumentTypeLabel, type DocumentType } from "@/lib/documents/templates"
import { format } from "date-fns"
import { ko } from "date-fns/locale"

interface DocumentCardProps {
  id: string
  documentType: DocumentType
  name: string
  date: string
  locale: string
  isCaseLinked?: boolean
  caseId?: string | null
  createdAt: string
}

export default function DocumentCard({
  id,
  documentType,
  name,
  date,
  locale,
  isCaseLinked,
  caseId,
  createdAt,
}: DocumentCardProps) {
  const localeMap: Record<string, string> = {
    ko: "한국어",
    en: "English",
    "zh-CN": "简体中文",
  }

  return (
    <Link href={`/admin/documents/${id}`}>
      <Card hover className="h-full">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <Badge variant="primary" className="text-xs">
              {getDocumentTypeLabel(documentType, locale as "ko" | "en" | "zh-CN")}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <Globe className="w-3 h-3" />
              {localeMap[locale] || locale}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-primary" />
            <h3 className="text-lg font-bold text-secondary line-clamp-1">
              {name}
            </h3>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar className="w-4 h-4" />
            <span>
              {format(new Date(date), "yyyy년 MM월 dd일", { locale: ko })}
            </span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-text-secondary">
            <span>생성일: {format(new Date(createdAt), "yyyy.MM.dd", { locale: ko })}</span>
            <div className="flex items-center gap-2">
              {isCaseLinked && (
                <>
                  <span className="text-primary flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    케이스 연결됨
                  </span>
                  {caseId && (
                    <a
                      href={`/admin/cases/${caseId}`}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        window.location.href = `/admin/cases/${caseId}`
                      }}
                      className="text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      케이스로
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

