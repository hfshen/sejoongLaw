"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { ArrowLeft, Loader2, Save, UserCheck, UserX } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"

interface UserFormData {
  name: string | null
  email: string | null
  phone: string | null
  role: string
  country: string | null
  organization: string | null
  status: string
}

const roleOptions = [
  { value: "korea_agent", label: "한국 에이전트" },
  { value: "translator", label: "번역가" },
  { value: "foreign_lawyer", label: "해외 변호사" },
  { value: "family_viewer", label: "유가족" },
  { value: "admin", label: "관리자" },
]

const statusOptions = [
  { value: "active", label: "활성" },
  { value: "pending", label: "대기" },
  { value: "suspended", label: "정지" },
]

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserFormData>()

  const status = watch("status")

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/users/${params.id}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "사용자를 불러올 수 없습니다.")
        }

        const user = data.data?.user || data.user

        if (user) {
          setValue("name", user.name || "")
          setValue("email", user.email || "")
          setValue("phone", user.phone || "")
          setValue("role", user.role || "family_viewer")
          setValue("country", user.country || "")
          setValue("organization", user.organization || "")
          setValue("status", user.status || "pending")
        }
      } catch (error: any) {
        toast.error(error.message || "사용자를 불러오는데 실패했습니다.")
        console.error("Fetch user error:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id, setValue])

  const onSubmit = async (data: UserFormData) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage =
          errorData.error || errorData.details || `사용자 수정 실패 (${response.status})`
        toast.error(errorMessage)
        console.error("User update error:", errorData)
        return
      }

      toast.success("사용자 정보가 수정되었습니다.")
      router.push("/admin/users")
    } catch (error) {
      toast.error("사용자 정보 수정에 실패했습니다.")
      console.error("User form submission error:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async () => {
    const newStatus = status === "active" ? "suspended" : "active"
    const action = newStatus === "active" ? "activate" : "suspend"

    try {
      const response = await fetch(`/api/admin/users/${params.id}?action=${action}`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "상태 변경에 실패했습니다.")
      }

      setValue("status", newStatus)
      toast.success("상태가 변경되었습니다.")
    } catch (error: any) {
      toast.error(error.message || "상태 변경에 실패했습니다.")
      console.error("Status change error:", error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          뒤로
        </Button>
        <h1 className="text-2xl font-bold text-secondary">사용자 상세</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>사용자 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2">이름</label>
              <input
                {...register("name")}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium mb-2">이메일</label>
              <input
                {...register("email")}
                type="email"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="이메일을 입력하세요"
              />
            </div>

            {/* 전화번호 */}
            <div>
              <label className="block text-sm font-medium mb-2">전화번호</label>
              <input
                {...register("phone")}
                type="tel"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="전화번호를 입력하세요"
              />
            </div>

            {/* 역할 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                역할 <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role", { required: "역할은 필수입니다." })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-500">{errors.role.message}</p>
              )}
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                상태 <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <select
                  {...register("status", { required: "상태는 필수입니다." })}
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleStatusToggle}
                  className={
                    status === "active"
                      ? "text-red-600 border-red-600 hover:bg-red-50"
                      : "text-green-600 border-green-600 hover:bg-green-50"
                  }
                >
                  {status === "active" ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      정지
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      활성화
                    </>
                  )}
                </Button>
              </div>
              {errors.status && (
                <p className="mt-1 text-sm text-red-500">{errors.status.message}</p>
              )}
            </div>

            {/* 국가 */}
            <div>
              <label className="block text-sm font-medium mb-2">국가</label>
              <input
                {...register("country")}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="예: LK, KR"
              />
            </div>

            {/* 조직 */}
            <div>
              <label className="block text-sm font-medium mb-2">조직</label>
              <input
                {...register("organization")}
                type="text"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="조직명을 입력하세요"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            취소
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
