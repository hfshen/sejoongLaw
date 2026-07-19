import type { LocalizedText, StayCareLanguage } from "@/lib/staycare/lifecycle-model"

export type IntegrationKind = "public_portal" | "telecom" | "bank" | "remittance" | "delivery" | "notification" | "ai"
export type IntegrationStatus = "research" | "partner_required" | "sandbox" | "connected" | "disabled"

export interface IntegrationDescriptor {
  id: string
  kind: IntegrationKind
  name: string
  status: IntegrationStatus
  description: LocalizedText
  capabilities: string[]
  requiredContract?: string
  officialUrl?: string
  notes?: LocalizedText
}

export const integrationDescriptors: IntegrationDescriptor[] = [
  {
    id: "eps-public",
    kind: "public_portal",
    name: "Employment Permit System",
    status: "research",
    description: {
      ko: "시험, 구직, 근로계약, 입국 진행과 사업장 이력을 확인하는 공식 고용허가제 채널입니다.",
      en: "Official Employment Permit System channel for tests, job roster, contracts, entry progress and employment history.",
      si: "පරීක්ෂණ, රැකියා ලැයිස්තුව, ගිවිසුම්, ඇතුළුවීමේ ප්‍රගතිය හා සේවා ඉතිහාසය සඳහා නිල EPS මාර්ගය.",
    },
    capabilities: ["official_deep_link", "status_reference", "user_guidance"],
    officialUrl: "https://www.eps.go.kr/",
    notes: {
      ko: "공식기관의 승인·처리를 플랫폼이 대체하지 않습니다. 향후 정식 API 또는 기관협약이 없으면 자동 수집하지 않습니다.",
      en: "The platform does not replace official approval or processing and does not scrape data without an authorized API or agreement.",
      si: "වේදිකාව නිල අනුමැතිය හෝ ක්‍රියාවලියට ආදේශයක් නොවන අතර අනුමත API හෝ ගිවිසුමක් නොමැතිව දත්ත ස්වයංක්‍රීයව ලබා නොගනී.",
    },
  },
  {
    id: "hrdk-eps",
    kind: "public_portal",
    name: "HRDK EPS Support",
    status: "research",
    description: {
      ko: "입국 후 취업교육, 보험, 체류지원과 귀국지원 정보를 제공하는 공공 채널입니다.",
      en: "Public channel for post-arrival employment training, EPS insurance, stay support and return support.",
      si: "පැමිණීමෙන් පසු රැකියා පුහුණුව, EPS රක්ෂණ, රැඳී සිටීම හා ආපසු යාමේ සහාය සඳහා රාජ්‍ය මාර්ගය.",
    },
    capabilities: ["official_deep_link", "education_reference", "insurance_reference", "return_reference"],
    officialUrl: "https://eps.hrdkorea.or.kr/",
  },
  {
    id: "hikorea-gov24",
    kind: "public_portal",
    name: "HiKorea / Government24",
    status: "research",
    description: {
      ko: "외국인등록, 체류지 변경, 각종 증명과 체류민원의 공식 안내·전자민원 채널입니다.",
      en: "Official information and e-government channels for foreigner registration, address reporting, certificates and stay matters.",
      si: "විදේශික ලියාපදිංචිය, ලිපින දැනුම්දීම, සහතික හා රැඳී සිටීමේ කටයුතු සඳහා නිල මාර්ගය.",
    },
    capabilities: ["official_deep_link", "appointment_reference", "document_checklist", "case_tracking_reference"],
    officialUrl: "https://www.hikorea.go.kr/",
  },
  {
    id: "telecom-provider",
    kind: "telecom",
    name: "Korean telecom provider adapter",
    status: "partner_required",
    description: {
      ko: "여권 기반 선불 SIM·eSIM, 공항수령, 숙소배송과 외국인등록 후 장기요금제 전환을 연결합니다.",
      en: "Connect passport-based prepaid SIM/eSIM, airport pickup, accommodation delivery and conversion to a resident plan after registration.",
      si: "ගමන් බලපත්‍ර පදනම් පෙරගෙවුම් SIM/eSIM, ගුවන් තොටුපළ ලබාගැනීම, නවාතැන් බෙදාහැරීම හා ලියාපදිංචියෙන් පසු දිගුකාලීන සැලැස්ම සම්බන්ධ කරයි.",
    },
    capabilities: ["device_compatibility", "identity_handoff", "order", "airport_pickup", "delivery", "activation", "plan_conversion", "termination"],
    requiredContract: "통신사 또는 공식 판매점 API·판매·개인정보 위탁계약",
    notes: {
      ko: "세중은 주문과 상태를 통합하며 실제 개통·본인확인은 통신사업자 또는 공식 판매점이 수행합니다.",
      en: "Sejoong orchestrates orders and status; the carrier or authorized retailer performs identity verification and activation.",
      si: "Sejoong ඇණවුම හා තත්ත්වය සංවිධානය කරයි; හැඳුනුම් තහවුරු කිරීම හා සක්‍රිය කිරීම දුරකථන සමාගම හෝ බලයලත් වෙළෙන්දා කරයි.",
    },
  },
  {
    id: "bank-account",
    kind: "bank",
    name: "Foreign-worker banking adapter",
    status: "partner_required",
    description: {
      ko: "급여계좌 개설 준비, 지점예약, 필요서류, 자동이체와 체크카드 상태를 관리합니다.",
      en: "Manage payroll-account preparation, branch appointments, required documents, auto-pay and debit-card status.",
      si: "වැටුප් ගිණුම් සූදානම, ශාඛා වෙන්කිරීම්, අවශ්‍ය ලේඛන, ස්වයං ගෙවීම් හා ඩෙබිට් කාඩ් තත්ත්වය කළමනාකරණය කරයි.",
    },
    capabilities: ["document_checklist", "appointment", "application_status", "payroll_registration"],
    requiredContract: "은행 또는 외국인 금융지원 제휴계약",
  },
  {
    id: "licensed-remittance",
    kind: "remittance",
    name: "Licensed remittance provider adapter",
    status: "partner_required",
    description: {
      ko: "인가된 은행·소액해외송금업자의 실시간 환율·수수료·예상 LKR·상태·영수증을 연결합니다.",
      en: "Connect live rate, fee, expected LKR, transfer status and receipts from a bank or registered small-remittance provider.",
      si: "බැංකුවක් හෝ ලියාපදිංචි කුඩා මුදල් යැවීමේ සේවාවක සජීවී අනුපාත, ගාස්තු, ලැබෙන LKR, තත්ත්වය හා රිසිට් සම්බන්ධ කරයි.",
    },
    capabilities: ["kyc_handoff", "beneficiary", "quote", "transfer_intent", "status", "receipt", "refund_status"],
    requiredContract: "외국환업무취급기관 또는 등록 소액해외송금업자 API·제휴계약",
    notes: {
      ko: "세중 플랫폼은 자금을 보유·환전·송금하지 않고 인가 사업자의 서비스 화면과 상태를 통합합니다.",
      en: "The StayCare platform does not hold, exchange or transmit funds; it orchestrates the licensed provider experience.",
      si: "StayCare වේදිකාව මුදල් තබාගැනීම, හුවමාරු කිරීම හෝ යැවීම නොකරයි; බලපත්‍රලාභී සේවාව සම්බන්ධ කරයි.",
    },
  },
  {
    id: "last-mile-delivery",
    kind: "delivery",
    name: "Airport and accommodation delivery adapter",
    status: "partner_required",
    description: {
      ko: "SIM·교통카드·안내키트의 공항수령, 담당자 일괄수령 또는 숙소배송 상태를 관리합니다.",
      en: "Manage airport pickup, coordinator bulk collection or accommodation delivery for SIMs, transport cards and welcome kits.",
      si: "SIM, ගමනාගමන කාඩ් සහ ආරම්භක කට්ටල සඳහා ගුවන් තොටුපළ ලබාගැනීම, සමූහ ලබාගැනීම හෝ නවාතැන් බෙදාහැරීම කළමනාකරණය කරයි.",
    },
    capabilities: ["pickup_slot", "bulk_manifest", "address_validation", "tracking", "proof_of_delivery"],
    requiredContract: "공항 카운터·택배·현장운영 제휴계약",
  },
  {
    id: "openai-language",
    kind: "ai",
    name: "OpenAI multilingual life assistant",
    status: "sandbox",
    description: {
      ko: "한국어·영어·싱할라어 번역과 한국생활 다음 행동 안내를 제공합니다.",
      en: "Provides Korean-English-Sinhala translation and practical Korea-life guidance.",
      si: "කොරියානු-ඉංග්‍රීසි-සිංහල පරිවර්තනය හා කොරියානු ජීවිත මාර්ගෝපදේශය සපයයි.",
    },
    capabilities: ["text_translation", "context_guide", "browser_speech_input", "browser_speech_output"],
    requiredContract: "OPENAI_API_KEY 및 개인정보·AI 이용정책",
    notes: {
      ko: "여권번호·외국인등록번호·카드번호를 AI 요청에 보내지 않으며 store:false로 호출합니다.",
      en: "Passport, registration and card numbers are blocked from AI requests, which are sent with store:false.",
      si: "ගමන් බලපත්‍ර, ලියාපදිංචි හා කාඩ් අංක AI ඉල්ලීම්වලට නොයවන අතර store:false භාවිත කරයි.",
    },
  },
]

export function localizedIntegrationDescription(id: string, language: StayCareLanguage) {
  const item = integrationDescriptors.find((descriptor) => descriptor.id === id)
  return item?.description[language] || item?.description.en || ""
}
