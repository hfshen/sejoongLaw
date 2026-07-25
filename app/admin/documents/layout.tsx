import { requireRole } from "@/lib/auth/role-guard"

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireRole([
    "admin",
    "korea_agent",
    "translator",
    "foreign_lawyer",
    "family_viewer",
  ])

  return <>{children}</>
}
