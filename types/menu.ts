export type MenuItem = {
  label: string
  path: string
  children?: MenuItem[]
}

export const menuStructure: MenuItem[] = [
  {
    label: "법인소개",
    path: "/about",
    children: [
      { label: "인사말", path: "/about/greeting" },
      { label: "구성원소개", path: "/about/members" },
      { label: "오시는 길", path: "/about/location" },
    ],
  },
  {
    label: "소송업무",
    path: "/litigation",
    children: [
      { label: "부동산분쟁", path: "/litigation/real-estate" },
      { label: "이혼/국제이혼", path: "/litigation/divorce" },
      { label: "상속분쟁", path: "/litigation/inheritance" },
      { label: "교통사고", path: "/litigation/traffic" },
      { label: "산업재해", path: "/litigation/industrial" },
      { label: "보험소송", path: "/litigation/insurance" },
      { label: "조세소송", path: "/litigation/tax" },
      { label: "가사/민사/형사/행정", path: "/litigation/general" },
    ],
  },
  {
    label: "기업자문",
    path: "/corporate",
    children: [
      { label: "기업자문 안내", path: "/corporate/advisory" },
      { label: "기업인수합병(M&A)", path: "/corporate/m-a" },
      { label: "해외투자", path: "/corporate/overseas" },
      { label: "부동산금융", path: "/corporate/finance" },
      { label: "부동산간접투자", path: "/corporate/indirect" },
    ],
  },
  {
    label: "해외이주",
    path: "/immigration",
    children: [
      { label: "비자/이민", path: "/immigration/visa" },
      { label: "비이민비자", path: "/immigration/non-immigrant" },
      { label: "이민비자", path: "/immigration/immigrant" },
      { label: "비자거절", path: "/immigration/refusal" },
      { label: "웨이버(Waiver)신청", path: "/immigration/waiver" },
      { label: "비자 성공사례", path: "/immigration/success" },
    ],
  },
  {
    label: "외국인센터",
    path: "/foreigner",
    children: [
      {
        label: "사증(VISA)",
        path: "/foreigner/visa",
        children: [
          { label: "사증발급인정서", path: "/foreigner/visa/certificate" },
          { label: "사증종류별 대상자", path: "/foreigner/visa/types" },
        ],
      },
      { label: "체류허가 연장/변경", path: "/foreigner/stay" },
      { label: "출입국관리사무소 관련업무", path: "/foreigner/immigration" },
      { label: "외국인투자", path: "/foreigner/investment" },
      { label: "재외동포법률지원", path: "/foreigner/overseas-korean" },
    ],
  },
  {
    label: "상담게시판",
    path: "/board",
    children: [
      { label: "최근업무사례", path: "/board" },
      { label: "온라인상담 Q/A", path: "/board/qa" },
      { label: "세중 칼럼", path: "/board/column" },
      { label: "최신뉴스", path: "/board/news" },
    ],
  },
]

