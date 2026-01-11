"use client"

import { useForm } from "react-hook-form"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { AddressAutocomplete } from "@/components/admin/AddressAutocomplete"

export interface CaseFormData {
  case_number?: string
  case_name: string
  // 사망자 정보
  deceased_name?: string
  deceased_birthdate?: string
  deceased_address?: string
  deceased_foreigner_id?: string
  incident_location?: string
  incident_time?: string
  // 유가족 대표 정보
  party_a_nationality?: string
  party_a_name?: string
  party_a_birthdate?: string
  party_a_contact?: string
  party_a_relation?: string
  party_a_id_number?: string
  party_a_address?: string
  // 가해자 회사 정보
  party_b_company_name?: string
  party_b_representative?: string
  party_b_registration?: string
  party_b_contact?: string
  party_b_address?: string
  // 사건 정보
  plaintiff?: string
  defendant?: string
}

interface CaseFormProps {
  initialData?: CaseFormData
  onSubmit: (data: CaseFormData) => void | Promise<void>
  isSubmitting?: boolean
}

export default function CaseForm({ initialData, onSubmit, isSubmitting = false }: CaseFormProps) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<CaseFormData>({
    defaultValues: initialData || {
      case_name: "",
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">
              케이스 이름 <span className="text-red-500">*</span>
            </label>
            <input
              {...register("case_name", { required: "케이스 이름을 입력하세요" })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="예: 2024-001 사망사고"
            />
            {errors.case_name && (
              <p className="text-red-500 text-sm mt-1">{errors.case_name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">사건번호</label>
            <input
              {...register("case_number")}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="예: 2024가단1234"
            />
          </div>
        </CardContent>
      </Card>

      {/* 사망자 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>사망자 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">성명</label>
            <input
              {...register("deceased_name")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">생년월일</label>
            <input
              {...register("deceased_birthdate")}
              type="date"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">외국인등록번호</label>
            <input
              {...register("deceased_foreigner_id")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">주소지</label>
            <input type="hidden" {...register("deceased_address")} />
            <AddressAutocomplete
              label="주소지"
              value={(watch("deceased_address") as string) || ""}
              onChange={(next) => setValue("deceased_address", next, { shouldDirty: true, shouldTouch: true })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">사건발생위치</label>
            <input
              {...register("incident_location")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">사건발생시간</label>
            <input
              {...register("incident_time")}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="예: 2024-01-15 14:30"
            />
          </div>
        </CardContent>
      </Card>

      {/* 유가족 대표 정보 (갑) */}
      <Card>
        <CardHeader>
          <CardTitle>유가족 대표 정보 (갑)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">성명</label>
            <input
              {...register("party_a_name")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">생년월일</label>
            <input
              {...register("party_a_birthdate")}
              type="date"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">국적</label>
            <input
              {...register("party_a_nationality")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input
              {...register("party_a_contact")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">관계</label>
            <select
              {...register("party_a_relation")}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">선택하세요</option>
              <option value="부">부</option>
              <option value="모">모</option>
              <option value="기타">기타</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">본국 신분증 번호</label>
            <input
              {...register("party_a_id_number")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">본국 주소</label>
            <input
              {...register("party_a_address")}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="본국 주소(자유 입력)"
            />
          </div>
        </CardContent>
      </Card>

      {/* 가해자 회사 정보 (을) */}
      <Card>
        <CardHeader>
          <CardTitle>가해자 회사 정보 (을)</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">상호</label>
            <input
              {...register("party_b_company_name")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">대표자 성명</label>
            <input
              {...register("party_b_representative")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">사업자등록번호</label>
            <input
              {...register("party_b_registration")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">연락처</label>
            <input
              {...register("party_b_contact")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">주소</label>
            <input type="hidden" {...register("party_b_address")} />
            <AddressAutocomplete
              label="주소"
              value={(watch("party_b_address") as string) || ""}
              onChange={(next) => setValue("party_b_address", next, { shouldDirty: true, shouldTouch: true })}
            />
          </div>
        </CardContent>
      </Card>

      {/* 사건 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>사건 정보</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">원고</label>
            <input
              {...register("plaintiff")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">피고</label>
            <input
              {...register("defendant")}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-6"
        >
          {isSubmitting ? "저장 중..." : "저장"}
        </Button>
      </div>
    </form>
  )
}

