"use client"

import Link from "next/link"
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  Bot,
  Building2,
  CheckCircle2,
  ChevronRight,
  FileLock2,
  HeartPulse,
  Landmark,
  Languages,
  Plane,
  Scale,
  ShieldCheck,
  Smartphone,
  Sparkles,
  WalletCards,
} from "lucide-react"
import StayCareLanguageSwitcher from "@/components/staycare/StayCareLanguageSwitcher"
import {
  journeyPhases,
  oneStopServices,
  responsibilityLabels,
  t,
  type StayCareLanguage,
} from "@/lib/staycare/lifecycle-model"
import {
  useStayCareLanguage,
  type StayCarePreferredLanguage,
} from "@/lib/staycare/language-preference"

const serviceIcons = {
  identity: FileLock2,
  telecom: Smartphone,
  finance: WalletCards,
  remittance: Banknote,
  immigration: Scale,
  insurance: ShieldCheck,
  housing: Building2,
  health: HeartPulse,
  work: BadgeCheck,
  mobility: Plane,
  translation: Languages,
  return: Plane,
} as const

const localized = {
  ko: {
    badge: "스리랑카 근로자를 위한 한국생활 원스톱 플랫폼",
    title1: "한국에 오기 전부터",
    title2: "귀국할 때까지 한곳에서.",
    description:
      "정부와 EPS가 처리하는 공식 모집·고용·입국 절차는 정확히 연결하고, 비자 발급 이후 통신, 공항수령, 숙소배송, 외국인등록, 은행, 보험, 본국송금, 체류연장, 병원, AI 통역과 귀국준비를 세중 플랫폼에서 통합합니다.",
    openApp: "원스톱 앱 열기",
    journey: "전체 준비과정 보기",
    languages: "한국어 · English · සිංහල · தமிழ்",
    officialBoundary: "정부 공식절차와 민간서비스를 구분",
    reuse: "한 번 입력한 자료를 동의 후 재사용",
    journeyEyebrow: "Sri Lanka to Korea lifecycle",
    journeyTitle: "현지 준비부터 한국생활·체류·귀국까지",
    journeyDescription:
      "한 명의 근로자가 실제로 지나가는 전체 생애주기를 기준으로 설계했습니다.",
    servicesEyebrow: "One-stop services",
    servicesTitle: "비자 발급 이후 필요한 서비스를 한 화면에서",
    servicesDescription:
      "세중이 신청과 진행상태를 통합하고, 실제 개통·금융·송금은 공식기관 또는 인가·제휴 사업자가 수행합니다.",
    boundaryEyebrow: "Clear responsibility",
    boundaryTitle: "정부가 하는 일은 연결하고, 빈틈은 세중이 채웁니다",
    government: "정부·공공기관",
    governmentText:
      "시험, 구직자 명부, 표준근로계약, 사전교육, 사증·입국 진행, 취업교육과 고용허가제 보험 등 공식 승인·처리 영역",
    sejoong: "세중 원스톱",
    sejoongText:
      "공식 상태 안내, 서류 준비, 일정·만료 관리, 생활서비스 신청, 상담·사건 접수, 파트너 연결과 진행 추적",
    partner: "인가·제휴 사업자",
    partnerText:
      "통신 개통, 은행계좌, 해외송금, 배송, 보험·의료·숙소 등 허가와 본인확인이 필요한 실제 서비스 수행",
    aiTitle: "AI 통역을 앱의 기본 기능으로",
    aiText:
      "한국어·영어·싱할라어·타밀어 텍스트와 브라우저 음성을 변환하고, 공항·사업장·병원·은행·출입국·숙소·송금 상황의 다음 행동을 안내합니다.",
    securityTitle: "여권과 체류정보를 다루는 수준의 보안",
    securityText:
      "비공개 문서함, 역할·조직별 접근통제, 짧은 만료 URL, 번호 마스킹, 공유동의와 조회·다운로드 감사기록을 전제로 합니다.",
    closeTitle: "한국생활에 필요한 것을 하나의 계정으로 시작합니다.",
    closeText:
      "스리랑카에서 로그인하면 지금 준비할 것과 다음 단계를 확인하고, 한국 도착 후 같은 계정으로 생활·체류·송금·귀국업무를 이어갑니다.",
    navJourney: "준비과정",
    navServices: "서비스",
    navResponsibility: "책임 구분",
    navPlatform: "AI·보안",
    previewJourney: "나의 한국생활 여정",
    previewRoute: "스리랑카 → 한국 → 귀국",
    previewStats: ["준비완료", "진행 중", "확인 필요"],
    previewItems: [
      ["eSIM / SIM", "단말 확인 → 공항수령 또는 배송"],
      ["스리랑카 송금", "인가사업자 견적과 영수증"],
      ["체류행정", "등록 → 연장 → 귀국"],
      ["AI 언어지원", "한국어 · 영어 · 싱할라어 · 타밀어"],
    ],
    aiCta: "AI 통역 열기",
    securityItems: ["비공개 문서함", "RLS", "동의", "감사기록"],
  },
  en: {
    badge: "Korea-life one-stop platform for Sri Lankan workers",
    title1: "From before Korea",
    title2: "until the return home.",
    description:
      "The platform connects official government and EPS recruitment, employment and entry processes, then integrates post-visa connectivity, pickup or delivery, registration, banking, insurance, remittance, stay extension, healthcare, AI interpretation and return preparation.",
    openApp: "Open one-stop app",
    journey: "View full journey",
    languages: "한국어 · English · සිංහල · தமிழ்",
    officialBoundary: "Clear public and private responsibility",
    reuse: "Reuse verified data with consent",
    journeyEyebrow: "Sri Lanka to Korea lifecycle",
    journeyTitle: "From local preparation to work, stay and return",
    journeyDescription:
      "Designed around the real lifecycle of each worker from Sri Lanka to Korea and back home.",
    servicesEyebrow: "One-stop services",
    servicesTitle: "Post-visa Korea-life services in one screen",
    servicesDescription:
      "Sejoong orchestrates applications and status while authorities and licensed providers perform regulated services.",
    boundaryEyebrow: "Clear responsibility",
    boundaryTitle: "Link official systems and fill the gaps with Sejoong",
    government: "Government and public authorities",
    governmentText:
      "Official approval and processing such as testing, roster placement, standard contracts, pre-departure training, visa and entry progress, employment training and EPS insurance.",
    sejoong: "Sejoong one-stop",
    sejoongText:
      "Explain official status, prepare records, manage deadlines, route life-service requests, receive cases and track providers.",
    partner: "Licensed or contracted providers",
    partnerText:
      "Perform identity-verified telecom, banking, remittance, delivery, insurance, healthcare and accommodation services.",
    aiTitle: "AI interpretation as a core app function",
    aiText:
      "Translate Korean, English, Sinhala and Tamil text or browser-captured speech and explain next actions for airports, workplaces, hospitals, banks, immigration, housing and remittance.",
    securityTitle: "Security suitable for passport and stay records",
    securityText:
      "Private document storage, role and organization access controls, expiring URLs, masked identifiers, sharing consent and access or download audit logs.",
    closeTitle: "Start Korea life with one account.",
    closeText:
      "Log in from Sri Lanka to see what to prepare and continue with the same account for life, stay, remittance and return tasks after arrival.",
    navJourney: "Journey",
    navServices: "Services",
    navResponsibility: "Responsibility",
    navPlatform: "AI & security",
    previewJourney: "My Korea journey",
    previewRoute: "Sri Lanka → Korea → Home",
    previewStats: ["Ready", "In progress", "Attention"],
    previewItems: [
      ["eSIM / SIM", "Device check → airport or delivery"],
      ["Sri Lanka remittance", "Licensed-provider quote and receipt"],
      ["Stay administration", "Registration → extension → return"],
      ["AI language", "Korean · English · Sinhala · Tamil"],
    ],
    aiCta: "Open AI interpreter",
    securityItems: ["Private storage", "RLS", "Consent", "Audit log"],
  },
  si: {
    badge: "ශ්‍රී ලාංකික සේවකයන් සඳහා කොරියානු ජීවිත එක්-තැනක වේදිකාව",
    title1: "කොරියාවට පැමිණීමට පෙර සිට",
    title2: "ආපසු ශ්‍රී ලංකාවට යන තෙක්.",
    description:
      "රජය සහ EPS විසින් පාලනය කරන නිල බඳවාගැනීම්, රැකියා සහ ඇතුළුවීමේ ක්‍රියාවලිය සම්බන්ධ කර, වීසා නිකුත් වූ පසු දුරකථන සම්බන්ධතාව, ගුවන් තොටුපළ ලබාගැනීම, නවාතැන් බෙදාහැරීම, විදේශික ලියාපදිංචිය, බැංකු, රක්ෂණ, මුදල් යැවීම, රැඳී සිටීම දිගු කිරීම, වෛද්‍ය සේවා, AI භාෂා සහාය සහ ආපසු යාම එක් වේදිකාවකින් කළමනාකරණය කරයි.",
    openApp: "එක්-තැනක යෙදුම විවෘත කරන්න",
    journey: "සම්පූර්ණ ගමන බලන්න",
    languages: "한국어 · English · සිංහල · தமிழ்",
    officialBoundary: "නිල ක්‍රියාවලිය සහ පෞද්ගලික සේවා වෙන් කරයි",
    reuse: "අනුමැතියෙන් තහවුරු කළ දත්ත නැවත භාවිතා කරන්න",
    journeyEyebrow: "ශ්‍රී ලංකාවෙන් කොරියාවට ජීවිත ගමන",
    journeyTitle: "දේශීය සූදානමෙන් කොරියානු ජීවිතය, රැඳී සිටීම සහ ආපසු යාම දක්වා",
    journeyDescription:
      "ශ්‍රී ලංකාවේ සිට කොරියාවට පැමිණ ආපසු යන එක් සේවකයෙකුගේ සැබෑ ජීවිත ගමන අනුව නිර්මාණය කර ඇත.",
    servicesEyebrow: "එක්-තැනක සේවා",
    servicesTitle: "වීසා පසු අවශ්‍ය කොරියානු ජීවිත සේවා එකම තිරයකින්",
    servicesDescription:
      "Sejoong අයදුම් සහ තත්ත්වය එකතු කරයි. නියාමිත සේවා රජයේ ආයතන හෝ බලපත්‍රලාභී හවුල්කරුවන් විසින් සිදු කරයි.",
    boundaryEyebrow: "පැහැදිලි වගකීම",
    boundaryTitle: "නිල පද්ධති සම්බන්ධ කර හිස්තැන් Sejoong පුරවයි",
    government: "රජය සහ රාජ්‍ය ආයතන",
    governmentText:
      "පරීක්ෂණ, රැකියා ලැයිස්තුගත කිරීම, සම්මත සේවා ගිවිසුම්, පිටත්වීමට පෙර පුහුණුව, වීසා සහ ඇතුළුවීම, රැකියා පුහුණුව සහ EPS රක්ෂණය වැනි නිල අනුමැතිය සහ ක්‍රියාත්මක කිරීම.",
    sejoong: "Sejoong එක්-තැනක සේවාව",
    sejoongText:
      "නිල තත්ත්වය පැහැදිලි කිරීම, ලේඛන සූදානම් කිරීම, අවසන් දින කළමනාකරණය, ජීවිත සේවා අයදුම්, නඩු හෝ විමසීම් භාරගැනීම සහ සේවා සපයන්නන් අනුගමනය කිරීම.",
    partner: "බලපත්‍රලාභී හෝ ගිවිසුම්ගත සේවා සපයන්නන්",
    partnerText:
      "දුරකථන සම්බන්ධතාව, බැංකු ගිණුම්, විදේශ මුදල් යැවීම, බෙදාහැරීම, රක්ෂණ, වෛද්‍ය සහ නවාතැන් සේවා සිදු කරයි.",
    aiTitle: "AI භාෂා සහාය යෙදුමේ මූලික අංගයක් ලෙස",
    aiText:
      "කොරියානු, ඉංග්‍රීසි, සිංහල සහ දෙමළ පෙළ හෝ හඬ පරිවර්තනය කර ගුවන් තොටුපළ, සේවා ස්ථානය, රෝහල, බැංකුව, ආගමන, නවාතැන් සහ මුදල් යැවීමේදී ඊළඟ ක්‍රියාව පැහැදිලි කරයි.",
    securityTitle: "ගමන් බලපත්‍ර සහ රැඳී සිටීමේ දත්ත සඳහා සුදුසු ආරක්ෂාව",
    securityText:
      "පෞද්ගලික ලේඛන ගබඩාව, භූමිකා සහ ආයතන අනුව ප්‍රවේශ පාලනය, කල් ඉකුත් වන සබැඳි, අංක සැඟවීම, බෙදාගැනීමේ අනුමැතිය සහ ප්‍රවේශ වාර්තා භාවිතා කරයි.",
    closeTitle: "එකම ගිණුමකින් කොරියානු ජීවිතය ආරම්භ කරන්න.",
    closeText:
      "ශ්‍රී ලංකාවේ සිට පිවිසී දැන් සූදානම් කළ යුතු දේ බලන්න. කොරියාවට පැමිණි පසු එම ගිණුමෙන්ම ජීවිත, රැඳී සිටීම, මුදල් යැවීම සහ ආපසු යාම කළමනාකරණය කරන්න.",
    navJourney: "ගමන",
    navServices: "සේවා",
    navResponsibility: "වගකීම්",
    navPlatform: "AI සහ ආරක්ෂාව",
    previewJourney: "මගේ කොරියානු ගමන",
    previewRoute: "ශ්‍රී ලංකාව → කොරියාව → ආපසු",
    previewStats: ["සූදානම්", "ක්‍රියාත්මකයි", "අවධානය අවශ්‍යයි"],
    previewItems: [
      ["eSIM / SIM", "උපාංග පරීක්ෂාව → ගුවන් තොටුපළ හෝ බෙදාහැරීම"],
      ["ශ්‍රී ලංකාවට මුදල් යැවීම", "බලපත්‍රලාභී සේවාවේ මිල හා රිසිට්"],
      ["රැඳී සිටීමේ පරිපාලනය", "ලියාපදිංචිය → දිගු කිරීම → ආපසු යාම"],
      ["AI භාෂා සහාය", "කොරියානු · ඉංග්‍රීසි · සිංහල · දෙමළ"],
    ],
    aiCta: "AI පරිවර්තකය විවෘත කරන්න",
    securityItems: ["පෞද්ගලික ගබඩාව", "RLS", "අනුමැතිය", "විගණන සටහන"],
  },
  ta: {
    badge: "இலங்கைத் தொழிலாளர்களுக்கான கொரிய வாழ்க்கை ஒருங்கிணைந்த தளம்",
    title1: "கொரியாவுக்கு வருவதற்கு முன்பிருந்து",
    title2: "வீடு திரும்பும் வரை ஒரே இடத்தில்.",
    description:
      "அரசு மற்றும் EPS நடத்தும் அதிகாரப்பூர்வ ஆட்சேர்ப்பு, வேலைவாய்ப்பு மற்றும் நுழைவு நடைமுறைகளை இணைத்து, விசாவிற்குப் பிறகு தொலைத்தொடர்பு, விமான நிலையப் பெறுதல், தங்குமிட விநியோகம், வெளிநாட்டவர் பதிவு, வங்கி, காப்பீடு, இலங்கை பணமாற்றம், தங்கும் கால நீட்டிப்பு, மருத்துவம், AI மொழி உதவி மற்றும் திரும்பும் தயாரிப்பை Sejoong தளத்தில் ஒருங்கிணைக்கிறது.",
    openApp: "ஒருங்கிணைந்த செயலியைத் திறக்கவும்",
    journey: "முழுப் பயணத்தைப் பார்க்கவும்",
    languages: "한국어 · English · සිංහල · தமிழ்",
    officialBoundary: "அரசு நடைமுறைகளையும் தனியார் சேவைகளையும் தெளிவாகப் பிரிக்கிறது",
    reuse: "ஒப்புதலுடன் சரிபார்க்கப்பட்ட தகவலை மீண்டும் பயன்படுத்தவும்",
    journeyEyebrow: "இலங்கையிலிருந்து கொரியா வரை வாழ்க்கைப் பயணம்",
    journeyTitle: "உள்ளூர் தயாரிப்பிலிருந்து கொரிய வாழ்க்கை, தங்குதல் மற்றும் திரும்புதல் வரை",
    journeyDescription:
      "இலங்கையிலிருந்து கொரியாவுக்கு வந்து மீண்டும் வீடு திரும்பும் ஒவ்வொரு தொழிலாளரின் உண்மையான வாழ்க்கைச் சுழற்சியை அடிப்படையாகக் கொண்டு வடிவமைக்கப்பட்டது.",
    servicesEyebrow: "ஒருங்கிணைந்த சேவைகள்",
    servicesTitle: "விசாவிற்குப் பிறகு தேவையான கொரிய வாழ்க்கைச் சேவைகள் ஒரே திரையில்",
    servicesDescription:
      "Sejoong விண்ணப்பங்களையும் நிலையையும் ஒருங்கிணைக்கிறது; கட்டுப்படுத்தப்பட்ட சேவைகளை அதிகாரப்பூர்வ நிறுவனங்கள் அல்லது உரிமம் பெற்ற கூட்டாளர்கள் செயல்படுத்துகின்றனர்.",
    boundaryEyebrow: "தெளிவான பொறுப்பு",
    boundaryTitle: "அதிகாரப்பூர்வ அமைப்புகளை இணைத்து இடைவெளிகளை Sejoong நிரப்புகிறது",
    government: "அரசு மற்றும் பொது நிறுவனங்கள்",
    governmentText:
      "தேர்வு, வேலை பட்டியல், நிலையான வேலை ஒப்பந்தம், புறப்படுவதற்கு முன் பயிற்சி, விசா மற்றும் நுழைவு, வேலைப் பயிற்சி, EPS காப்பீடு போன்ற அதிகாரப்பூர்வ ஒப்புதல் மற்றும் செயலாக்கப் பகுதிகள்.",
    sejoong: "Sejoong ஒருங்கிணைந்த சேவை",
    sejoongText:
      "அதிகாரப்பூர்வ நிலை விளக்கம், ஆவணத் தயாரிப்பு, காலக்கெடு மற்றும் காலாவதி மேலாண்மை, வாழ்க்கைச் சேவை விண்ணப்பம், ஆலோசனை மற்றும் வழக்கு பதிவு, கூட்டாளர் இணைப்பு மற்றும் முன்னேற்றக் கண்காணிப்பு.",
    partner: "உரிமம் பெற்ற அல்லது ஒப்பந்த சேவை வழங்குநர்கள்",
    partnerText:
      "தொலைத்தொடர்பு செயல்படுத்தல், வங்கி கணக்கு, வெளிநாட்டு பணமாற்றம், விநியோகம், காப்பீடு, மருத்துவம் மற்றும் தங்குமிடம் போன்ற அடையாளச் சரிபார்ப்பு தேவைப்படும் சேவைகளை செயல்படுத்துகின்றனர்.",
    aiTitle: "AI மொழி உதவியை செயலியின் அடிப்படை அம்சமாக",
    aiText:
      "கொரியம், ஆங்கிலம், சிங்களம் மற்றும் தமிழ் உரை அல்லது உலாவி குரலை மாற்றி, விமான நிலையம், வேலைத்தளம், மருத்துவமனை, வங்கி, குடிவரவு, தங்குமிடம் மற்றும் பணமாற்ற சூழல்களில் அடுத்த செயலை விளக்குகிறது.",
    securityTitle: "கடவுச்சீட்டு மற்றும் தங்கும் தகவலுக்கேற்ற பாதுகாப்பு",
    securityText:
      "தனிப்பட்ட ஆவண சேமிப்பு, பங்கு மற்றும் நிறுவனம் அடிப்படையிலான அணுகல் கட்டுப்பாடு, காலாவதியாகும் URL, எண் மறைத்தல், பகிர்வு ஒப்புதல் மற்றும் அணுகல்/பதிவிறக்க தணிக்கை பதிவுகளைப் பயன்படுத்துகிறது.",
    closeTitle: "ஒரே கணக்கில் கொரிய வாழ்க்கையைத் தொடங்குங்கள்.",
    closeText:
      "இலங்கையிலிருந்து உள்நுழைந்து இப்போது தயாரிக்க வேண்டியவற்றைப் பாருங்கள். கொரியாவுக்கு வந்த பிறகு அதே கணக்கில் வாழ்க்கை, தங்குதல், பணமாற்றம் மற்றும் திரும்பும் பணிகளைத் தொடருங்கள்.",
    navJourney: "பயணம்",
    navServices: "சேவைகள்",
    navResponsibility: "பொறுப்புகள்",
    navPlatform: "AI மற்றும் பாதுகாப்பு",
    previewJourney: "என் கொரிய வாழ்க்கைப் பயணம்",
    previewRoute: "இலங்கை → கொரியா → வீடு",
    previewStats: ["தயார்", "செயல்பாட்டில்", "கவனம் தேவை"],
    previewItems: [
      ["eSIM / SIM", "சாதனச் சரிபார்ப்பு → விமான நிலையம் அல்லது விநியோகம்"],
      ["இலங்கை பணமாற்றம்", "உரிமம் பெற்ற சேவையின் விலை மற்றும் ரசீது"],
      ["தங்கும் நிர்வாகம்", "பதிவு → நீட்டிப்பு → திரும்புதல்"],
      ["AI மொழி உதவி", "கொரியம் · ஆங்கிலம் · சிங்களம் · தமிழ்"],
    ],
    aiCta: "AI மொழிபெயர்ப்பாளரைத் திறக்கவும்",
    securityItems: ["தனிப்பட்ட சேமிப்பு", "RLS", "ஒப்புதல்", "தணிக்கை பதிவு"],
  },
} as const

function appHref(locale: string, language: StayCarePreferredLanguage) {
  return `/${locale}/staycare/app?lang=${language}`
}

export default function StayCareLanding({ locale }: { locale: string }) {
  const initialLanguage: StayCarePreferredLanguage = locale === "en" ? "en" : locale === "si" ? "si" : locale === "ta" ? "ta" : "ko"
  const { language, setLanguage } = useStayCareLanguage(initialLanguage)
  const copy = localized[language]
  const modelLanguage = language as StayCareLanguage

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#f7f7f5]/95 backdrop-blur-xl">
        <div className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href={`/${locale}/staycare`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#bb271a] font-black text-white">S</span>
            <span>
              <span className="block font-black tracking-tight">Sejoong StayCare</span>
              <span className="block text-[11px] text-slate-500">Korea Life One-stop</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-slate-600 lg:flex">
            <a href="#journey" className="hover:text-slate-950">{copy.navJourney}</a>
            <a href="#services" className="hover:text-slate-950">{copy.navServices}</a>
            <a href="#boundary" className="hover:text-slate-950">{copy.navResponsibility}</a>
            <a href="#platform" className="hover:text-slate-950">{copy.navPlatform}</a>
          </nav>
          <div className="flex items-center gap-2">
            <StayCareLanguageSwitcher value={language} onChange={setLanguage} compact />
            <Link href={appHref(locale, language)} className="hidden items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#bb271a] sm:inline-flex">
              {copy.openApp} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(187,39,26,0.17),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(15,23,42,0.08),transparent_32%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8 lg:py-28">
          <div className="flex flex-col justify-center">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-red-200 bg-white px-3 py-1.5 text-xs font-bold text-[#bb271a] shadow-sm">
              <Sparkles className="h-4 w-4" /> {copy.badge}
            </div>
            <h1 className="mt-7 text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {copy.title1}
              <span className="block text-[#bb271a]">{copy.title2}</span>
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-600">{copy.description}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href={appHref(locale, language)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white shadow-lg shadow-red-900/10 transition hover:bg-[#9a1f14]">
                {copy.openApp} <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#journey" className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 py-4 font-bold text-slate-800 hover:border-slate-400">
                {copy.journey}
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2"><Languages className="h-4 w-4 text-blue-600" /> {copy.languages}</span>
              <span className="flex items-center gap-2"><Landmark className="h-4 w-4 text-emerald-600" /> {copy.officialBoundary}</span>
              <span className="flex items-center gap-2"><FileLock2 className="h-4 w-4 text-violet-600" /> {copy.reuse}</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-red-200/50 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/70 bg-white p-4 shadow-2xl shadow-slate-900/10">
              <div className="rounded-[1.5rem] bg-slate-950 p-6 text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-300">{copy.previewJourney}</p>
                <p className="mt-2 text-2xl font-black">{copy.previewRoute}</p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {copy.previewStats.map((label, index) => { const value = ["8", "4", "1"][index]; return (
                    <div key={label} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs text-slate-400">{label}</p>
                      <p className="mt-2 text-2xl font-black">{value}</p>
                    </div>
                  )})}
                </div>
              </div>
              <div className="space-y-3 p-4">
                {[
                  [Smartphone, ...copy.previewItems[0]],
                  [Banknote, ...copy.previewItems[1]],
                  [Scale, ...copy.previewItems[2]],
                  [Bot, ...copy.previewItems[3]],
                ].map(([Icon, title, note]) => {
                  const IconComponent = Icon as typeof Smartphone
                  return (
                    <div key={String(title)} className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700"><IconComponent className="h-5 w-5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="font-black text-slate-900">{String(title)}</p>
                        <p className="truncate text-xs text-slate-500">{String(note)}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300" />
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="journey" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.journeyEyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.journeyTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">{copy.journeyDescription}</p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeyPhases.map((phase) => (
            <article key={phase.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 font-black text-[#bb271a]">{phase.order}</span>
                <span className="text-xs font-bold text-slate-400">{t(phase.location, modelLanguage)}</span>
              </div>
              <h3 className="mt-6 text-xl font-black">{t(phase.title, modelLanguage)}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">{t(phase.description, modelLanguage)}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.servicesEyebrow}</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.servicesTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-slate-600">{copy.servicesDescription}</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {oneStopServices.map((service) => {
              const Icon = serviceIcons[service.category]
              return (
                <article key={service.id} className="rounded-3xl border border-slate-200 bg-[#fafaf8] p-6">
                  <div className="flex items-start justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#bb271a]"><Icon className="h-6 w-6" /></span>
                    <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-500">{service.integrationStatus}</span>
                  </div>
                  <h3 className="mt-5 text-xl font-black">{t(service.title, modelLanguage)}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{t(service.description, modelLanguage)}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {service.ownership.map((owner) => (
                      <span key={owner} className="rounded-lg bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500">
                        {t(responsibilityLabels[owner], modelLanguage)}
                      </span>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="boundary" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#bb271a]">{copy.boundaryEyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{copy.boundaryTitle}</h2>
        </div>
        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {[
            [Landmark, copy.government, copy.governmentText, "blue"],
            [Sparkles, copy.sejoong, copy.sejoongText, "red"],
            [BadgeCheck, copy.partner, copy.partnerText, "emerald"],
          ].map(([Icon, title, text, tone]) => {
            const IconComponent = Icon as typeof Landmark
            return (
              <article key={String(title)} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "emerald" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-[#bb271a]"}`}>
                  <IconComponent className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{String(title)}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{String(text)}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="platform" className="border-y border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <Bot className="h-9 w-9 text-violet-300" />
            <h2 className="mt-5 text-2xl font-black">{copy.aiTitle}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">{copy.aiText}</p>
            <Link href={appHref(locale, language)} className="mt-6 inline-flex items-center rounded-2xl bg-violet-400/15 px-5 py-3 text-sm font-black text-violet-200">
              {copy.aiCta} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </article>
          <article className="rounded-[2rem] border border-white/10 bg-white/5 p-7">
            <ShieldCheck className="h-9 w-9 text-emerald-300" />
            <h2 className="mt-5 text-2xl font-black">{copy.securityTitle}</h2>
            <p className="mt-4 text-sm leading-8 text-slate-300">{copy.securityText}</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-bold text-slate-300">
              {copy.securityItems.map((item) => (
                <div key={item} className="rounded-xl bg-white/5 p-3"><CheckCircle2 className="mb-2 h-4 w-4 text-emerald-400" />{item}</div>
              ))}
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold text-[#bb271a]">Sejoong StayCare</p>
            <h2 className="mt-3 text-3xl font-black">{copy.closeTitle}</h2>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">{copy.closeText}</p>
          </div>
          <Link href={appHref(locale, language)} className="inline-flex items-center justify-center rounded-2xl bg-[#bb271a] px-6 py-4 font-bold text-white">
            {copy.openApp} <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  )
}
