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
  const initialLanguage =
    locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  return (
    <>
      <StayCarePurposeNote
        compact
        initialLanguage={initialLanguage}
        eyebrow={{ ko: "관리자 영역 안내", en: "ADMIN SECTION NOTE", si: "පරිපාලක අංශ සටහන", ta: "நிர்வாக பிரிவு குறிப்பு" }}
        title={{ ko: "StayCare 운영·통제 영역", en: "StayCare operations and control", si: "StayCare මෙහෙයුම් හා පාලන අංශය", ta: "StayCare செயல்பாடு மற்றும் கட்டுப்பாடு" }}
        purpose={{
          ko: "개별 사건처리와 2,000명 집단 운영을 분리합니다. 통합 운영센터는 개인 업무큐, Control Tower는 Cohort·입국차수 집계, 명부 등록은 공식 대상자 생성에 사용합니다.",
          en: "Separate individual case handling from 2,000-worker program operations. The operations center manages individual queues, Control Tower aggregates cohorts and arrival batches, and roster registration creates official worker records.",
          si: "පුද්ගල නඩු කටයුතු සහ සේවක 2,000 වැඩසටහන් මෙහෙයුම් වෙන් කරයි. මෙහෙයුම් මධ්‍යස්ථානය පුද්ගල කාර්ය පෝලිම්, Control Tower කණ්ඩායම් හා පැමිණීමේ වාර, ලැයිස්තු ලියාපදිංචිය නිල සේවක වාර්තා කළමනාකරණය කරයි.",
          ta: "தனிப்பட்ட வழக்கு செயலாக்கத்தையும் 2,000 தொழிலாளர் திட்ட செயல்பாட்டையும் பிரிக்கிறது. செயல்பாட்டு மையம் தனிப்பட்ட பணிப்பட்டியலை, Control Tower குழுக்கள் மற்றும் வருகைத் தொகுதிகளை, பட்டியல் பதிவு அதிகாரப்பூர்வ தொழிலாளர் பதிவுகளை நிர்வகிக்கிறது.",
        }}
        boundary={{
          ko: "관리자 화면은 역할과 테넌트에 따라 제한됩니다. 고용주·현지기관·공급자는 별도 포털에서 필요한 최소정보만 조회합니다.",
          en: "Administrator access is restricted by role and tenant. Employers, local institutions and providers see only the minimum necessary information in separate portals.",
          si: "පරිපාලක ප්‍රවේශය භූමිකාව සහ tenant අනුව සීමා වේ. සේවායෝජකයන්, දේශීය ආයතන සහ සේවා සපයන්නන් වෙන්වූ පෝර්ටලවල අවම අවශ්‍ය තොරතුරු පමණක් බලයි.",
          ta: "நிர்வாக அணுகல் பங்கு மற்றும் tenant அடிப்படையில் கட்டுப்படுத்தப்படுகிறது. முதலாளிகள், உள்ளூர் நிறுவனங்கள் மற்றும் வழங்குநர்கள் தனிப்பட்ட போர்டல்களில் தேவையான குறைந்தபட்ச தகவலை மட்டுமே காண்கிறார்கள்.",
        }}
        links={[
          { href: `/${locale}/staycare/admin`, label: { ko: "개인 업무 통합 운영센터", en: "Individual operations center", si: "පුද්ගල මෙහෙයුම් මධ්‍යස්ථානය", ta: "தனிப்பட்ட செயல்பாட்டு மையம்" } },
          { href: `/${locale}/staycare/admin/control-tower`, label: { ko: "2,000명 Control Tower", en: "2,000-worker Control Tower", si: "සේවක 2,000 Control Tower", ta: "2,000 தொழிலாளர் Control Tower" } },
          { href: `/${locale}/staycare/admin/roster`, label: { ko: "공식 명부·초대 등록", en: "Official roster and invitations", si: "නිල ලැයිස්තුව හා ආරාධනා", ta: "அதிகாரப்பூர்வ பட்டியல் மற்றும் அழைப்புகள்" } },
          { href: `/${locale}/staycare/notes`, label: { ko: "전체 화면 용도", en: "All page purposes", si: "සියලු පිටු අරමුණු", ta: "அனைத்து பக்க பயன்பாடுகள்" } },
        ]}
      />
      {children}
    </>
  )
}
