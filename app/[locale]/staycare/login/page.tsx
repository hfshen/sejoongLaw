import type { Metadata } from "next"
import { redirect } from "next/navigation"
import StayCareAuthRecoveryNotice from "@/components/staycare/StayCareAuthRecoveryNotice"
import StayCareDemoLogin from "@/components/staycare/StayCareDemoLogin"
import StayCareLogin from "@/components/staycare/StayCareLogin"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import StayCareSocialLogin from "@/components/staycare/StayCareSocialLogin"
import { stayCareLoginRecoveryPath } from "@/lib/auth/redirects"
import { resolveStayCareDestination } from "@/lib/staycare/auth"
import { isStayCareProductionDemoAllowed } from "@/lib/staycare/demo-accounts"

export const metadata: Metadata = {
  title: "StayCare 로그인",
  robots: { index: false, follow: false },
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function StayCareLoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale } = await params
  const query = await searchParams
  const error = first(query.error)
  const reason = first(query.reason)
  const next = first(query.next)

  if (reason === "otp_expired" && error !== "otp_expired") {
    redirect(
      stayCareLoginRecoveryPath({
        locale,
        reason: "otp_expired",
        next,
      })
    )
  }

  const destination = await resolveStayCareDestination(locale)
  if (destination) redirect(destination)

  const showDemoLogin = isStayCareProductionDemoAllowed()

  return (
    <>
      <StayCarePurposeNote
        compact
        initialLanguage={locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"}
        title={{ ko: "StayCare 인증 페이지", en: "StayCare authentication", si: "StayCare සත්‍යාපනය", ta: "StayCare அங்கீகாரம்" }}
        purpose={{
          ko: "이메일 매직링크, +94·+82 휴대전화 SMS OTP 또는 운영에서 활성화한 Google·Facebook 계정으로 연락수단 소유를 확인합니다. 이메일은 메일 안의 로그인 버튼을 한 번 누르면 자동으로 로그인됩니다. 로그인 후 공식 초대명부와 계정을 연결해야 근로자 앱이 활성화됩니다.",
          en: "Verify ownership through an email magic link, +94/+82 phone SMS OTP, or an enabled Google/Facebook account. Email users sign in automatically by selecting the button in the message. After sign-in, the account must match the official invitation roster before the worker app is activated.",
          si: "Email magic link එකක්, +94/+82 දුරකථන SMS OTP එකක් හෝ සක්‍රිය Google/Facebook ගිණුමක් මඟින් සම්බන්ධතා හිමිකම තහවුරු කරයි. Email පණිවිඩයේ බොත්තම එක් වරක් ඔබා ස්වයංක්‍රීයව පිවිසිය හැක. පසුව නිල ආරාධනා ලැයිස්තුවට ගිණුම සම්බන්ධ කළ යුතුය.",
          ta: "மின்னஞ்சல் magic link, +94/+82 தொலைபேசி SMS OTP அல்லது இயக்கப்பட்ட Google/Facebook கணக்கின் மூலம் தொடர்பு உரிமையைச் சரிபார்க்கிறது. மின்னஞ்சலில் உள்ள உள்நுழைவு பொத்தானை ஒருமுறை அழுத்தினால் தானாக உள்நுழையலாம். உள்நுழைந்த பிறகு அதிகாரப்பூர்வ அழைப்புப் பட்டியலுடன் கணக்கு பொருந்தினால்தான் தொழிலாளர் செயலி செயல்படும்.",
        }}
        boundary={{
          ko: "로그인 성공만으로 근로자 자격이나 비자 상태가 인정되지 않습니다. 지정된 초대코드와 공식 명부정보가 추가로 일치해야 합니다.",
          en: "Successful sign-in does not prove worker eligibility or visa status. The invitation code and official roster information must also match.",
          si: "සාර්ථක පිවිසීමෙන් සේවක සුදුසුකම හෝ වීසා තත්ත්වය තහවුරු නොවේ. ආරාධනා කේතය සහ නිල ලැයිස්තු තොරතුරුද ගැළපිය යුතුය.",
          ta: "வெற்றிகரமான உள்நுழைவு தொழிலாளர் தகுதி அல்லது விசா நிலையை நிரூபிக்காது. அழைப்புக் குறியீடும் அதிகாரப்பூர்வ பட்டியல் தகவலும் பொருந்த வேண்டும்.",
        }}
        items={[
          { label: { ko: "1. 연락수단 인증", en: "1. Verify contact", si: "1. සම්බන්ධතාව තහවුරු කිරීම", ta: "1. தொடர்பைச் சரிபார்க்கவும்" }, description: { ko: "이메일 매직링크·SMS OTP 또는 선택형 소셜 로그인", en: "Email magic link, SMS OTP or optional social login", si: "Email magic link, SMS OTP හෝ සමාජ පිවිසුම", ta: "மின்னஞ்சல் magic link, SMS OTP அல்லது விருப்ப சமூக உள்நுழைவு" } },
          { label: { ko: "2. 명부 Claim", en: "2. Claim roster identity", si: "2. ලැයිස්තු අනන්‍යතාව claim කිරීම", ta: "2. பட்டியல் அடையாளத்தை claim செய்யவும்" }, description: { ko: "초대코드·영문명·생년월일 대조", en: "Match invitation code, English name and date of birth", si: "ආරාධනා කේතය, ඉංග්‍රීසි නම හා උපන්දිනය ගැළපීම", ta: "அழைப்புக் குறியீடு, ஆங்கிலப் பெயர் மற்றும் பிறந்த தேதியைப் பொருத்தவும்" } },
          { label: { ko: "3. 계정 승계", en: "3. Continue account", si: "3. ගිණුම දිගටම භාවිත කිරීම", ta: "3. கணக்கைத் தொடரவும்" }, description: { ko: "입국 후 한국 전화번호 추가", en: "Add a Korean phone after arrival", si: "පැමිණීමෙන් පසු කොරියානු අංකය එක් කිරීම", ta: "வருகைக்குப் பிறகு கொரியா எண்ணைச் சேர்க்கவும்" } },
          { label: { ko: "4. 복구", en: "4. Recovery", si: "4. නැවත ලබාගැනීම", ta: "4. மீட்பு" }, description: { ko: "이메일과 두 번째 연락수단 유지", en: "Keep email and a second verified method", si: "Email සහ දෙවන තහවුරු ක්‍රමයක් තබන්න", ta: "மின்னஞ்சலும் இரண்டாவது சரிபார்ப்பு முறையும் வைத்திருக்கவும்" } },
        ]}
        links={[{ href: `/${locale}/staycare/notes`, label: { ko: "페이지별 용도 안내", en: "Page-purpose guide", si: "පිටු අරමුණු මාර්ගෝපදේශය", ta: "பக்க பயன்பாட்டு வழிகாட்டி" } }]}
      />
      <StayCareAuthRecoveryNotice locale={locale} reason={reason || error} />
      <StayCareLogin locale={locale} />
      <StayCareSocialLogin locale={locale} />
      {showDemoLogin ? <StayCareDemoLogin locale={locale} /> : null}
    </>
  )
}
