import { requireRole } from "@/lib/auth/role-guard"

export default async function AdminCasesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole(["admin", "korea_agent"])
  return <>{children}</>
}
