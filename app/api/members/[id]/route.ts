import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import {
  firstZodMessage,
  memberUpdateSchema,
  UUID_PATTERN,
} from "@/lib/admin/member-validation"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

async function ensureAdmin() {
  return getAuthenticatedBackofficeProfile(["admin"])
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 구성원 ID가 필요합니다.")

    const supabase = getServiceClient()
    const { data: member, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !member) {
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Member not found"),
        "구성원을 찾을 수 없습니다.",
        404
      )
    }

    logger.info("Member fetched", {
      actorUserId: admin.id,
      memberId: id,
    })
    return createSuccessResponse({ member })
  } catch (error) {
    logger.error("Error fetching member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 구성원 ID가 필요합니다.")

    const parsed = memberUpdateSchema.safeParse(await request.json())
    if (!parsed.success) {
      return badRequest(firstZodMessage(parsed.error))
    }

    const supabase = getServiceClient()
    const { data: member, error } = await supabase
      .from("members")
      .update(parsed.data)
      .eq("id", id)
      .select()
      .single()

    if (error || !member) {
      logger.error("Failed to update member", {
        error,
        actorUserId: admin.id,
        memberId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error || new Error("Updated member was not returned"),
        "구성원 수정에 실패했습니다.",
        500
      )
    }

    logger.info("Member updated", {
      actorUserId: admin.id,
      memberId: id,
      changedFields: Object.keys(parsed.data),
    })
    return createSuccessResponse({ member }, "구성원이 수정되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error updating member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 수정에 실패했습니다.",
      500
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    requireTrustedOrigin(request)
    const admin = await ensureAdmin()
    if (!admin) return forbidden()

    const { id } = await params
    if (!UUID_PATTERN.test(id)) return badRequest("올바른 구성원 ID가 필요합니다.")

    const supabase = getServiceClient()
    const { data: member, error: lookupError } = await supabase
      .from("members")
      .select("profile_image_url")
      .eq("id", id)
      .single()

    if (lookupError || !member) {
      return NextResponse.json({ error: "구성원을 찾을 수 없습니다." }, { status: 404 })
    }

    const { error } = await supabase.from("members").delete().eq("id", id)
    if (error) {
      logger.error("Failed to delete member", {
        error,
        actorUserId: admin.id,
        memberId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 삭제에 실패했습니다.",
        500
      )
    }

    const publicPrefix = "/storage/v1/object/public/public/"
    const imageUrl = member.profile_image_url || ""
    const prefixIndex = imageUrl.indexOf(publicPrefix)
    if (prefixIndex >= 0) {
      const storagePath = decodeURIComponent(
        imageUrl.slice(prefixIndex + publicPrefix.length)
      )
      if (storagePath.startsWith("members/")) {
        const { error: storageError } = await supabase.storage
          .from("public")
          .remove([storagePath])
        if (storageError) {
          logger.warn("Member record deleted but image cleanup failed", {
            error: storageError,
            actorUserId: admin.id,
            memberId: id,
          })
        }
      }
    }

    logger.info("Member deleted", {
      actorUserId: admin.id,
      memberId: id,
    })
    return createSuccessResponse(null, "구성원이 삭제되었습니다.")
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error deleting member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 삭제에 실패했습니다.",
      500
    )
  }
}
