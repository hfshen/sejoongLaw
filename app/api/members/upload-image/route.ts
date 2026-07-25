import { randomUUID } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"
import logger from "@/lib/logger"
import { requireTrustedOrigin } from "@/lib/security/request"
import { getServiceClient } from "@/lib/supabase/service"
import { createNextErrorResponse } from "@/lib/utils/error-handler"
import { createSuccessResponse } from "@/lib/utils/api-response"

const MAX_IMAGE_BYTES = 5 * 1024 * 1024

type ImageFormat = {
  mime: "image/jpeg" | "image/png" | "image/webp"
  extension: "jpg" | "png" | "webp"
}

function forbidden() {
  const response = NextResponse.json({ error: "Forbidden" }, { status: 403 })
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}

function detectImageFormat(buffer: Buffer): ImageFormat | null {
  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return { mime: "image/jpeg", extension: "jpg" }
  }

  const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
  if (
    buffer.length >= pngSignature.length &&
    pngSignature.every((byte, index) => buffer[index] === byte)
  ) {
    return { mime: "image/png", extension: "png" }
  }

  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { mime: "image/webp", extension: "webp" }
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    requireTrustedOrigin(request)
    const admin = await getAuthenticatedBackofficeProfile(["admin"])
    if (!admin) return forbidden()

    const formData = await request.formData()
    const candidate = formData.get("file")
    if (!(candidate instanceof File)) {
      return NextResponse.json({ error: "파일이 필요합니다." }, { status: 400 })
    }
    if (candidate.size <= 0 || candidate.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: "파일 크기는 0바이트보다 크고 5MB 이하여야 합니다." },
        { status: 400 }
      )
    }

    const fileBuffer = Buffer.from(await candidate.arrayBuffer())
    const format = detectImageFormat(fileBuffer)
    if (!format) {
      return NextResponse.json(
        { error: "실제 파일 형식을 확인할 수 없습니다. JPEG, PNG, WebP만 가능합니다." },
        { status: 400 }
      )
    }

    const declaredMime = candidate.type === "image/jpg" ? "image/jpeg" : candidate.type
    if (declaredMime && declaredMime !== format.mime) {
      return NextResponse.json(
        { error: "파일 내용과 선언된 이미지 형식이 일치하지 않습니다." },
        { status: 400 }
      )
    }

    const supabase = getServiceClient()
    const fileName = `members/${randomUUID()}.${format.extension}`
    const { error: uploadError } = await supabase.storage
      .from("public")
      .upload(fileName, fileBuffer, {
        contentType: format.mime,
        cacheControl: "31536000",
        upsert: false,
      })

    if (uploadError) {
      logger.error("Failed to upload member image", {
        error: uploadError,
        actorUserId: admin.id,
      })
      return createNextErrorResponse(
        NextResponse,
        uploadError,
        "이미지 업로드에 실패했습니다.",
        500
      )
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("public").getPublicUrl(fileName)

    logger.info("Member image uploaded successfully", {
      actorUserId: admin.id,
      storagePath: fileName,
      contentType: format.mime,
      sizeBytes: candidate.size,
    })
    return createSuccessResponse(
      { url: publicUrl, path: fileName },
      "이미지가 업로드되었습니다."
    )
  } catch (error) {
    if (error instanceof Error && error.name === "UntrustedOriginError") {
      return forbidden()
    }
    logger.error("Error uploading member image", { error })
    return createNextErrorResponse(
      NextResponse,
      error,
      "이미지 업로드에 실패했습니다.",
      500
    )
  }
}
