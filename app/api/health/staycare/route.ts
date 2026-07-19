import { NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { productionReadiness } from "@/lib/env/staycare"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const startedAt = Date.now()

  try {
    const readiness = productionReadiness()
    const tenantSlug = process.env.STAYCARE_TENANT_SLUG || "sejoong-staycare"
    const { data: tenant, error } = await getServiceClient()
      .from("staycare_tenants")
      .select("id, status")
      .eq("slug", tenantSlug)
      .maybeSingle()

    const database = !error && Boolean(tenant?.id) && tenant?.status === "active"
    const checks = {
      ...readiness.checks,
      database,
    }
    const ready = Object.values(checks).every(Boolean)

    return NextResponse.json(
      {
        service: "sejoong-staycare",
        status: ready ? "ready" : "degraded",
        checks,
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      {
        status: ready ? 200 : 503,
        headers: { "Cache-Control": "no-store" },
      }
    )
  } catch (error) {
    return NextResponse.json(
      {
        service: "sejoong-staycare",
        status: "not_ready",
        error: error instanceof Error ? error.message : "Health check failed",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    )
  }
}
