import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function GET(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Use service client to bypass RLS for admin operations
    const supabase = getServiceClient()
    const { searchParams } = new URL(request.url)
    const orderBy = searchParams.get("orderBy") || "order_index"
    const order = searchParams.get("order") || "asc"

    const { data, error } = await supabase
      .from("members")
      .select("*")
      .order(orderBy, { ascending: order === "asc" })

    if (error) {
      logger.error("Failed to fetch members", { error })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 목록을 불러오는데 실패했습니다.",
        500
      )
    }

    logger.info("Members fetched successfully", { count: data?.length || 0 })
    return createSuccessResponse({ members: data || [] })
  } catch (error) {
    logger.error("Error fetching members", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 목록을 불러오는데 실패했습니다.",
      500
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    const { data: member, error } = await (supabase as any)
      .from("members")
      .insert([
        {
          name,
          position: position || null,
          profile_image_url: profile_image_url || null,
          introduction: introduction || null,
          specialties: specialties || [],
          education: education || [],
          career: career || [],
          order_index: order_index || 0,
        },
      ])
      .select()
      .single()

    if (error) {
      logger.error("Failed to create member", {
        error,
        errorCode: error.code,
        errorMessage: error.message,
        name,
      })
      return createNextErrorResponse(
        NextResponse,
        error,
        "구성원 추가에 실패했습니다.",
        500
      )
    }

    logger.info("Member created successfully", { memberId: member.id, name })
    return createSuccessResponse({ member }, "구성원이 추가되었습니다.", 201)
  } catch (error) {
    logger.error("Error creating member", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "구성원 추가에 실패했습니다.",
      500
    )
  }
}
