import type { Metadata } from "next"
import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileLock2,
  Gauge,
  HeartHandshake,
  KeyRound,
  Plane,
  ShieldAlert,
  Smartphone,
  Users,
} from "lucide-react"
import StayCarePurposeNote from "@/components/staycare/StayCarePurposeNote"
import StayCareText, { type StayCareTextValue } from "@/components/staycare/StayCareText"
import { normalizeStayCareLanguage } from "@/lib/staycare/language"

export const metadata: Metadata = {
  title: "StayCare screen and section operating notes",
  robots: { index: false, follow: false },
}

type Copy = Record<"ko" | "en" | "si" | "ta", string>
type Section = {
  title: Copy
  href: string
  icon: typeof KeyRound
  audience: Copy
  purpose: Copy
  boundary: Copy
}

const sections: Section[] = [
  {
    title: { ko: "로그인", en: "Login", si: "පිවිසුම", ta: "உள்நுழைவு" },
    href: "login",
    icon: KeyRound,
    audience: { ko: "모든 사용자", en: "All users", si: "සියලු පරිශීලකයින්", ta: "அனைத்து பயனர்களும்" },
    purpose: {
      ko: "이메일 또는 +94·+82 휴대전화 OTP로 연락수단 소유를 확인합니다.",
      en: "Verify ownership of an email address or +94/+82 mobile number with an OTP.",
      si: "විද්‍යුත් තැපෑල හෝ +94/+82 ජංගම අංකයක හිමිකාරිත්වය OTP මඟින් තහවුරු කරයි.",
      ta: "மின்னஞ்சல் அல்லது +94/+82 கைப்பேசி எண்ணின் உரிமையை OTP மூலம் சரிபார்க்கிறது.",
    },
    boundary: {
      ko: "로그인 계정 생성은 공식 근로자 자격을 의미하지 않습니다.",
      en: "Creating a login account does not establish official worker eligibility.",
      si: "පිවිසුම් ගිණුමක් සෑදීම නිල සේවක සුදුසුකමක් නොවේ.",
      ta: "உள்நுழைவு கணக்கு உருவாக்குவது அதிகாரப்பூர்வ தொழிலாளர் தகுதியை உறுதிப்படுத்தாது.",
    },
  },
  {
    title: { ko: "근로자 명부 Claim", en: "Worker roster claim", si: "සේවක ලැයිස්තු Claim", ta: "தொழிலாளர் பட்டியல் Claim" },
    href: "claim",
    icon: BadgeCheck,
    audience: { ko: "스리랑카 지정 근로자", en: "Designated Sri Lankan workers", si: "නියමිත ශ්‍රී ලාංකික සේවකයින්", ta: "நியமிக்கப்பட்ட இலங்கைத் தொழிலாளர்கள்" },
    purpose: {
      ko: "초대코드·여권 영문명·생년월일을 공식 사전명부와 대조해 근로자 ID를 연결합니다.",
      en: "Match the invitation code, passport English name and date of birth with the approved roster to link the worker ID.",
      si: "ආරාධනා කේතය, ගමන් බලපත්‍ර ඉංග්‍රීසි නම සහ උපන් දිනය අනුමත ලැයිස්තුව සමඟ ගැළපවී සේවක ID සම්බන්ධ කරයි.",
      ta: "அழைப்புக் குறியீடு, கடவுச்சீட்டு ஆங்கிலப் பெயர் மற்றும் பிறந்த தேதியை அங்கீகரிக்கப்பட்ட பட்டியலுடன் ஒப்பிட்டு தொழிலாளர் ID-ஐ இணைக்கிறது.",
    },
    boundary: {
      ko: "명부에 없는 사람은 근로자 앱에 진입할 수 없습니다.",
      en: "A person who is not on the approved roster cannot enter the worker app.",
      si: "අනුමත ලැයිස්තුවේ නොමැති අයෙකුට සේවක යෙදුමට ඇතුළු විය නොහැක.",
      ta: "அங்கீகரிக்கப்பட்ட பட்டியலில் இல்லாதவர் தொழிலாளர் செயலிக்குள் நுழைய முடியாது.",
    },
  },
  {
    title: { ko: "근로자 앱", en: "Worker app", si: "සේවක යෙදුම", ta: "தொழிலாளர் செயலி" },
    href: "app",
    icon: Smartphone,
    audience: { ko: "Claim 완료 근로자", en: "Claimed workers", si: "Claim සම්පූර්ණ කළ සේවකයින්", ta: "Claim முடித்த தொழிலாளர்கள்" },
    purpose: {
      ko: "출국 준비부터 입국, 90일 정착, 근로·체류, 사고·민원, 귀국까지 다음 행동을 표시합니다.",
      en: "Show the next action from pre-departure through arrival, 90-day settlement, work and stay, incidents, requests and return.",
      si: "පිටත්වීමේ සූදානමේ සිට පැමිණීම, දින 90 පදිංචිය, රැකියාව හා රැඳී සිටීම, සිදුවීම්, ඉල්ලීම් සහ ආපසු යාම දක්වා ඊළඟ ක්‍රියාව පෙන්වයි.",
      ta: "புறப்படும் தயாரிப்பிலிருந்து வருகை, 90 நாள் குடியேற்றம், வேலை மற்றும் தங்குதல், சம்பவங்கள், கோரிக்கைகள் மற்றும் திரும்புதல் வரை அடுத்த செயலைக் காட்டுகிறது.",
    },
    boundary: {
      ko: "정부 승인과 법률·의료 결정을 대신하지 않습니다.",
      en: "It does not replace government approval or legal and medical decisions.",
      si: "එය රජයේ අනුමැතිය හෝ නීතිමය සහ වෛද්‍ය තීරණ වෙනුවට ක්‍රියා නොකරයි.",
      ta: "இது அரசு அங்கீகாரம் அல்லது சட்ட மற்றும் மருத்துவ முடிவுகளுக்கு மாற்றாகாது.",
    },
  },
  {
    title: { ko: "연락수단 승계", en: "Contact continuity", si: "සම්බන්ධතා අඛණ්ඩතාව", ta: "தொடர்பு தொடர்ச்சி" },
    href: "account",
    icon: Smartphone,
    audience: { ko: "근로자", en: "Workers", si: "සේවකයින්", ta: "தொழிலாளர்கள்" },
    purpose: {
      ko: "+94 번호로 시작한 계정에 한국 +82 번호를 OTP로 추가하고 주 연락수단을 전환합니다.",
      en: "Add a Korean +82 number by OTP to an account started with +94 and switch the primary contact.",
      si: "+94 අංකයකින් ආරම්භ කළ ගිණුමකට OTP මඟින් කොරියානු +82 අංකයක් එක් කර ප්‍රධාන සම්බන්ධතාව මාරු කරයි.",
      ta: "+94 எண்ணில் தொடங்கிய கணக்கில் OTP மூலம் கொரிய +82 எண்ணைச் சேர்த்து முதன்மை தொடர்பை மாற்றுகிறது.",
    },
    boundary: {
      ko: "전화번호는 영구 회원번호가 아니며 변경이력을 유지합니다.",
      en: "A phone number is not the permanent member ID; its change history is retained.",
      si: "දුරකථන අංකය ස්ථිර සාමාජික ID නොවන අතර වෙනස්කම් ඉතිහාසය තබා ගනී.",
      ta: "தொலைபேசி எண் நிரந்தர உறுப்பினர் ID அல்ல; மாற்ற வரலாறு பாதுகாக்கப்படுகிறது.",
    },
  },
  {
    title: { ko: "통합 운영센터", en: "Integrated operations center", si: "ඒකාබද්ධ මෙහෙයුම් මධ්‍යස්ථානය", ta: "ஒருங்கிணைந்த செயல்பாட்டு மையம்" },
    href: "admin",
    icon: Gauge,
    audience: { ko: "세중·운영사·감사자", en: "Sejoong, operators and auditors", si: "Sejoong, මෙහෙයුම්කරුවන් සහ විගණකයින්", ta: "Sejoong, செயல்பாட்டாளர்கள் மற்றும் தணிக்கையாளர்கள்" },
    purpose: {
      ko: "근로자, 문서, 신청, 체류사건, 티켓, 감사로그와 환경상태를 역할별로 처리합니다.",
      en: "Process workers, documents, applications, stay cases, tickets, audit logs and environment status by role.",
      si: "භූමිකාව අනුව සේවකයින්, ලේඛන, අයදුම්, රැඳී සිටීමේ නඩු, ටිකට්, විගණන සටහන් සහ පරිසර තත්ත්වය කළමනාකරණය කරයි.",
      ta: "பங்கு அடிப்படையில் தொழிலாளர்கள், ஆவணங்கள், விண்ணப்பங்கள், தங்கும் வழக்குகள், கோரிக்கைகள், தணிக்கைப் பதிவுகள் மற்றும் சூழல் நிலையை நிர்வகிக்கிறது.",
    },
    boundary: {
      ko: "변호사·출입국·운영자·감사자의 권한이 분리됩니다.",
      en: "Lawyer, immigration, operator and auditor permissions are separated.",
      si: "නීතිඥ, ආගමන, මෙහෙයුම් සහ විගණන අවසර වෙන් කර ඇත.",
      ta: "வழக்கறிஞர், குடிவரவு, செயல்பாட்டாளர் மற்றும் தணிக்கையாளர் அனுமதிகள் பிரிக்கப்பட்டுள்ளன.",
    },
  },
  {
    title: { ko: "2,000명 Control Tower", en: "2,000-worker Control Tower", si: "සේවකයින් 2,000 Control Tower", ta: "2,000 தொழிலாளர் Control Tower" },
    href: "admin/control-tower",
    icon: Users,
    audience: { ko: "사업·운영 총괄", en: "Business and operations leads", si: "ව්‍යාපාර සහ මෙහෙයුම් නායකයින්", ta: "வணிக மற்றும் செயல்பாட்டு பொறுப்பாளர்கள்" },
    purpose: {
      ko: "Cohort, 입국차수, 항공편, 버스, Claim, 입국, 외국인등록, 사고를 집계합니다.",
      en: "Aggregate cohorts, arrival batches, flights, buses, claims, arrivals, alien registration and incidents.",
      si: "Cohort, පැමිණීමේ කණ්ඩායම්, ගුවන් ගමන්, බස්, Claim, පැමිණීම්, විදේශික ලියාපදිංචිය සහ සිදුවීම් එකතු කරයි.",
      ta: "Cohort, வருகைக் குழுக்கள், விமானங்கள், பேருந்துகள், Claim, வருகைகள், வெளிநாட்டவர் பதிவு மற்றும் சம்பவங்களை ஒருங்கிணைக்கிறது.",
    },
    boundary: {
      ko: "개인 법률·의료·인권상담은 고용주 집계화면에 노출하지 않습니다.",
      en: "Private legal, medical and human-rights consultations are not exposed in employer aggregate views.",
      si: "පෞද්ගලික නීති, වෛද්‍ය සහ මානව හිමිකම් උපදේශන සේවායෝජක සාරාංශ දර්ශනවල නොපෙන්වයි.",
      ta: "தனிப்பட்ட சட்ட, மருத்துவ மற்றும் மனித உரிமை ஆலோசனைகள் முதலாளி ஒருங்கிணைந்த பார்வையில் காட்டப்படாது.",
    },
  },
  {
    title: { ko: "명부·초대 등록", en: "Roster and invitation registration", si: "ලැයිස්තු සහ ආරාධනා ලියාපදිංචිය", ta: "பட்டியல் மற்றும் அழைப்பு பதிவு" },
    href: "admin/roster",
    icon: ClipboardList,
    audience: { ko: "세중 관리자·운영 매니저", en: "Sejoong administrators and operations managers", si: "Sejoong පරිපාලකයින් සහ මෙහෙයුම් කළමනාකරුවන්", ta: "Sejoong நிர்வாகிகள் மற்றும் செயல்பாட்டு மேலாளர்கள்" },
    purpose: {
      ko: "검증된 CSV·TSV 명부를 Cohort와 입국차수에 등록하고 1회용 초대코드를 발급합니다.",
      en: "Register a validated CSV/TSV roster to a cohort and arrival batch and issue single-use invitation codes.",
      si: "තහවුරු කළ CSV/TSV ලැයිස්තුව Cohort සහ පැමිණීමේ කණ්ඩායමකට ලියාපදිංචි කර එක්වර භාවිතා කරන ආරාධනා කේත නිකුත් කරයි.",
      ta: "சரிபார்க்கப்பட்ட CSV/TSV பட்டியலை Cohort மற்றும் வருகைக் குழுவில் பதிவு செய்து ஒருமுறை பயன்படும் அழைப்புக் குறியீடுகளை வழங்குகிறது.",
    },
    boundary: {
      ko: "적법한 공식 채널에서 확정된 명부만 입력합니다.",
      en: "Enter only rosters confirmed through lawful official channels.",
      si: "නීත්‍යානුකූල නිල මාර්ගවලින් තහවුරු කළ ලැයිස්තු පමණක් ඇතුළත් කරන්න.",
      ta: "சட்டபூர்வமான அதிகாரப்பூர்வ வழிகளில் உறுதிசெய்யப்பட்ட பட்டியல்களை மட்டும் உள்ளிடவும்.",
    },
  },
  {
    title: { ko: "협력기관 포털", en: "Partner portal", si: "හවුල් ආයතන පෝර්ටලය", ta: "கூட்டாளர் தளம்" },
    href: "portal",
    icon: Building2,
    audience: { ko: "고용주·현지기관·인가 공급자", en: "Employers, local institutions and authorized providers", si: "සේවායෝජකයින්, දේශීය ආයතන සහ බලයලත් සපයන්නන්", ta: "முதலாளிகள், உள்ளூர் நிறுவனங்கள் மற்றும் அங்கீகரிக்கப்பட்ட வழங்குநர்கள்" },
    purpose: {
      ko: "각 기관에 배정된 최소 운영정보, 서비스 신청과 처리결과만 제공합니다.",
      en: "Provide only the minimum operational data, service applications and results assigned to each organization.",
      si: "එක් එක් ආයතනයට පවරන ලද අවම මෙහෙයුම් දත්ත, සේවා අයදුම් සහ ප්‍රතිඵල පමණක් ලබා දෙයි.",
      ta: "ஒவ்வொரு நிறுவனத்திற்கும் ஒதுக்கப்பட்ட குறைந்தபட்ச செயல்பாட்டு தரவு, சேவை விண்ணப்பங்கள் மற்றும் முடிவுகளை மட்டும் வழங்குகிறது.",
    },
    boundary: {
      ko: "다른 기관·근로자의 데이터와 개인 민감상담에 접근할 수 없습니다.",
      en: "Partners cannot access other organizations' or workers' data or private sensitive consultations.",
      si: "වෙනත් ආයතන හෝ සේවක දත්ත සහ පෞද්ගලික සංවේදී උපදේශන වෙත ප්‍රවේශ විය නොහැක.",
      ta: "மற்ற நிறுவனங்கள் அல்லது தொழிலாளர்களின் தரவு மற்றும் தனிப்பட்ட உணர்வுப்பூர்வ ஆலோசனைகளை அணுக முடியாது.",
    },
  },
]

const lifecycle: Array<[string, Copy, Copy]> = [
  ["1", { ko: "공식 명부", en: "Official roster", si: "නිල ලැයිස්තුව", ta: "அதிகாரப்பூர்வ பட்டியல்" }, { ko: "검증된 인원과 초대코드를 생성", en: "Create validated worker records and invitation codes", si: "තහවුරු කළ සේවක වාර්තා සහ ආරාධනා කේත සාදන්න", ta: "சரிபார்க்கப்பட்ட தொழிலாளர் பதிவுகளையும் அழைப்புக் குறியீடுகளையும் உருவாக்கவும்" }],
  ["2", { ko: "현지 준비", en: "Local preparation", si: "දේශීය සූදානම", ta: "உள்ளூர் தயாரிப்பு" }, { ko: "여권·계약·검진·교육·비자 준비", en: "Prepare passport, contract, medical check, training and visa", si: "ගමන් බලපත්‍ර, ගිවිසුම, වෛද්‍ය පරීක්ෂණ, පුහුණුව සහ වීසා සූදානම් කරන්න", ta: "கடவுச்சீட்டு, ஒப்பந்தம், மருத்துவச் சோதனை, பயிற்சி மற்றும் விசாவைத் தயாரிக்கவும்" }],
  ["3", { ko: "출국", en: "Departure", si: "පිටත්වීම", ta: "புறப்பாடு" }, { ko: "공항 집결·탑승·항공편 상태", en: "Track airport assembly, boarding and flight status", si: "ගුවන් තොටුපළ එකතුව, ගුවන්ගත වීම සහ ගුවන් ගමන් තත්ත්වය", ta: "விமான நிலையச் சேர்க்கை, ஏற்றம் மற்றும் விமான நிலையை கண்காணிக்கவும்" }],
  ["4", { ko: "한국 도착", en: "Arrival in Korea", si: "කොරියාවට පැමිණීම", ta: "கொரியா வருகை" }, { ko: "공항·버스·기숙사·사업장 인계", en: "Handover across airport, bus, dormitory and workplace", si: "ගුවන් තොටුපළ, බස්, නේවාසිකාගාර සහ සේවා ස්ථාන භාරදීම", ta: "விமான நிலையம், பேருந்து, விடுதி மற்றும் வேலைத்தள ஒப்படைப்பு" }],
  ["5", { ko: "90일 정착", en: "90-day settlement", si: "දින 90 පදිංචිය", ta: "90 நாள் குடியேற்றம்" }, { ko: "외국인등록·통신·계좌·보험", en: "Alien registration, telecom, bank account and insurance", si: "විදේශික ලියාපදිංචිය, දුරකථන, බැංකු ගිණුම සහ රක්ෂණය", ta: "வெளிநாட்டவர் பதிவு, தொலைத்தொடர்பு, வங்கிக் கணக்கு மற்றும் காப்பீடு" }],
  ["6", { ko: "근로·생활", en: "Work and life", si: "වැඩ සහ ජීවිතය", ta: "வேலை மற்றும் வாழ்க்கை" }, { ko: "급여·송금·병원·숙소·민원", en: "Salary, remittance, hospital, housing and support requests", si: "වැටුප්, මුදල් යැවීම, රෝහල, නිවාස සහ සහාය ඉල්ලීම්", ta: "சம்பளம், பணமாற்றம், மருத்துவமனை, தங்குமிடம் மற்றும் உதவி கோரிக்கைகள்" }],
  ["7", { ko: "체류 관리", en: "Stay management", si: "රැඳී සිටීම කළමනාකරණය", ta: "தங்கும் நிலை மேலாண்மை" }, { ko: "연장·변경·E-7-4 준비 데이터", en: "Extension, change and E-7-4 preparation data", si: "දිගු කිරීම, වෙනස් කිරීම සහ E-7-4 සූදානම් දත්ත", ta: "நீட்டிப்பு, மாற்றம் மற்றும் E-7-4 தயாரிப்பு தரவு" }],
  ["8", { ko: "귀국", en: "Return", si: "ආපසු යාම", ta: "திரும்புதல்" }, { ko: "최종급여·퇴직금·보험·서비스 종료", en: "Final salary, severance, insurance and service closure", si: "අවසන් වැටුප, විශ්‍රාම ප්‍රතිලාභ, රක්ෂණය සහ සේවා අවසන් කිරීම", ta: "இறுதி சம்பளம், பணிநிறைவு தொகை, காப்பீடு மற்றும் சேவை முடிவு" }],
]

export default async function StayCareNotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const initialLanguage = normalizeStayCareLanguage(locale) || "ko"
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <StayCarePurposeNote
        initialLanguage={initialLanguage}
        title={{ ko: "프론트 화면·섹션 운영 노트", en: "Frontend screen and section operating notes", si: "ඉදිරිපස තිර සහ කොටස් මෙහෙයුම් සටහන්", ta: "முன்புற திரை மற்றும் பிரிவு செயல்பாட்டு குறிப்புகள்" }}
        purpose={{ ko: "개발자, 운영자, 고용주와 현지기관이 각 화면의 사용자·목적·입력·출력·법적 경계를 동일하게 이해하도록 만든 제품 내 설명서입니다.", en: "An in-product guide so developers, operators, employers and local institutions understand each screen's users, purpose, inputs, outputs and legal boundary consistently.", si: "සංවර්ධකයින්, මෙහෙයුම්කරුවන්, සේවායෝජකයින් සහ දේශීය ආයතන එක් එක් තිරයේ පරිශීලකයින්, අරමුණ, ආදාන, ප්‍රතිදාන සහ නීතිමය සීමාව එකම ආකාරයෙන් තේරුම් ගැනීමට වූ නිෂ්පාදන මාර්ගෝපදේශයකි.", ta: "உருவாக்குநர்கள், செயல்பாட்டாளர்கள், முதலாளிகள் மற்றும் உள்ளூர் நிறுவனங்கள் ஒவ்வொரு திரையின் பயனர், நோக்கம், உள்ளீடு, வெளியீடு மற்றும் சட்ட எல்லையை ஒரேபோல் புரிந்துகொள்ளும் தயாரிப்பு வழிகாட்டி." }}
        boundary={{ ko: "이 노트는 운영 설계와 화면 사용을 설명합니다. 법률의견, 모집승인, 비자결정 또는 의료판단 문서가 아닙니다.", en: "These notes explain operating design and screen use. They are not legal advice, recruitment approval, a visa decision or a medical judgment.", si: "මෙම සටහන් මෙහෙයුම් සැලසුම සහ තිර භාවිතය පැහැදිලි කරයි. ඒවා නීති උපදෙස්, බඳවාගැනීමේ අනුමැතිය, වීසා තීරණයක් හෝ වෛද්‍ය විනිශ්චයක් නොවේ.", ta: "இந்த குறிப்புகள் செயல்பாட்டு வடிவமைப்பு மற்றும் திரைப் பயன்பாட்டை விளக்குகின்றன. இவை சட்ட ஆலோசனை, ஆட்சேர்ப்பு அங்கீகாரம், விசா முடிவு அல்லது மருத்துவத் தீர்ப்பு அல்ல." }}
        items={[
          { label: { ko: "사용자", en: "Who", si: "කවුද", ta: "யார்" }, description: { ko: "누가 해당 화면을 사용하는가", en: "Who uses the screen", si: "තිරය භාවිතා කරන්නේ කවුද", ta: "திரையை யார் பயன்படுத்துகிறார்கள்" } },
          { label: { ko: "목적", en: "Why", si: "ඇයි", ta: "ஏன்" }, description: { ko: "어떤 운영문제를 해결하는가", en: "Which operating problem it solves", si: "එය විසඳන මෙහෙයුම් ගැටලුව", ta: "இது தீர்க்கும் செயல்பாட்டு சிக்கல்" } },
          { label: { ko: "경계", en: "Boundary", si: "සීමාව", ta: "எல்லை" }, description: { ko: "정부·세중·고용주·공급자 책임구분", en: "Government, Sejoong, employer and provider responsibility", si: "රජය, Sejoong, සේවායෝජක සහ සපයන්නාගේ වගකීම්", ta: "அரசு, Sejoong, முதலாளி மற்றும் வழங்குநர் பொறுப்புகள்" } },
          { label: { ko: "출력", en: "Output", si: "ප්‍රතිදානය", ta: "வெளியீடு" }, description: { ko: "다음 단계와 운영기록이 무엇인가", en: "The next step and operating record", si: "ඊළඟ පියවර සහ මෙහෙයුම් සටහන", ta: "அடுத்த படி மற்றும் செயல்பாட்டு பதிவு" } },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon
            return (
              <article key={section.href} className="flex flex-col rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-800"><Icon className="h-5 w-5" /></span>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black text-blue-800"><StayCareText value={section.audience} initialLanguage={initialLanguage} /></span>
                </div>
                <h2 className="mt-5 text-xl font-black"><StayCareText value={section.title} initialLanguage={initialLanguage} /></h2>
                <p className="mt-3 text-sm leading-6 text-slate-600"><StayCareText value={section.purpose} initialLanguage={initialLanguage} /></p>
                <p className="mt-3 rounded-xl bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-900"><StayCareText value={section.boundary} initialLanguage={initialLanguage} /></p>
                <Link href={`/${locale}/staycare/${section.href}`} className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-black text-blue-700">
                  <StayCareText value={{ ko: "화면 열기", en: "Open screen", si: "තිරය විවෘත කරන්න", ta: "திரையைத் திறக்கவும்" }} initialLanguage={initialLanguage} /> <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            )
          })}
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
          <div className="flex items-center gap-3"><Plane className="h-7 w-7 text-blue-700" /><div><h2 className="text-2xl font-black"><StayCareText value={{ ko: "근로자 전 생애주기", en: "Complete worker lifecycle", si: "සම්පූර්ණ සේවක ජීවන චක්‍රය", ta: "முழுமையான தொழிலாளர் வாழ்க்கைச் சுழற்சி" }} initialLanguage={initialLanguage} /></h2><p className="mt-1 text-sm text-slate-500"><StayCareText value={{ ko: "각 화면과 데이터는 아래 8단계 중 하나에 연결됩니다.", en: "Every screen and data record is connected to one of the eight stages below.", si: "සෑම තිරයක් සහ දත්ත වාර්තාවක්ම පහත අදියර අටෙන් එකකට සම්බන්ධ වේ.", ta: "ஒவ்வொரு திரையும் தரவுப் பதிவும் கீழுள்ள எட்டு கட்டங்களில் ஒன்றுடன் இணைக்கப்படுகிறது." }} initialLanguage={initialLanguage} /></p></div></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycle.map(([number, title, description]) => (
              <div key={number} className="rounded-2xl border border-slate-200 p-4"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">{number}</span><h3 className="mt-3 font-black"><StayCareText value={title} initialLanguage={initialLanguage} /></h3><p className="mt-1 text-xs leading-5 text-slate-600"><StayCareText value={description} initialLanguage={initialLanguage} /></p></div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-3">
          <Boundary icon={FileLock2} initialLanguage={initialLanguage} title={{ ko: "개인정보 경계", en: "Privacy boundary", si: "පෞද්ගලිකත්ව සීමාව", ta: "தனியுரிமை எல்லை" }} text={{ ko: "여권·체류·건강·급여정보는 최소수집, 목적별 동의, 역할기반 접근, 감사로그와 파기정책으로 관리합니다.", en: "Passport, stay, health and salary data are managed through minimization, purpose-specific consent, role-based access, audit logs and deletion policy.", si: "ගමන් බලපත්‍ර, රැඳී සිටීම, සෞඛ්‍ය සහ වැටුප් දත්ත අවම එකතු කිරීම, අරමුණු අනුව අනුමැතිය, භූමිකා ප්‍රවේශය, විගණන සටහන් සහ මකාදැමීමේ ප්‍රතිපත්තියෙන් කළමනාකරණය කරයි.", ta: "கடவுச்சீட்டு, தங்குதல், சுகாதாரம் மற்றும் சம்பளத் தரவு குறைந்தபட்ச சேகரிப்பு, நோக்க ஒப்புதல், பங்கு அடிப்படையிலான அணுகல், தணிக்கைப் பதிவு மற்றும் அழிப்பு கொள்கையால் நிர்வகிக்கப்படுகிறது." }} />
          <Boundary icon={ShieldAlert} initialLanguage={initialLanguage} title={{ ko: "사고 대응 경계", en: "Incident-response boundary", si: "සිදුවීම් ප්‍රතිචාර සීමාව", ta: "சம்பவப் பதில் எல்லை" }} text={{ ko: "P0/P1 사고는 일반 상담과 분리해 즉시 담당자를 배정하고 증거보전·법률·노무·의료 에스컬레이션을 실행합니다.", en: "P0/P1 incidents are separated from general support, assigned immediately and escalated for evidence preservation, legal, labor and medical response.", si: "P0/P1 සිදුවීම් සාමාන්‍ය සහායෙන් වෙන් කර වහාම පවරා සාක්ෂි සංරක්ෂණය, නීති, කම්කරු සහ වෛද්‍ය ප්‍රතිචාර වෙත යොමු කරයි.", ta: "P0/P1 சம்பவங்கள் பொதுவான உதவியிலிருந்து பிரிக்கப்பட்டு உடனடியாக ஒதுக்கப்பட்டு, ஆதாரப் பாதுகாப்பு, சட்ட, தொழிலாளர் மற்றும் மருத்துவப் பதிலுக்கு உயர்த்தப்படுகின்றன." }} />
          <Boundary icon={HeartHandshake} initialLanguage={initialLanguage} title={{ ko: "서비스 수행 경계", en: "Service-execution boundary", si: "සේවා ක්‍රියාත්මක සීමාව", ta: "சேவை செயலாக்க எல்லை" }} text={{ ko: "통신·은행·송금·보험·의료·출입국·법률은 인가된 수행주체가 처리하고 StayCare는 신청·자료·상태·증빙을 통합합니다.", en: "Authorized entities perform telecom, banking, remittance, insurance, medical, immigration and legal work; StayCare integrates applications, data, status and evidence.", si: "බලයලත් පාර්ශ්ව දුරකථන, බැංකු, මුදල් යැවීම, රක්ෂණ, වෛද්‍ය, ආගමන සහ නීති සේවා සිදු කරන අතර StayCare අයදුම්, දත්ත, තත්ත්ව සහ සාක්ෂි ඒකාබද්ධ කරයි.", ta: "அங்கீகரிக்கப்பட்ட நிறுவனங்கள் தொலைத்தொடர்பு, வங்கி, பணமாற்றம், காப்பீடு, மருத்துவம், குடிவரவு மற்றும் சட்டப் பணிகளைச் செய்கின்றன; StayCare விண்ணப்பம், தரவு, நிலை மற்றும் ஆதாரத்தை ஒருங்கிணைக்கிறது." }} />
        </section>
      </div>
    </main>
  )
}

function Boundary({ icon: Icon, title, text, initialLanguage }: { icon: typeof FileLock2; title: StayCareTextValue; text: StayCareTextValue; initialLanguage: "ko" | "en" | "si" | "ta" }) {
  return <div className="rounded-[1.75rem] bg-slate-950 p-6 text-white"><Icon className="h-7 w-7 text-red-300" /><h3 className="mt-4 text-xl font-black"><StayCareText value={title} initialLanguage={initialLanguage} /></h3><p className="mt-3 text-sm leading-7 text-slate-300"><StayCareText value={text} initialLanguage={initialLanguage} /></p></div>
}
