"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Search, UserCheck, UserX } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"

interface User {
  id: string
  email: string | null
  name: string | null
  role: string
  status: string
  country: string | null
  organization: string | null
  created_at: string
  activated_at: string | null
}

const roleLabels: Record<string, string> = {
  korea_agent: "한국 에이전트",
  translator: "번역가",
  foreign_lawyer: "해외 변호사",
  family_viewer: "유가족",
  admin: "관리자",
}

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: "활성", color: "bg-green-100 text-green-800" },
  pending: { label: "대기", color: "bg-yellow-100 text-yellow-800" },
  suspended: { label: "정지", color: "bg-red-100 text-red-800" },
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("")
  const [statusFilter, setStatusFilter] = useState<string>("")

  const fetchUsers = useCallback(async (search = "") => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (roleFilter) params.append("role", roleFilter)
      if (statusFilter) params.append("status", statusFilter)
      if (search) params.append("search", search)

      const response = await fetch(`/api/admin/users?${params.toString()}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "사용자 목록을 불러오는데 실패했습니다.")
      }

      const usersData = data.data?.users || data.users || []
      setUsers(usersData)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "사용자 목록을 불러오는데 실패했습니다."
      toast.error(message)
      console.error("Fetch users error:", error)
    } finally {
      setLoading(false)
    }
  }, [roleFilter, statusFilter])

  useEffect(() => {
    void fetchUsers()
  }, [fetchUsers])

  const handleSearch = () => {
    void fetchUsers(searchTerm)
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const action = newStatus === "active" ? "activate" : "suspend"
      const response = await fetch(`/api/admin/users/${userId}?action=${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "상태 변경에 실패했습니다.")
      }

      toast.success("상태가 변경되었습니다.")
      await fetchUsers(searchTerm)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "상태 변경에 실패했습니다."
      toast.error(message)
      console.error("Status change error:", error)
    }
  }

  const filteredUsers = users.filter((user) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-secondary">사용자 관리</h1>
        <Link href="/admin/users/invite">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            사용자 초대
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch()
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="이메일 또는 이름으로 검색..."
              />
            </div>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">모든 역할</option>
              {Object.entries(roleLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">모든 상태</option>
              {Object.entries(statusLabels).map(([value, { label }]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <Button onClick={handleSearch} className="w-full">
              검색
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">로딩 중...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">이메일</th>
                    <th className="text-left py-3 px-4 font-medium">이름</th>
                    <th className="text-left py-3 px-4 font-medium">역할</th>
                    <th className="text-left py-3 px-4 font-medium">상태</th>
                    <th className="text-left py-3 px-4 font-medium">국가</th>
                    <th className="text-left py-3 px-4 font-medium">조직</th>
                    <th className="text-left py-3 px-4 font-medium">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.email || "-"}</td>
                      <td className="py-3 px-4">{user.name || "-"}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-sm ${statusLabels[user.status]?.color || "bg-gray-100 text-gray-800"}`}>
                          {statusLabels[user.status]?.label || user.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{user.country || "-"}</td>
                      <td className="py-3 px-4">{user.organization || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              상세
                            </Button>
                          </Link>
                          {user.status === "active" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(user.id, "suspended")}
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              aria-label="사용자 정지"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusChange(user.id, "active")}
                              className="text-green-600 border-green-600 hover:bg-green-50"
                              aria-label="사용자 활성화"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
