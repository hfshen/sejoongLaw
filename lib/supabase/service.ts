import "server-only"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"

let serviceClient: ReturnType<typeof createSupabaseClient> | null = null

export function getServiceClient() {
  if (serviceClient) return serviceClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase service environment is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )
  }

  serviceClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        "X-Client-Info": "sejoong-staycare-server",
      },
    },
  })

  return serviceClient
}
