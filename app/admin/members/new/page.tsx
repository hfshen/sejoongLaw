"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Save, ArrowLeft, Loader2, Upload, X } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { toast } from "@/components/ui/Toast"
import Image from "next/image"

interface MemberFormData {
  name: string
  position?: string
  profile_image_url?: string
  introduction?: string
  specialties: string[]
  education: string[]
  career: string[]
  order_index: number
}

export default function NewMemberPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberFormData>({
    defaultValues: {
      name: "",
      position: "",
      introduction: "",
      specialties: [],
      education: [],
      career: [],
      order_index: 0,
    },
  })

  const specialties = watch("specialties") || []
  const education = watch("education") || []
  const career = watch("career") || []

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast.error("지원하지 않는 파일 형식입니다. JPEG, PNG, WebP만 가능합니다.")
      return
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      toast.error("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/members/upload-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "이미지 업로드 실패")
      }

      const result = await response.json()
      const imageUrl = result.data?.url || result.url

      setValue("profile_image_url", imageUrl)
      setImagePreview(imageUrl)
      toast.success("이미지가 업로드되었습니다.")
    } catch (error: any) {
      toast.error(error.message || "이미지 업로드에 실패했습니다.")
      console.error("Image upload error:", error)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setValue("profile_image_url", "")
    setImagePreview(null)
  }

  const addSpecialty = () => {
    const input = document.getElementById("specialty-input") as HTMLInputElement
    if (input?.value.trim()) {
      setValue("specialties", [...specialties, input.value.trim()])
      input.value = ""
    }
  }

  const removeSpecialty = (index: number) => {
    setValue(
      "specialties",
      specialties.filter((_, i) => i !== index)
    )
  }

  const addEducation = () => {
    const input = document.getElementById("education-input") as HTMLInputElement
    if (input?.value.trim()) {
      setValue("education", [...education, input.value.trim()])
      input.value = ""
    }
  }

  const removeEducation = (index: number) => {
    setValue(
      "education",
      education.filter((_, i) => i !== index)
    )
  }

  const addCareer = () => {
    const input = document.getElementById("career-input") as HTMLInputElement
    if (input?.value.trim()) {
      setValue("career", [...career, input.value.trim()])
      input.value = ""
    }
  }

  const removeCareer = (index: number) => {
    setValue(
      "career",
      career.filter((_, i) => i !== index)
    )
  }

  const onSubmit = async (data: MemberFormData) => {
    setSaving(true)
    try {
      const response = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage =
          errorData.error || errorData.details || `구성원 추가 실패 (${response.status})`
        toast.error(errorMessage)
        console.error("Member creation error:", errorData)
        return
      }

      const result = await response.json()
      const createdMember = result?.data?.member || result?.member

      if (createdMember?.id) {
        toast.success("구성원이 추가되었습니다.")
        router.push(`/admin/members/${createdMember.id}`)
      } else {
        toast.error("구성원이 추가되었지만 응답 형식이 올바르지 않습니다.")
      }
    } catch (error) {
      toast.error("구성원 추가에 실패했습니다.")
      console.error("Member form submission error:", error)
    } finally {
      setSaving(false)
    }
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
        <h1 className="text-2xl font-bold text-secondary">새 구성원 추가</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 이름 */}
            <div>
              <label className="block text-sm font-medium mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name", { required: "이름은 필수입니다." })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="이름을 입력하세요"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 직책 */}
            <div>
              <label className="block text-sm font-medium mb-2">직책</label>
              <input
                {...register("position")}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="예: 대표 변호사, 변호사"
              />
            </div>

            {/* 프로필 이미지 */}
            <div>
              <label className="block text-sm font-medium mb-2">프로필 이미지</label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <Image
                    src={imagePreview}
                    alt="프로필 미리보기"
                    width={200}
                    height={200}
                    className="rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-8 w-8 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {uploadingImage ? "업로드 중..." : "이미지를 업로드하세요"}
                    </span>
                  </label>
                </div>
              )}
            </div>

            {/* 소개 */}
            <div>
              <label className="block text-sm font-medium mb-2">소개</label>
              <textarea
                {...register("introduction")}
                rows={5}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="구성원 소개를 입력하세요"
              />
            </div>

            {/* 전문 분야 */}
            <div>
              <label className="block text-sm font-medium mb-2">전문 분야</label>
              <div className="flex gap-2 mb-2">
                <input
                  id="specialty-input"
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="전문 분야를 입력하세요"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addSpecialty()
                    }
                  }}
                />
                <Button type="button" onClick={addSpecialty}>
                  추가
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                  >
                    {specialty}
                    <button
                      type="button"
                      onClick={() => removeSpecialty(index)}
                      className="hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* 학력 */}
            <div>
              <label className="block text-sm font-medium mb-2">학력</label>
              <div className="flex gap-2 mb-2">
                <input
                  id="education-input"
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="학력을 입력하세요"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addEducation()
                    }
                  }}
                />
                <Button type="button" onClick={addEducation}>
                  추가
                </Button>
              </div>
              <div className="space-y-2">
                {education.map((edu, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between"
                  >
                    <span>{edu}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 경력 */}
            <div>
              <label className="block text-sm font-medium mb-2">경력</label>
              <div className="flex gap-2 mb-2">
                <input
                  id="career-input"
                  type="text"
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="경력을 입력하세요"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCareer()
                    }
                  }}
                />
                <Button type="button" onClick={addCareer}>
                  추가
                </Button>
              </div>
              <div className="space-y-2">
                {career.map((c, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 px-3 py-2 rounded-lg flex items-center justify-between"
                  >
                    <span>{c}</span>
                    <button
                      type="button"
                      onClick={() => removeCareer(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* 순서 */}
            <div>
              <label className="block text-sm font-medium mb-2">표시 순서</label>
              <input
                {...register("order_index", { valueAsNumber: true })}
                type="number"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
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
