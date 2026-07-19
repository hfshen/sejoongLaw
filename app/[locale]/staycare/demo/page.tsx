import type { Metadata } from "next"
import StayCarePortal from "@/components/staycare/StayCarePortal"

export const metadata: Metadata = {
  title: "StayCare 운영 데모",
  description: "법무법인 세중 StayCare의 역할별 외국인 근로자 운영관리 Reference Implementation",
  robots: {
    index: false,
    follow: false,
  },
}

export default function StayCareDemoPage() {
  return <StayCarePortal />
}
