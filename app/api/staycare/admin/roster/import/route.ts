import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getStaffContext } from "@/lib/staycare/auth"
import { getServiceClient } from "@/lib/supabase/service"
import {
  generateInviteCode,
  inviteTokenHash,
  rosterRowHash,
} from "@/lib/staycare/identity"
import { getRequestIp, requireTrustedOrigin } from "@/lib/security/request"
import { rateLimit, rateLimitFailureResponse } from "@/lib/security/rate-limit"

export const runtime = "nodejs"

const optionalDate = z.string().date().optional().or(z.literal(""))
const optionalText = z.string().trim().max(160).optional().or(z.literal(""))

const rowSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  fullNameEn: z.string().trim().min(2).max(120),
  dateOfBirth: z.string().date(),
  officialReferenceNo: optionalText,
  visaType: optionalText,
  occupation: optionalText,
  expectedArrivalDate: optionalDate,
  siteName: optionalText,
  subcontractorName: optionalText,
  department: optionalText,
  jobCode: optionalText,
  shiftCode: optionalText,
  teamCode: optionalText,
  dormitoryName: optionalText,
  roomReference: optionalText,
})

const schema = z.object({
  tenantId: z.string().uuid(),
  cohort: z.object({
    code: z.string().trim().min(2).max(50),
    name: z.string().trim().min(2).max(160),
    targetHeadcount: z.number().int().min(0).max(10000).default(0),
    visaPath: optionalText,
    employerOrganizationId: z.string().uuid().optional().or(z.literal("")),
    sendingOrganizationId: z.string().uuid().optional().or(z.literal("")),
    trainingOrganizationId: z.string().uuid().optional().or(z.literal("")),
  }),
  batch: z
    .object({
      code: z.string().trim().min(2).max(50),
      sequenceNo: z.number().int().min(1).max(999).default(1),
      flightNumber: optionalText,
      scheduledArrivalAt: z.string().datetime().optional().or(z.literal("")),
      arrivalAirport: optionalText,
      arrivalTerminal: optionalText,
      busReference: optionalText,
      leadName: optionalText,
      leadPhone: optionalText,
    })
    .optional(),
  rosterVersion: z.string().trim().min(1).max(80).default("v1"),
  rows: z.array(rowSchema).min(1).max(500),
})

function memberNo(cohortCode: string, row: z.infer<typeof rowSchema>) {
  const fingerprint = rosterRowHash({
    name: row.fullNameEn,
    dob: row.dateOfBirth,
    ref: row.officialReferenceNo,
  })
    .slice(0, 10)
    .toUpperCase()
  const cohort = cohortCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10)
  return `SC-${cohort}-${fingerprint}`
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const context = await getStaffContext()
    if (!context) {
      return NextResponse.json({ error: "Staff authentication required" }, { status: 401 })
    }

    const allowedMemberships = context.memberships.filter((membership) =>
      ["sejoong_admin", "operator_manager"].includes(String(membership.role))
    )
    if (!allowedMemberships.length) {
      return NextResponse.json({ error: "Roster import requires manager access" }, { status: 403 })
    }

    const limited = await rateLimit({
      key: `roster-import:${context.user.id}:${getRequestIp(request)}`,
      limit: 10,
      windowSeconds: 3600,
    })
    if (!limited.allowed) {
      return rateLimitFailureResponse(limited, "Too many roster imports")
    }

    const body = schema.parse(await request.json())
    if (!allowedMemberships.some((membership) => String(membership.tenant_id) === body.tenantId)) {
      return NextResponse.json({ error: "Tenant access denied" }, { status: 403 })
    }

    const admin = getServiceClient()
    const { data: cohort, error: cohortError } = await admin
      .from("staycare_cohorts")
      .upsert(
        {
          tenant_id: body.tenantId,
          code: body.cohort.code,
          name: body.cohort.name,
          target_headcount: body.cohort.targetHeadcount || body.rows.length,
          visa_path: body.cohort.visaPath || null,
          employer_organization_id: body.cohort.employerOrganizationId || null,
          sending_organization_id: body.cohort.sendingOrganizationId || null,
          training_organization_id: body.cohort.trainingOrganizationId || null,
          status: "recruiting",
          created_by: context.user.id,
          metadata: { source: "roster_import" },
        },
        { onConflict: "tenant_id,code" }
      )
      .select("id, code, name")
      .single()
    if (cohortError || !cohort) throw cohortError || new Error("Unable to create cohort")

    let batch: { id: string; batch_code: string } | null = null
    if (body.batch) {
      const { data, error } = await admin
        .from("staycare_arrival_batches")
        .upsert(
          {
            tenant_id: body.tenantId,
            cohort_id: cohort.id,
            batch_code: body.batch.code,
            sequence_no: body.batch.sequenceNo,
            flight_number: body.batch.flightNumber || null,
            scheduled_arrival_at: body.batch.scheduledArrivalAt || null,
            arrival_airport: body.batch.arrivalAirport || null,
            arrival_terminal: body.batch.arrivalTerminal || null,
            bus_reference: body.batch.busReference || null,
            lead_name: body.batch.leadName || null,
            lead_phone: body.batch.leadPhone || null,
            expected_headcount: body.rows.length,
            status: "planning",
            metadata: { source: "roster_import" },
          },
          { onConflict: "tenant_id,batch_code" }
        )
        .select("id, batch_code")
        .single()
      if (error || !data) throw error || new Error("Unable to create arrival batch")
      batch = data
    }

    const imported: Array<Record<string, unknown>> = []
    const failed: Array<{ row: number; name: string; error: string }> = []

    for (const [index, row] of body.rows.entries()) {
      try {
        const generatedMemberNo = memberNo(body.cohort.code, row)
        let existing: { id: string; member_no: string } | null = null
        if (row.officialReferenceNo) {
          const result = await admin
            .from("staycare_workers")
            .select("id, member_no")
            .eq("tenant_id", body.tenantId)
            .eq("official_reference_no", row.officialReferenceNo)
            .maybeSingle()
          if (result.error) throw result.error
          existing = result.data
        }

        const workerPayload = {
          tenant_id: body.tenantId,
          cohort_id: cohort.id,
          arrival_batch_id: batch?.id || null,
          employer_organization_id: body.cohort.employerOrganizationId || null,
          sending_organization_id: body.cohort.sendingOrganizationId || null,
          training_organization_id: body.cohort.trainingOrganizationId || null,
          member_no: existing?.member_no || generatedMemberNo,
          full_name: row.fullName,
          full_name_en: row.fullNameEn,
          date_of_birth: row.dateOfBirth,
          nationality_code: "LK",
          preferred_language: "si",
          visa_type: row.visaType || null,
          occupation: row.occupation || null,
          status: "invited",
          current_phase: "prepare",
          official_reference_no: row.officialReferenceNo || null,
          expected_arrival_date: row.expectedArrivalDate || null,
          profile_completion: 20,
          next_action: "Claim the StayCare invitation and verify the roster identity",
          metadata: { rosterVersion: body.rosterVersion, importRow: index + 1 },
        }

        const workerResult = existing
          ? await admin
              .from("staycare_workers")
              .update(workerPayload)
              .eq("id", existing.id)
              .select("id, member_no")
              .single()
          : await admin
              .from("staycare_workers")
              .insert(workerPayload)
              .select("id, member_no")
              .single()
        if (workerResult.error || !workerResult.data) {
          throw workerResult.error || new Error("Unable to save worker")
        }
        const worker = workerResult.data

        await admin
          .from("staycare_worker_invites")
          .update({ status: "revoked" })
          .eq("worker_id", worker.id)
          .eq("status", "active")

        const inviteCode = generateInviteCode()
        const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
        const { error: inviteError } = await admin.from("staycare_worker_invites").insert({
          tenant_id: body.tenantId,
          worker_id: worker.id,
          cohort_id: cohort.id,
          batch_id: batch?.id || null,
          token_hash: inviteTokenHash(inviteCode),
          token_hint: inviteCode.slice(-4),
          channel: "admin",
          status: "active",
          expires_at: expiresAt,
          issued_by: context.user.id,
        })
        if (inviteError) throw inviteError

        const { error: sourceError } = await admin.from("staycare_worker_roster_sources").upsert(
          {
            tenant_id: body.tenantId,
            worker_id: worker.id,
            cohort_id: cohort.id,
            source_organization_id: body.cohort.sendingOrganizationId || null,
            source_type: body.cohort.sendingOrganizationId ? "sending_agency" : "manual_import",
            official_reference_no: row.officialReferenceNo || null,
            roster_version: body.rosterVersion,
            source_row_hash: rosterRowHash(row),
            imported_at: new Date().toISOString(),
            status: "imported",
            metadata: { importRow: index + 1 },
          },
          { onConflict: "tenant_id,worker_id,source_type,roster_version" }
        )
        if (sourceError) throw sourceError

        if (row.siteName || row.dormitoryName) {
          const { error: placementError } = await admin.from("staycare_placements").insert({
            tenant_id: body.tenantId,
            worker_id: worker.id,
            cohort_id: cohort.id,
            batch_id: batch?.id || null,
            employer_organization_id: body.cohort.employerOrganizationId || null,
            site_name: row.siteName || null,
            subcontractor_name: row.subcontractorName || null,
            department: row.department || null,
            job_code: row.jobCode || null,
            shift_code: row.shiftCode || null,
            team_code: row.teamCode || null,
            dormitory_name: row.dormitoryName || null,
            room_reference: row.roomReference || null,
            status: "planned",
          })
          if (placementError) throw placementError
        }

        imported.push({
          row: index + 1,
          workerId: worker.id,
          memberNo: worker.member_no,
          fullNameEn: row.fullNameEn,
          inviteCode,
          expiresAt,
          batchCode: batch?.batch_code || null,
        })
      } catch (rowError) {
        failed.push({
          row: index + 1,
          name: row.fullNameEn,
          error: rowError instanceof Error ? rowError.message : "Unknown import error",
        })
      }
    }

    await admin.from("staycare_audit_events").insert({
      tenant_id: body.tenantId,
      actor_user_id: context.user.id,
      actor_role: String(allowedMemberships[0].role),
      action: "roster.imported",
      entity_type: "staycare_cohorts",
      entity_id: cohort.id,
      metadata: {
        rosterVersion: body.rosterVersion,
        requested: body.rows.length,
        imported: imported.length,
        failed: failed.length,
        batchId: batch?.id || null,
      },
    })

    return NextResponse.json(
      { cohort, batch, imported, failed },
      { status: failed.length ? 207 : 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid roster data", details: error.flatten() },
        { status: 400 }
      )
    }
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    console.error("StayCare roster import failed", error instanceof Error ? error.message : "unknown")
    return NextResponse.json({ error: "Unable to import the worker roster" }, { status: 500 })
  }
}
