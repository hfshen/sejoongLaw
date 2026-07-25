import { requireAdmin } from "@/lib/auth/role-guard"

export default async function AdminMembersLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin("/auth/login?error=insufficient_permissions")
  return <>{children}</>
}
