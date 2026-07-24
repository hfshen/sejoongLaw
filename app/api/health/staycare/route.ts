import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { productionReadiness } from "@/lib/env/staycare"
import { providerReadiness } from "@/lib/staycare/providers/registry"
import type { ProviderKind } from "@/lib/staycare/providers/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const providerKinds: ProviderKind[] = ["telecom", "bank", "remittance", "delivery"]
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow",
}

export async function GET() {
  const startedAt = Date.now()

  try {
    const readiness = productionReadiness()
    const providers = providerKinds.map(providerReadiness)
    const tenantSlug = process.env.STAYCARE_TENANT_SLUG || "sejoong-staycare"
    const { data: tenant, error } = await getServiceClient()
      .from("staycare_tenants")
      .select("id, status")
      .eq("slug", tenantSlug)
      .maybeSingle()

    const database = !error && Boolean(tenant?.id) && tenant?.status === "active"
    const providerConnections = providers.every((provider) => provider.configured)
    const ready = readiness.ready && database && providerConnections

    return NextResponse.json(
      {
        service: "sejoong-staycare",
        status: ready ? "ready" : "degraded",
        checks: {
          configuration: readiness.ready,
          database,
          providerConnections,
        },
        version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) || "local",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: ready ? 200 : 503, headers }
    )
  } catch {
    return NextResponse.json(
      {
        service: "sejoong-staycare",
        status: "not_ready",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers }
    )
  }
}
