"use client"

import { useCallback, useEffect, useState } from "react"
import { Clock } from "lucide-react"
import { Card } from "@/components/ui/Card"

interface AuditTrailProps {
  caseId: string
}

interface AuditEvent {
  id: string
  entity_type: string
  entity_id: string
  action: string
  meta: Record<string, unknown>
  actor: string | null
  created_at: string
}

export default function AuditTrail({ caseId }: AuditTrailProps) {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchAuditTrail = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cases/${caseId}/audit`, {
        cache: "no-store",
      })
      if (!response.ok) {
        throw new Error(`Unable to load audit trail: ${response.status}`)
      }
      const data = await response.json()
      if (data.success && Array.isArray(data.data?.events)) {
        setEvents(data.data.events)
      }
    } catch (error) {
      console.error("Failed to fetch audit trail", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [caseId])

  useEffect(() => {
    void fetchAuditTrail()
  }, [fetchAuditTrail])

  const filteredEvents =
    filter === "all"
      ? events
      : events.filter((event) => event.entity_type === filter)

  if (loading) {
    return (
      <Card>
        <div className="p-6 text-center">Loading audit trail...</div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Audit Trail / 감사 추적</h3>
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="p-2 border rounded"
            aria-label="감사 이벤트 유형 필터"
          >
            <option value="all">All Events</option>
            <option value="document">Documents</option>
            <option value="version">Versions</option>
            <option value="translation">Translations</option>
            <option value="approval">Approvals</option>
            <option value="export">Exports</option>
            <option value="case">Cases</option>
          </select>
        </div>

        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No audit events found.
            </p>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded border-l-4 border-blue-500"
              >
                <Clock className="text-gray-400 mt-1" size={16} />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{event.action}</p>
                      <p className="text-sm text-gray-600">
                        {event.entity_type}: {event.entity_id.substring(0, 8)}...
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                  {event.actor && (
                    <p className="text-xs text-gray-500 mt-1">
                      Actor: {event.actor.substring(0, 8)}...
                    </p>
                  )}
                  {Object.keys(event.meta).length > 0 && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-600 cursor-pointer">
                        Metadata
                      </summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto">
                        {JSON.stringify(event.meta, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  )
}
