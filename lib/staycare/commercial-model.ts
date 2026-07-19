export type StayCarePayer = "employer" | "worker" | "sponsor"
export type StayCarePriority = "P0" | "P1" | "P2" | "P3"
export type StayCareDepartment =
  | "세중 통합운영센터"
  | "세중 출입국팀"
  | "세중 법률팀"
  | "세중 노무·산재팀"
  | "세중 생활정착팀"

export const DEFAULT_MEMBER_COUNT = 200
export const DEFAULT_ANNUAL_FEE = 1_000_000
export const DEFAULT_DIRECT_COST_RATE = 0.25
export const MIN_DIRECT_COST_RATE = 0.2
export const MAX_DIRECT_COST_RATE = 0.3

export const payerLabels: Record<StayCarePayer, string> = {
  employer: "고용주 부담",
  worker: "근로자 부담",
  sponsor: "외부 후원·도입기관 부담",
}

export interface UnitEconomicsInput {
  memberCount: number
  annualFee: number
  directCostRate: number
}

export interface UnitEconomicsResult {
  annualRevenue: number
  monthlyRunRate: number
  annualDirectCost: number
  annualOperationsBudget: number
  revenuePerMemberPerMonth: number
  directCostPerMember: number
  operationsBudgetPerMember: number
}

export function calculateUnitEconomics({
  memberCount,
  annualFee,
  directCostRate,
}: UnitEconomicsInput): UnitEconomicsResult {
  const safeMembers = Math.max(1, Math.round(memberCount))
  const safeFee = Math.max(0, Math.round(annualFee))
  const safeRate = Math.min(MAX_DIRECT_COST_RATE, Math.max(MIN_DIRECT_COST_RATE, directCostRate))
  const annualRevenue = safeMembers * safeFee
  const annualDirectCost = Math.round(annualRevenue * safeRate)
  const annualOperationsBudget = annualRevenue - annualDirectCost

  return {
    annualRevenue,
    monthlyRunRate: Math.round(annualRevenue / 12),
    annualDirectCost,
    annualOperationsBudget,
    revenuePerMemberPerMonth: Math.round(safeFee / 12),
    directCostPerMember: Math.round(safeFee * safeRate),
    operationsBudgetPerMember: Math.round(safeFee * (1 - safeRate)),
  }
}

export function formatKrw(value: number) {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value)
}

export const annualMembership = {
  id: "staycare-annual-100",
  name: "Sejoong StayCare 연간 통합관리 멤버십",
  annualFee: DEFAULT_ANNUAL_FEE,
  monthlyEquivalent: Math.round(DEFAULT_ANNUAL_FEE / 12),
  billingOptions: ["연간 일시납", "월 분납", "고용주 일괄계약", "외부기관 단체계약"],
  payerOptions: Object.values(payerLabels),
  serviceArea: {
    remote: "전국 비대면 상담·업무접수·상태관리 포함",
    includedField: "계약된 주 사업장 1개 권역과 반경 30km 내 현장지원",
    additionalField: "추가 사업장·타 지역·장거리 이동은 사전승인 후 실비 또는 별도 견적",
  },
  responsePolicy: {
    P0: "즉시 안전·생명 위험: 15분 이내 1차 확인 및 공공 긴급기관 연결",
    P1: "체류·임금·산재·폭력 등 중대사안: 1시간 이내 담당자 지정",
    P2: "기한이 있는 일반 행정·생활문제: 4영업시간 이내 1차 답변",
    P3: "일반 문의·정보 요청: 1영업일 이내 1차 답변",
  },
  included: [
    "입국 전 개인 프로필·여권·비자·고용·항공·숙소 체크리스트 1회 구축",
    "외국인등록, 체류기간, 계약, 보험, 여권 만료 자동알림과 담당자 배정",
    "디지털 문의 무제한 접수와 처리상태 확인",
    "예약형 비대면 상담 연 12회, 회당 최대 30분",
    "법률·출입국·노무 기본 전문검토 연 4회",
    "전화·화상 통역 연 180분",
    "계약 사업장 권역 내 현장지원 연 2회, 회당 최대 2시간",
    "유심·계좌·보험·숙소·병원 이용 절차 안내와 예약·연결 지원",
    "월 1회 상태 체크인과 고위험 신호 분류",
    "근로자용 한국어·영어·싱할라어 모바일 화면",
    "고용주 또는 비용부담기관용 범위제한 현황판",
    "세중 통합운영센터 단일 창구와 P0~P3 SLA",
  ],
  separatelyQuoted: [
    "소송·심판·수사 대응, 법률대리, 장기 또는 복합 사건",
    "비자·체류 민원의 공식 신청대행과 정부 수수료·인지대·공증비",
    "산재·임금체불 등 개별 사건의 대리와 외부 감정·의료 비용",
    "포함량을 초과한 통역·번역·현장 동행",
    "장거리 교통·숙박·주말·야간 현장지원",
    "통신요금, 보험료, 숙소비, 병원비, 교통비 등 제3자 실비",
  ],
} as const

export const sejoongOperatingModel = [
  {
    actor: "법무법인 세중",
    externalRole: "서비스 주최·계약·수납·품질책임",
    responsibilities: [
      "회원·고용주·후원기관과 멤버십 계약",
      "월·연 비용 수납과 포함서비스 정책 결정",
      "모든 상담·행정·현장지원의 대외 단일 창구",
      "법률·출입국·노무·생활업무의 최종 품질관리",
      "별도 사건의 위임·견적·수행",
    ],
  },
  {
    actor: "위탁 운영사",
    externalRole: "세중 브랜드 아래 플랫폼·운영 실행",
    responsibilities: [
      "플랫폼 개발·보안·유지보수",
      "회원 등록, 문서·일정·티켓·SLA 운영",
      "상담 예약, 다국어 CS, 현장지원 배정",
      "고용주·담당자·협력업체 커뮤니케이션",
      "월간 운영·원가·품질 리포트",
    ],
  },
  {
    actor: "전문 수행팀·협력업체",
    externalRole: "세중의 관리 아래 배정 업무 수행",
    responsibilities: [
      "변호사·출입국·노무·통역 등 전문업무",
      "통신·숙소·병원·교통 등 생활서비스",
      "업무 결과와 증빙을 세중 플랫폼에 기록",
      "회원에게 독립 판매자가 아닌 세중 지정 수행팀으로 표시",
    ],
  },
] as const

export const briefingDecisions = [
  "200명의 국적·세부 비자·직무·고용주·사업장·도입 일정",
  "1인 연 100만 원의 실제 비용부담자와 납부 방식",
  "한 번에 200명인지, 단계별 입국인지, 예상 입국 파동 수",
  "계약 사업장 권역과 숙소 위치, 현장지원 이동거리",
  "입국 전 준비를 누가 언제부터 시작할지",
  "싱할라어·영어 담당자와 세중 내부 책임자",
  "공식 비자·출입국 업무의 범위와 별도 수임 기준",
  "고용주에게 제공할 데이터 범위와 근로자 동의 방식",
  "연간 포함량을 초과하는 서비스의 단가표",
  "계약 체결·선수금·개발 착수·첫 입국 전 준비 일정",
] as const

export const implementationPhases = [
  {
    phase: "Phase 1",
    title: "계약·200명 명단 준비",
    period: "계약 후 2주",
    outputs: ["계약·요금·SLA 확정", "고용주·담당자 계정", "근로자 초대", "국가·비자별 체크리스트"],
  },
  {
    phase: "Phase 2",
    title: "입국 전 온라인 온보딩",
    period: "입국 8~12주 전",
    outputs: ["여권·비자·고용정보", "다국어 교육", "항공·숙소·통신 계획", "누락자료 리포트"],
  },
  {
    phase: "Phase 3",
    title: "입국·초기 30일 집중관리",
    period: "D-day~D+30",
    outputs: ["인계·숙소·유심", "외국인등록", "계좌·보험", "사업장 배치와 초기민원"],
  },
  {
    phase: "Phase 4",
    title: "연간 체류·생활·사건관리",
    period: "D+31~1년",
    outputs: ["월간 체크인", "만료·변경 알림", "P0~P3 티켓", "운영·매출·원가 리포트"],
  },
] as const

export interface ProgramMemberSample {
  id: string
  name: string
  nameEn: string
  visa: string
  job: string
  employer: string
  stage: string
  completion: number
  payer: StayCarePayer
  owner: StayCareDepartment
  nextAction: string
  risk: "낮음" | "주의" | "높음"
}

export const programMemberSamples: ProgramMemberSample[] = [
  {
    id: "SL-200-001",
    name: "니말 페레라",
    nameEn: "Nimal Perera",
    visa: "E-7 예정",
    job: "조선 용접",
    employer: "고용주 확정 전",
    stage: "사전 명단 검토",
    completion: 72,
    payer: "employer",
    owner: "세중 출입국팀",
    nextAction: "경력·자격 증빙 검토",
    risk: "주의",
  },
  {
    id: "SL-200-002",
    name: "카산 자야싱헤",
    nameEn: "Kasan Jayasinghe",
    visa: "E-7 예정",
    job: "조선 도장",
    employer: "고용주 확정 전",
    stage: "사전 명단 검토",
    completion: 64,
    payer: "sponsor",
    owner: "세중 통합운영센터",
    nextAction: "여권 유효기간 확인",
    risk: "낮음",
  },
  {
    id: "SL-200-003",
    name: "딜란 페르난도",
    nameEn: "Dilan Fernando",
    visa: "E-9 검토",
    job: "제조 생산",
    employer: "배정 협의 중",
    stage: "고용조건 확인",
    completion: 48,
    payer: "employer",
    owner: "세중 노무·산재팀",
    nextAction: "근로조건·숙소비 구조 검토",
    risk: "주의",
  },
  {
    id: "SL-200-004",
    name: "라히루 쿠마라",
    nameEn: "Lahiru Kumara",
    visa: "E-10 검토",
    job: "선원",
    employer: "배정 협의 중",
    stage: "자격경로 확인",
    completion: 41,
    payer: "worker",
    owner: "세중 법률팀",
    nextAction: "E-9·E-10 적용 경로 구분",
    risk: "높음",
  },
]

export interface ProgramTicketSample {
  id: string
  priority: StayCarePriority
  title: string
  category: string
  owner: StayCareDepartment
  sla: string
  status: string
}

export const programTicketSamples: ProgramTicketSample[] = [
  {
    id: "SC-P0-001",
    priority: "P0",
    title: "신체위험·폭력·중상 신고",
    category: "긴급·안전",
    owner: "세중 통합운영센터",
    sla: "15분",
    status: "긴급기관 연결 후 세중 담당자 추적",
  },
  {
    id: "SC-P1-014",
    priority: "P1",
    title: "임금 미지급과 체류기한 동시 문제",
    category: "노무·출입국",
    owner: "세중 노무·산재팀",
    sla: "1시간",
    status: "전문담당 배정",
  },
  {
    id: "SC-P2-031",
    priority: "P2",
    title: "외국인등록 예약·숙소주소 자료 확인",
    category: "행정·정착",
    owner: "세중 출입국팀",
    sla: "4영업시간",
    status: "자료 요청",
  },
  {
    id: "SC-P3-052",
    priority: "P3",
    title: "유심 요금제와 급여계좌 준비 문의",
    category: "생활지원",
    owner: "세중 생활정착팀",
    sla: "1영업일",
    status: "가이드 발송",
  },
]
