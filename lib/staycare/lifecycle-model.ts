import { translateStayCareTamil } from "@/lib/staycare/tamil-translations"

export type StayCareBaseLanguage = "ko" | "en" | "si"
export type StayCareLanguage = StayCareBaseLanguage | "ta"
export type LocalizedText = Record<StayCareBaseLanguage, string> & { ta?: string }
export type JourneyPhaseId =
  | "prepare"
  | "official"
  | "preDeparture"
  | "arrival"
  | "settlement"
  | "living"
  | "renewal"
  | "return"
export type Responsibility = "government" | "sejoong" | "partner" | "worker" | "employer"
export type StepStatus = "not_started" | "ready" | "in_progress" | "waiting" | "completed" | "attention"
export type ServiceCategory =
  | "identity"
  | "telecom"
  | "finance"
  | "remittance"
  | "immigration"
  | "insurance"
  | "housing"
  | "health"
  | "work"
  | "mobility"
  | "translation"
  | "return"

export const languageLabels: Record<StayCareLanguage, string> = {
  ko: "한국어",
  en: "English",
  si: "සිංහල",
  ta: "தமிழ்",
}

export const responsibilityLabels: Record<Responsibility, LocalizedText> = {
  government: {
    ko: "정부·공공기관",
    en: "Government / public authority",
    si: "රජය / රාජ්‍ය ආයතනය",
  },
  sejoong: {
    ko: "세중 원스톱 지원",
    en: "Sejoong one-stop support",
    si: "Sejoong එක්-තැනක සේවාව",
  },
  partner: {
    ko: "공식 제휴·인가 사업자",
    en: "Licensed / contracted provider",
    si: "බලපත්‍රලාභී / ගිවිසුම්ගත සේවා සපයන්නා",
  },
  worker: {
    ko: "근로자 본인",
    en: "Worker",
    si: "සේවකයා",
  },
  employer: {
    ko: "고용주",
    en: "Employer",
    si: "සේවායෝජකයා",
  },
}

export interface JourneyStep {
  id: string
  phaseId: JourneyPhaseId
  title: LocalizedText
  description: LocalizedText
  responsibility: Responsibility[]
  official?: boolean
  required?: boolean
  documents?: LocalizedText[]
  actions?: Array<"guide" | "upload" | "apply" | "book" | "track" | "contact">
  serviceCategory?: ServiceCategory
  officialReference?: {
    label: string
    url: string
  }
}

export interface JourneyPhase {
  id: JourneyPhaseId
  order: number
  title: LocalizedText
  shortTitle: LocalizedText
  description: LocalizedText
  location: LocalizedText
  color: string
}

export interface OneStopService {
  id: string
  category: ServiceCategory
  title: LocalizedText
  description: LocalizedText
  availableFrom: JourneyPhaseId
  ownership: Responsibility[]
  deliveryModes: Array<"digital" | "airport" | "accommodation" | "branch" | "video" | "phone">
  requiredData: LocalizedText[]
  result: LocalizedText
  integrationStatus: "ready_ui" | "partner_api" | "official_link" | "manual_review"
  legalBoundary?: LocalizedText
}

export const journeyPhases: JourneyPhase[] = [
  {
    id: "prepare",
    order: 1,
    title: {
      ko: "스리랑카에서 준비",
      en: "Prepare in Sri Lanka",
      si: "ශ්‍රී ලංකාවේ සූදානම් වීම",
    },
    shortTitle: { ko: "현지 준비", en: "Sri Lanka", si: "ශ්‍රී ලංකාව" },
    description: {
      ko: "공식 모집·교육기관을 통해 후보자로 등록되고, 한국 취업에 필요한 개인자료와 교육상태를 준비합니다.",
      en: "Register through the official recruitment and training channel and prepare personal records for employment in Korea.",
      si: "නිල බඳවාගැනීම් හා පුහුණු මාර්ගයෙන් ලියාපදිංචි වී කොරියාවේ රැකියාව සඳහා අවශ්‍ය තොරතුරු සූදානම් කරන්න.",
    },
    location: { ko: "스리랑카", en: "Sri Lanka", si: "ශ්‍රී ලංකාව" },
    color: "emerald",
  },
  {
    id: "official",
    order: 2,
    title: {
      ko: "정부·EPS 절차",
      en: "Government and EPS process",
      si: "රජයේ හා EPS ක්‍රියාවලිය",
    },
    shortTitle: { ko: "공식 절차", en: "Official process", si: "නිල ක්‍රියාවලිය" },
    description: {
      ko: "시험, 구직자 명부, 근로계약, 사전교육, 사증과 입국 진행상황은 공식 기관이 처리합니다. 플랫폼은 공식 상태와 필요한 서류를 한 화면에서 안내·추적합니다.",
      en: "Official authorities manage testing, roster placement, the employment contract, pre-departure training, visa and entry progress. The platform explains and tracks the official status.",
      si: "පරීක්ෂණ, රැකියා ලැයිස්තුව, සේවා ගිවිසුම, පිටත්වීමට පෙර පුහුණුව, වීසා සහ ඇතුළුවීමේ තත්ත්වය නිල ආයතන විසින් පාලනය කරයි. වේදිකාව ඒවා පැහැදිලි කර අනුගමනය කරයි.",
    },
    location: { ko: "정부·송출기관", en: "Official channel", si: "නිල මාර්ගය" },
    color: "blue",
  },
  {
    id: "preDeparture",
    order: 3,
    title: {
      ko: "비자 발급 후 출국 준비",
      en: "After visa, before departure",
      si: "වීසා ලැබුණු පසු පිටත්වීමට පෙර",
    },
    shortTitle: { ko: "출국 준비", en: "Pre-departure", si: "පිටත්වීම" },
    description: {
      ko: "비자와 항공편이 확인되면 한국 도착 즉시 필요한 통신, 이동, 숙소, 계좌·송금 준비를 미리 신청합니다.",
      en: "Once the visa and flight are confirmed, pre-arrange connectivity, transport, accommodation, banking and remittance setup.",
      si: "වීසා සහ ගුවන් ගමන තහවුරු වූ පසු සන්නිවේදන, ගමනාගමන, නවාතැන්, බැංකු හා මුදල් යැවීමේ සේවා පෙර සූදානම් කරන්න.",
    },
    location: { ko: "스리랑카·온라인", en: "Sri Lanka / online", si: "ශ්‍රී ලංකාව / මාර්ගගත" },
    color: "violet",
  },
  {
    id: "arrival",
    order: 4,
    title: {
      ko: "한국 도착",
      en: "Arrival in Korea",
      si: "කොරියාවට පැමිණීම",
    },
    shortTitle: { ko: "도착", en: "Arrival", si: "පැමිණීම" },
    description: {
      ko: "공항에서 통신을 활성화하고 이동·인계·취업교육·숙소 체크인을 확인합니다.",
      en: "Activate connectivity and confirm airport handover, transport, employment training and accommodation check-in.",
      si: "ගුවන් තොටුපළේදී සන්නිවේදනය සක්‍රිය කර භාරදීම, ගමනාගමනය, රැකියා පුහුණුව සහ නවාතැන් ඇතුළුවීම තහවුරු කරන්න.",
    },
    location: { ko: "대한민국 공항·교육기관", en: "Korean airport / training center", si: "කොරියානු ගුවන් තොටුපළ / පුහුණු මධ්‍යස්ථානය" },
    color: "rose",
  },
  {
    id: "settlement",
    order: 5,
    title: {
      ko: "초기 정착 90일",
      en: "First 90 days",
      si: "පළමු දින 90",
    },
    shortTitle: { ko: "초기 정착", en: "Settle", si: "පදිංචි වීම" },
    description: {
      ko: "외국인등록, 장기 통신요금제, 급여계좌, 보험, 주소, 교통과 병원이용 기반을 완성합니다.",
      en: "Complete foreigner registration, resident mobile service, payroll banking, insurance, address, transport and healthcare setup.",
      si: "විදේශික ලියාපදිංචිය, දිගුකාලීන දුරකථන සේවාව, වැටුප් ගිණුම, රක්ෂණය, ලිපිනය, ගමනාගමනය හා සෞඛ්‍ය සේවා සම්පූර්ණ කරන්න.",
    },
    location: { ko: "사업장·숙소 지역", en: "Workplace / accommodation area", si: "සේවා ස්ථානය / නවාතැන් ප්‍රදේශය" },
    color: "amber",
  },
  {
    id: "living",
    order: 6,
    title: {
      ko: "한국 생활·근로",
      en: "Work and life in Korea",
      si: "කොරියාවේ වැඩ සහ ජීවිතය",
    },
    shortTitle: { ko: "생활·근로", en: "Work & life", si: "වැඩ හා ජීවිතය" },
    description: {
      ko: "급여, 본국 송금, 병원, 숙소, 노동권, 세금, 보험과 일상 민원을 지속 관리합니다.",
      en: "Manage wages, remittance, healthcare, housing, labor rights, tax, insurance and everyday requests.",
      si: "වැටුප්, මව්රටට මුදල් යැවීම, සෞඛ්‍ය, නවාතැන්, කම්කරු අයිතිවාසිකම්, බදු, රක්ෂණය සහ දෛනික අවශ්‍යතා කළමනාකරණය කරන්න.",
    },
    location: { ko: "대한민국", en: "Korea", si: "කොරියාව" },
    color: "cyan",
  },
  {
    id: "renewal",
    order: 7,
    title: {
      ko: "체류 연장·변경",
      en: "Extension and changes",
      si: "කාලය දිගු කිරීම හා වෙනස්කම්",
    },
    shortTitle: { ko: "연장·변경", en: "Renew", si: "දිගු කිරීම" },
    description: {
      ko: "체류기간, 여권, 근로계약, 주소와 사업장 변경 가능성을 미리 진단하고 필요한 신청을 준비합니다.",
      en: "Prepare early for stay extension, passport and contract expiry, address changes and eligible workplace changes.",
      si: "රැඳී සිටීම දිගු කිරීම, ගමන් බලපත්‍රය හා ගිවිසුම් කල් ඉකුත්වීම, ලිපින හා සේවා ස්ථාන වෙනස්කම් සඳහා කලින් සූදානම් වන්න.",
    },
    location: { ko: "온라인·출입국 관서", en: "Online / immigration office", si: "මාර්ගගත / ආගමන කාර්යාලය" },
    color: "indigo",
  },
  {
    id: "return",
    order: 8,
    title: {
      ko: "귀국·재정착",
      en: "Return and reintegration",
      si: "ආපසු යාම හා නැවත පදිංචි වීම",
    },
    shortTitle: { ko: "귀국", en: "Return", si: "ආපසු යාම" },
    description: {
      ko: "보험금·퇴직금·최종급여, 계좌·통신·숙소 종료, 최종송금, 출국서류와 본국 재정착을 준비합니다.",
      en: "Prepare insurance claims, severance and final wages, service closures, final remittance, departure records and reintegration.",
      si: "රක්ෂණ මුදල්, සේවා අවසන් දීමනා හා අවසන් වැටුප, ගිණුම් හා සේවා වසා දැමීම, අවසන් මුදල් යැවීම සහ නැවත පදිංචිය සූදානම් කරන්න.",
    },
    location: { ko: "대한민국 → 스리랑카", en: "Korea to Sri Lanka", si: "කොරියාවෙන් ශ්‍රී ලංකාවට" },
    color: "slate",
  },
]

const document = (ko: string, en: string, si: string): LocalizedText => ({ ko, en, si })

export const journeySteps: JourneyStep[] = [
  {
    id: "sl-official-registration",
    phaseId: "prepare",
    title: { ko: "공식 모집·송출기관 등록", en: "Official recruitment registration", si: "නිල බඳවාගැනීම් ලියාපදිංචිය" },
    description: { ko: "스리랑카의 공식 정부·송출 경로에서 본인 등록과 모집 공고를 확인합니다.", en: "Confirm registration and recruitment through the official Sri Lankan channel.", si: "ශ්‍රී ලංකාවේ නිල රජයේ හා යැවීමේ මාර්ගයෙන් ලියාපදිංචිය තහවුරු කරන්න." },
    responsibility: ["government", "worker"],
    official: true,
    required: true,
    documents: [document("여권", "Passport", "ගමන් බලපත්‍රය"), document("개인 신원자료", "Identity records", "හැඳුනුම් තොරතුරු")],
    actions: ["guide", "track"],
  },
  {
    id: "eps-topik",
    phaseId: "prepare",
    title: { ko: "EPS-TOPIK 및 선발요건", en: "EPS-TOPIK and eligibility", si: "EPS-TOPIK සහ සුදුසුකම්" },
    description: { ko: "공식 시험 일정, 결과와 구직자 명부 진행상태를 확인합니다.", en: "Track the official test schedule, result and roster status.", si: "නිල පරීක්ෂණ දිනය, ප්‍රතිඵලය හා රැකියා ලැයිස්තු තත්ත්වය අනුගමනය කරන්න." },
    responsibility: ["government", "worker"],
    official: true,
    required: true,
    actions: ["guide", "track"],
    officialReference: { label: "EPS", url: "https://www.eps.go.kr/" },
  },
  {
    id: "health-skill",
    phaseId: "prepare",
    title: { ko: "건강·기능·경력자료", en: "Health, skill and career records", si: "සෞඛ්‍ය, කුසලතා සහ සේවා වාර්තා" },
    description: { ko: "비자·직종에 필요한 건강검진, 기능평가, 경력과 자격 증빙을 준비합니다.", en: "Prepare medical, skill, career and qualification evidence required for the visa and occupation.", si: "වීසා හා වෘත්තිය සඳහා අවශ්‍ය වෛද්‍ය, කුසලතා, සේවා අත්දැකීම් හා සුදුසුකම් ලේඛන සූදානම් කරන්න." },
    responsibility: ["government", "worker", "sejoong"],
    required: true,
    documents: [document("건강검진", "Medical examination", "වෛද්‍ය පරීක්ෂණය"), document("경력·자격증", "Career / qualification", "සේවා අත්දැකීම් / සුදුසුකම්")],
    actions: ["upload", "track"],
  },
  {
    id: "employment-contract",
    phaseId: "official",
    title: { ko: "표준근로계약 확인", en: "Review the standard employment contract", si: "සම්මත සේවා ගිවිසුම පරීක්ෂා කිරීම" },
    description: { ko: "임금, 근로시간, 업종, 근무지, 숙소비와 공제항목을 본인의 언어로 확인합니다.", en: "Review wage, hours, occupation, workplace, accommodation charges and deductions in your language.", si: "වැටුප, වැඩ පැය, වෘත්තිය, සේවා ස්ථානය, නවාතැන් ගාස්තු හා අඩුකිරීම් ඔබේ භාෂාවෙන් පරීක්ෂා කරන්න." },
    responsibility: ["government", "employer", "worker", "sejoong"],
    official: true,
    required: true,
    documents: [document("표준근로계약서", "Standard employment contract", "සම්මත සේවා ගිවිසුම")],
    actions: ["upload", "guide", "contact"],
  },
  {
    id: "pre-departure-training",
    phaseId: "official",
    title: { ko: "사전취업교육 이수", en: "Complete pre-departure training", si: "පිටත්වීමට පෙර පුහුණුව සම්පූර්ණ කිරීම" },
    description: { ko: "공식 교육기관이 실시하는 한국 생활·근로·안전 교육을 이수하고 수료상태를 기록합니다.", en: "Complete the official training on Korean life, work and safety and record completion.", si: "කොරියානු ජීවිතය, වැඩ සහ ආරක්ෂාව පිළිබඳ නිල පුහුණුව සම්පූර්ණ කර තත්ත්වය සටහන් කරන්න." },
    responsibility: ["government", "worker"],
    official: true,
    required: true,
    actions: ["track", "upload"],
  },
  {
    id: "visa-entry-status",
    phaseId: "official",
    title: { ko: "비자·입국 진행상황", en: "Visa and entry progress", si: "වීසා සහ ඇතුළුවීමේ ප්‍රගතිය" },
    description: { ko: "공식 기관이 처리하는 사증과 입국 진행상황을 확인하고, 플랫폼에는 결과와 다음 준비사항만 연결합니다.", en: "Check the visa and entry progress managed by official authorities; the platform links the result to the next preparation tasks.", si: "නිල ආයතන පාලනය කරන වීසා හා ඇතුළුවීමේ තත්ත්වය පරීක්ෂා කර ඊළඟ කාර්යයන් සමඟ සම්බන්ධ කරන්න." },
    responsibility: ["government", "worker", "sejoong"],
    official: true,
    required: true,
    documents: [document("비자", "Visa", "වීසා"), document("입국 일정", "Entry schedule", "ඇතුළුවීමේ දිනය")],
    actions: ["track", "upload"],
    officialReference: { label: "EPS entry status", url: "https://www.eps.go.kr/" },
  },
  {
    id: "digital-profile",
    phaseId: "preDeparture",
    title: { ko: "세중 디지털 프로필", en: "Sejoong digital profile", si: "Sejoong ඩිජිටල් පැතිකඩ" },
    description: { ko: "여권·비자·항공·고용·숙소·비상연락처를 한 번 입력해 이후 서비스 신청에 재사용합니다.", en: "Enter passport, visa, flight, employment, accommodation and emergency contact data once for reuse across services.", si: "ගමන් බලපත්‍ර, වීසා, ගුවන් ගමන්, රැකියා, නවාතැන් සහ හදිසි සම්බන්ධතා දත්ත එක් වරක් ඇතුළත් කර සේවාවල නැවත භාවිත කරන්න." },
    responsibility: ["worker", "sejoong"],
    required: true,
    actions: ["upload", "track"],
    serviceCategory: "identity",
  },
  {
    id: "device-check",
    phaseId: "preDeparture",
    title: { ko: "휴대폰·eSIM 호환 확인", en: "Phone and eSIM compatibility", si: "දුරකථන සහ eSIM ගැළපීම" },
    description: { ko: "단말 모델, eSIM 지원, IMEI와 잠금상태를 확인해 eSIM 또는 물리 SIM 방식을 추천합니다.", en: "Check device model, eSIM support, IMEI and carrier lock to recommend eSIM or physical SIM.", si: "දුරකථන මාදිලිය, eSIM සහාය, IMEI සහ ජාල අගුල පරීක්ෂා කර eSIM හෝ භෞතික SIM නිර්දේශ කරන්න." },
    responsibility: ["worker", "sejoong", "partner"],
    actions: ["apply", "guide"],
    serviceCategory: "telecom",
  },
  {
    id: "sim-preorder",
    phaseId: "preDeparture",
    title: { ko: "eSIM·선불 SIM 사전신청", en: "Pre-order eSIM or prepaid SIM", si: "eSIM හෝ පෙරගෙවුම් SIM පෙර ඇණවුම" },
    description: { ko: "여권, 입국일, 공항, 단말정보를 활용해 온라인 eSIM, 공항 수령 또는 숙소 배송을 선택합니다.", en: "Use passport, arrival date, airport and device data to choose online eSIM, airport pickup or accommodation delivery.", si: "ගමන් බලපත්‍රය, පැමිණීමේ දිනය, ගුවන් තොටුපළ හා දුරකථන දත්ත භාවිත කර මාර්ගගත eSIM, ගුවන් තොටුපළ ලබාගැනීම හෝ නවාතැන් බෙදාහැරීම තෝරන්න." },
    responsibility: ["worker", "sejoong", "partner"],
    actions: ["apply", "track"],
    serviceCategory: "telecom",
  },
  {
    id: "arrival-handover",
    phaseId: "preDeparture",
    title: { ko: "공항 인계·이동 계획", en: "Airport handover and transport", si: "ගුවන් තොටුපළ භාරදීම හා ගමනාගමනය" },
    description: { ko: "항공편, 도착 터미널, 집결장소, 담당자, 교육기관과 숙소 이동을 한 화면에서 확인합니다.", en: "Confirm flight, terminal, meeting point, coordinator, training-center and accommodation transport.", si: "ගුවන් ගමන, ටර්මිනලය, හමුවන ස්ථානය, සම්බන්ධීකාරක, පුහුණු මධ්‍යස්ථානය සහ නවාතැන් ගමනාගමනය තහවුරු කරන්න." },
    responsibility: ["government", "employer", "sejoong", "worker"],
    actions: ["track", "contact"],
    serviceCategory: "mobility",
  },
  {
    id: "arrival-connectivity",
    phaseId: "arrival",
    title: { ko: "도착 즉시 통신 활성화", en: "Activate connectivity on arrival", si: "පැමිණීමේදී සන්නිවේදනය සක්‍රිය කිරීම" },
    description: { ko: "eSIM QR 설치, 공항 카운터 수령 또는 사전 배송된 SIM 활성화를 완료합니다.", en: "Install the eSIM QR, collect at an airport counter, or activate a pre-delivered physical SIM.", si: "eSIM QR ස්ථාපනය, ගුවන් තොටුපළ කවුන්ටරයෙන් ලබාගැනීම හෝ පෙර බෙදාහැරූ SIM සක්‍රිය කරන්න." },
    responsibility: ["worker", "partner", "sejoong"],
    actions: ["track", "contact"],
    serviceCategory: "telecom",
  },
  {
    id: "employment-training-korea",
    phaseId: "arrival",
    title: { ko: "입국 후 취업교육·사업장 배치", en: "Post-arrival training and placement", si: "පැමිණීමෙන් පසු පුහුණුව හා සේවා ස්ථාන පත්කිරීම" },
    description: { ko: "정부·공단의 취업교육과 사업장 인계 상태를 확인합니다.", en: "Track the official employment training and handover to the workplace.", si: "නිල රැකියා පුහුණුව සහ සේවා ස්ථානයට භාරදීම අනුගමනය කරන්න." },
    responsibility: ["government", "employer", "worker"],
    official: true,
    required: true,
    actions: ["track", "guide"],
    officialReference: { label: "HRDK EPS", url: "https://eps.hrdkorea.or.kr/" },
  },
  {
    id: "accommodation-checkin",
    phaseId: "arrival",
    title: { ko: "숙소 체크인·생활기반", en: "Accommodation check-in", si: "නවාතැන් ඇතුළුවීම" },
    description: { ko: "숙소 주소, 방 배정, 비용, 생활규칙, 시설상태와 긴급연락처를 확인합니다.", en: "Confirm address, room assignment, charges, house rules, condition and emergency contact.", si: "ලිපිනය, කාමරය, ගාස්තු, නීති, පහසුකම් තත්ත්වය හා හදිසි සම්බන්ධතා තහවුරු කරන්න." },
    responsibility: ["employer", "worker", "sejoong"],
    actions: ["track", "contact"],
    serviceCategory: "housing",
  },
  {
    id: "foreigner-registration",
    phaseId: "settlement",
    title: { ko: "외국인등록 준비·예약", en: "Foreigner registration preparation", si: "විදේශික ලියාපදිංචි සූදානම" },
    description: { ko: "관할기관, 예약, 여권, 사진, 체류지와 고용 관련 서류를 점검하고 진행상태를 관리합니다.", en: "Check the office, reservation, passport, photo, address and employment evidence and track progress.", si: "අදාළ කාර්යාලය, වෙන්කිරීම, ගමන් බලපත්‍රය, ඡායාරූපය, ලිපිනය හා රැකියා ලේඛන පරීක්ෂා කර ප්‍රගතිය අනුගමනය කරන්න." },
    responsibility: ["government", "worker", "sejoong", "employer"],
    official: true,
    required: true,
    documents: [document("여권·비자", "Passport / visa", "ගමන් බලපත්‍රය / වීසා"), document("체류지 입증", "Proof of accommodation", "නවාතැන් සාක්ෂි")],
    actions: ["apply", "book", "track"],
    serviceCategory: "immigration",
  },
  {
    id: "resident-mobile",
    phaseId: "settlement",
    title: { ko: "장기 통신요금제 전환", en: "Convert to a resident mobile plan", si: "දිගුකාලීන ජංගම සැලැස්මකට මාරුවීම" },
    description: { ko: "외국인등록 후 본인명의 장기 요금제, 자동이체, 번호유지와 단말 호환을 확인합니다.", en: "After registration, set up a resident plan, auto-pay, number retention and device compatibility.", si: "ලියාපදිංචියෙන් පසු දිගුකාලීන සැලැස්ම, ස්වයං ගෙවීම්, අංකය රඳවාගැනීම හා උපාංග ගැළපීම සකසන්න." },
    responsibility: ["worker", "partner", "sejoong"],
    actions: ["apply", "track"],
    serviceCategory: "telecom",
  },
  {
    id: "payroll-bank",
    phaseId: "settlement",
    title: { ko: "급여계좌 개설", en: "Open a payroll bank account", si: "වැටුප් බැංකු ගිණුම විවෘත කිරීම" },
    description: { ko: "여권·외국인등록·근로계약과 전화번호를 준비하고 은행 예약·계좌상태를 관리합니다.", en: "Prepare passport, registration, contract and phone number and track the bank appointment and account status.", si: "ගමන් බලපත්‍රය, ලියාපදිංචිය, සේවා ගිවිසුම හා දුරකථන අංකය සූදානම් කර බැංකු වෙන්කිරීම හා ගිණුම් තත්ත්වය අනුගමනය කරන්න." },
    responsibility: ["worker", "employer", "partner", "sejoong"],
    actions: ["book", "track"],
    serviceCategory: "finance",
  },
  {
    id: "eps-insurance",
    phaseId: "settlement",
    title: { ko: "고용허가제 보험·사회보험 확인", en: "EPS and social insurance check", si: "EPS හා සමාජ රක්ෂණ පරීක්ෂාව" },
    description: { ko: "귀국비용·상해·출국만기·보증보험과 적용 가능한 사회보험 가입상태를 확인합니다.", en: "Check return-cost, accident, departure-guarantee, wage-guarantee and applicable social insurance status.", si: "ආපසු යාමේ වියදම්, අනතුරු, පිටත්වීමේ, වැටුප් සහ සමාජ රක්ෂණ තත්ත්වය පරීක්ෂා කරන්න." },
    responsibility: ["government", "employer", "worker", "sejoong"],
    official: true,
    actions: ["track", "guide"],
    serviceCategory: "insurance",
    officialReference: { label: "EPS insurance", url: "https://eps.hrdkorea.or.kr/e9/user/intro/intro.do?method=epsInsurances" },
  },
  {
    id: "remittance-profile",
    phaseId: "settlement",
    title: { ko: "스리랑카 송금 프로필", en: "Sri Lanka remittance profile", si: "ශ්‍රී ලංකා මුදල් යැවීමේ පැතිකඩ" },
    description: { ko: "인가된 은행·소액해외송금업자 이용을 위해 본인확인, 수취인, 계좌와 송금목적을 등록합니다.", en: "Register identity, beneficiary, account and purpose for use with a bank or registered remittance provider.", si: "බැංකුවක් හෝ ලියාපදිංචි මුදල් යැවීමේ සේවාවක් සඳහා හැඳුනුම්, ලාභියා, ගිණුම හා අරමුණ ලියාපදිංචි කරන්න." },
    responsibility: ["worker", "partner", "sejoong"],
    actions: ["apply", "track"],
    serviceCategory: "remittance",
  },
  {
    id: "monthly-remittance",
    phaseId: "living",
    title: { ko: "월급 본국 송금", en: "Send salary home", si: "වැටුප මව්රටට යැවීම" },
    description: { ko: "인가 사업자의 환율, 수수료, 예상 수취액과 도착시간을 비교하고 선택한 사업자에서 송금합니다.", en: "Compare licensed providers by rate, fee, expected LKR received and delivery time, then complete the transfer with the selected provider.", si: "බලපත්‍රලාභී සේවා සපයන්නන්ගේ විනිමය අනුපාත, ගාස්තු, ලැබෙන LKR හා කාලය සසඳා තෝරාගත් සේවාවෙන් යවන්න." },
    responsibility: ["worker", "partner", "sejoong"],
    actions: ["apply", "track"],
    serviceCategory: "remittance",
  },
  {
    id: "wage-contract",
    phaseId: "living",
    title: { ko: "급여명세·계약·근로시간", en: "Payslip, contract and hours", si: "වැටුප් පත්‍රය, ගිවිසුම හා වැඩ පැය" },
    description: { ko: "급여명세서를 보관하고 계약조건, 공제, 연장근로와 실제 입금액을 확인합니다.", en: "Store payslips and check contract terms, deductions, overtime and the actual deposit.", si: "වැටුප් පත්‍ර තබා ගිවිසුම් කොන්දේසි, අඩුකිරීම්, අතිකාල හා සැබෑ තැන්පතුව පරීක්ෂා කරන්න." },
    responsibility: ["worker", "employer", "sejoong"],
    actions: ["upload", "guide", "contact"],
    serviceCategory: "work",
  },
  {
    id: "healthcare",
    phaseId: "living",
    title: { ko: "병원·약국·건강관리", en: "Healthcare and pharmacy", si: "රෝහල්, ඖෂධ හා සෞඛ්‍ය සේවා" },
    description: { ko: "증상별 진료과, 가까운 의료기관, 예약, 보험 적용과 필요한 문장을 안내합니다.", en: "Find the right department and nearby provider, arrange appointments and explain insurance and useful phrases.", si: "අදාළ වෛද්‍ය අංශය, ආසන්න ආයතනය, වෙන්කිරීම, රක්ෂණය හා අවශ්‍ය වාක්‍ය ලබාගන්න." },
    responsibility: ["worker", "sejoong", "partner"],
    actions: ["guide", "book", "contact"],
    serviceCategory: "health",
  },
  {
    id: "ai-interpreter",
    phaseId: "living",
    title: { ko: "AI 한국어·영어·싱할라어·타밀어 통역", en: "AI Korean-English-Sinhala-Tamil interpreter", si: "AI කොරියානු-ඉංග්‍රීසි-සිංහල පරිවර්තකය" },
    description: { ko: "텍스트와 음성을 한국어·영어·싱할라어·타밀어로 실시간 변환하고 병원·은행·사업장 상황별 문장을 제공합니다.", en: "Translate text and speech among Korean, English, Sinhala and Tamil and provide context-specific phrases for hospitals, banks and workplaces.", si: "කොරියානු, ඉංග්‍රීසි, සිංහල සහ දෙමළ අතර පෙළ හා හඬ පරිවර්තනය කර රෝහල්, බැංකු හා සේවා ස්ථාන සඳහා වාක්‍ය ලබාදෙයි." },
    responsibility: ["worker", "sejoong"],
    actions: ["apply"],
    serviceCategory: "translation",
  },
  {
    id: "address-change",
    phaseId: "renewal",
    title: { ko: "체류지 변경신고", en: "Report a change of address", si: "ලිපිනය වෙනස් කිරීමේ දැනුම්දීම" },
    description: { ko: "이사일, 새 주소와 체류지 입증자료를 확인하고 신고기한을 안내·추적합니다.", en: "Check the move date, new address and proof and track the reporting deadline.", si: "මාරු වූ දිනය, නව ලිපිනය හා සාක්ෂි පරීක්ෂා කර දැනුම්දීමේ කාලසීමාව අනුගමනය කරන්න." },
    responsibility: ["government", "worker", "sejoong", "employer"],
    official: true,
    actions: ["apply", "track"],
    serviceCategory: "immigration",
    officialReference: { label: "Government24 address report", url: "https://www.gov.kr/mw/AA020InfoCappView.do?CappBizCD=12700000026" },
  },
  {
    id: "stay-extension",
    phaseId: "renewal",
    title: { ko: "체류기간 연장 준비", en: "Prepare a stay extension", si: "රැඳී සිටීම දිගු කිරීමට සූදානම" },
    description: { ko: "만료 120일 전부터 자격, 여권, 계약, 고용주와 체류지 자료를 점검하고 세중 검토를 요청합니다.", en: "From 120 days before expiry, check eligibility, passport, contract, employer and address records and request Sejoong review.", si: "කල් ඉකුත්වීමට දින 120කට පෙර සුදුසුකම්, ගමන් බලපත්‍රය, ගිවිසුම, සේවායෝජකයා හා ලිපින ලේඛන පරීක්ෂා කර Sejoong සමාලෝචනය ඉල්ලන්න." },
    responsibility: ["government", "worker", "employer", "sejoong"],
    actions: ["apply", "upload", "track", "contact"],
    serviceCategory: "immigration",
  },
  {
    id: "workplace-change",
    phaseId: "renewal",
    title: { ko: "사업장 변경 가능성 검토", en: "Workplace change assessment", si: "සේවා ස්ථානය වෙනස් කිරීමේ ඇගයීම" },
    description: { ko: "정부제도상 허용사유와 기한을 확인하고 임의 이탈 없이 세중을 통해 절차를 검토합니다.", en: "Check permitted grounds and deadlines and review the process with Sejoong before leaving the workplace.", si: "අවසර ලැබෙන හේතු හා කාලසීමා පරීක්ෂා කර සේවා ස්ථානයෙන් ඉවත් වීමට පෙර Sejoong සමඟ ක්‍රියාවලිය සමාලෝචනය කරන්න." },
    responsibility: ["government", "worker", "employer", "sejoong"],
    actions: ["contact", "track"],
    serviceCategory: "immigration",
  },
  {
    id: "return-plan",
    phaseId: "return",
    title: { ko: "귀국 180일 전 진단", en: "Return readiness at D-180", si: "ආපසු යාමට දින 180කට පෙර සූදානම" },
    description: { ko: "귀국일, 계약종료, 최종급여, 보험금, 퇴직금, 항공, 계좌·통신·숙소 종료 일정을 만듭니다.", en: "Build a schedule for return, contract end, final wage, insurance, severance, flight and closure of bank, mobile and accommodation services.", si: "ආපසු යාම, ගිවිසුම් අවසානය, අවසන් වැටුප, රක්ෂණය, සේවා අවසන් දීමනා, ගුවන් ගමන සහ සේවා වසා දැමීමේ සැලැස්මක් සාදන්න." },
    responsibility: ["worker", "employer", "government", "sejoong"],
    actions: ["apply", "track"],
    serviceCategory: "return",
  },
  {
    id: "insurance-claims",
    phaseId: "return",
    title: { ko: "보험금·퇴직금·미지급금 확인", en: "Insurance, severance and unpaid balance", si: "රක්ෂණ, සේවා අවසන් දීමනා හා නොගෙවූ මුදල්" },
    description: { ko: "출국만기보험, 귀국비용보험, 퇴직금 차액, 최종급여와 환급 가능 항목을 확인합니다.", en: "Check departure insurance, return-cost insurance, severance difference, final salary and possible refunds.", si: "පිටත්වීමේ හා ආපසු යාමේ රක්ෂණ, සේවා අවසන් දීමනා වෙනස, අවසන් වැටුප හා ආපසු ලැබිය හැකි මුදල් පරීක්ෂා කරන්න." },
    responsibility: ["government", "employer", "worker", "sejoong"],
    actions: ["track", "contact"],
    serviceCategory: "return",
  },
  {
    id: "service-closure",
    phaseId: "return",
    title: { ko: "계좌·통신·숙소·자동결제 종료", en: "Close accounts and recurring services", si: "ගිණුම් හා අඛණ්ඩ සේවා වසා දැමීම" },
    description: { ko: "은행잔액, 자동이체, 휴대폰, 인터넷, 숙소보증금과 공과금을 정리합니다.", en: "Settle bank balance, auto-pay, mobile, internet, accommodation deposit and utilities.", si: "බැංකු ශේෂය, ස්වයං ගෙවීම්, දුරකථන, අන්තර්ජාල, නවාතැන් තැන්පතු හා බිල්පත් අවසන් කරන්න." },
    responsibility: ["worker", "sejoong", "partner", "employer"],
    actions: ["track", "contact"],
    serviceCategory: "return",
  },
  {
    id: "final-remittance",
    phaseId: "return",
    title: { ko: "최종 송금·수취 확인", en: "Final remittance and receipt confirmation", si: "අවසන් මුදල් යැවීම හා ලැබීම තහවුරු කිරීම" },
    description: { ko: "최종급여·보험금·퇴직금을 인가 사업자를 통해 송금하고 스리랑카 수취를 확인합니다.", en: "Send final salary, insurance and severance through a licensed provider and confirm receipt in Sri Lanka.", si: "අවසන් වැටුප, රක්ෂණ හා සේවා අවසන් දීමනා බලපත්‍රලාභී සේවාවෙන් යවා ශ්‍රී ලංකාවේ ලැබීම තහවුරු කරන්න." },
    responsibility: ["worker", "partner", "sejoong"],
    actions: ["apply", "track"],
    serviceCategory: "remittance",
  },
  {
    id: "departure-records",
    phaseId: "return",
    title: { ko: "출국서류·귀국지원", en: "Departure records and return support", si: "පිටත්වීමේ ලේඛන හා ආපසු යාමේ සහාය" },
    description: { ko: "출국에 필요한 등록증·증명·항공·보험 절차와 본국 재정착 교육·취업정보를 연결합니다.", en: "Connect required departure records, flight and insurance procedures with reintegration training and employment information.", si: "පිටත්වීමේ ලේඛන, ගුවන් ගමන් හා රක්ෂණ ක්‍රියාමාර්ග නැවත පදිංචි පුහුණුව හා රැකියා තොරතුරු සමඟ සම්බන්ධ කරන්න." },
    responsibility: ["government", "worker", "sejoong"],
    actions: ["guide", "track"],
    serviceCategory: "return",
    officialReference: { label: "HRDK return support", url: "https://eps.hrdkorea.or.kr/e9/user/intro/intro.do?method=supportReturnee" },
  },
]

export const oneStopServices: OneStopService[] = [
  {
    id: "digital-wallet",
    category: "identity",
    title: { ko: "내 디지털 서류함", en: "My digital document wallet", si: "මගේ ඩිජිටල් ලේඛන ගබඩාව" },
    description: { ko: "여권·비자·계약·등록·보험·급여·송금영수증을 한 번 저장하고 필요한 서비스에 동의 후 재사용합니다.", en: "Store passport, visa, contract, registration, insurance, payslip and remittance receipts once and reuse with consent.", si: "ගමන් බලපත්‍ර, වීසා, ගිවිසුම්, ලියාපදිංචි, රක්ෂණ, වැටුප් හා මුදල් යැවීමේ රිසිට් එක් වරක් තබා අනුමැතියෙන් නැවත භාවිත කරන්න." },
    availableFrom: "prepare",
    ownership: ["worker", "sejoong"],
    deliveryModes: ["digital"],
    requiredData: [document("본인확인", "Identity verification", "හැඳුනුම් තහවුරු කිරීම")],
    result: { ko: "개인별 암호화 문서·만료일·공유동의 기록", en: "Encrypted personal records, expiry dates and consent history", si: "ගුප්තකේතනය කළ ලේඛන, කල් ඉකුත්වීම් හා අනුමැති ඉතිහාසය" },
    integrationStatus: "ready_ui",
  },
  {
    id: "connectivity",
    category: "telecom",
    title: { ko: "한국 통신 원스톱", en: "Korea connectivity one-stop", si: "කොරියා සන්නිවේදන එක්-තැනක සේවාව" },
    description: { ko: "단말 호환 확인, eSIM·SIM 선택, 온라인 설치, 공항수령, 숙소배송, 장기요금제 전환과 해지를 관리합니다.", en: "Manage device compatibility, eSIM/SIM selection, online installation, airport pickup, accommodation delivery, resident-plan conversion and closure.", si: "උපාංග ගැළපීම, eSIM/SIM තේරීම, මාර්ගගත ස්ථාපනය, ගුවන් තොටුපළ ලබාගැනීම, නවාතැන් බෙදාහැරීම, දිගුකාලීන සැලැස්ම සහ වසා දැමීම කළමනාකරණය කරන්න." },
    availableFrom: "preDeparture",
    ownership: ["worker", "sejoong", "partner"],
    deliveryModes: ["digital", "airport", "accommodation", "branch"],
    requiredData: [document("여권", "Passport", "ගමන් බලපත්‍රය"), document("입국일·공항", "Arrival date / airport", "පැමිණීමේ දිනය / ගුවන් තොටුපළ"), document("단말·IMEI", "Device / IMEI", "උපාංගය / IMEI")],
    result: { ko: "활성화 QR 또는 수령·배송 상태와 한국 전화번호", en: "Activation QR or pickup/delivery status and Korean number", si: "සක්‍රිය QR හෝ ලබාගැනීම/බෙදාහැරීමේ තත්ත්වය සහ කොරියානු අංකය" },
    integrationStatus: "partner_api",
    legalBoundary: { ko: "세중은 신청·상태를 통합하고 실제 통신가입은 통신사·공식 판매점이 본인확인 후 수행합니다.", en: "Sejoong orchestrates the application; the carrier or official retailer performs identity verification and activation.", si: "Sejoong අයදුම්පත සංවිධානය කරයි; අනන්‍යතාව තහවුරු කිරීම හා සක්‍රිය කිරීම දුරකථන සමාගම හෝ නිල වෙළෙන්දා කරයි." },
  },
  {
    id: "banking",
    category: "finance",
    title: { ko: "급여계좌·자동이체", en: "Payroll account and auto-pay", si: "වැටුප් ගිණුම හා ස්වයං ගෙවීම්" },
    description: { ko: "필요서류, 은행·지점, 예약, 급여계좌 등록, 체크카드와 자동이체를 순서대로 안내합니다.", en: "Guide required documents, bank/branch selection, appointment, payroll registration, debit card and auto-pay.", si: "අවශ්‍ය ලේඛන, බැංකුව/ශාඛාව, වෙන්කිරීම, වැටුප් ලියාපදිංචිය, ඩෙබිට් කාඩ් හා ස්වයං ගෙවීම් මඟ පෙන්වයි." },
    availableFrom: "settlement",
    ownership: ["worker", "sejoong", "partner", "employer"],
    deliveryModes: ["digital", "branch"],
    requiredData: [document("여권·외국인등록", "Passport / registration", "ගමන් බලපත්‍රය / ලියාපදිංචිය"), document("근로계약·전화번호", "Contract / phone number", "ගිවිසුම / දුරකථන අංකය")],
    result: { ko: "예약·계좌·급여등록 상태", en: "Appointment, account and payroll-registration status", si: "වෙන්කිරීම, ගිණුම හා වැටුප් ලියාපදිංචි තත්ත්වය" },
    integrationStatus: "manual_review",
  },
  {
    id: "remittance",
    category: "remittance",
    title: { ko: "스리랑카 급여송금", en: "Salary remittance to Sri Lanka", si: "ශ්‍රී ලංකාවට වැටුප් මුදල් යැවීම" },
    description: { ko: "인가된 은행·송금사업자의 환율, 수수료, LKR 예상수취액과 소요시간을 비교하고 송금상태·영수증을 보관합니다.", en: "Compare licensed banks/remitters by rate, fee, expected LKR and delivery time, then retain status and receipts.", si: "බලපත්‍රලාභී බැංකු/මුදල් යැවීමේ සේවාවන්ගේ අනුපාත, ගාස්තු, ලැබෙන LKR හා කාලය සසඳා තත්ත්වය හා රිසිට් තබාගන්න." },
    availableFrom: "settlement",
    ownership: ["worker", "sejoong", "partner"],
    deliveryModes: ["digital", "branch"],
    requiredData: [document("본인확인·급여계좌", "Identity / payroll account", "හැඳුනුම් / වැටුප් ගිණුම"), document("수취인·계좌", "Beneficiary / account", "ලාභියා / ගිණුම"), document("송금목적", "Purpose", "අරමුණ")],
    result: { ko: "선택한 인가사업자의 송금번호·수취확인·영수증", en: "Licensed provider transfer reference, receipt confirmation and record", si: "බලපත්‍රලාභී සේවාවේ යොමුව, ලැබීමේ තහවුරු කිරීම හා රිසිට්" },
    integrationStatus: "partner_api",
    legalBoundary: { ko: "세중은 비교·신청연결·상태관리를 제공하고 자금을 직접 보유·환전·송금하지 않습니다.", en: "Sejoong provides comparison, application routing and status tracking; it does not hold, exchange or transfer funds.", si: "Sejoong සසඳීම, අයදුම් සම්බන්ධ කිරීම හා තත්ත්ව අනුගමනය සපයයි; මුදල් තබාගැනීම, හුවමාරු කිරීම හෝ යැවීම නොකරයි." },
  },
  {
    id: "immigration-desk",
    category: "immigration",
    title: { ko: "체류·비자 행정 데스크", en: "Stay and visa administration desk", si: "රැඳී සිටීම හා වීසා පරිපාලන මධ්‍යස්ථානය" },
    description: { ko: "외국인등록, 주소변경, 체류연장, 사업장변경 검토와 출국 관련 업무를 일정·서류·사건으로 관리합니다.", en: "Manage registration, address change, stay extension, workplace-change assessment and departure matters as dated cases.", si: "ලියාපදිංචිය, ලිපින වෙනස, රැඳී සිටීම දිගු කිරීම, සේවා ස්ථාන වෙනස හා පිටත්වීමේ කටයුතු නඩු හා කාලසීමා ලෙස කළමනාකරණය කරන්න." },
    availableFrom: "preDeparture",
    ownership: ["worker", "sejoong", "government", "employer"],
    deliveryModes: ["digital", "video", "phone", "branch"],
    requiredData: [document("여권·비자·등록", "Passport / visa / registration", "ගමන් බලපත්‍ර / වීසා / ලියාපදිංචිය"), document("고용·체류지 자료", "Employment / address records", "රැකියා / ලිපින ලේඛන")],
    result: { ko: "적용 절차, 필요자료, 예약·신청·보완·결과 상태", en: "Applicable process, required records and booking/application/result status", si: "අදාළ ක්‍රියාවලිය, අවශ්‍ය ලේඛන හා වෙන්කිරීම්/අයදුම්/ප්‍රතිඵල තත්ත්වය" },
    integrationStatus: "manual_review",
  },
  {
    id: "ai-language",
    category: "translation",
    title: { ko: "AI 생활 통역·가이드", en: "AI life interpreter and guide", si: "AI ජීවිත පරිවර්තකය හා මාර්ගෝපදේශය" },
    description: { ko: "한국어·영어·싱할라어·타밀어 텍스트와 브라우저 음성을 변환하고 상황별 다음 행동을 안내합니다.", en: "Translate Korean, English, Sinhala and Tamil text or browser-captured speech and explain the next action for the situation.", si: "කොරියානු, ඉංග්‍රීසි හා සිංහල පෙළ හෝ බ්‍රවුසරයෙන් ලබාගත් හඬ පරිවර්තනය කර ඊළඟ ක්‍රියාව පැහැදිලි කරයි." },
    availableFrom: "prepare",
    ownership: ["worker", "sejoong"],
    deliveryModes: ["digital"],
    requiredData: [document("번역할 문장", "Text to translate", "පරිවර්තනය කළ යුතු පෙළ")],
    result: { ko: "번역문·발음·상황별 주의사항", en: "Translation, pronunciation and contextual caution", si: "පරිවර්තනය, උච්චාරණය හා අවස්ථා අනුව අවධානම්" },
    integrationStatus: "ready_ui",
    legalBoundary: { ko: "AI 결과는 공식 법률·의료 통역을 대체하지 않으며 중요한 결정은 세중 또는 담당기관 확인이 필요합니다.", en: "AI output does not replace certified legal or medical interpretation; important decisions require human confirmation.", si: "AI ප්‍රතිඵල නිල නීතිමය හෝ වෛද්‍ය පරිවර්තනයට ආදේශයක් නොවේ; වැදගත් තීරණ සඳහා මානව තහවුරු කිරීම අවශ්‍යය." },
  },
  {
    id: "return-home",
    category: "return",
    title: { ko: "귀국 원스톱", en: "Return-home one-stop", si: "ආපසු යාමේ එක්-තැනක සේවාව" },
    description: { ko: "D-180부터 보험금·퇴직금·최종급여, 최종송금, 계좌·통신·숙소 종료와 귀국 후 재정착을 관리합니다.", en: "From D-180, manage insurance, severance, final salary/remittance, service closures and reintegration.", si: "D-180 සිට රක්ෂණ, සේවා අවසන් දීමනා, අවසන් වැටුප/මුදල් යැවීම, සේවා වසා දැමීම හා නැවත පදිංචිය කළමනාකරණය කරන්න." },
    availableFrom: "return",
    ownership: ["worker", "sejoong", "government", "employer", "partner"],
    deliveryModes: ["digital", "phone", "video", "branch"],
    requiredData: [document("귀국예정일", "Expected return date", "අපේක්ෂිත ආපසු යාමේ දිනය"), document("계약·급여·보험", "Contract / wage / insurance", "ගිවිසුම් / වැටුප් / රක්ෂණ")],
    result: { ko: "개인별 귀국 체크리스트와 완료증빙", en: "Personal return checklist and completion evidence", si: "පුද්ගලික ආපසු යාමේ ලැයිස්තුව හා සම්පූර්ණ කළ සාක්ෂි" },
    integrationStatus: "ready_ui",
  },
]

export const emergencyContacts = [
  { id: "police", number: "112", title: { ko: "경찰", en: "Police", si: "පොලිසිය" } },
  { id: "fire", number: "119", title: { ko: "구급·소방", en: "Ambulance / fire", si: "ගිලන් රථ / ගිනි නිවීම" } },
  { id: "immigration", number: "1345", title: { ko: "출입국 종합안내", en: "Immigration contact center", si: "ආගමන තොරතුරු මධ්‍යස්ථානය" } },
  { id: "labor", number: "1350", title: { ko: "고용노동 상담", en: "Labor counseling", si: "කම්කරු උපදේශනය" } },
  { id: "eps", number: "1577-0071", title: { ko: "외국인력 상담", en: "Foreign workforce counseling", si: "විදේශ සේවක උපදේශනය" } },
]

export const statusLabels: Record<StepStatus, LocalizedText> = {
  not_started: { ko: "시작 전", en: "Not started", si: "ආරම්භ කර නැත" },
  ready: { ko: "준비 가능", en: "Ready", si: "සූදානම්" },
  in_progress: { ko: "진행 중", en: "In progress", si: "ක්‍රියාත්මකයි" },
  waiting: { ko: "기관·파트너 대기", en: "Waiting for authority/provider", si: "ආයතනය/සේවාව බලාපොරොත්තු වේ" },
  completed: { ko: "완료", en: "Completed", si: "සම්පූර්ණයි" },
  attention: { ko: "확인 필요", en: "Needs attention", si: "අවධානය අවශ්‍යයි" },
}

export function t(value: LocalizedText, language: StayCareLanguage) {
  if (language === "ta") return value.ta || translateStayCareTamil(value.en) || value.en
  return value[language] || value.en
}

export function getPhaseSteps(phaseId: JourneyPhaseId) {
  return journeySteps.filter((step) => step.phaseId === phaseId)
}

export function getServicesForPhase(phaseId: JourneyPhaseId) {
  const phaseOrder = journeyPhases.find((phase) => phase.id === phaseId)?.order ?? 1
  return oneStopServices.filter((service) => {
    const startOrder = journeyPhases.find((phase) => phase.id === service.availableFrom)?.order ?? 1
    return startOrder <= phaseOrder
  })
}
