#!/usr/bin/env node

import { createClient } from "@supabase/supabase-js"

function argument(name, fallback) {
  const index = process.argv.indexOf(`--${name}`)
  if (index === -1) return fallback
  return process.argv[index + 1] || fallback
}

const email = argument("email", "")?.trim().toLowerCase()
const organizationName = argument("organization", "법무법인 세중")
const role = argument("role", "sejoong_admin")
const tenantSlug = process.env.STAYCARE_TENANT_SLUG || "sejoong-staycare"
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!email) {
  console.error("Usage: npm run bootstrap:staycare-admin -- --email admin@sejoonglaw.kr")
  process.exit(1)
}

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required")
  process.exit(1)
}

const allowedRoles = new Set([
  "sejoong_admin",
  "sejoong_lawyer",
  "immigration_manager",
  "operator_manager",
  "operator_agent",
  "auditor",
])

if (!allowedRoles.has(role)) {
  console.error(`Unsupported role: ${role}`)
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function findUserByEmail(targetEmail) {
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (error) throw error
    const user = data.users.find((item) => item.email?.toLowerCase() === targetEmail)
    if (user) return user
    if (data.users.length < 100) return null
  }
  return null
}

async function main() {
  const user = await findUserByEmail(email)
  if (!user) {
    throw new Error(
      `Auth user not found for ${email}. Sign in once through /staycare/login or create the user in Supabase Authentication first.`
    )
  }

  const { data: tenant, error: tenantError } = await supabase
    .from("staycare_tenants")
    .select("id, slug")
    .eq("slug", tenantSlug)
    .single()
  if (tenantError || !tenant) throw tenantError || new Error("StayCare tenant not found")

  let { data: organization, error: organizationError } = await supabase
    .from("staycare_organizations")
    .select("id, name")
    .eq("tenant_id", tenant.id)
    .eq("type", "sejoong")
    .eq("name", organizationName)
    .maybeSingle()
  if (organizationError) throw organizationError

  if (!organization) {
    const created = await supabase
      .from("staycare_organizations")
      .insert({
        tenant_id: tenant.id,
        type: "sejoong",
        name: organizationName,
        country_code: "KR",
        supported_languages: ["ko", "en", "si"],
        status: "active",
      })
      .select("id, name")
      .single()
    if (created.error || !created.data) {
      throw created.error || new Error("Unable to create Sejoong organization")
    }
    organization = created.data
  }

  const { data: membership, error: membershipError } = await supabase
    .from("staycare_memberships")
    .select("id, role, status")
    .eq("tenant_id", tenant.id)
    .eq("organization_id", organization.id)
    .eq("user_id", user.id)
    .eq("role", role)
    .maybeSingle()
  if (membershipError) throw membershipError

  let membershipId = membership?.id
  if (membership) {
    const updated = await supabase
      .from("staycare_memberships")
      .update({
        status: "active",
        activated_at: membership.status === "active" ? undefined : new Date().toISOString(),
        revoked_at: null,
      })
      .eq("id", membership.id)
      .select("id")
      .single()
    if (updated.error) throw updated.error
    membershipId = updated.data.id
  } else {
    const created = await supabase
      .from("staycare_memberships")
      .insert({
        tenant_id: tenant.id,
        organization_id: organization.id,
        user_id: user.id,
        role,
        status: "active",
        activated_at: new Date().toISOString(),
      })
      .select("id")
      .single()
    if (created.error) throw created.error
    membershipId = created.data.id
  }

  await supabase.from("staycare_audit_events").insert({
    tenant_id: tenant.id,
    actor_user_id: user.id,
    actor_role: "bootstrap_script",
    action: "membership.staff_bootstrapped",
    entity_type: "staycare_memberships",
    entity_id: membershipId,
    metadata: { email, role, organization: organization.name },
  })

  console.log("StayCare staff account is ready:")
  console.log(JSON.stringify({ email, userId: user.id, role, organization: organization.name }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
