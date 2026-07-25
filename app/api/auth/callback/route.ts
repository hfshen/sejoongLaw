import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const destination = new URL("/auth/callback", request.url)
  destination.search = request.nextUrl.search

  const response = NextResponse.redirect(destination, 307)
  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  response.headers.set("Referrer-Policy", "no-referrer")
  return response
}
