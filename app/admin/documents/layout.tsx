import { redirect } from "next/navigation"
import { isAdminAuthenticated } from "@/lib/admin/auth"

export default async function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAdmin = await isAdminAuthenticated()

  if (!isAdmin) {
    redirect("/admin/login")
  }

  return <>{children}</>
}

