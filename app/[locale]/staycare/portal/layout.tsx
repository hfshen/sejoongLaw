import type { ReactNode } from "react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"

export default function StayCarePortalLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StayCarePurposeNote
        compact
        eyebrow="PARTNER SECTION NOTE"
        title="고용주·스리랑카 기관·인가 공급자 포털"
        purpose="기관별로 배정된 근로자의 최소 운영상태와 해당 기관이 처리해야 하는 신청·자료·인계 업무만 제공합니다."
        boundary="개인 법률·의료·인권상담, 전체 근로자 명부, 다른 기관의 자료에는 접근할 수 없습니다."
      />
      {children}
    </>
  )
}
