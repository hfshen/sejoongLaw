// 통일된 API 응답 형식

import { NextResponse } from "next/server"

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * 성공 응답 생성
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = 200
) {
  return NextResponse.json<ApiResponse<T>>(
    {
      success: true,
      data,
      ...(message && { message }),
    },
    { status }
  )
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  error: string | Error,
  status: number = 500
) {
  const errorMessage = error instanceof Error ? error.message : error
  return NextResponse.json<ApiResponse>(
    {
      success: false,
      error: errorMessage,
    },
    { status }
  )
}

/**
 * 페이지네이션 응답 생성
 */
export interface PaginatedResponse<T> {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
) {
  return NextResponse.json<PaginatedResponse<T>>(
    {
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    { status: 200 }
  )
}

