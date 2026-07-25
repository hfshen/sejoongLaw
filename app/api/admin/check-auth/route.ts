import { NextResponse } from "next/server"
import { getAuthenticatedBackofficeProfile } from "@/lib/admin/auth"

export async function GET() {
  const profile = await getAuthenticatedBackofficeProfile()
  const response = NextResponse.json({
    authenticated: Boolean(profile),
    user: profile
      ? {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
        }
      : null,
  })

  response.headers.set("Cache-Control", "private, no-store, max-age=0")
  return response
}
