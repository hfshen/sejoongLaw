import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getWorkerContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import { requireTrustedOrigin } from "@/lib/security/request"

const readSchema = z.object({
  notificationIds: z.array(z.string().uuid()).min(1).max(100),
})

export async function GET() {
  const context = await getWorkerContext()
  if (!context?.worker) {
    return NextResponse.json({ error: "Worker account required" }, { status: 401 })
  }

  const { data, error } = await context.supabase
    .from("staycare_notifications")
    .select("id, channel, language, template_code, subject, body, read_at, created_at, metadata")
    .eq("worker_id", context.worker.id)
    .eq("channel", "in_app")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: "Unable to load notifications" }, { status: 500 })
  }

  return NextResponse.json({
    notifications: data || [],
    unread: (data || []).filter((notification) => !notification.read_at).length,
  })
}

export async function PATCH(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getWorkerContext()
    if (!context?.worker) {
      return NextResponse.json({ error: "Worker account required" }, { status: 401 })
    }

    const body = readSchema.parse(await request.json())
    const admin = getServiceClient()
    const { data, error } = await admin
      .from("staycare_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("tenant_id", context.worker.tenant_id)
      .eq("worker_id", context.worker.id)
      .eq("channel", "in_app")
      .in("id", body.notificationIds)
      .select("id, read_at")

    if (error) throw error
    return NextResponse.json({ notifications: data || [] })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid notification request", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: "Unable to update notifications" }, { status: 500 })
  }
}
