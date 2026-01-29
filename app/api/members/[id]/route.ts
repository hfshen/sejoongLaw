import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    // Use service client to bypass RLS for admin operations
    const supabase = getServiceClient()

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      logger.error("Failed to fetch member", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        memberId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원을 찾을 수 없습니다.",
        404
      )
    }

    logger.info("Member fetched", { memberId: id })
    return createSuccessResponse({ member: data })
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
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    // Use service client to bypass RLS for admin operations
    const supabase = getServiceClient()
    const body = await request.json()

    const {
      name,
      position,
      profile_image_url,
      introduction,
      specialties,
      education,
      career,
      order_index,
    } = body

    if (!name) {
      return NextResponse.json(
        { error: "이름은 필수입니다." },
        { status: 400 }
      )
    }

    const updateData: Partial<{
      name: string
      position: string | null
      profile_image_url: string | null
      introduction: string | null
      specialties: string[]
      education: string[]
      career: string[]
      order_index: number
    }> = {
      name,
    }

    if (position !== undefined) updateData.position = position
    if (profile_image_url !== undefined)
      updateData.profile_image_url = profile_image_url
    if (introduction !== undefined) updateData.introduction = introduction
    if (specialties !== undefined) updateData.specialties = specialties
    if (education !== undefined) updateData.education = education
    if (career !== undefined) updateData.career = career
    if (order_index !== undefined) updateData.order_index = order_index

    const { data: member, error } = await (supabase as any)
      .from("members")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      logger.error("Failed to update member", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        memberId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 수정에 실패했습니다.",
        500
      )
    }

    logger.info("Member updated", { memberId: id })
    return createSuccessResponse({ member }, "구성원이 수정되었습니다.")
  } catch (error) {
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
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    // Use service client to bypass RLS for admin operations
    const supabase = getServiceClient()

    const { error } = await supabase.from("members").delete().eq("id", id)

    if (error) {
      logger.error("Failed to delete member", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        memberId: id,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 삭제에 실패했습니다.",
        500
      )
    }

    logger.info("Member deleted", { memberId: id })
    return createSuccessResponse(null, "구성원이 삭제되었습니다.")
  } catch (error) {
    logger.error("Error deleting member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 삭제에 실패했습니다.",
      500
    )
  }
}
