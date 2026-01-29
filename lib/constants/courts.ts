export const KOREAN_COURTS: string[] = [
  "서울고등법원",
  "서울중앙지방법원",
  "서울가정법원",
  "서울행정법원",
  "서울회생법원",
  "서울동부지방법원",
  "서울남부지방법원",
  "서울북부지방법원",
  "서울서부지방법원",
  "의정부지방법원",
  "고양지원",
  "남양주지원",
  "인천지방법원",
  "부천지원",
  "인천가정법원",
  "춘천지방법원",
  "강릉지원",
  "원주지원",
  "속초지원",
  "영월지원",
  "대전고등법원",
  "대전지방법원",
  "홍성지원",
  "공주지원",
  "논산지원",
  "서산지원",
  "천안지원",
  "대전가정법원",
  "청주지방법원",
  "충주지원",
  "제천지원",
  "영동지원",
  "대구고등법원",
  "대구지방법원",
  "서부지원",
  "안동지원",
  "경주지원",
  "포항지원",
  "김천지원",
  "상주지원",
  "의성지원",
  "영덕지원",
  "대구가정법원",
  "부산고등법원",
  "부산지방법원",
  "동부지원",
  "부산가정법원",
  "부산회생법원",
  "울산지방법원",
  "울산가정법원",
  "창원지방법원",
  "마산지원",
  "진주지원",
  "통영지원",
  "밀양지원",
  "거창지원",
  "광주고등법원",
  "광주지방법원",
  "목포지원",
  "장흥지원",
  "순천지원",
  "해남지원",
  "광주가정법원",
  "전주지방법원",
  "군산지원",
  "정읍지원",
  "남원지원",
  "제주지방법원",
  "수원고등법원",
  "수원지방법원",
  "성남지원",
  "여주지원",
  "평택지원",
  "안산지원",
  "안양지원",
  "수원가정법원",
  "수원회생법원",
  "특허법원",
].filter((v, i, arr) => arr.indexOf(v) === i)

const CITY: Record<string, { en: string; "zh-CN": string }> = {
  서울: { en: "Seoul", "zh-CN": "首尔" },
  인천: { en: "Incheon", "zh-CN": "仁川" },
  수원: { en: "Suwon", "zh-CN": "水原" },
  대전: { en: "Daejeon", "zh-CN": "大田" },
  대구: { en: "Daegu", "zh-CN": "大邱" },
  부산: { en: "Busan", "zh-CN": "釜山" },
  울산: { en: "Ulsan", "zh-CN": "蔚山" },
  창원: { en: "Changwon", "zh-CN": "昌原" },
  광주: { en: "Gwangju", "zh-CN": "光州" },
  전주: { en: "Jeonju", "zh-CN": "全州" },
  제주: { en: "Jeju", "zh-CN": "济州" },
  춘천: { en: "Chuncheon", "zh-CN": "春川" },
  청주: { en: "Cheongju", "zh-CN": "清州" },
  의정부: { en: "Uijeongbu", "zh-CN": "议政府" },
  고양: { en: "Goyang", "zh-CN": "高阳" },
  남양주: { en: "Namyangju", "zh-CN": "南杨州" },
  부천: { en: "Bucheon", "zh-CN": "富川" },
  강릉: { en: "Gangneung", "zh-CN": "江陵" },
  원주: { en: "Wonju", "zh-CN": "原州" },
  속초: { en: "Sokcho", "zh-CN": "束草" },
  영월: { en: "Yeongwol", "zh-CN": "宁越" },
  홍성: { en: "Hongseong", "zh-CN": "洪城" },
  공주: { en: "Gongju", "zh-CN": "公州" },
  논산: { en: "Nonsan", "zh-CN": "论山" },
  서산: { en: "Seosan", "zh-CN": "瑞山" },
  천안: { en: "Cheonan", "zh-CN": "天安" },
  충주: { en: "Chungju", "zh-CN": "忠州" },
  제천: { en: "Jecheon", "zh-CN": "堤川" },
  영동: { en: "Yeongdong", "zh-CN": "永同" },
  안동: { en: "Andong", "zh-CN": "安东" },
  경주: { en: "Gyeongju", "zh-CN": "庆州" },
  포항: { en: "Pohang", "zh-CN": "浦项" },
  김천: { en: "Gimcheon", "zh-CN": "金泉" },
  상주: { en: "Sangju", "zh-CN": "尚州" },
  의성: { en: "Uiseong", "zh-CN": "义城" },
  영덕: { en: "Yeongdeok", "zh-CN": "盈德" },
  마산: { en: "Masan", "zh-CN": "马山" },
  진주: { en: "Jinju", "zh-CN": "晋州" },
  통영: { en: "Tongyeong", "zh-CN": "统营" },
  밀양: { en: "Miryang", "zh-CN": "密阳" },
  거창: { en: "Geochang", "zh-CN": "居昌" },
  목포: { en: "Mokpo", "zh-CN": "木浦" },
  장흥: { en: "Jangheung", "zh-CN": "长兴" },
  순천: { en: "Suncheon", "zh-CN": "顺天" },
  해남: { en: "Haenam", "zh-CN": "海南" },
  군산: { en: "Gunsan", "zh-CN": "群山" },
  정읍: { en: "Jeongeup", "zh-CN": "井邑" },
  남원: { en: "Namwon", "zh-CN": "南原" },
  성남: { en: "Seongnam", "zh-CN": "城南" },
  여주: { en: "Yeoju", "zh-CN": "骊州" },
  평택: { en: "Pyeongtaek", "zh-CN": "平泽" },
  안산: { en: "Ansan", "zh-CN": "安山" },
  안양: { en: "Anyang", "zh-CN": "安养" },
}

function translateCourtKoToEnZh(koName: string) {
  if (!koName) return { en: "", "zh-CN": "" }
  if (koName === "특허법원") return { en: "Patent Court", "zh-CN": "专利法院" }

  // 방향 지원 (부산/대구 등에서 등장)
  if (koName === "동부지원") return { en: "Eastern Branch", "zh-CN": "东部支院" }
  if (koName === "서부지원") return { en: "Western Branch", "zh-CN": "西部支院" }

  // 지원(Branch)
  if (koName.endsWith("지원")) {
    const cityKo = koName.replace(/지원$/, "")
    const city = CITY[cityKo]
    if (city) return { en: `${city.en} Branch`, "zh-CN": `${city["zh-CN"]}支院` }
    return { en: `${cityKo} Branch`, "zh-CN": `${cityKo}支院` }
  }

  const m = koName.match(/^(.*?)(고등법원|중앙지방법원|지방법원|가정법원|행정법원|회생법원)$/)
  if (!m) return { en: koName, "zh-CN": koName }
  const cityKo = m[1]
  const kind = m[2]
  const city = CITY[cityKo] || { en: cityKo, "zh-CN": cityKo }

  switch (kind) {
    case "고등법원":
      return { en: `${city.en} High Court`, "zh-CN": `${city["zh-CN"]}高等法院` }
    case "중앙지방법원":
      return { en: `${city.en} Central District Court`, "zh-CN": `${city["zh-CN"]}中央地方法院` }
    case "지방법원":
      return { en: `${city.en} District Court`, "zh-CN": `${city["zh-CN"]}地方法院` }
    case "가정법원":
      return { en: `${city.en} Family Court`, "zh-CN": `${city["zh-CN"]}家庭法院` }
    case "행정법원":
      return { en: `${city.en} Administrative Court`, "zh-CN": `${city["zh-CN"]}行政法院` }
    case "회생법원":
      return { en: `${city.en} Bankruptcy Court`, "zh-CN": `${city["zh-CN"]}破产法院` }
    default:
      return { en: koName, "zh-CN": koName }
  }
}

const CHOSUNG = [
  "ㄱ",
  "ㄲ",
  "ㄴ",
  "ㄷ",
  "ㄸ",
  "ㄹ",
  "ㅁ",
  "ㅂ",
  "ㅃ",
  "ㅅ",
  "ㅆ",
  "ㅇ",
  "ㅈ",
  "ㅉ",
  "ㅊ",
  "ㅋ",
  "ㅌ",
  "ㅍ",
  "ㅎ",
] as const

function isHangulSyllableCode(code: number) {
  return code >= 0xac00 && code <= 0xd7a3
}

export function toChosung(str: string) {
  const s = (str || "").replace(/\s+/g, "")
  let out = ""
  for (const ch of s) {
    const code = ch.charCodeAt(0)
    if (isHangulSyllableCode(code)) {
      const index = Math.floor((code - 0xac00) / 588)
      out += CHOSUNG[index] ?? ""
    } else {
      out += ch
    }
  }
  return out
}

function normalize(str: string) {
  return (str || "").replace(/\s+/g, "").toLowerCase()
}

function isSubsequence(haystack: string, needle: string) {
  if (!needle) return true
  let i = 0
  for (let j = 0; j < haystack.length && i < needle.length; j++) {
    if (haystack[j] === needle[i]) i++
  }
  return i === needle.length
}

export type CourtLocale = "ko" | "en" | "zh-CN" | "si" | "ta"

export type CourtSuggestion = {
  label: string
  value: string
}

function getCourtLabel(nameKo: string, locale: CourtLocale) {
  if (locale === "ko") return nameKo
  if (locale === "si" || locale === "ta") {
    // For Sinhala and Tamil, use English translation as fallback
    const t = translateCourtKoToEnZh(nameKo)
    return t["en"] || nameKo
  }
  const t = translateCourtKoToEnZh(nameKo)
  return (t as any)[locale] || nameKo
}

export function getCourtSuggestions(query: string, locale: CourtLocale = "ko", limit = 12): CourtSuggestion[] {
  const q = normalize(query)
  const qChosung = normalize(toChosung(query))

  const scored = KOREAN_COURTS.map((nameKo) => {
    const label = getCourtLabel(nameKo, locale)
    const labelNorm = normalize(label)
    const koNorm = normalize(nameKo)
    const koChosung = normalize(toChosung(nameKo))

    let score = 0
    if (q && labelNorm.startsWith(q)) score = Math.max(score, 100)
    if (q && labelNorm.includes(q)) score = Math.max(score, 80)

    // 한국어 초성 검색은 항상 지원 (다국어 UI에서도 가능)
    if (qChosung && koChosung.startsWith(qChosung)) score = Math.max(score, 70)
    if (qChosung && koChosung.includes(qChosung)) score = Math.max(score, 60)
    if (qChosung && isSubsequence(koChosung, qChosung)) score = Math.max(score, 55)

    // 한국어 텍스트로도 검색 가능
    if (q && koNorm.startsWith(q)) score = Math.max(score, 65)
    if (q && koNorm.includes(q)) score = Math.max(score, 50)

    return { nameKo, label, score }
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.label.length - b.label.length || a.label.localeCompare(b.label))
    .slice(0, limit)

  return scored.map((x) => ({ label: x.label, value: x.label }))
}


