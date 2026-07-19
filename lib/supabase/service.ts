import "server-only"
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js"

// The repository contains legacy and newly migrated StayCare tables but does not yet
// commit a generated Supabase Database type. Keep the client schema-open until
// `supabase gen types` is introduced, otherwise current supabase-js versions infer
// every table mutation as `never` and block production builds.
let serviceClient: SupabaseClient<any, "public", any> | null = null

export function getServiceClient(): SupabaseClient<any, "public", any> {
  if (serviceClient) return serviceClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase service environment is missing. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    )
  }

  serviceClient = createSupabaseClient<any>(supabaseUrl, serviceRoleKey, {
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
