import type { ReactNode } from "react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"

export default async function StayCareAdminLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return (
    <>
      <StayCarePurposeNote
        compact
        eyebrow="ADMIN SECTION NOTE"
        title="StayCare 운영·통제 영역"
        purpose="개별 사건처리와 2,000명 집단 운영을 분리합니다. 통합 운영센터는 개인 업무큐, Control Tower는 Cohort·입국차수 집계, 명부 등록은 공식 대상자 생성에 사용합니다."
        boundary="관리자 화면은 역할과 테넌트에 따라 제한됩니다. 고용주·현지기관·공급자는 별도 포털에서 필요한 최소정보만 조회합니다."
        links={[
          { href: `/${locale}/staycare/admin`, label: "개인 업무 통합 운영센터" },
          { href: `/${locale}/staycare/admin/control-tower`, label: "2,000명 Control Tower" },
          { href: `/${locale}/staycare/admin/roster`, label: "공식 명부·초대 등록" },
          { href: `/${locale}/staycare/notes`, label: "전체 화면 용도" },
        ]}
      />
      {children}
    </>
  )
}
