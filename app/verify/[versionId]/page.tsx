// Verification page for QR code scanning
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getVersion } from "@/lib/documents/versioning"
import { getApprovalChain } from "@/lib/workflow/approval"
import { getAuditTrail } from "@/lib/audit/events"

interface PageProps {
  params: Promise<{ versionId: string }>
  searchParams: Promise<{ hash?: string }>
}

export default async function VerifyPage(props: PageProps) {
  const params = await props.params
  const searchParams = await props.searchParams
  const { versionId } = params
  const { hash } = searchParams

  const supabase = await createClient()

  // Get version
  const version = await getVersion(versionId)
  if (!version) {
    notFound()
  }

  // Verify hash if provided
  const hashValid = hash ? hash === version.sha256 : null

  // Get document
  const { data: document } = await supabase
    .from("documents")
    .select("*")
    .eq("id", version.document_id)
    .single()

  // Get case
  const { data: caseData } = await supabase
    .from("cases")
    .select("*")
    .eq("id", document?.case_id)
    .single()

  // Get approvals
  const approvals = await getApprovalChain(versionId)

  // Get audit trail
  const auditEvents = caseData ? await getAuditTrail(caseData.id) : []

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6">Document Verification / 문서 검증</h1>

          {/* Hash verification */}
          {hashValid !== null && (
            <div
              className={`mb-6 p-4 rounded ${
                hashValid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
              }`}
            >
              <p className={`font-semibold ${hashValid ? "text-green-800" : "text-red-800"}`}>
                {hashValid ? "✓ Hash Verified / 해시 검증 완료" : "✗ Hash Mismatch / 해시 불일치"}
              </p>
              <p className="text-sm mt-2">
                Provided: {hash?.substring(0, 16)}...
                <br />
                Expected: {version.sha256.substring(0, 16)}...
              </p>
            </div>
          )}

          {/* Version info */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Version Information / 버전 정보</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Document:</span> {document?.name}
              </p>
              <p>
                <span className="font-semibold">Version:</span> {version.version_no}
              </p>
              <p>
                <span className="font-semibold">Hash:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded">{version.sha256}</code>
              </p>
              <p>
                <span className="font-semibold">Created:</span>{" "}
                {new Date(version.created_at).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Status:</span> {version.status}
              </p>
            </div>
          </div>

          {/* Approvals */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Approvals / 승인 이력</h2>
            {approvals.length === 0 ? (
              <p className="text-gray-500 text-sm">No approvals recorded.</p>
            ) : (
              <div className="space-y-3">
                {approvals.map((approval) => (
                  <div
                    key={approval.id}
                    className={`p-3 rounded border ${
                      approval.decision === "approved"
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {approval.decision === "approved" ? "✓ Approved" : "✗ Rejected"} by{" "}
                          {approval.role}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(approval.created_at).toLocaleString()}
                        </p>
                        {approval.comment && (
                          <p className="text-sm mt-2">{approval.comment}</p>
                        )}
                      </div>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {approval.target_lang === "source" ? "Source" : approval.target_lang}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Audit trail */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Audit Trail / 감사 추적</h2>
            {auditEvents.length === 0 ? (
              <p className="text-gray-500 text-sm">No audit events recorded.</p>
            ) : (
              <div className="space-y-2">
                {auditEvents.slice(-20).map((event) => (
                  <div key={event.id} className="p-2 bg-gray-50 rounded text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{event.action}</span>
                      <span className="text-gray-600">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs mt-1">
                      {event.entity_type}: {event.entity_id.substring(0, 8)}...
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-500">
            <p>This verification page confirms the authenticity of the document.</p>
            <p className="mt-2">이 검증 페이지는 문서의 진위를 확인합니다.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
