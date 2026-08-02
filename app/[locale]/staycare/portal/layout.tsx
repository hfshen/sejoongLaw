import type { ReactNode } from "react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"

export default async function StayCarePartnerLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const initialLanguage =
    locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  return (
    <>
      <StayCarePurposeNote
        compact
        initialLanguage={initialLanguage}
        eyebrow={{ ko: "협력기관 영역 안내", en: "PARTNER SECTION NOTE", si: "හවුල්කාර අංශ සටහන", ta: "கூட்டாளர் பிரிவு குறிப்பு" }}
        title={{
          ko: "고용주·스리랑카 기관·인가 공급자 포털",
          en: "Employer, Sri Lanka institution and licensed-provider portal",
          si: "සේවායෝජක, ශ්‍රී ලංකා ආයතන සහ බලපත්‍රලාභී සේවා පෝර්ටලය",
          ta: "முதலாளி, இலங்கை நிறுவனம் மற்றும் உரிமம் பெற்ற வழங்குநர் போர்டல்",
        }}
        purpose={{
          ko: "기관별로 배정된 근로자의 최소 운영상태와 해당 기관이 처리해야 하는 신청·자료·인계 업무만 제공합니다.",
          en: "Provide only the minimum operational status for assigned workers and the applications, records and handoff tasks that each organization must process.",
          si: "එක් එක් ආයතනයට පවරා ඇති සේවකයින්ගේ අවම මෙහෙයුම් තත්ත්වය සහ එම ආයතනය කළ යුතු අයදුම්, ලේඛන හා භාරදීමේ කාර්ය පමණක් සපයයි.",
          ta: "ஒவ்வொரு நிறுவனத்திற்கும் ஒதுக்கப்பட்ட தொழிலாளர்களின் குறைந்தபட்ச செயல்பாட்டு நிலை மற்றும் அந்த நிறுவனம் செயலாக்க வேண்டிய விண்ணப்பம், ஆவணம் மற்றும் ஒப்படைப்பு பணிகளை மட்டுமே வழங்குகிறது.",
        }}
        boundary={{
          ko: "개인 법률·의료·인권상담, 전체 근로자 명부, 다른 기관의 자료에는 접근할 수 없습니다.",
          en: "Partners cannot access private legal, medical or human-rights consultations, the full worker roster or another organization's records.",
          si: "පුද්ගල නීතිමය, වෛද්‍ය හෝ මානව හිමිකම් උපදේශන, සම්පූර්ණ සේවක ලැයිස්තුව හෝ වෙනත් ආයතන වාර්තා වෙත ප්‍රවේශ නොලැබේ.",
          ta: "தனிப்பட்ட சட்ட, மருத்துவ அல்லது மனித உரிமை ஆலோசனைகள், முழு தொழிலாளர் பட்டியல் அல்லது மற்ற நிறுவனத்தின் பதிவுகளை அணுக முடியாது.",
        }}
      />
      {children}
    </>
  )
}
