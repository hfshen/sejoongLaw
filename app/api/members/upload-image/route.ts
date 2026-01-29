import { NextRequest, NextResponse } from "next/server"
import { getServiceClient } from "@/lib/supabase/service"
import { isAdminAuthenticated } from "@/lib/admin/auth"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"
import logger from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const isAdmin = await isAdminAuthenticated()
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = getServiceClient()
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "파일이 필요합니다." },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 가능합니다." },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "파일 크기는 5MB 이하여야 합니다." },
        { status: 400 }
      )
    }

    // Upload to Supabase Storage
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    const fileName = `members/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("public")
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      logger.error("Failed to upload image", { error: uploadError })
      return createNextErrorResponse(
        NextResponse,
        uploadError,
        "이미지 업로드에 실패했습니다.",
        500
      )
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(fileName)

    logger.info("Image uploaded successfully", { fileName, publicUrl })
    return createSuccessResponse(
      { url: publicUrl, path: fileName },
      "이미지가 업로드되었습니다."
    )
  } catch (error) {
    logger.error("Error uploading image", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "이미지 업로드에 실패했습니다.",
      500
    )
  }
}
