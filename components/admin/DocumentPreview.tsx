"use client"

import { forwardRef, useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react"
import { type DocumentType } from "@/lib/documents/templates"
import { WATERMARK_CONFIG } from "@/lib/documents/watermark-config"
import { format } from "date-fns"
import type {
  DocumentData,
  AgreementData,
  PowerOfAttorneyData,
  AttorneyAppointmentData,
  LitigationPowerData,
  InsuranceConsentData,
} from "@/lib/types/documents"

interface DocumentPreviewProps {
  documentType: DocumentType
  data: DocumentData
  locale: "ko" | "en" | "zh-CN"
}

interface PreviewComponentProps {
  data: DocumentData
  locale: "ko" | "en" | "zh-CN"
  fontClass?: string
  getValue: (key: string) => string
  formatDate: (date: string | undefined) => string
  showWatermark?: boolean
}

function getWatermarkStyle() {
  return {
    backgroundImage: "url('/SJ_logo.svg')",
    backgroundRepeat: "repeat",
    backgroundSize: `${WATERMARK_CONFIG.preview.sizePx}px auto`,
    backgroundPosition: "0 0",
    opacity: WATERMARK_CONFIG.preview.opacity,
    zIndex: 10,
    backgroundColor: "transparent",
    transform: `rotate(${WATERMARK_CONFIG.rotationDeg}deg)`,
    transformOrigin: "center center",
    width: "250%",
    height: "250%",
    left: "-75%",
    top: "-75%",
  } as const
}

function DocumentFooter({ locale }: { locale: "ko" | "en" | "zh-CN" }) {
  const fontFamily =
    locale === "ko"
      ? '"Noto Sans KR", sans-serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", serif'
        : "system-ui, sans-serif"

  const text =
    locale === "ko"
      ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
      : locale === "en"
        ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
        : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"

  return (
    <div
      style={{
        position: "absolute",
        left: "35px",
        right: "35px",
        bottom: "12px",
        zIndex: 25,
        paddingTop: "6px",
        borderTop: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
      }}
    >
      <div
        className="flex items-center justify-center mb-1"
        style={{ backgroundColor: "transparent", position: "relative", zIndex: 25 }}
      >
        <img
          src="/SJ_logo.svg"
          alt="법무법인 세중"
          onError={(e) => {
            console.error("Footer logo failed to load:", e)
          }}
          style={{
            height: "36px",
            width: "auto",
            objectFit: "contain",
            maxWidth: "100%",
            backgroundColor: "transparent",
            display: "block",
            visibility: "visible",
            opacity: "1",
            zIndex: 26,
            position: "relative",
            filter: "none",
            pointerEvents: "none",
          }}
        />
      </div>
      <div
        className="text-center"
        style={{
          fontSize: "11px",
          color: "#666",
          lineHeight: "1.35",
          fontFamily,
          backgroundColor: "transparent",
        }}
      >
        {text}
      </div>
    </div>
  )
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

function AutoFitContent({
  targetHeightPx,
  minScale = 0.85,
  maxScale = 1,
  innerPadding,
  verticalAlign = "top",
  baseWidthPx = 794,
  children,
}: {
  targetHeightPx: number
  minScale?: number
  maxScale?: number
  innerPadding: string
  verticalAlign?: "top" | "center"
  baseWidthPx?: number
  children: ReactNode
}) {
  const [scale, setScale] = useState(1)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const [layoutWidth, setLayoutWidth] = useState<number>(794)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const measure = useCallback(() => {
    const el = contentRef.current
    if (!el) return

    // scrollHeight는 transform(scale)의 영향을 받지 않는 "레이아웃 기준" 높이
    // 업스케일(>1) 시 좌우가 잘리지 않도록, 레이아웃 폭을 baseWidth/scale로 역보정하며
    // 그 폭에서의 높이를 다시 측정해 scale을 2~3회 수렴시킨다.
    let nextScale = scale
    let nextLayoutWidth = baseWidthPx
    const prevInlineWidth = el.style.width

    try {
      for (let i = 0; i < 3; i++) {
        // 현재 후보 scale에 맞춰 레이아웃 폭을 조정 (시각적 폭 = baseWidth 유지)
        nextLayoutWidth = nextScale > 1 ? baseWidthPx / nextScale : baseWidthPx
        // DOM에 폭을 임시 반영하여 reflow 후 높이 측정
        el.style.width = `${nextLayoutWidth}px`
        const h = el.scrollHeight
        if (!h || h <= 0) break
        setContentHeight(h)

        nextScale = clamp(targetHeightPx / h, minScale, maxScale)
      }
    } finally {
      // 측정 과정에서 넣은 임시 width는 반드시 원복(렌더/정렬 꼬임 방지)
      el.style.width = prevInlineWidth
    }

    // 최종 폭을 state로 고정(렌더링 일관성)
    setLayoutWidth((prev) => (Math.abs(prev - nextLayoutWidth) < 0.5 ? prev : nextLayoutWidth))
    const next = nextScale

    setScale((prev) => {
      // 미세한 흔들림/무한 업데이트 방지
      if (Math.abs(prev - next) < 0.01) return prev
      return next
    })
  }, [baseWidthPx, maxScale, minScale, scale, targetHeightPx])

  useLayoutEffect(() => {
    measure()

    const el = contentRef.current
    if (!el) return

    let ro: ResizeObserver | null = null
    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => measure())
      ro.observe(el)
    }

    const onResize = () => measure()
    window.addEventListener("resize", onResize)

    return () => {
      window.removeEventListener("resize", onResize)
      ro?.disconnect()
    }
  }, [measure])

  const offsetY =
    verticalAlign === "center" && contentHeight > 0
      ? Math.max(0, (targetHeightPx - contentHeight * scale) / 2)
      : 0

  return (
    <div
      style={{
        width: `${baseWidthPx}px`,
        height: `${targetHeightPx}px`,
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          transform: `translateY(${offsetY}px) scale(${scale})`,
          // scale이 줄어들어도 좌우 대칭이 깨지지 않도록 중앙 기준으로 축소/확대
          transformOrigin: "top center",
          width: `${baseWidthPx}px`,
          margin: "0 auto",
        }}
      >
        <div
          ref={contentRef}
          style={{
            width: `${layoutWidth}px`,
            margin: "0 auto",
            maxWidth: `${baseWidthPx}px`,
            boxSizing: "border-box",
            padding: innerPadding,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  function DocumentPreview({ documentType, data, locale }, ref) {
  const getValue = (key: string): string => {
    // 먼저 평면 키로 접근 시도 (예: "special_authority.withdrawal_of_suit"가 직접 키인 경우)
    if (data?.[key] !== undefined && data?.[key] !== null) {
      const value = data[key]
      if (typeof value === "string") return value
      if (typeof value === "number") return String(value)
      if (typeof value === "boolean") return String(value)
      if (Array.isArray(value)) return value.join(", ")
      if (typeof value === "object") return JSON.stringify(value)
      return ""
    }
    
    // 중첩된 키 처리 (예: "special_authority.withdrawal_of_suit"를 data.special_authority.withdrawal_of_suit로 접근)
    if (key.includes(".")) {
      const keys = key.split(".")
      let value: any = data
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined || value === null) return ""
      }
      if (typeof value === "string") return value
      if (typeof value === "number") return String(value)
      if (typeof value === "boolean") return String(value)
      if (Array.isArray(value)) return value.join(", ")
      if (typeof value === "object") return JSON.stringify(value)
      return ""
    }
    const value = data?.[key]
    if (typeof value === "string") return value
    if (typeof value === "number") return String(value)
    if (typeof value === "boolean") return String(value)
    if (Array.isArray(value)) return value.join(", ")
    if (typeof value === "object") return JSON.stringify(value)
    return ""
  }

  const getCheckboxValue = (key: string): boolean => {
    // 중첩된 키 처리 (예: "authorized_tasks.civil_criminal")
    if (key.includes(".")) {
      const keys = key.split(".")
      let value: any = data
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined || value === null) {
          return false
        }
      }
      // 배열인 경우도 확인 (예: authorized_tasks가 배열인 경우)
      if (Array.isArray(value)) {
        return value.includes(keys[keys.length - 1])
      }
      return value === true || value === "true" || value === "on"
    }
    
    // 평면 키 접근
    const value: any = data?.[key] || (data as any)?.authorized_tasks?.[key] || (data as any)?.authorized_actions?.[key] || (data as any)?.special_authority?.[key]
    
    // 배열인 경우 (예: authorized_tasks가 배열로 저장된 경우)
    if (Array.isArray(value)) {
      return value.length > 0
    }
    
    return value === true || value === "true" || value === "on"
  }

  const formatDate = (dateStr: string | undefined, dateType: "full" | "short" = "full") => {
    if (!dateStr) return ""
    try {
      const date = new Date(dateStr)
      if (locale === "ko") {
        return format(date, "yyyy년 MM월 dd일")
      } else if (locale === "en") {
        return format(date, "MMMM d, yyyy")
      } else {
        return format(date, "yyyy年M月d日")
      }
    } catch {
      return dateStr || ""
    }
  }

  // 언어별 폰트 클래스
  const fontClass = locale === "ko" ? "font-korean" : locale === "zh-CN" ? "font-chinese" : "font-sans"

    const showWatermark = !String(documentType).endsWith("_old")

    switch (documentType) {
      case "agreement":
        return <AgreementPreview ref={ref} data={data as AgreementData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} showWatermark={showWatermark} />
      case "agreement_old":
        return <AgreementOldPreview ref={ref} data={data as AgreementData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      case "power_of_attorney":
        return <PowerOfAttorneyPreview ref={ref} data={data as PowerOfAttorneyData} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} showWatermark={showWatermark} />
      case "power_of_attorney_old":
        return <PowerOfAttorneyOldPreview ref={ref} data={data as PowerOfAttorneyData} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} />
      case "attorney_appointment":
        return <AttorneyAppointmentPreview ref={ref} data={data as AttorneyAppointmentData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} showWatermark={showWatermark} />
      case "attorney_appointment_old":
        return <AttorneyAppointmentOldPreview ref={ref} data={data as AttorneyAppointmentData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      case "litigation_power":
        return <LitigationPowerPreview ref={ref} data={data as LitigationPowerData} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} showWatermark={showWatermark} />
      case "litigation_power_old":
        return <LitigationPowerOldPreview ref={ref} data={data as LitigationPowerData} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} />
      case "insurance_consent":
        return <InsuranceConsentPreview ref={ref} data={data as InsuranceConsentData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} showWatermark={showWatermark} />
      case "insurance_consent_old":
        return <InsuranceConsentOldPreview ref={ref} data={data as InsuranceConsentData} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      default:
        return <div ref={ref} className="p-8 text-center text-gray-500">미리보기를 사용할 수 없습니다.</div>
    }
  }
)

export default DocumentPreview

// 합의서 미리보기
const AgreementPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: AgreementData }>(
  function AgreementPreview({ data, locale, fontClass, getValue, formatDate, showWatermark = true }, ref) {
  const title = locale === "ko" ? "합의서" : locale === "en" ? "Agreement" : "协议"
  const deceasedName = getValue("deceased_name") || "_________________________"
  // 푸터가 absolute 이므로, 본문이 푸터 영역까지 내려와도 "겹치지" 않도록
  // 본문 전용 높이를 별도 영역으로 분리해서 클리핑한다.
  // 합의서 푸터는 높이가 크지 않아 180px는 과도하게 보수적이라
  // 불필요한 축소(scale-down)를 유발할 수 있음 → 적정 안전영역으로 조정
  const FOOTER_SAFE_SPACE_PX = 150
  const A4_HEIGHT_PX = 1123
  const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - FOOTER_SAFE_SPACE_PX
  const intro = locale === "ko"
    ? `본 합의서는 고(故) ${deceasedName} (이하 "망인")의 사망과 관련하여, 망인의 유족 대표(이하 "갑")와 사업장 대표(이하 "을")가 상호 원만히 분쟁을 종결하기 위하여 다음과 같이 체결한다.`
    : locale === "en"
    ? `This agreement is entered into between the family representative (hereinafter "Party A") and the company representative (hereinafter "Party B") regarding the death of ${deceasedName} (hereinafter "the deceased") to amicably resolve disputes.`
    : `本协议由家属代表（以下简称"甲方"）和公司代表（以下简称"乙方"）就死者${deceasedName}（以下简称"死者"）的死亡相关事宜，为友好解决争议而签订。`

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "0",
          fontSize: "16px",
          lineHeight: "1.45",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "geometricPrecision",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
      <style>{`
        /* 다운로드(html2canvas)와 웹 미리보기의 표/텍스트 느낌을 최대한 동일하게 */
        /* zh-CN 폰트 강제 (FangSong 우선, 없으면 next/font Noto Serif SC로 fallback) */
        [data-preview-id="document-preview"][data-locale="zh-CN"],
        [data-preview-id="document-preview"][data-locale="zh-CN"] * {
          font-family: "FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", var(--font-noto-sans-kr), "Noto Sans KR", serif !important;
        }
        [data-preview-id="document-preview"] table td,
        [data-preview-id="document-preview"] table th {
          padding: 6px 10px !important;
          line-height: 1.35 !important;
          vertical-align: middle;
        }
        /* Tailwind 배경색이 다운로드 캡처에서 누락되는 케이스 방지 */
        [data-preview-id="document-preview"] .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* 영문 긴 문자열(번호/주소/이메일 등)이 좌우를 밀어내며 잘리는 현상 방지 */
        [data-preview-id="document-preview"] td,
        [data-preview-id="document-preview"] th,
        [data-preview-id="document-preview"] p,
        [data-preview-id="document-preview"] span {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      `}</style>
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1 }}>
      <AutoFitContent
        targetHeightPx={CONTENT_HEIGHT_PX}
        // 영문은 문장이 길어 축소가 더 필요할 수 있어 minScale을 약간 더 열어둔다.
        minScale={locale === "en" ? 0.8 : 0.85}
        // 폭은 AutoFit이 역보정하므로, 내용이 짧으면 약간 키워 A4에 더 꽉 차게
        maxScale={locale === "en" ? 1.08 : 1.1}
        // 좌우 여백을 줄여 A4 폭을 더 활용 (특히 영문에서 체감이 큼)
        innerPadding={"22px 22px 0 22px"}
        verticalAlign="top"
      >
      {/* 제목 */}
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "12px", fontSize: "32px", lineHeight: "1.25", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 서문 */}
      <p style={{ marginBottom: "14px", fontSize: "16px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{intro}</p>

      {/* 갑 정보 */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "21px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? '"갑" 유가족 대표' : locale === "en" ? '"Party A" Family Representative' : '"甲方" 家属代表'}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "12%", minWidth: "12%", maxWidth: "12%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "12%", minWidth: "12%", maxWidth: "12%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "12%", minWidth: "12%", maxWidth: "12%" }} />
            <col style={{ width: "28%", minWidth: "28%", maxWidth: "28%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "국적" : locale === "en" ? "Nationality" : "国籍"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_nationality")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("party_a_birthdate"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_contact")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "관계" : locale === "en" ? "Relation" : "关系"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                {getValue("party_a_relation") === "기타" ? getValue("party_a_relation_other") : getValue("party_a_relation")}
              </td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                {locale === "ko" ? "본국 신분증 번호" : locale === "en" ? "ID Number" : "本国身份证号"}
              </td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                {getValue("party_a_id_number")}
              </td>
            </tr>
            <tr>
              <td
                style={{
                  border: "1px solid #9ca3af",
                  padding: "10px 15px",
                  backgroundColor: "#f3f4f6",
                  fontWeight: "600",
                  textAlign: "center",
                  lineHeight: "1.5",
                  fontFamily:
                    locale === "ko"
                      ? '"Noto Sans KR", sans-serif'
                      : locale === "zh-CN"
                        ? '"FangSong", "STFangsong", serif'
                        : "system-ui, sans-serif",
                }}
              >
                {locale === "ko" ? "본국 주소" : locale === "en" ? "Home Address" : "本国地址"}
              </td>
              <td
                style={{
                  border: "1px solid #9ca3af",
                  padding: "10px 15px",
                  lineHeight: "1.5",
                  fontFamily:
                    locale === "ko"
                      ? '"Noto Sans KR", sans-serif'
                      : locale === "zh-CN"
                        ? '"FangSong", "STFangsong", serif'
                        : "system-ui, sans-serif",
                }}
                colSpan={5}
              >
                {getValue("party_a_address")}
              </td>
            </tr>
            {(getValue("party_a_2_name") ||
              getValue("party_a_2_relation") ||
              getValue("party_a_2_id_number") ||
              getValue("party_a_2_address")) && (
              <>
                <tr>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {locale === "ko" ? "추가 유가족" : locale === "en" ? "Additional Family" : "追加家属"}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={4}>
                    {getValue("party_a_2_name")}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {locale === "ko" ? "관계" : locale === "en" ? "Relation" : "关系"}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {getValue("party_a_2_relation") === "기타"
                      ? getValue("party_a_2_relation_other")
                      : getValue("party_a_2_relation")}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {locale === "ko" ? "본국 신분증 번호" : locale === "en" ? "ID Number" : "本国身份证号"}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>
                    {getValue("party_a_2_id_number")}
                  </td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {locale === "ko" ? "본국 주소" : locale === "en" ? "Home Address" : "本国地址"}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={5}>
                    {getValue("party_a_2_address")}
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* 을 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "21px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? '"을" 회사측 대표' : locale === "en" ? '"Party B" Company Representative' : '"乙方" 公司代表'}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "상호" : locale === "en" ? "Company Name" : "公司名称"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_company_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "대표자 성명" : locale === "en" ? "Representative Name" : "代表姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_representative")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_registration")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_contact")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("party_b_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 고인 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "21px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "고인(망인)" : locale === "en" ? "Deceased" : "死者"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "외국인등록번호" : locale === "en" ? "Foreigner Registration Number" : "外国人登记号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_foreigner_id")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("deceased_birthdate"))}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주소지" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_address")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사건발생위치" : locale === "en" ? "Incident Location" : "事件发生地点"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("incident_location")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사건발생시간" : locale === "en" ? "Incident Time" : "事件发生时间"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("incident_time")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 합의 내용 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "21px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "합의 내용" : locale === "en" ? "Agreement Terms" : "协议内容"}</h2>
        <div className="space-y-2 leading-relaxed" style={{ fontSize: locale === "en" ? "14px" : "15px", lineHeight: locale === "en" ? "1.35" : "1.45" }}>
          <p>1. {locale === "ko" ? "갑과 을은 본 사건(망인의 사망 관련 건)에 관하여 상호 원만히 합의하였고, 본 합의서 체결로써 본 사건과 관련된 분쟁이 종결되었음을 확인한다." : locale === "en" ? "Party A and Party B have amicably agreed regarding this case (related to the death of the deceased), and confirm that all disputes related to this case are resolved by the execution of this agreement." : "甲方和乙方就本案（与死者死亡相关）已友好达成协议，并确认通过签署本协议，与本案相关的所有争议已解决。"}</p>
          <p>2. {locale === "ko" ? "갑은 본 사건과 관련하여 향후 을 및 을의 대표자, 사업장에 대하여 민사·형사·행정(산재 등 포함) 기타 일체의 사항에 관하여 어떠한 이의도 제기하지 아니하며, 추가로 어떠한 청구나 권리 주장도 하지 아니한다." : locale === "en" ? "Party A shall not raise any objections or make any additional claims or assertions of rights against Party B, its representative, or the workplace regarding civil, criminal, administrative (including industrial accidents) or any other matters related to this case." : "甲方就本案相关事宜，今后不对乙方及其代表、工作场所提出任何民事、刑事、行政（包括工伤等）或其他任何异议，也不提出任何追加请求或权利主张。"}</p>
          <p>3. {locale === "ko" ? "갑은 본 사건과 관련하여 을의 대표자에 대한 처벌을 원하지 아니한다. 갑은 위의사를 표시한 처벌불원서를 본 합의서와 함께 제출한다." : locale === "en" ? "Party A does not wish for the punishment of Party B's representative in relation to this case. Party A shall submit a non-prosecution request expressing this intention together with this agreement." : "甲方不希望就本案对乙方代表进行处罚。甲方应提交表示此意的免予起诉书，与本协议一起提交。"}</p>
          <p>4. {locale === "ko" ? "갑과 을은 본 합의가 각 당사자의 자유로운 의사에 따라 작성·체결되었으며, 강박 또는 기망 등에 의한 것이 아님을 상호 확인한다." : locale === "en" ? "Party A and Party B mutually confirm that this agreement has been prepared and executed according to each party's free will and is not the result of coercion or fraud." : "甲方和乙方相互确认，本协议是根据各方自由意志编写和签署的，并非因胁迫或欺诈所致。"}</p>
        </div>
      </div>

      {/* 서명란 */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <p style={{ marginBottom: "10px", fontSize: "14px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본 합의서는 2부 작성하여 갑과 을이 각각 서명(또는 기명) 날인 후 각 1부씩 보관한다." : locale === "en" ? "This agreement is prepared in duplicate, with Party A and Party B each signing (or initialing) and sealing, and each party keeping one copy." : "本协议一式两份，甲方和乙方各自签名（或署名）盖章后，各保存一份。"}</p>
        <div style={{ marginTop: "16px" }}>
          <p style={{ marginBottom: "6px", fontSize: "15px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("signature_date") || getValue("agreement_date") || getValue("date"))}</p>
          <p style={{ marginBottom: "6px", fontSize: "15px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "갑(유가족 대표) 성명:" : locale === "en" ? "Party A (Family Representative) Name:" : "甲方（家属代表）姓名："}</p>
          <p style={{ marginBottom: "6px", fontSize: "15px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "을(사업장 대표) 성명:" : locale === "en" ? "Party B (Company Representative) Name:" : "乙方（公司代表）姓名："}</p>
        </div>
      </div>
      </AutoFitContent>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      {showWatermark && <div className="absolute inset-0 pointer-events-none" style={getWatermarkStyle()} />}
      
      <DocumentFooter locale={locale} />
      </div>
    )
  }
)

// 위임장 미리보기
const PowerOfAttorneyPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: PowerOfAttorneyData; getCheckboxValue: (key: string) => boolean }>(
  function PowerOfAttorneyPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate, showWatermark = true }, ref) {
    const title = locale === "ko" ? "위임장" : locale === "en" ? "Power of Attorney" : "委托书"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          // 푸터 하단 고정을 위해 하단 여백 확보 (푸터 겹침 방지)
          // 푸터 영역을 확보하되, 하단 빈 공간이 과도하지 않도록 조정
          padding: "22px 32px 180px 32px",
          fontSize: "16px",
          lineHeight: "1.4",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "geometricPrecision",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
      <style>{`
        /* zh-CN 폰트 강제 (FangSong 우선, 없으면 next/font Noto Serif SC로 fallback) */
        [data-preview-id="document-preview"][data-locale="zh-CN"],
        [data-preview-id="document-preview"][data-locale="zh-CN"] * {
          font-family: "FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", var(--font-noto-sans-kr), "Noto Sans KR", serif !important;
        }
        [data-preview-id="document-preview"] table td,
        [data-preview-id="document-preview"] table th {
          padding: 6px 10px !important;
          line-height: 1.35 !important;
          vertical-align: middle;
        }
        [data-preview-id="document-preview"] .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1 }}>
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "10px", fontSize: "28px", lineHeight: "1.25", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 위임인 */}
      <div style={{ marginBottom: "14px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "18px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "1. 위임인" : locale === "en" ? "1. Principal" : "1. 委托人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("principal_birthdate"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "여권번호" : locale === "en" ? "Passport Number" : "护照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_passport")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : "本国身份证号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_id_number")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국주소" : locale === "en" ? "Home Address" : "本国地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("principal_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 수임인 */}
      <div className="mb-3">
        <h2 className="font-bold mb-2" style={{ fontSize: "18px" }}>{locale === "ko" ? "2. 수임인" : locale === "en" ? "2. Attorney" : "2. 受托人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>710409-1******</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사업장명" : locale === "en" ? "Office Name" : "事务所名称"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>214-09-16365</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "대표 변호사" : locale === "en" ? "Managing Attorney" : "代表律师"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>031-8044-8805</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 복 대리인 */}
      <div style={{ marginBottom: "12px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "8px", fontSize: "18px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "3. 수임인 복 대리인" : locale === "en" ? "3. Sub-Attorney" : "3. 复代理人"}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
            <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주성규" : locale === "en" ? "Joo Seong-gyu" : "朱성규"}</td>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>620613-1******</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "국장" : locale === "en" ? "Director" : "局长"}</td>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>010-7152-7094</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</td>
              </tr>
            </tbody>
          </table>
        </div>

      {/* 위임업무 */}
      <div className="mb-3">
        <h2 className="font-bold mb-2" style={{ fontSize: "18px" }}>{locale === "ko" ? "위임업무" : locale === "en" ? "Authorized Tasks" : "委托业务"}</h2>
        <div className="grid grid-cols-2 gap-1" style={{ fontSize: "13px" }}>
          {[
            { key: "civil_criminal", label: { ko: "민·형사소송 위임", en: "Civil/Criminal Litigation", "zh-CN": "民事/刑事诉讼委托" } },
            { key: "labor_complaint", label: { ko: "노동부진정서 위임", en: "Labor Complaint", "zh-CN": "劳动部申诉委托" } },
            { key: "wage_claim", label: { ko: "임금체불 및 수령행위", en: "Wage Claim", "zh-CN": "工资拖欠及领取" } },
            { key: "damages_claim", label: { ko: "손해배상청구 위임", en: "Damages Claim", "zh-CN": "损害赔偿请求委托" } },
            { key: "death_insurance", label: { ko: "사망보험금 청구 및 수령행위 일체권한", en: "Death Insurance Claim", "zh-CN": "死亡保险金请求及领取全部权限" } },
            { key: "insurance_claim", label: { ko: "보험금청구 및 수령행위", en: "Insurance Claim", "zh-CN": "保险金请求及领取" } },
            { key: "deposit_withdrawal", label: { ko: "공탁출금 및 수령행위", en: "Deposit Withdrawal", "zh-CN": "提存提取及领取" } },
            { key: "criminal_settlement", label: { ko: "형사합의", en: "Criminal Settlement", "zh-CN": "刑事和解" } },
            { key: "severance_claim", label: { ko: "퇴직금청구 및 급여정산 수령행위", en: "Severance Claim", "zh-CN": "退休金请求及工资结算领取" } },
            { key: "financial_inquiry", label: { ko: "금융권 내역사실 확인", en: "Financial Inquiry", "zh-CN": "金融机构明细事实确认" } },
            { key: "civil_settlement", label: { ko: "민사합의", en: "Civil Settlement", "zh-CN": "民事和解" } },
            { key: "insurance_settlement", label: { ko: "보험사합의", en: "Insurance Settlement", "zh-CN": "保险公司和解" } },
            { key: "departure_insurance", label: { ko: "출국보험청구및수령행위", en: "Departure Insurance Claim", "zh-CN": "出境保险请求及领取" } },
            { key: "funeral_expenses", label: { ko: "장제비청구 등", en: "Funeral Expenses Claim", "zh-CN": "丧葬费请求等" } },
          ].map((task) => (
            <div key={task.key} className="flex items-center">
              <span className="mr-2">{getCheckboxValue(`authorized_tasks.${task.key}`) ? "☑" : "☐"}</span>
              <span>{task.label[locale as keyof typeof task.label]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 서명란 (센터링) */}
      <div className="mt-4" style={{ textAlign: "center" }}>
        <p className="mb-2" style={{ fontSize: "14px" }}>{locale === "ko" ? "위 위임인은 수임인 및 복 대리인에게 위와 같이 위임 업무를 위임 합니다." : locale === "en" ? "The above principal hereby delegates the above tasks to the attorney and sub-attorney." : "上述委托人特此将上述委托业务委托给受托人及复代理人。"}</p>
        <div className="mt-2 space-y-1">
          <p style={{ fontSize: "14px" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("power_date"))}</p>
          <p style={{ fontSize: "14px" }}>{locale === "ko" ? "위임인(외국인 부/모):" : locale === "en" ? "Principal (Foreign Parent):" : "委托人（外国人父/母）："}</p>
          <p style={{ fontSize: "14px" }}>{locale === "ko" ? "수임인 변호사 이택기 (인)" : locale === "en" ? "Attorney Lee Taek-gi (Seal)" : "受托人 律师 李택기（印）"}</p>
          <p style={{ fontSize: "14px" }}>{locale === "ko" ? "수임인 복 대리인 주성규(인)" : locale === "en" ? "Sub-Attorney Joo Seong-gyu (Seal)" : "复代理人 周성규（印）"}</p>
        </div>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      {showWatermark && <div className="absolute inset-0 pointer-events-none" style={getWatermarkStyle()} />}
      
      <DocumentFooter locale={locale} />
      </div>
    )
  }
)

// 변호인선임서 미리보기
const AttorneyAppointmentPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: AttorneyAppointmentData }>(
  function AttorneyAppointmentPreview({ data, locale, fontClass, getValue, formatDate, showWatermark = true }, ref) {
    const title = locale === "ko" ? "변호인 선임서" : locale === "en" ? "Appointment of Counsel" : "律师任命书"
    // zh-CN: FangSong이 있으면 우선 사용. 없으면 next/font로 로드된 Noto Serif SC(css var)로 확실히 fallback.
    const zhFontFamily = '"FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", serif'
    const baseFontFamily =
      locale === "ko"
        ? '"Noto Sans KR", sans-serif'
        : locale === "zh-CN"
          ? zhFontFamily
          : "system-ui, sans-serif"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          // 푸터 하단 고정을 위해 하단 여백 확보 (푸터 겹침 방지)
          padding: "25px 35px 180px 35px",
          fontSize: "18px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "geometricPrecision",
          fontFamily: baseFontFamily,
        }}
      >
      <style>{`
        /* zh-CN 폰트 강제 (FangSong 우선, 없으면 next/font Noto Serif SC로 fallback) */
        [data-preview-id="document-preview"][data-locale="zh-CN"],
        [data-preview-id="document-preview"][data-locale="zh-CN"] * {
          font-family: "FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", var(--font-noto-sans-kr), "Noto Sans KR", serif !important;
        }
        [data-preview-id="document-preview"] table td,
        [data-preview-id="document-preview"] table th {
          padding: 6px 10px !important;
          line-height: 1.35 !important;
          vertical-align: middle;
        }
        [data-preview-id="document-preview"] .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1, flex: "1", display: "flex", flexDirection: "column", fontFamily: baseFontFamily }}>
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "33px", lineHeight: "1.4", fontFamily: baseFontFamily }}>{title}</h1>

      {/* 사건 정보 */}
      <div className="mb-4">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사건" : locale === "en" ? "Case" : "案件"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("case_number")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "피해자" : locale === "en" ? "Victim" : "受害者"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("victim")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 서문 */}
      <p className="mb-4 leading-relaxed" style={{ fontSize: "17px", fontFamily: baseFontFamily }}>
        {locale === "ko"
          ? "위 사건에 관하여 아래와 같이 변호인을 선임하였음으로 이이 변호인 선임서를 제출합니다."
          : locale === "en"
          ? "Regarding the above case, we hereby appoint counsel as follows and submit this appointment of counsel form."
          : "就上述案件，特此任命如下律师，并提交此律师任命书。"}
      </p>

      {/* 선임인 정보 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "21px", fontFamily: baseFontFamily }}>{locale === "ko" ? "선임인 가족대표자" : locale === "en" ? "Appointer's Family Representative" : "任命人家属代表"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0", fontFamily: baseFontFamily }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("appointer_name")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "본국신분증번호" : locale === "en" ? "National ID Number" : "本国身份证号"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("appointer_id_number")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "관계" : locale === "en" ? "Relation" : "关系"}</td>
              <td className="border border-gray-400 px-3 py-2">
                {getValue("appointer_relation") === "기타" ? getValue("appointer_relation_other") : getValue("appointer_relation")}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 변호인 정보 */}
      <div className="mb-4">
        <div className="flex">
          <div className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center" style={{ fontSize: "15px", width: "18%", fontFamily: baseFontFamily }}>{locale === "ko" ? "변호인" : locale === "en" ? "Counsel" : "律师"}</div>
          <div className="border border-gray-400 px-3 py-2" style={{ fontSize: "15px", width: "82%", fontFamily: baseFontFamily }}>
            <p style={{ fontWeight: "600", marginBottom: "4px", lineHeight: "1.5", fontFamily: baseFontFamily }}>{locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"}</p>
            <p style={{ fontWeight: "600", marginBottom: "4px", lineHeight: "1.5", fontFamily: baseFontFamily }}>{locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"}</p>
            <p style={{ marginBottom: "4px", lineHeight: "1.5", fontFamily: baseFontFamily }}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</p>
            <p>{locale === "ko" ? "전화" : locale === "en" ? "Phone" : "电话"}: 031-8044-8805 {locale === "ko" ? "팩스" : locale === "en" ? "Fax" : "传真"}: 031-491-8817</p>
          </div>
        </div>
      </div>

      {/* 일자 및 수신처 */}
      <div className="mt-6" style={{ marginTop: "auto" }}>
        <p className="mb-3" style={{ fontSize: "17px", textAlign: "center" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("appointment_date"))}</p>
        <p className="text-center mt-4" style={{ fontSize: "17px" }}>{getValue("court") || "의정부지방법원"} {locale === "ko" ? "귀중" : locale === "en" ? "" : "收"}</p>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      {showWatermark && <div className="absolute inset-0 pointer-events-none" style={getWatermarkStyle()} />}
      
      <DocumentFooter locale={locale} />
      </div>
    )
  }
)

// 소송위임장 미리보기
const LitigationPowerPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: LitigationPowerData; getCheckboxValue: (key: string) => boolean }>(
  function LitigationPowerPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate, showWatermark = true }, ref) {
    const title = locale === "ko" ? "소송위임장" : locale === "en" ? "Litigation Power of Attorney" : "诉讼委托书"
    const FOOTER_SAFE_SPACE_PX = 180
    const A4_HEIGHT_PX = 1123
    const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - FOOTER_SAFE_SPACE_PX

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          // 푸터 하단 고정을 위해 하단 여백 확보 (푸터 겹침 방지)
          padding: "0",
          // 영문은 문장/라벨이 길어 과밀해질 수 있어 약간 컴팩트하게
          fontSize: locale === "en" ? "16px" : "18px",
          lineHeight: locale === "en" ? "1.45" : "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          textRendering: "geometricPrecision",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
      <style>{`
        /* zh-CN 폰트 강제 (FangSong 우선, 없으면 next/font Noto Serif SC로 fallback) */
        [data-preview-id="document-preview"][data-locale="zh-CN"],
        [data-preview-id="document-preview"][data-locale="zh-CN"] * {
          font-family: "FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", var(--font-noto-sans-kr), "Noto Sans KR", serif !important;
        }
        [data-preview-id="document-preview"] table td,
        [data-preview-id="document-preview"] table th {
          padding: 6px 10px !important;
          line-height: 1.35 !important;
          vertical-align: middle;
        }
        [data-preview-id="document-preview"] .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      `}</style>
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1 }}>
      <AutoFitContent
        targetHeightPx={CONTENT_HEIGHT_PX}
        minScale={locale === "en" ? 0.82 : 0.85}
        innerPadding={"25px 35px 0 35px"}
        verticalAlign="top"
      >
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "33px", lineHeight: "1.4", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 사건 정보 */}
      <div className="mb-4">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "15px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사건" : locale === "en" ? "Case" : "案件"}</td>
              <td className="border border-gray-400 px-3 py-2" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("case_number")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "원고" : locale === "en" ? "Plaintiff" : "原告"}</td>
              <td className="border border-gray-400 px-3 py-2" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("plaintiff")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "피고" : locale === "en" ? "Defendant" : "被告"}</td>
              <td className="border border-gray-400 px-3 py-2" style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("defendant")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 서문 */}
      <p className="mb-4 leading-relaxed" style={{ fontSize: "17px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
        {locale === "ko"
          ? "위 사건에 관하여 아래의 수임인을 원고의 소송대리인으로 선임하고, 아래와 같은 권한을 수여합니다."
          : locale === "en"
          ? "Regarding the above case, the undersigned appointee is appointed as the plaintiff's litigation representative, and the following powers are granted."
          : "就上述案件，特此任命以下受托人为原告的诉讼代理人，并授予以下权限。"}
      </p>

      {/* 수임인 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수임인" : locale === "en" ? "Appointee" : "受托人"}</h2>
        <div style={{ border: "1px solid #9ca3af", padding: "12px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontWeight: "600", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"}</span>
            <span style={{ fontWeight: "600", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</span>
            <span style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "전화" : locale === "en" ? "Phone" : "电话"}: 031-8044-8805 {locale === "ko" ? "팩스" : locale === "en" ? "Fax" : "传真"}: 031-491-8817</span>
          </div>
        </div>
      </div>

      {/* 수권사항 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "16px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수권사항" : locale === "en" ? "Granted Powers" : "授权事项"}</h2>
        <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
          <p style={{ marginBottom: "8px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>1. {locale === "ko" ? "일체의 소송행위(반소 및 상소의 제기 및, 가압류, 가처분, 경매 등 민사집행법에 따른 신청 및 이의절차 일체)" : locale === "en" ? "All litigation acts (counterclaims, appeals, provisional measures, and all procedures under the Civil Execution Act)" : "一切诉讼行为（包括提起反诉和上诉、假扣押、假处分、拍卖等根据民事执行法的申请及异议程序全部）"}</p>
          <p style={{ marginBottom: "8px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>2. {locale === "ko" ? "기록복사 및 열람, 변제의 수령, 복대리인의 선임" : locale === "en" ? "Copying and viewing records, receiving payments, appointing sub-agents" : "记录复制及查阅、接收付款、任命复代理人"}</p>
          <p style={{ marginBottom: "8px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>3. {locale === "ko" ? "재판상 또는 재판외의 화해" : locale === "en" ? "Settlement in or out of court" : "审判上或审判外和解"}</p>
          <p style={{ marginBottom: "8px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>4. {locale === "ko" ? "담보권 행사 및 최고신청, 소송비용 확정 신청" : locale === "en" ? "Exercise of security rights, demand for payment, and determination of litigation costs" : "担保权行使及催告申请、诉讼费用确定申请"}</p>
          <p style={{ marginBottom: "8px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>5. {locale === "ko" ? "공탁신청 및 공탁금 납입행위, 공탁금 출급회 수청구 및 공탁통지서 수령행위, 공탁기록 열람/복사, 사실증명·청과 수령행위 일체" : locale === "en" ? "Deposit applications, withdrawals, record viewing/copying, and all related acts" : "提存申请及提存金缴纳行为、提存金提取请求及提存通知书接收行为、提存记录查阅/复制、事实证明请求及接收行为全部"}</p>
        </div>
      </div>

      {/* 기타 특별수권사항 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "21px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "기타 특별수권사항" : locale === "en" ? "Special Authority" : "其他特别授权事项"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: locale === "en" ? "11px" : "12px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "80%", minWidth: "80%", maxWidth: "80%" }} />
            <col style={{ width: "20%", minWidth: "20%", maxWidth: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수권사항" : locale === "en" ? "Granted Powers" : "授权事项"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수권여부" : locale === "en" ? "Grant Status" : "授权与否"}</td>
            </tr>
          </thead>
          <tbody>
            {[
              { 
                key: "withdrawal_of_suit", 
                label: { 
                  ko: "소의 취하: 제기된 소송의 전부 또는 일부를 철회하여 소송을 종료할 수 있는 권한", 
                  en: "Withdrawal of Suit: Authority to withdraw all or part of the lawsuit", 
                  "zh-CN": "诉讼撤回：撤回已提起的诉讼的全部或部分以终止诉讼的权限" 
                } 
              },
              { 
                key: "withdrawal_of_appeal", 
                label: { 
                  ko: "상소의 취하: 원심을 유지·확정하면서 상소의 신청을 철회할 수 있는 권한", 
                  en: "Withdrawal of Appeal: Authority to withdraw the appeal while maintaining the original judgment", 
                  "zh-CN": "上诉撤回：在维持和确认原审的同时撤回上诉申请的权限" 
                } 
              },
              { 
                key: "waiver_of_claim", 
                label: { 
                  ko: "청구의 포기: 위임인의 청구가 이유 없다고 인정하여 소송을 종료할 수 있는 권한", 
                  en: "Waiver of Claim: Authority to terminate the lawsuit by acknowledging the claim is groundless", 
                  "zh-CN": "请求放弃：承认委托人的请求无理由而终止诉讼的权限" 
                } 
              },
              { 
                key: "admission_of_claim", 
                label: { 
                  ko: "청구의 인낙: 상대방의 청구가 이유 있다고 인정하여 소송을 종료할 수 있는 권한", 
                  en: "Admission of Claim: Authority to terminate the lawsuit by acknowledging the opponent's claim is valid", 
                  "zh-CN": "请求承认：承认对方的请求有理由而终止诉讼的权限" 
                } 
              },
              { 
                key: "withdrawal_from_suit", 
                label: { 
                  ko: "소송 탈퇴: 제3자가 소송에 참가한 경우 그 소송에서 탈퇴할 수 있는 권한(민사소송법 제80조에 따른 탈퇴)", 
                  en: "Withdrawal from Litigation: Authority to withdraw if a third party has intervened (Article 80)", 
                  "zh-CN": "诉讼退出：第三人参加诉讼时从该诉讼中退出的权限（根据民事诉讼法第80条的退出）" 
                } 
              },
            ].map((item) => {
              // special_authority.withdrawal_of_suit 형태의 키로 값 가져오기
              const value = getValue(`special_authority.${item.key}`)
              return (
                <tr key={item.key}>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {item.label[locale as keyof typeof item.label]}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "10px 15px", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif", fontSize: "21px", fontWeight: "bold" }}>
                    {value === "O" || value === "o" ? "○" : "×"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{ marginTop: "8px", fontSize: "15px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          * {locale === "ko" ? "기타특별수권사항(권한을 부여하면 O표시, 보류하면 X표시)" : locale === "en" ? "Other special granted powers (mark O if granted, X if reserved)" : "其他特别授权事项（授权则标记○，保留则标记×）"}
        </p>
      </div>

      {/* 일자 및 서명 */}
      <div style={{ marginTop: "18px", textAlign: "center" }}>
        <p style={{ marginBottom: "10px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("power_date"))}</p>
        <div style={{ marginBottom: "8px", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "baseline", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
            <span style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "위임인 가족대표 성명:" : locale === "en" ? "Principal's Family Representative Name:" : "委托人家属代表姓名："}</span>
            <span style={{ marginLeft: "4px", borderBottom: getValue("principal_name") ? "1px solid #000" : "none", minWidth: getValue("principal_name") ? "100px" : "0", paddingBottom: getValue("principal_name") ? "2px" : "0", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_name") || ""}</span>
            <span style={{ marginLeft: "2px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "(인)" : locale === "en" ? "(Seal)" : "（印）"}</span>
          </div>
        </div>
        <p style={{ marginBottom: "8px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국신분증번호:" : locale === "en" ? "National ID Number:" : "本国身份证号："} {getValue("principal_id_number")}</p>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("court") || "의정부지방법원"} {locale === "ko" ? "귀중" : locale === "en" ? "" : "收"}</p>
      </div>
      </AutoFitContent>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      {showWatermark && <div className="absolute inset-0 pointer-events-none" style={getWatermarkStyle()} />}
      
      <DocumentFooter locale={locale} />
      </div>
    )
  }
)

// 사망보험금지급동의 미리보기
const InsuranceConsentPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: InsuranceConsentData }>(
  function InsuranceConsentPreview({ data, locale, fontClass, getValue, formatDate, showWatermark = true }, ref) {
    const title = locale === "ko"
      ? "사망보험금 지급 동의 법정상속인 확인서"
      : locale === "en"
      ? "Death Insurance Payment Consent Legal Heir Confirmation"
      : "死亡保险金支付同意法定继承人确认书"

    const FOOTER_SAFE_SPACE_PX = 180
    const A4_HEIGHT_PX = 1123
    const CONTENT_HEIGHT_PX = A4_HEIGHT_PX - FOOTER_SAFE_SPACE_PX
    const cellFontFamily =
      locale === "ko"
        ? '"Noto Sans KR", "Noto Sans", sans-serif'
        : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : "system-ui, -apple-system, sans-serif"
    // A4 양식이라 "행 높이"가 충분히 있어야 꽉 차 보임
    const tdBase = { border: "1px solid #9ca3af", fontFamily: cellFontFamily, height: "34px" }
    const thBase = {
      ...tdBase,
      backgroundColor: "#f3f4f6",
      fontWeight: 600,
      textAlign: "center" as const,
    }

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "0",
          // 기본 텍스트가 너무 작게 느껴져 한 단계 키움 (overflow는 AutoFit으로 처리)
          fontSize: "16px",
          lineHeight: "1.42",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: cellFontFamily,
        }}
      >
      <style>{`
        /* zh-CN 폰트 강제 (FangSong 우선, 없으면 next/font Noto Serif SC로 fallback) */
        [data-preview-id="document-preview"][data-locale="zh-CN"],
        [data-preview-id="document-preview"][data-locale="zh-CN"] * {
          font-family: "FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", var(--font-noto-sans-kr), "Noto Sans KR", serif !important;
        }
        /* 이 문서는 "작성칸"이 잘 보이도록 표 행 높이를 충분히 준다 */
        [data-preview-id="document-preview"] table td,
        [data-preview-id="document-preview"] table th {
          padding: 7px 12px !important;
          line-height: 1.36 !important;
          vertical-align: middle;
        }
        [data-preview-id="document-preview"] .bg-gray-100 {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        /* 영문/중문 긴 문자열이 표 밖으로 튀어나가며 깨지는 현상 방지 */
        [data-preview-id="document-preview"] td,
        [data-preview-id="document-preview"] th,
        [data-preview-id="document-preview"] p,
        [data-preview-id="document-preview"] span {
          overflow-wrap: anywhere;
          word-break: break-word;
        }
      `}</style>
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1 }}>
      <AutoFitContent
        targetHeightPx={CONTENT_HEIGHT_PX}
        // 내용이 길면 축소해서 한 장에, 내용이 짧으면 살짝 키워서 "A4 꽉 찬" 느낌을 만든다.
        // 업스케일(>1) 시에도 AutoFitContent가 레이아웃 폭을 역보정하여 A4 폭에 맞춘다.
        minScale={0.78}
        maxScale={1.16}
        innerPadding={"20px 26px 0 26px"}
        // 동의서는 위에서 시작하는 양식이라 상단 정렬이 자연스럽다.
        verticalAlign="top"
      >
      <h1 className="text-center font-bold mb-2" style={{ fontSize: "22px", lineHeight: "1.15", fontFamily: cellFontFamily }}>{title}</h1>

      {/* 수신/발신 정보 */}
      <div className="mb-1">
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "14px", tableLayout: "fixed", borderSpacing: "0", fontFamily: cellFontFamily }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={thBase}>{locale === "ko" ? "수신" : locale === "en" ? "Recipient" : "收件"}</td>
              <td style={tdBase}>{getValue("recipient_company") || "삼성화재해상보험주식회사"}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "발신" : locale === "en" ? "Sender" : "发件"}</td>
              <td style={tdBase}>{getValue("sender_company")}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td style={tdBase}>{getValue("sender_registration")}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={tdBase}>{getValue("sender_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 고인 정보 */}
      <div className="mb-1">
        <h2 className="font-bold mb-1" style={{ fontSize: "16px", fontFamily: cellFontFamily }}>{locale === "ko" ? "고인 (피보험자)" : locale === "en" ? "Deceased (Insured Person)" : "死者（被保险人）"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "10px", fontSize: "14px", tableLayout: "fixed", borderSpacing: "0", fontFamily: cellFontFamily }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={thBase}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={tdBase}>{getValue("insured_name")}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "거소신고" : locale === "en" ? "Residence Registration" : "居所申报"}</td>
              <td style={tdBase}>{getValue("insured_registration")}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={tdBase}>{formatDate(getValue("insured_birthdate"))}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "성별" : locale === "en" ? "Gender" : "性别"}</td>
              <td style={tdBase}>{getValue("insured_gender") || ""}</td>
            </tr>
            <tr>
              <td style={thBase}>{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={tdBase}>{getValue("insured_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 보험계약 정보 */}
      <div className="mb-1">
        <h2 className="font-bold mb-1" style={{ fontSize: "16px", fontFamily: cellFontFamily }}>{locale === "ko" ? "보험계약사항" : locale === "en" ? "Insurance Contract Details" : "保险合同事项"}</h2>
        <div className="space-y-1" style={{ fontSize: "14px", fontFamily: cellFontFamily }}>
          <p><strong>{locale === "ko" ? "가. 보험상품명:" : locale === "en" ? "a. Insurance Product Name:" : "a. 保险产品名称："}</strong> {getValue("insurance_product")}</p>
          <p><strong>{locale === "ko" ? "나. 보험계약자:" : locale === "en" ? "b. Policyholder:" : "b. 投保人："}</strong> {getValue("policyholder")}</p>
          <p><strong>{locale === "ko" ? "다. 피보험자:" : locale === "en" ? "c. Insured Person:" : "c. 被保险人："}</strong> {getValue("insured_name")}</p>
          <p><strong>{locale === "ko" ? "라. 계약 일자:" : locale === "en" ? "d. Contract Date:" : "d. 合同日期："}</strong> {getValue("contract_date_1")} {getValue("contract_date_2") && `+ ${getValue("contract_date_2")}`}</p>
        </div>
      </div>

      {/* 법정상속인 */}
      <div className="mb-1">
        <h2 className="font-bold mb-1" style={{ fontSize: "16px", fontFamily: cellFontFamily }}>{locale === "ko" ? "법정상속인" : locale === "en" ? "Legal Heirs" : "法定继承人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "12px", fontSize: "14px", tableLayout: "fixed", borderSpacing: "0", fontFamily: cellFontFamily }}>
          <colgroup>
            <col style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }} />
            <col style={{ width: "34%", minWidth: "34%", maxWidth: "34%" }} />
            <col style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }} />
          </colgroup>
          <thead>
            <tr>
              <td style={thBase}>{locale === "ko" ? "본국성명" : locale === "en" ? "Name in Home Country" : "本国姓名"}</td>
              <td style={thBase}>{locale === "ko" ? "본국 신분증번호" : locale === "en" ? "Home Country ID Number" : "本国身份证号"}</td>
              <td style={thBase}>{locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relationship to Insured" : "与投保人关系"}</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdBase}>{getValue("heir_1_name")}</td>
              <td style={tdBase}>{getValue("heir_1_id")}</td>
              <td style={{ ...tdBase, textAlign: "center" }}>{locale === "ko" ? "부" : locale === "en" ? "Father" : "父"}</td>
            </tr>
            <tr>
              <td style={tdBase}>{getValue("heir_2_name")}</td>
              <td style={tdBase}>{getValue("heir_2_id")}</td>
              <td style={{ ...tdBase, textAlign: "center" }}>{locale === "ko" ? "모" : locale === "en" ? "Mother" : "母"}</td>
            </tr>
            {/* 작성용 빈 행 (A4 서식처럼 꽉 차 보이도록) */}
            {Array.from({ length: 3 }).map((_, idx) => (
              <tr key={`heir_blank_${idx}`}>
                <td style={tdBase} />
                <td style={tdBase} />
                <td style={tdBase} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 일자 및 수신처 */}
      <div style={{ marginTop: "10px", paddingTop: "6px" }}>
        <p className="mb-1" style={{ fontSize: "14px", fontFamily: cellFontFamily }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("consent_date"))}</p>
        <p className="text-center mt-1" style={{ fontSize: "14px", fontFamily: cellFontFamily }}>{getValue("recipient_company") || "삼성화재해상보험주식회사"} {locale === "ko" ? "귀하" : locale === "en" ? "" : "收"}</p>
      </div>
      </AutoFitContent>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      {showWatermark && <div className="absolute inset-0 pointer-events-none" style={getWatermarkStyle()} />}
      
      <DocumentFooter locale={locale} />
      </div>
    )
  }
)


// ============================================================================
// OLD-case 프리뷰 컴포넌트들 (HTML/CSS로 문서 구조 재현)
// ============================================================================

// 공통 스타일
const oldCaseFontFamily = (locale: "ko" | "en" | "zh-CN") => 
  locale === "ko" 
    ? '"Noto Sans KR", sans-serif' 
    : locale === "zh-CN" 
      ? '"FangSong", "STFangsong", var(--font-noto-serif-sc), "Noto Serif SC", serif'
      : "system-ui, sans-serif"

const oldCaseBaseStyle: React.CSSProperties = {
  width: "794px",
  height: "1123px",
  minHeight: "1123px",
  maxHeight: "1123px",
  position: "relative",
  backgroundColor: "#ffffff",
  padding: "60px 50px",
  boxSizing: "border-box",
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#000000",
}

const oldCaseTableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "20px",
  fontSize: "14px",
}

const oldCaseThStyle: React.CSSProperties = {
  border: "1px solid #000000",
  padding: "8px 12px",
  backgroundColor: "#f9f9f9",
  textAlign: "left",
  fontWeight: "normal",
  width: "20%",
}

const oldCaseTdStyle: React.CSSProperties = {
  border: "1px solid #000000",
  padding: "8px 12px",
  textAlign: "left",
}

// 합의서 OLD-case 미리보기
const AgreementOldPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: AgreementData }>(
  function AgreementOldPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
    // Locale에 따른 폰트 설정
    const fontFamily = locale === "ko" 
      ? '"Batang", "바탕", "BatangChe", "Noto Serif KR", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : '"Times New Roman", "Georgia", serif'
    
    // 번역 텍스트
    const translations = {
      ko: {
        title: "합 의 서",
        partyA: "\"갑\" 유가족 대표",
        partyB: "\"을\" 회사측 대표",
        nationality: "국적",
        name: "성명",
        birthdate: "생년월일",
        idNumber: "본국신분증번호",
        relation: "사망자와관계",
        address: "본국주소",
        addressPartyB: "주소",
        companyName: "상호",
        representative: "대표",
        bizNumber: "사업자번호",
        incidentTime: "일시",
        foreignerId: "외국인등록번호",
        occurred: "발생한",
        deceased: "위 고인.",
        related: "의 사망과 관련하여 상기",
        partyADesc: "은 사망자 유족대표라 하고",
        partyBDesc: "은 사업장 대표라 칭. 한다.",
        agree: "다음과 같이",
        agree2: "은 합의 한다.",
        clause1: "은 위 사건과 관련하여",
        clause1_2: "과 원만히 합의를 보았으며 추후, 민, 형사상. 에 관하여 그 어떠한 이의도 제기하지 않는다.",
        clause2: "위 사건과 관련하여",
        clause2_2: "은",
        clause2_3: "의 대표자에게 처벌을 원하지 아니하며 이에",
        clause2_4: "은 처벌불원서를 합의서 와 함께 제출 합니다.",
        conclusion: "- 이상과 같이",
        conclusion2: "은 자유 의사에 반하여 민, 형사상 원만히 합의를 하였으며",
        conclusion3: "은 이에 대하여 이의가 없음을 확인하고",
        conclusion4: "사망과 관련하여 이의를 제기하지 않을 것을 확인하며 그 증거로 이 합의서에 각자 서명 날인 한다.",
        court: "귀하"
      },
      en: {
        title: "SETTLEMENT AGREEMENT",
        partyA: "\"Party A\" (Family Representative)",
        partyB: "\"Party B\" (Company Representative)",
        nationality: "Nationality",
        name: "Name",
        birthdate: "Date of Birth",
        idNumber: "National ID No.",
        relation: "Relationship to Deceased",
        address: "Home Address",
        addressPartyB: "Address",
        companyName: "Company",
        representative: "Representative",
        bizNumber: "Business Reg. No.",
        incidentTime: "Date/Time",
        foreignerId: "Alien Registration No.",
        occurred: "Occurred at",
        deceased: "Regarding the death of the above person,",
        related: "",
        partyADesc: "",
        partyBDesc: "",
        agree: "",
        agree2: "Party A (family representative) and Party B (workplace/company representative) agree as follows:",
        clause1: "Party A and Party B have reached an amicable settlement. Party A shall not raise any objection in the future in any civil or criminal matter related to this incident.",
        clause1_2: "",
        clause2: "Party A does not request punishment of Party B's representative in connection with this incident and shall submit a non-punishment statement together with this agreement.",
        clause2_2: "",
        clause2_3: "",
        clause2_4: "",
        conclusion: "The Parties confirm that this settlement is made of their own free will in both civil and criminal aspects, and that they have no objection.",
        conclusion2: "The Parties further confirm they will not raise any claims regarding the death of",
        conclusion3: "",
        conclusion4: "As evidence, the Parties sign and seal this agreement.",
        court: "To:"
      },
      "zh-CN": {
        title: "和 解 协 议 书",
        partyA: "\"甲\" 遗属代表",
        partyB: "\"乙\" 公司方代表",
        nationality: "国 籍",
        name: "姓 名",
        birthdate: "出生年月日",
        idNumber: "本国身份证号码",
        relation: "与死者关系",
        address: "本国住址",
        addressPartyB: "地址",
        companyName: "商 号",
        representative: "代 表",
        bizNumber: "事业者登记号",
        incidentTime: "日 时",
        foreignerId: "外国人登记号",
        occurred: "发生",
        deceased: "关于上述故人",
        related: "之死亡相关事宜，",
        partyADesc: "",
        partyBDesc: "",
        agree: "",
        agree2: "甲作为死者遗属代表，乙作为事业场代表，甲乙双方如下达成协议。",
        clause1: "甲就本事件与乙已友好协商解决，今后就民事、刑事等任何事项不再提出任何异议。",
        clause1_2: "",
        clause2: "甲就本事件不要求对乙之代表人予以处罚，并与本协议一并提交不予处罚意向书(不处罚申请/撤诉意向)。",
        clause2_2: "",
        clause2_3: "",
        clause2_4: "",
        conclusion: "甲乙双方出于自由意思就民事、刑事事宜达成圆满协议，并确认对本协议无任何异议。",
        conclusion2: "并确认就",
        conclusion3: "死亡相关事宜不再提出异议。",
        conclusion4: "为此，双方在本协议上签名盖章。",
        court: "敬启"
      }
    }
    
    const t = translations[locale]
    
    // 날짜 파싱
    const agreementDate = getValue("agreement_date") || getValue("signature_date") || getValue("date")
    let year = ""
    let month = ""
    let day = ""
    
    if (agreementDate) {
      try {
        const date = new Date(agreementDate)
        year = String(date.getFullYear())
        month = String(date.getMonth() + 1).padStart(2, "0")
        day = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패 시 빈 값
      }
    }
    
    // 생년월일 포맷팅
    const formatBirthdate = (dateStr: string | undefined) => {
      if (!dateStr) return ""
      try {
        const date = new Date(dateStr)
        return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`
      } catch {
        return dateStr
      }
    }
    
    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          position: "relative",
          backgroundColor: "#ffffff",
          padding: "60px 70px 50px 70px", // 패딩 줄임
          boxSizing: "border-box",
          fontFamily,
          color: "#111",
          fontSize: "11.5pt", // 폰트 크기 약간 줄임
          lineHeight: "1.7", // line-height 줄임
          letterSpacing: "0.01em"
        }}
      >
        <style>{`
          .agreement-kv {
            display: flex;
            gap: 22.68px; /* 6mm */
            align-items: baseline;
            margin: 0;
          }
          .agreement-kv .k {
            width: ${locale === "en" ? "150px" : "90.72px"}; /* 24mm, wider for English to prevent wrapping */
            white-space: nowrap;
            font-family: ${fontFamily};
            font-size: 11.5pt;
            flex-shrink: 0;
          }
          .agreement-kv .v {
            flex: 1;
            min-width: 0;
            margin-left: ${locale === "en" ? "10px" : "0"};
            font-family: ${fontFamily};
            font-size: 11.5pt;
          }
          .agreement-blank {
            display: inline-block;
            min-width: ${locale === "en" ? "200px" : "264.6px"}; /* 70mm, adjusted for English */
          }
          .agreement-clauses {
            margin: 15px 0 0 0;
            padding-left: 22.68px; /* 6mm */
            list-style: decimal;
            list-style-position: outside;
          }
          .agreement-clauses li {
            margin: 8px 0;
            padding-left: 5px;
          }
        `}</style>
        
        {/* 제목 */}
        <div 
          className="title"
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: "17pt",
            letterSpacing: locale === "ko" ? "0.55em" : locale === "zh-CN" ? "0.3em" : "0.1em",
            textIndent: locale === "ko" ? "0.55em" : "0",
            margin: "0 0 30px 0",
            fontFamily
          }}
        >
          {t.title}
        </div>

        <div className="body" style={{ fontFamily, fontSize: "11.5pt", lineHeight: "1.7", letterSpacing: "0.01em" }}>
          {/* 갑 (유가족 대표) */}
          <div className="sec-head" style={{ marginTop: "15px", marginBottom: "5px", fontFamily, fontSize: "11.5pt" }}>{t.partyA}</div>

          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{locale === "ko" ? "1. " : ""}{t.nationality} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{getValue("party_a_nationality") || ""}</span></div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.name} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{getValue("party_a_name") || ""}</span></div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.birthdate} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{formatBirthdate(getValue("party_a_birthdate"))}</span></div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.idNumber} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{getValue("party_a_id_number") || ""}</span></div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.relation} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{getValue("party_a_relation") === "기타" || getValue("party_a_relation") === "Other" || getValue("party_a_relation") === "其他" ? getValue("party_a_relation_other") : (getValue("party_a_relation") || (locale === "ko" ? "부" : locale === "zh-CN" ? "父" : "Father"))}</span></div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.address} :</div>
            <div className="v" style={{ fontFamily }}><span className="agreement-blank">{getValue("party_a_address") || ""}</span></div>
          </div>

          {/* 을 (회사측 대표) */}
          <div className="sec-head" style={{ marginTop: "15px", marginBottom: "5px", fontFamily, fontSize: "11.5pt" }}>{t.partyB}</div>

          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.companyName} :</div>
            <div className="v" style={{ fontFamily }}>{getValue("party_b_company_name") || ""} {t.bizNumber} : {getValue("party_b_registration") || ""}</div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{t.representative} :</div>
            <div className="v" style={{ fontFamily }}>{getValue("party_b_representative") || ""}</div>
          </div>
          <div className="agreement-kv">
            <div className="k" style={{ fontFamily }}>{locale === "en" ? (t.addressPartyB || t.address) : t.address} :</div>
            <div className="v" style={{ fontFamily }}>{getValue("party_b_address") || ""}</div>
          </div>

          {/* 사망자 정보 */}
          <div className="indent" style={{ marginTop: "15px", fontFamily }}>
            <div className="agreement-kv">
              <div className="k">{t.incidentTime} :</div>
              <div className="v">{getValue("incident_time") || ""} {getValue("incident_location") || ""} {t.occurred}</div>
            </div>
            <div className="agreement-kv">
              <div className="k" style={{ fontFamily }}>{t.name} :</div>
              <div className="v" style={{ fontFamily }}>{getValue("deceased_name") || ""}</div>
            </div>
            <div className="agreement-kv">
              <div className="k" style={{ fontFamily }}>{t.foreignerId} :</div>
              <div className="v" style={{ fontFamily }}>{getValue("deceased_foreigner_id") || ""}{locale === "ko" ? "." : ""}</div>
            </div>
            <div className="agreement-kv">
              <div className="k" style={{ fontFamily }}>{t.birthdate} :</div>
              <div className="v" style={{ fontFamily }}>{formatBirthdate(getValue("deceased_birthdate"))}</div>
            </div>
            <div className="agreement-kv">
              <div className="k" style={{ fontFamily }}>{t.address} :</div>
              <div className="v" style={{ fontFamily }}>{getValue("deceased_address") || ""}{locale === "ko" ? "." : ""}</div>
            </div>
          </div>

          {/* 합의 문장 */}
          <div className="indent" style={{ marginTop: "15px", fontFamily, fontSize: "11.5pt", lineHeight: "1.7", textAlign: "justify" }}>
            {t.agree2}
          </div>

          {/* 조항 */}
          <ol className="agreement-clauses" style={{ fontFamily, fontSize: "11.5pt", lineHeight: "1.7" }}>
            <li style={{ fontFamily, fontSize: "11.5pt", lineHeight: "1.7" }}>
              {locale === "ko" ? (
                <>
                  {getValue("party_a_name") || "갑"} {t.clause1} {getValue("party_b_company_name") || "을"} {t.clause1_2}
                </>
              ) : (
                t.clause1
              )}
            </li>
            <li style={{ fontFamily, fontSize: "11.5pt", lineHeight: "1.7" }}>
              {locale === "ko" ? (
                <>
                  {t.clause2} {getValue("party_a_name") || "갑"} {t.clause2_2} {getValue("party_b_company_name") || "을"} {t.clause2_3} {getValue("party_a_name") || "갑"} {t.clause2_4}
                </>
              ) : (
                t.clause2
              )}
            </li>
          </ol>

          {/* 결론 */}
          <div className="conclusion" style={{ marginTop: "15px", fontFamily, fontSize: "11.5pt", lineHeight: "1.7", textAlign: "justify" }}>
            {t.conclusion} {t.conclusion2} {getValue("deceased_name") || ""} {formatBirthdate(getValue("deceased_birthdate"))} {t.conclusion3} {t.conclusion4}
          </div>

          {/* 날짜 */}
          <div className="date" style={{ textAlign: "center", margin: "15px 0 15px 0", letterSpacing: locale === "en" ? "0.1em" : "0.25em", fontFamily, fontSize: "11.5pt" }}>
            {year || ""}{locale === "en" ? "." : ""} {month || ""}{locale === "en" ? "." : ""} {day || ""}{locale === "en" ? "." : ""}
          </div>

          {/* 서명 */}
          <div className="sign" style={{ marginTop: "15px", fontFamily, fontSize: "11.5pt" }}>
            <div className="sign-line" style={{ display: "flex", gap: "22.68px", alignItems: "baseline", margin: "6px 0" }}>
              <div className="k" style={{ width: "52.92px", whiteSpace: "nowrap", fontFamily, fontSize: "11.5pt" }}>{locale === "ko" ? "\"갑\"" : locale === "zh-CN" ? "\"甲方\"" : "\"Party A\""}</div>
              <div className="v" style={{ flex: 1, fontFamily, fontSize: "11.5pt" }}>{t.name} : <span className="agreement-blank">{getValue("party_a_name") || ""}</span></div>
            </div>
            <div className="sign-line" style={{ display: "flex", gap: "22.68px", alignItems: "baseline", margin: "6px 0" }}>
              <div className="k" style={{ width: "52.92px", whiteSpace: "nowrap", fontFamily, fontSize: "11.5pt" }}>{locale === "ko" ? "\"을\"" : locale === "zh-CN" ? "\"乙方\"" : "\"Party B\""}</div>
              <div className="v" style={{ flex: 1, fontFamily, fontSize: "11.5pt" }}>{t.name} : {getValue("party_b_company_name") || ""} {locale === "ko" ? "대표" : locale === "zh-CN" ? "代表" : "Representative"} {getValue("party_b_representative") || ""}</div>
            </div>
          </div>

          {/* 법원 */}
          <div className="to-court" style={{ marginTop: "20px", textAlign: "left", fontFamily, fontSize: "11.5pt" }}>
            {(() => {
              const courtKo = getValue("court") || "의정부지방법원"
              if (locale === "ko") return courtKo
              // 법원 이름 번역
              try {
                const { translateCourtKoToEnZh } = require("@/lib/constants/courts")
                const translated = translateCourtKoToEnZh(courtKo)
                return translated[locale] || courtKo
              } catch {
                // Fallback
                if (locale === "zh-CN") {
                  if (courtKo === "의정부지방법원") return "议政府地方法院"
                  if (courtKo === "수원가정법원") return "水原家庭法院"
                } else {
                  if (courtKo === "의정부지방법원") return "Uijeongbu District Court"
                  if (courtKo === "수원가정법원") return "Suwon Family Court"
                }
                return courtKo
              }
            })()} {t.court}
          </div>
        </div>
      </div>
    )
  }
)

// 위임장 OLD-case 미리보기
const PowerOfAttorneyOldPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: PowerOfAttorneyData; getCheckboxValue: (key: string) => boolean }>(
  function PowerOfAttorneyOldPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate }, ref) {
    // Locale에 따른 폰트 설정
    const fontFamily = locale === "ko" 
      ? '"Batang", "바탕", "BatangChe", "Noto Serif KR", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : '"Times New Roman", "Georgia", serif'
    
    const monoFont = locale === "ko"
      ? '"Times New Roman", "Batang", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", serif'
        : '"Times New Roman", serif'
    
    // 번역 텍스트
    const translations = {
      ko: {
        title: "위 임 장",
        principal: "위임인",
        agent: "수임인",
        subAgent: "수임인의 복 대리인",
        name: "성 명",
        birthdate: "생 년 월 일",
        passport: "여 권 번 호",
        idNumber: "본국신분증번호",
        address: "본 국 주 소",
        residentId: "주민등록번호",
        contact: "연 락 처",
        businessName: "사업장명",
        position: "직 위",
        businessReg: "사업자등록번호",
        delegatedTasks: "위임업무",
        sentence: "위 위임인은 수임인 및 복 대리인에게 위와 같이 위임 업무를 위임 합니다.",
        principalSign: "위임인(외국인 부,모.)",
        agentSign: "수임인  변호사  이  택  기",
        subAgentSign: "수임인의복대리인  주  성  규",
        seal: "(인)",
        footerTitle: "법률사무소 세종 변호사",
        footerAddress: "(15378) 경기도 안산시 단원구 원곡로 45, 2층(원곡동, 세종빌딩)",
        footerTel: "전화",
        footerFax: "팩스",
        tasks: {
          civil_criminal: "민, 형사,소송 위임",
          labor_complaint: "근로복지정서 위임",
          wage_claim: "임금체불 및 수령행위",
          damages_claim: "손해배상청구위임",
          death_insurance: "사망보험금청구 및 수령행위 일체권한",
          insurance_claim: "보험금청구 및 수령행위",
          deposit_withdrawal: "공탁출급, 및 수령행위",
          criminal_settlement: "형사합의",
          severance_pay: "퇴직금청구 및 급여정산 수령행위.",
          financial_confirmation: "금융권 내역사실 확인",
          civil_settlement: "민사합의",
          insurance_settlement: "보험사합의",
          departure_insurance: "출국보험청구및수령행위",
          funeral_expenses: "장제비청구.등"
        }
      },
      en: {
        title: "POWER OF ATTORNEY",
        principal: "Principal",
        agent: "Attorney-in-fact",
        subAgent: "Sub-Agent (of the Attorney-in-fact)",
        name: "Name",
        birthdate: "Date of Birth",
        passport: "Passport No.",
        idNumber: "National ID No.",
        address: "Home Address (Country)",
        residentId: "Resident Reg. No.",
        contact: "Contact",
        businessName: "Business Name",
        position: "Title",
        businessReg: "Business Registration No.",
        delegatedTasks: "SCOPE OF AUTHORIZATION",
        sentence: "The Principal hereby authorizes the Attorney-in-fact and the Sub-Agent to handle the above matters.",
        principalSign: "Principal (Foreigner Father/Mother)",
        agentSign: "Attorney-in-fact LEE, Taek Gi",
        subAgentSign: "Sub-Agent JOO, Seong Gyu",
        seal: "(Seal/Sign)",
        footerTitle: "SEJONG LAW OFFICE, Attorney-at-Law",
        footerAddress: "(15378) 2F, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do (Wongok-dong, Sejong Bldg.)",
        footerTel: "Tel.",
        footerFax: "Fax.",
        tasks: {
          civil_criminal: "Civil/Criminal litigation matters",
          labor_complaint: "Workers' welfare service documents (근로복지공단)",
          wage_claim: "Wage arrears & receipt",
          damages_claim: "Claim for damages",
          death_insurance: "Death insurance benefit claim & receipt (full authority)",
          insurance_claim: "Insurance claim & receipt",
          deposit_withdrawal: "Court deposit withdrawal & receipt",
          criminal_settlement: "Criminal settlement",
          severance_pay: "Severance claim & payroll settlement receipt",
          financial_confirmation: "Verification of financial transaction records",
          civil_settlement: "Civil settlement",
          insurance_settlement: "Insurer settlement",
          departure_insurance: "Exit/Departure insurance claim & receipt",
          funeral_expenses: "Funeral expense claim, etc."
        }
      },
      "zh-CN": {
        title: "委 任 状",
        principal: "委任人",
        agent: "受任人",
        subAgent: "受任人的转委代理人(再代理人)",
        name: "姓 名",
        birthdate: "出生年月日",
        passport: "护照号码",
        idNumber: "本国身份证号码",
        address: "本国地址",
        residentId: "居民登记号",
        contact: "联络处",
        businessName: "事业场名",
        position: "职 位",
        businessReg: "营业者登记号",
        delegatedTasks: "【委 任 业 务】",
        sentence: "委任人现将上述委任业务委任给受任人及其再代理人。",
        principalSign: "委任人(外国人 父/母)",
        agentSign: "受任人 律师 李泽基",
        subAgentSign: "受任人之再代理人 朱成规",
        seal: "(印)",
        footerTitle: "世宗律师事务所 律师",
        footerAddress: "(15378) 京畿道 安山市 檀园区 元谷路 45号 2层(元谷洞, 世宗大厦)",
        footerTel: "电话",
        footerFax: "传真",
        tasks: {
          civil_criminal: "民/刑事诉讼委任",
          labor_complaint: "劳动福利公团(근로복지공단)文件委任",
          wage_claim: "工资拖欠及受领行为",
          damages_claim: "损害赔偿请求委任",
          death_insurance: "身故保险金请求及受领行为之一切权限",
          insurance_claim: "保险金请求及受领行为",
          deposit_withdrawal: "提存金领取及受领行为",
          criminal_settlement: "刑事和解",
          severance_pay: "退职金请求及工资结算受领行为",
          financial_confirmation: "金融机构明细事实确认",
          civil_settlement: "民事和解",
          insurance_settlement: "保险公司和解",
          departure_insurance: "出国保险请求及受领行为",
          funeral_expenses: "丧葬费请求等"
        }
      }
    }
    
    const t = translations[locale]
    
    // 날짜 파싱
    const powerDate = getValue("power_date")
    let year = ""
    let month = ""
    let day = ""
    
    if (powerDate) {
      try {
        const date = new Date(powerDate)
        year = String(date.getFullYear())
        month = String(date.getMonth() + 1).padStart(2, "0")
        day = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패
      }
    }
    
    // 위임업무 체크박스 값 가져오기 (templates.ts의 키와 매핑)
    const getTaskChecked = (key: string) => {
      // authorized_tasks가 배열인 경우
      const tasks = getValue("authorized_tasks")
      if (Array.isArray(tasks)) {
        return tasks.includes(key)
      }
      // authorized_tasks가 객체인 경우
      if (typeof tasks === "object" && tasks !== null) {
        return (tasks as any)[key] === true || (tasks as any)[key] === "true"
      }
      // 중첩 키로 접근
      return getCheckboxValue(`authorized_tasks.${key}`)
    }
    
    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          position: "relative",
          backgroundColor: "#ffffff",
          padding: "40px 53px 25px 53px",
          boxSizing: "border-box",
          fontFamily,
          color: "#111"
        }}
      >
        <style>{`
          .poa-title {
            text-align: center;
            font-weight: 800;
            font-size: 23pt;
            letter-spacing: 0.85em;
            text-indent: 0.85em;
            margin: 10px 0 15px 0;
            font-family: ${fontFamily};
          }
          .poa-sec {
            font-size: 12pt;
            font-weight: 600;
            margin: 12px 0 5px 0;
            font-family: ${fontFamily};
          }
          .poa-t {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            table-layout: fixed;
            border: 1.25px solid #4c4c4c;
            font-size: 11.5pt;
            margin: 0 0 12px 0;
            border-collapse: collapse;
          }
          .poa-t td {
            border: 1.25px solid #4c4c4c;
            vertical-align: middle;
            padding: 5px 7px;
            box-sizing: border-box;
          }
          .poa-k {
            width: ${locale === "en" ? "140px" : locale === "zh-CN" ? "130px" : "120px"};
            text-align: center;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
            font-weight: 600;
            white-space: nowrap;
            overflow: visible;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "12pt"};
          }
          .poa-k2 {
            width: ${locale === "en" ? "180px" : locale === "zh-CN" ? "170px" : "160px"};
            text-align: center;
            letter-spacing: 0.38em;
            text-indent: 0.38em;
            font-weight: 600;
            white-space: nowrap;
            overflow: visible;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "12pt"};
          }
          .poa-v {
            width: auto;
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            overflow: hidden;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "11.5pt"};
          }
          .poa-v2 {
            width: ${locale === "en" ? "200px" : locale === "zh-CN" ? "190px" : "180px"};
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            overflow: hidden;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "11.5pt"};
          }
          .poa-center {
            text-align: center;
          }
          .poa-mono {
            font-family: ${monoFont};
            letter-spacing: 0.03em;
          }
          .poa-k-addr {
            width: ${locale === "en" ? "140px" : locale === "zh-CN" ? "130px" : "120px"};
            text-align: center;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
            font-weight: 600;
            white-space: nowrap;
            overflow: visible;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "12pt"};
          }
          .poa-v-addr {
            width: auto;
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            overflow: hidden;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "11.5pt"};
          }
          .poa-k2-small {
            width: ${locale === "en" ? "180px" : locale === "zh-CN" ? "170px" : "160px"};
            text-align: center;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
            font-weight: 600;
            white-space: nowrap;
            overflow: visible;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "12pt"};
          }
          .poa-v2-small {
            width: ${locale === "en" ? "200px" : locale === "zh-CN" ? "190px" : "180px"};
            min-width: 0;
            word-wrap: break-word;
            overflow-wrap: break-word;
            overflow: hidden;
            font-family: ${fontFamily};
            font-size: ${locale === "en" ? "11pt" : locale === "zh-CN" ? "11pt" : "11.5pt"};
          }
          .poa-work {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            table-layout: fixed;
            border: 1.25px solid #4c4c4c;
            font-size: 11pt;
            margin-top: 3px;
            border-collapse: collapse;
          }
          .poa-work td {
            border: 1.25px solid #4c4c4c;
            vertical-align: middle;
            padding: 0;
            box-sizing: border-box;
          }
          .poa-wlbl {
            width: 136px;
            text-align: center;
            letter-spacing: 0.75em;
            text-indent: 0.75em;
            font-weight: 700;
            font-size: 11pt;
            font-family: ${fontFamily};
          }
          .poa-wbody {
            padding: 6px 10px;
            line-height: 1.5;
            letter-spacing: 0.01em;
            font-size: 11pt;
            font-family: ${fontFamily};
          }
          .poa-cb {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            margin-right: 20px;
            white-space: nowrap;
            font-size: 11pt;
          }
          .poa-box {
            width: 14px;
            height: 14px;
            border: 1.2px solid #222;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 8.5pt;
            line-height: 1;
            transform: translateY(-1px);
            flex-shrink: 0;
          }
          .poa-cb.checked .poa-box::after {
            content: "✓";
            font-weight: 800;
            font-size: 9pt;
          }
          .poa-sentence {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            margin: 10px 0 15px 0;
            font-size: 11.5pt;
            letter-spacing: 0.01em;
            line-height: 1.5;
            font-family: ${fontFamily};
          }
          .poa-date {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            text-align: center;
            font-size: 12pt;
            margin: 15px 0 15px 0;
            letter-spacing: 0.25em;
            font-family: ${fontFamily};
          }
          .poa-sign {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            font-size: 11.5pt;
            line-height: 1.7;
            margin-bottom: 10px;
            font-family: ${fontFamily};
          }
          .poa-sign-line {
            display: flex;
            justify-content: space-between;
            gap: 23px;
            margin-bottom: 3px;
          }
          .poa-sign-left {
            white-space: nowrap;
          }
          .poa-sign-right {
            width: 83px;
            text-align: right;
          }
          .poa-footer {
            width: ${locale === "en" ? "700px" : locale === "zh-CN" ? "695px" : "688px"};
            margin-top: 3px;
            padding-top: 3px;
            text-align: center;
            color: #111;
            font-family: ${fontFamily};
            position: relative;
          }
          .poa-footer .rule {
            border-top: 2px solid #3f3f3f;
            margin-bottom: 10px;
          }
          .poa-footer .f1 {
            font-size: 16pt;
            font-weight: 900;
            letter-spacing: 0.05em;
            line-height: 1.2;
          }
          .poa-footer .f2 {
            margin-top: 5px;
            font-size: 11pt;
            letter-spacing: 0.02em;
            line-height: 1.3;
          }
          .poa-footer .f3 {
            margin-top: 4px;
            font-size: 11pt;
            letter-spacing: 0.02em;
            line-height: 1.3;
          }
        `}</style>
        
        <div className="poa-title" style={{ fontFamily }}>{t.title}</div>

        {/* 1. 위임인 */}
        <div className="poa-sec" style={{ fontFamily }}>1. {t.principal}</div>
        <table className="poa-t">
          <tbody>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.name}</td>
            <td className="poa-v" style={{ fontFamily }}>{getValue("principal_name") || ""}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.birthdate}</td>
            <td className="poa-v2" style={{ fontFamily }}>{formatDate(getValue("principal_birthdate")) || ""}</td>
          </tr>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.passport}</td>
            <td className="poa-v" style={{ fontFamily }}>{getValue("principal_passport") || ""}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.idNumber}</td>
            <td className="poa-v2" style={{ fontFamily: monoFont }}>{getValue("principal_id_number") || ""}</td>
          </tr>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.address}</td>
            <td className="poa-v" colSpan={3} style={{ fontFamily }}>{getValue("principal_address") || ""}</td>
          </tr>
          </tbody>
        </table>

        {/* 2. 수임인 */}
        <div className="poa-sec" style={{ fontFamily }}>2. {t.agent}</div>
        <table className="poa-t">
          <tbody>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.name}</td>
            <td className="poa-v poa-center" style={{ fontFamily, fontWeight: 700, letterSpacing: "0.55em", textIndent: "0.55em" }}>{locale === "ko" ? "이 택 기" : locale === "zh-CN" ? "李택기" : "Lee Taek-gi"}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.residentId}</td>
            <td className="poa-v2 poa-center poa-mono" style={{ fontFamily: monoFont }}>710409-1******</td>
          </tr>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{locale === "ko" ? "주 소" : locale === "zh-CN" ? "地址" : "Address"}</td>
            <td className="poa-v" style={{ fontFamily }}>{locale === "ko" ? "안산시 단원구 원곡로 45, 2층" : locale === "zh-CN" ? "安山市檀园区原谷路45号，2层" : "2F, 45 Wongok-ro, Danwon-gu, Ansan-si"}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.contact}</td>
            <td className="poa-v2 poa-center poa-mono" style={{ fontFamily: monoFont }}>031)8044-8805</td>
          </tr>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.businessName}</td>
            <td className="poa-v" style={{ fontFamily }}>{locale === "ko" ? "법률사무소 세종" : locale === "zh-CN" ? "世宗律师事务所" : "Sejoong Law Office"}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.position}</td>
            <td className="poa-v2 poa-center" style={{ fontFamily, letterSpacing: "0.45em", textIndent: "0.45em" }}>{locale === "ko" ? "대 표 변 호 사" : locale === "zh-CN" ? "代表律师" : "Representative Attorney"}</td>
          </tr>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.businessReg}</td>
            <td className="poa-v poa-center poa-mono" colSpan={3} style={{ fontFamily: monoFont }}>214-09-16365</td>
          </tr>
          </tbody>
        </table>

        {/* 3. 수임인의 복 대리인 */}
        <div className="poa-sec" style={{ fontFamily }}>3. {t.subAgent}</div>
        <table className="poa-t">
          <tbody>
          <tr>
            <td className="poa-k" style={{ fontFamily }}>{t.name}</td>
            <td className="poa-v poa-center" style={{ fontFamily, fontWeight: 700, letterSpacing: "0.55em", textIndent: "0.55em" }}>{locale === "ko" ? "주 성 규" : locale === "zh-CN" ? "朱성규" : "Joo Sung-gyu"}</td>
            <td className="poa-k2" style={{ fontFamily }}>{t.residentId}</td>
            <td className="poa-v2 poa-center poa-mono" style={{ fontFamily: monoFont }}>620613-1******</td>
          </tr>
          <tr>
            <td className="poa-k-addr" rowSpan={2} style={{ fontFamily }}>{locale === "ko" ? "주 소" : locale === "zh-CN" ? "地址" : "Address"}</td>
            <td className="poa-v-addr" style={{ fontFamily }}>{locale === "ko" ? "안산시 단원구 원곡로 45" : locale === "zh-CN" ? "安山市檀园区原谷路45号" : "45 Wongok-ro, Danwon-gu, Ansan-si"}</td>
            <td className="poa-k2-small" style={{ fontFamily }}>{t.position}</td>
            <td className="poa-v2-small poa-center" style={{ fontFamily, letterSpacing: "0.45em", textIndent: "0.45em" }}>{locale === "ko" ? "국 장" : locale === "zh-CN" ? "局长" : "Director"}</td>
          </tr>
          <tr>
            <td className="poa-v-addr" style={{ fontFamily }}>{locale === "ko" ? "2층 세종법률사무소" : locale === "zh-CN" ? "2层世宗律师事务所" : "2F Sejoong Law Office"}</td>
            <td className="poa-k2-small" style={{ fontFamily }}>{t.contact}</td>
            <td className="poa-v2-small poa-center poa-mono" style={{ fontFamily: monoFont }}>010-7152-7094</td>
          </tr>
          </tbody>
        </table>

        {/* 위임업무 */}
        <table className="poa-work">
          <tbody>
          <tr>
            <td className="poa-wlbl" style={{ fontFamily }}>{t.delegatedTasks}</td>
            <td className="poa-wbody" style={{ fontFamily }}>
              <span className={`poa-cb ${getTaskChecked("civil_criminal") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.civil_criminal}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("labor_complaint") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.labor_complaint}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("wage_claim") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.wage_claim}</span>
              </span>
              <br/>
              <span className={`poa-cb ${getTaskChecked("damages_claim") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.damages_claim}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("death_insurance") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.death_insurance}</span>
              </span>
              <br/>
              <span className={`poa-cb ${getTaskChecked("insurance_claim") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.insurance_claim}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("deposit_withdrawal") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.deposit_withdrawal}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("criminal_settlement") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.criminal_settlement}</span>
              </span>
              <br/>
              <span className={`poa-cb ${getTaskChecked("severance_claim") || getTaskChecked("severance_pay") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.severance_pay}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("financial_inquiry") || getTaskChecked("financial_confirmation") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.financial_confirmation}</span>
              </span>
              <br/>
              <span className={`poa-cb ${getTaskChecked("civil_settlement") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.civil_settlement}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("insurance_settlement") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.insurance_settlement}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("departure_insurance") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.departure_insurance}</span>
              </span>
              <span className={`poa-cb ${getTaskChecked("funeral_expenses") ? "checked" : ""}`} style={{ fontFamily }}>
                <span className="poa-box"></span>
                <span style={{ fontFamily }}>{t.tasks.funeral_expenses}</span>
              </span>
            </td>
          </tr>
          </tbody>
        </table>

        <div className="poa-sentence" style={{ fontFamily }}>{t.sentence}</div>

        <div className="poa-date" style={{ fontFamily }}>{year || ""}{locale === "ko" ? "년" : locale === "zh-CN" ? "年" : ""}&nbsp;&nbsp;&nbsp;&nbsp;{month || (locale === "ko" ? "월" : locale === "zh-CN" ? "月" : "")}&nbsp;&nbsp;&nbsp;&nbsp;{day || (locale === "ko" ? "일" : locale === "zh-CN" ? "日" : "")}</div>

        <div className="poa-sign" style={{ fontFamily }}>
          <div className="poa-sign-line" style={{ fontFamily }}>
            <div className="poa-sign-left" style={{ fontFamily }}>{t.principalSign}</div>
            <div className="poa-sign-right" style={{ fontFamily }}>{t.seal}</div>
          </div>
          <div className="poa-sign-line" style={{ fontFamily }}>
            <div className="poa-sign-left" style={{ fontFamily }}>{t.agentSign}</div>
            <div className="poa-sign-right" style={{ fontFamily }}>{t.seal}</div>
          </div>
          <div className="poa-sign-line" style={{ fontFamily }}>
            <div className="poa-sign-left" style={{ fontFamily }}>{t.subAgentSign}</div>
            <div className="poa-sign-right" style={{ fontFamily }}>{t.seal}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="poa-footer" style={{ fontFamily }}>
          <div className="rule"></div>
          <div className="f1" style={{ fontFamily }}>{t.footerTitle}</div>
          <div className="f2" style={{ fontFamily }}>{t.footerAddress}</div>
          <div className="f3" style={{ fontFamily }}>{t.footerTel} : <span className="poa-mono" style={{ fontFamily: monoFont }}>031-8044-8805</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{t.footerFax} : <span className="poa-mono" style={{ fontFamily: monoFont }}>031-491-8817</span></div>
        </div>
      </div>
    )
  }
)

// 변호인선임서 OLD-case 미리보기
const AttorneyAppointmentOldPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: AttorneyAppointmentData }>(
  function AttorneyAppointmentOldPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
    // Locale에 따른 폰트 설정
    const fontFamily = locale === "ko" 
      ? '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : '"Times New Roman", "Georgia", serif'
    
    // 번역 텍스트
    const translations = {
      ko: {
        title: "변호인선임서",
        case: "사건",
        victim: "피해자",
        mainText: "위 사건에 관하여 아래와 같이 변호인을 선임하였음으로, 이의 변호인 선임서를 제출합니다.",
        attachedDocuments: "첨부서류",
        familyRepresentative: "선임인 가족대표자",
        name: "성명",
        idNumber: "본국신분증번호",
        relation: "관계",
        attorney: "변호인",
        attorneyName: "변호사 이택기 (법률사무소 세중)",
        court: "의정부지방법원",
        attorneyAddress: "안산시 단원구 원곡로 45, 2층",
        attorneyContact: "전화 031-8044-8805 팩스 031-491-8817"
      },
      en: {
        title: "NOTICE OF APPOINTMENT OF COUNSEL",
        case: "Case",
        victim: "Victim/Complainant",
        mainText: "With respect to the above case, the undersigned has appointed counsel as set forth below and hereby submits this notice of appointment.",
        attachedDocuments: "Attachments",
        familyRepresentative: "Appointer (Family Representative)",
        name: "Name",
        idNumber: "National ID No.",
        relation: "Relationship",
        attorney: "Counsel",
        attorneyName: "Attorney LEE, Taek Gi (SEJONG LAW OFFICE)",
        attorneyAddress: "Address: 2F, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do",
        attorneyContact: "Tel. 031-8044-8805 Fax. 031-491-8817",
        court: "To: Uijeongbu District Court",
        footerAddress: "2F, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do"
      },
      "zh-CN": {
        title: "律 师 委 任 书",
        case: "事 件",
        victim: "被 害 人",
        mainText: "就上述案件，现如下委任律师，特提交本委任书。",
        attachedDocuments: "附 件",
        familyRepresentative: "委任人 家属代表",
        name: "姓 名",
        idNumber: "本国身份证号码",
        relation: "关 系",
        attorney: "律师",
        attorneyName: "律师 李泽基（世宗律师事务所）",
        attorneyAddress: "地址 京畿道 安山市 檀园区 元谷路 45号 2层",
        attorneyContact: "电话 031-8044-8805 传真 031-491-8817",
        court: "议政府地方法院 敬启",
        footerAddress: "京畿道 安山市 檀园区 元谷路 45号 2层"
      }
    }
    
    const t = translations[locale]
    
    // 변호사 정보 (고정값)
    const attorneyInfo = {
      name: "이택기",
      firm: locale === "ko" ? "법률사무소 세중" : locale === "zh-CN" ? "世中律师事务所" : "Sejoong Law Office",
      address: "안산시 단원구 원곡로 45, 2층",
      phone: "031-8044-8805",
      fax: "031-491-8817"
    }
    
    // 날짜 파싱
    const appointmentDate = getValue("appointment_date")
    let year = new Date().getFullYear()
    let month = ""
    let day = ""
    
    if (appointmentDate) {
      try {
        const date = new Date(appointmentDate)
        year = date.getFullYear()
        month = String(date.getMonth() + 1).padStart(2, "0")
        day = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패 시 현재 날짜 사용
      }
    }
    
    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          position: "relative",
          backgroundColor: "#ffffff",
          padding: "53px 53px 53px 53px",
          boxSizing: "border-box",
          fontFamily,
          color: "#111",
          fontSize: "13.5pt",
          lineHeight: "1.55"
        }}
      >
        <style>{`
          .attorney-appointment-table {
            width: 689px;
            height: auto;
            min-height: 675px;
            table-layout: fixed;
            border-collapse: collapse;
            border: 1px solid #5a5a5a;
          }
          .attorney-appointment-table td {
            border: 1px solid #5a5a5a;
            vertical-align: top;
            padding: 0;
          }
          .attorney-appointment-table td,
          .attorney-attach-table td,
          .attorney-lawyer-table td {
            border: 1px solid #5a5a5a !important;
          }
          .attorney-title {
            height: 91px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 26pt;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-case-block {
            padding: 15px 20px;
            box-sizing: border-box;
            font-size: 13.5pt;
            line-height: 1.7;
            height: 100%;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-case-line {
            display: block;
          }
          .attorney-case-label {
            display: inline-block;
            width: 68px;
          }
          .attorney-mono {
            font-family: "Times New Roman", "Batang", "바탕", serif;
            letter-spacing: 0.03em;
          }
          .attorney-pad {
            padding: 15px 20px;
            box-sizing: border-box;
            font-size: 13.5pt;
            line-height: 1.55;
            height: 100%;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-attach-table {
            width: 100%;
            height: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            border: none;
          }
          .attorney-attach-table td {
            border: none !important;
            border-right: 1px solid #5a5a5a !important;
          }
          .attorney-attach-table td:last-child {
            border-right: none !important;
          }
          .attorney-attach-table tr:first-child td {
            border-top: none !important;
          }
          .attorney-attach-table tr:last-child td {
            border-bottom: none !important;
          }
          .attorney-attach-label {
            width: 113px;
            padding: 15px 19px;
            box-sizing: border-box;
            font-size: 13.5pt;
            vertical-align: middle;
            white-space: nowrap;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-attach-blank {
            padding: 15px 19px;
            box-sizing: border-box;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-date {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14pt;
            letter-spacing: 0.15em;
            height: 68px;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-family {
            padding: 25px 40px 0 40px;
            box-sizing: border-box;
            font-size: 13.5pt;
            line-height: 1.85;
            height: 100%;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-family .head {
            margin-bottom: 12px;
          }
          .attorney-family .lbl {
            display: inline-block;
            width: 106px;
          }
          .attorney-lawyer-table {
            width: 100%;
            height: 100%;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            border: none;
          }
          .attorney-lawyer-table td {
            border: none !important;
            border-right: 1px solid #5a5a5a !important;
            border-bottom: 1px solid #5a5a5a !important;
          }
          .attorney-lawyer-table td:last-child {
            border-right: none !important;
          }
          .attorney-lawyer-table tr:last-child td {
            border-bottom: none !important;
          }
          .attorney-lawyer-table tr:first-child td {
            border-top: none !important;
          }
          .attorney-lawyer-label {
            width: 106px;
            text-align: center;
            vertical-align: middle;
            font-size: 14pt;
            letter-spacing: 0.15em;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-lawyer-name {
            height: 83px;
            text-align: center;
            vertical-align: middle;
            font-size: 15pt;
            letter-spacing: 0.05em;
            font-weight: 600;
            padding: 0 23px;
            box-sizing: border-box;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-lawyer-info {
            height: 98px;
            text-align: left;
            vertical-align: middle;
            padding: 0 38px;
            box-sizing: border-box;
            font-size: 13.5pt;
            line-height: 1.6;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-lawyer-info .line {
            display: block;
            text-align: center;
          }
          .attorney-court {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            padding-left: 38px;
            font-size: 14.5pt;
            letter-spacing: 0.08em;
            height: 83px;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-footer {
            width: 689px;
            margin-top: 30px;
            text-align: center;
            color: #111;
            font-family: "Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif;
          }
          .attorney-footer .f1 {
            font-size: 16pt;
            letter-spacing: 0.18em;
            margin-bottom: 8px;
          }
          .attorney-footer .f2 {
            font-size: 11.5pt;
            letter-spacing: 0.05em;
            margin-bottom: 6px;
          }
          .attorney-footer .f3 {
            font-size: 11.5pt;
            letter-spacing: 0.04em;
            margin-bottom: 11px;
          }
          .attorney-footer .bar {
            border-top: 1px solid #5a5a5a;
            padding-top: 9px;
            font-size: 14pt;
            font-weight: normal;
            letter-spacing: 0.08em;
          }
          .attorney-footer .bar small {
            display: block;
            font-weight: 400;
            font-size: 10.5pt;
            letter-spacing: 0.02em;
            margin-top: 6px;
          }
        `}</style>
        
        <table className="attorney-appointment-table">
          <tbody>
          {/* 1) Title */}
          <tr style={{ height: "70px" }}>
            <td>
              <div 
                className="attorney-title"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: locale === "ko" 
                    ? '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif'
                    : locale === "zh-CN"
                      ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
                      : '"Times New Roman", "Georgia", serif',
                  fontWeight: "normal",
                  fontSize: locale === "en" ? "20pt" : locale === "zh-CN" ? "22pt" : "26pt",
                  letterSpacing: locale === "en" ? "0.1em" : locale === "zh-CN" ? "0.2em" : "0.55em",
                  textIndent: locale === "en" ? "0" : locale === "zh-CN" ? "0" : "0.55em",
                  whiteSpace: "nowrap"
                }}
              >
                {t.title}
              </div>
            </td>
          </tr>

          {/* 2) 사건 / 피해자 */}
          <tr style={{ height: "75px" }}>
            <td>
              <div 
                className="attorney-case-block"
                style={{
                  padding: "15px 20px",
                  boxSizing: "border-box",
                  fontFamily,
                  fontSize: "13.5pt",
                  lineHeight: "1.7",
                  height: "100%"
                }}
              >
                <span className="attorney-case-line" style={{ display: "block" }}>
                  <span className="attorney-case-label" style={{ display: "inline-block", width: locale === "ko" ? "68px" : "80px", fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>{t.case} :</span>{" "}
                  <span 
                    className="attorney-mono"
                    style={{
                      fontFamily: locale === "ko" ? '"Times New Roman", "Batang", "바탕", serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : '"Times New Roman", serif',
                      fontSize: "13.5pt",
                      letterSpacing: "0.03em",
                      fontWeight: "normal"
                    }}
                  >
                    {getValue("case_number") || ""}
                  </span>
                </span>
                <span className="attorney-case-line" style={{ display: "block" }}>
                  <span className="attorney-case-label" style={{ display: "inline-block", width: locale === "ko" ? "68px" : "80px", fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>{t.victim} :</span>{" "}
                  <span 
                    className="attorney-mono"
                    style={{
                      fontFamily: locale === "ko" ? '"Times New Roman", "Batang", "바탕", serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : '"Times New Roman", serif',
                      fontSize: "13.5pt",
                      letterSpacing: "0.03em",
                      fontWeight: "normal"
                    }}
                  >
                    {getValue("victim") || ""}
                  </span>
                </span>
              </div>
            </td>
          </tr>

          {/* 3) 본문 문장 */}
          <tr style={{ height: "70px" }}>
            <td>
              <div 
                className="attorney-pad"
                style={{
                  padding: "15px 20px",
                  boxSizing: "border-box",
                  fontFamily,
                  fontSize: "13.5pt",
                  lineHeight: "1.55",
                  height: "100%"
                }}
              >
                <span style={{ fontWeight: "normal", fontFamily }}>{t.mainText}</span>
              </div>
            </td>
          </tr>

          {/* 4) 첨부서류 */}
          <tr style={{ height: "50px" }}>
            <td>
              <table className="attorney-attach-table" style={{ width: "100%", height: "100%", tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
                <tbody>
                <tr>
                  <td 
                    className="attorney-attach-label"
                    style={{
                      width: locale === "ko" ? "113px" : "140px",
                      padding: "10px 15px",
                      boxSizing: "border-box",
                      border: "none",
                      borderRight: "1px solid #5a5a5a",
                      fontFamily,
                      fontSize: "13.5pt",
                      verticalAlign: "middle",
                      whiteSpace: "nowrap",
                      fontWeight: "normal"
                    }}
                  >
                    {t.attachedDocuments}
                  </td>
                  <td 
                    className="attorney-attach-blank"
                    style={{
                      padding: "10px 15px",
                      boxSizing: "border-box",
                      border: "none",
                      fontFamily: '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif',
                      fontSize: "13.5pt",
                      fontWeight: "normal",
                      verticalAlign: "middle"
                    }}
                  >
                    <span 
                      className="attorney-mono"
                      style={{
                        fontFamily: '"Times New Roman", "Batang", "바탕", serif',
                        fontSize: "13.5pt",
                        letterSpacing: "0.03em",
                        fontWeight: "normal"
                      }}
                    >
                      {getValue("attached_documents") || ""}
                    </span>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* 5) 날짜 */}
          <tr style={{ height: "60px" }}>
            <td>
              <div 
                className="attorney-date"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: "10px",
                  fontFamily: '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif',
                  fontSize: "14pt",
                  letterSpacing: "0.15em",
                  fontWeight: "normal"
                }}
              >
                {year}. {month || "  "}. {day || "  "}.
              </div>
            </td>
          </tr>

          {/* 6) 선임인 가족대표자 */}
          <tr style={{ height: "160px" }}>
            <td>
              <div 
                className="attorney-family"
                style={{
                  padding: "25px 40px 0 40px",
                  boxSizing: "border-box",
                  fontFamily: '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif',
                  fontSize: "13.5pt",
                  lineHeight: "1.85",
                  height: "100%"
                }}
              >
                <div className="head" style={{ marginBottom: "12px", fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>{t.familyRepresentative}</div>
                <div style={{ fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>
                  <span className="lbl" style={{ display: "inline-block", width: locale === "ko" ? "140px" : "160px", fontFamily, fontSize: "13.5pt", fontWeight: "normal", textAlign: "right" }}>{t.name} :</span>{" "}
                  <span 
                    className="attorney-mono"
                    style={{
                      fontFamily: locale === "ko" ? '"Times New Roman", "Batang", "바탕", serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : '"Times New Roman", serif',
                      fontSize: "13.5pt",
                      letterSpacing: "0.03em",
                      fontWeight: "normal"
                    }}
                  >
                    {getValue("appointer_name") || ""}
                  </span>
                </div>
                <div style={{ fontFamily, fontSize: "13.5pt", fontWeight: "normal", whiteSpace: "nowrap" }}>
                  <span className="lbl" style={{ display: "inline-block", width: locale === "ko" ? "140px" : "160px", fontFamily, fontSize: "13.5pt", fontWeight: "normal", whiteSpace: "nowrap", textAlign: "right" }}>{t.idNumber} :</span>
                  <span 
                    className="attorney-mono"
                    style={{
                      fontFamily: locale === "ko" ? '"Times New Roman", "Batang", "바탕", serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : '"Times New Roman", serif',
                      fontSize: "13.5pt",
                      letterSpacing: "0.03em",
                      fontWeight: "normal",
                      marginLeft: "4px"
                    }}
                  >
                    {getValue("appointer_id_number") || ""}
                  </span>
                </div>
                <div style={{ fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>
                  <span className="lbl" style={{ display: "inline-block", width: locale === "ko" ? "140px" : "160px", fontFamily, fontSize: "13.5pt", fontWeight: "normal", textAlign: "right" }}>{t.relation} :</span> <span style={{ fontWeight: "normal" }}>{getValue("appointer_relation") || (locale === "ko" ? "부" : locale === "zh-CN" ? "父" : "Father")}{locale === "ko" ? "." : ""}</span>
                </div>
              </div>
            </td>
          </tr>

          {/* 7) 변호인 박스 */}
          <tr style={{ height: "140px" }}>
            <td>
              <table className="attorney-lawyer-table" style={{ width: "100%", height: "100%", tableLayout: "fixed", borderCollapse: "separate", borderSpacing: 0 }}>
                <tbody>
                <tr>
                  <td 
                    className="attorney-lawyer-label" 
                    rowSpan={2}
                    style={{
                      width: locale === "ko" ? "106px" : "120px",
                      textAlign: "center",
                      verticalAlign: "middle",
                      border: "none",
                      borderRight: "1px solid #5a5a5a",
                      fontFamily,
                      fontSize: "14pt",
                      letterSpacing: "0.15em",
                      fontWeight: "normal"
                    }}
                  >
                    {t.attorney}
                  </td>
                  <td 
                    className="attorney-lawyer-name"
                    style={{
                      height: "65px",
                      textAlign: "center",
                      verticalAlign: "middle",
                      border: "none",
                      borderBottom: "1px solid #5a5a5a",
                      fontFamily,
                      fontSize: "17pt",
                      letterSpacing: "0.05em",
                      fontWeight: "bold",
                      padding: "0 18px",
                      boxSizing: "border-box"
                    }}
                  >
                    {t.attorneyName || (locale === "ko" ? "변호사 이택기 (법률사무소 세중)" : locale === "zh-CN" ? "律师 李泽基（世宗律师事务所）" : "Attorney LEE, Taek Gi (SEJONG LAW OFFICE)")}
                  </td>
                </tr>
                <tr>
                  <td 
                    className="attorney-lawyer-info"
                    style={{
                      height: "75px",
                      textAlign: "left",
                      verticalAlign: "middle",
                      border: "none",
                      padding: "0 30px",
                      boxSizing: "border-box",
                      fontFamily,
                      fontSize: "13.5pt",
                      lineHeight: "1.6",
                      fontWeight: "normal"
                    }}
                  >
                    <span className="line" style={{ display: "block", textAlign: "center", fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>{t.attorneyAddress}</span>
                    <span className="line" style={{ display: "block", textAlign: "center", fontFamily, fontSize: "13.5pt", fontWeight: "normal" }}>{t.attorneyContact}</span>
                  </td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* 8) 법원 귀중 */}
          <tr style={{ height: "70px", paddingBottom: "0" }}>
            <td>
              <div 
                className="attorney-court"
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingLeft: "30px",
                  paddingTop: "10px",
                  fontFamily,
                  fontSize: "16pt",
                  letterSpacing: "0.08em",
                  fontWeight: "bold"
                }}
              >
                {getValue("court") || t.court}
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div 
          className="attorney-footer"
          style={{
            fontFamily
          }}
        >
          <div 
            className="f1"
            style={{
              fontSize: "16pt",
              letterSpacing: "0.18em",
              marginBottom: "8px",
              fontWeight: "normal"
            }}
          >
            {attorneyInfo.firm}
          </div>
          <div 
            className="f2"
            style={{
              fontSize: "11.5pt",
              letterSpacing: "0.05em",
              marginBottom: "6px",
              fontWeight: "normal"
            }}
          >
            {locale === "en" ? "2F, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do" : locale === "zh-CN" ? "京畿道 安山市 檀园区 元谷路 45号 2层" : "안산시 단원구 원곡로 45, 2F"}
          </div>
          <div 
            className="f3"
            style={{
              fontSize: "11.5pt",
              letterSpacing: "0.04em",
              marginBottom: "11px",
              fontWeight: "normal"
            }}
          >
            <span 
              className="attorney-mono"
              style={{
                fontFamily: '"Times New Roman", "Batang", "바탕", serif',
                letterSpacing: "0.03em",
                fontWeight: "normal"
              }}
            >
              TEL. 031)8044-8805
            </span>
            &nbsp;&nbsp;/&nbsp;&nbsp;
            <span 
              className="attorney-mono"
              style={{
                fontFamily: '"Times New Roman", "Batang", "바탕", serif',
                letterSpacing: "0.03em",
                fontWeight: "normal"
              }}
            >
              FAX. 031)491-8817
            </span>
          </div>
          <div 
            className="bar"
            style={{
              borderTop: "1px solid #5a5a5a",
              paddingTop: "9px",
              fontSize: "14pt",
              fontWeight: "normal",
              letterSpacing: "0.08em",
              fontFamily: '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif'
            }}
          >
            법률사무소 세중 변호사
            <small
              style={{
                display: "block",
                fontWeight: "normal",
                fontSize: "10.5pt",
                letterSpacing: "0.02em",
                marginTop: "6px",
                fontFamily: '"Batang", "바탕", "BatangChe", "Gungsuh", "궁서", "Noto Serif KR", serif'
              }}
            >
              (15378) 경기도 안산시 단원구 원곡로 45, 2층(원곡동, 세중빌딩)
              <br />
              전화 : 031-8044-8805 &nbsp;&nbsp;팩스 : 031-491-8817
            </small>
          </div>
        </div>
      </div>
    )
  }
)

// 소송위임장 OLD-case 미리보기
const LitigationPowerOldPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: LitigationPowerData; getCheckboxValue: (key: string) => boolean }>(
  function LitigationPowerOldPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate }, ref) {
    // Locale에 따른 폰트 설정
    const fontFamily = locale === "ko" 
      ? '"Batang", "바탕", "BatangChe", "Noto Serif KR", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : '"Times New Roman", "Georgia", serif'
    
    const gungsuhFont = locale === "ko"
      ? '"Gungsuh", "궁서", "Batang", "바탕", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", serif'
        : '"Times New Roman", serif'
    
    const monoFont = locale === "ko"
      ? '"Times New Roman", "Batang", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", serif'
        : '"Times New Roman", serif'
    
    // 번역 텍스트
    const translations = {
      ko: {
        title: "소송위임장",
        case: "사 건",
        plaintiff: "원 고",
        defendant: "피 고",
        sentence: "위 사건에 관하여 아래의 수임인을 원고의 소송대리인으로 선임하고, 아래와 같은 권한을 수여합니다.",
        suwonin: "수임인",
        sukwon: "수권사항",
        lawOffice: "법률사무소세중",
        lawyer: "변호사이택기",
        address: "안산시 단원구 원곡로 45, 세중빌딩 2층",
        tel: "전화",
        fax: "팩스",
        specialAuth: "기타 특별수권사항",
        authStatus: "수권여부",
        withdrawalOfSuit: "소의 취하",
        withdrawalOfSuitDesc: "제기된 소송의 전부 또는 일부를 철회하여 소송을 종료할 수 있는 권한",
        withdrawalOfAppeal: "상소의 취하",
        withdrawalOfAppealDesc: "원심을 유지·확정하면서 상소의 신청을 철회할 수 있는 권한",
        waiverOfClaim: "청구의 포기",
        waiverOfClaimDesc: "위임인의 청구가 이유 없다고 인정하여 소송을 종료할 수 있는 권한",
        admissionOfClaim: "청구의 인낙",
        admissionOfClaimDesc: "상대방의 청구가 이유 있다고 인정하여 소송을 종료할 수 있는 권한",
        withdrawalFromSuit: "소송 탈퇴",
        withdrawalFromSuitDesc: "제3자가 소송에 참가한 경우 그 소송에서 탈퇴할 수 있는 권한(민사소송법 제80조에 따른 탈퇴)",
        note: "기타특별수권사항(권한을 부여하면 O표시, 보류하면 X표시)",
        principalName: "위임인 가족대표 성명",
        idNumber: "본국신분증번호",
        court: "의정부지방법원",
        to: "귀하",
        footerTitle: "법률사무소 세중 변호사",
        footerAddress: "(15378) 경기도 안산시 단원구 원곡로 45, 2층(원곡동, 세중빌딩)",
        footerTel: "전화",
        footerFax: "팩스",
        power1: "일체의 소송행위(반소 및 상소의 제기 및, 가압류, 가처분, 경매 등 민사집행법에 따른 신청 및 이의절차 일체)",
        power2: "기록복사 및 열람, 변제의 수령, 복대리인의 선임",
        power3: "재판상 또는 재판외의 화해",
        power4: "담보권 행사 및 최고신청, 소송비용 확정 신청",
        power5: "공탁신청 및 공탁금 납입행위, 공탁금 출급회수청구 및 공탁통지서 수령행위, 공탁기록 열람/복사, 사실증명신청과 수령행위 일체"
      },
      en: {
        title: "POWER OF ATTORNEY FOR LITIGATION",
        case: "Case",
        plaintiff: "Plaintiff",
        defendant: "Defendant",
        sentence: "With respect to the above case, the undersigned appoints the following attorney as the Plaintiff's litigation representative and grants the powers set forth below.",
        suwonin: "Attorney-in-fact",
        sukwon: "POWERS GRANTED",
        lawOffice: "SEJONG LAW OFFICE",
        lawyer: "Attorney LEE, Taek Gi",
        address: "Address 2F, Sejong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do",
        tel: "Tel.",
        fax: "Fax.",
        specialAuth: "OTHER SPECIAL POWERS",
        authStatus: "Authorized",
        withdrawalOfSuit: "Withdrawal of action",
        withdrawalOfSuitDesc: "Authority to withdraw all or part of the action and terminate the case",
        withdrawalOfAppeal: "Withdrawal of appeal",
        withdrawalOfAppealDesc: "Authority to withdraw the appeal while maintaining and finalizing the judgment",
        waiverOfClaim: "Waiver of claim",
        waiverOfClaimDesc: "Authority to acknowledge the claim is without grounds and terminate the case",
        admissionOfClaim: "Admission of claim",
        admissionOfClaimDesc: "Authority to admit the opposing party's claim and terminate the case",
        withdrawalFromSuit: "Withdrawal from suit",
        withdrawalFromSuitDesc: "Authority to withdraw from the suit upon third-party intervention (CCP Art.80)",
        note: "Other special powers (mark \"O\" if granted; mark \"X\" if reserved)",
        principalName: "Family Representative of the Principal",
        idNumber: "National ID No.",
        court: "Uijeongbu District Court",
        to: "To:",
        footerTitle: "SEJONG LAW OFFICE, Attorney-at-Law",
        footerAddress: "(15378) 2F, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do (Wongok-dong, Sejong Bldg.)",
        footerTel: "Tel.",
        footerFax: "Fax.",
        power1: "All litigation acts (including filing counterclaims and appeals; and all applications and objection procedures under the Civil Execution Act, such as provisional attachment, injunction, auction/execution, etc.)",
        power2: "Inspection/copying of records, receipt of payment, appointment of a sub-agent (substitute counsel)",
        power3: "Settlement in court or out of court",
        power4: "Exercise of security rights and demand notice; application for determination of litigation costs",
        power5: "Deposit (court deposit) applications and payments; claims for withdrawal/return of deposited funds and receipt of deposit notices; inspection/copying of deposit records; applications for certificates of facts and receipt thereof, and all related acts"
      },
      "zh-CN": {
        title: "诉 讼 委 任 状",
        case: "事 件",
        plaintiff: "原 告",
        defendant: "被 告",
        sentence: "就上述案件，现委任下列受任人为原告之诉讼代理人，并授予如下权限。",
        suwonin: "受 任 人",
        sukwon: "【授 权 事 项】",
        lawOffice: "世宗律师事务所",
        lawyer: "律师 李泽基",
        address: "地址 京畿道 安山市 檀园区 元谷路 45号，世宗大厦 2层",
        tel: "电话",
        fax: "传真",
        specialAuth: "【其 他 特 别 授 权 事 项】",
        authStatus: "【授权与否】",
        withdrawalOfSuit: "撤回起诉",
        withdrawalOfSuitDesc: "撤回已提起之诉讼全部或一部，从而终结诉讼之权限",
        withdrawalOfAppeal: "撤回上诉",
        withdrawalOfAppealDesc: "在维持并确定原审的同时撤回上诉申请之权限",
        waiverOfClaim: "放弃请求",
        waiverOfClaimDesc: "认可委任人请求无理由并终结诉讼之权限",
        admissionOfClaim: "认可请求",
        admissionOfClaimDesc: "认可对方请求有理由并终结诉讼之权限",
        withdrawalFromSuit: "诉讼退出",
        withdrawalFromSuitDesc: "第三人参加诉讼时退出该诉讼之权限(民事诉讼法第80条)",
        note: "其他特别授权事项（授予则标记 O，保留则标记 X）",
        principalName: "委任人 家属代表 姓名",
        idNumber: "本国身份证号码",
        court: "议政府地方法院",
        to: "敬启",
        footerTitle: "世宗律师事务所 律师",
        footerAddress: "(15378) 京畿道 安山市 檀园区 元谷路 45号 2层(元谷洞, 世宗大厦)",
        footerTel: "电话",
        footerFax: "传真",
        power1: "一切诉讼行为（提起反诉及上诉，以及假扣押、假处分、强制执行/拍卖等民事执行法项下的申请及异议程序等全部事项）",
        power2: "阅卷/复制，受领清偿，选任转委代理人(再代理人)",
        power3: "诉讼上或诉讼外和解",
        power4: "担保权行使及催告申请，申请确定诉讼费用",
        power5: "提存申请及提存金缴纳行为，提存金领取/回收请求及受领提存通知书，提存记录阅览/复制，事实证明申请及受领等一切行为"
      }
    }
    
    const t = translations[locale]
    
    // 날짜 파싱
    const powerDate = getValue("power_date")
    let year = ""
    let month = ""
    let day = ""
    
    if (powerDate) {
      try {
        const date = new Date(powerDate)
        year = String(date.getFullYear())
        month = String(date.getMonth() + 1).padStart(2, "0")
        day = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패
      }
    }
    
    // 특별수권사항 값 가져오기 (O/X)
    const getSpecialAuthValue = (key: string) => {
      const value = getValue(key)
      if (value === "O" || value === "o") return "O"
      if (value === "X" || value === "x") return "X"
      return "0"
    }
    
    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          position: "relative",
          backgroundColor: "#ffffff",
          padding: "50px 50px 35px 50px",
          boxSizing: "border-box",
          fontFamily,
          color: "#111"
        }}
      >
        <style>{`
          .litigation-form {
            width: 694px;
            height: 1008px;
            table-layout: fixed;
            border: 1.3px solid #4b4b4b;
            margin: 0 auto;
            border-collapse: collapse;
          }
          .litigation-form td {
            border: 1.3px solid #4b4b4b;
            vertical-align: top;
            padding: 0;
          }
          .litigation-c-l { width: 150px; }
          .litigation-c-m { width: 544px; }
          .litigation-r-title { height: 65px; }
          .litigation-r-info { height: 80px; }
          .litigation-r-sent { height: 55px; }
          .litigation-r-suw { height: 120px; }
          .litigation-r-skw { height: 500px; }
          .litigation-r-bottom { height: 140px; }
          .litigation-title {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28pt;
            font-weight: 700;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
          }
          .litigation-mini {
            width: 100%;
            height: 100%;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 13.5pt;
          }
          .litigation-mini td {
            border: 1.3px solid #4b4b4b;
            vertical-align: middle;
          }
          .litigation-mini .k {
            width: 150px;
            text-align: left;
            padding-left: 35px;
            letter-spacing: 0.7em;
            text-indent: 0.7em;
            font-weight: 600;
            font-size: 13.5pt;
          }
          .litigation-mini .v {
            width: 544px;
            padding: 0 25px;
            text-align: center;
            letter-spacing: 0.06em;
            font-size: 13.5pt;
          }
          .litigation-sent {
            padding: 12px 25px;
            box-sizing: border-box;
            font-size: 13pt;
            line-height: 1.65;
            letter-spacing: 0.02em;
          }
          .litigation-biglbl {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18pt;
            font-weight: 600;
            letter-spacing: 0.7em;
            text-indent: 0.7em;
          }
          .litigation-suw-wrap {
            height: 100%;
            padding: 20px 25px 12px 25px;
            box-sizing: border-box;
            text-align: center;
          }
          .litigation-lawoffice {
            font-size: 18pt;
            font-weight: 700;
            letter-spacing: 0.65em;
            text-indent: 0.65em;
            margin-top: 2px;
          }
          .litigation-lawyer {
            font-size: 18pt;
            font-weight: 700;
            letter-spacing: 0.55em;
            text-indent: 0.55em;
            margin-top: 10px;
          }
          .litigation-dash {
            margin: 15px 0 12px 0;
            border-top: 1.3px dashed #4b4b4b;
          }
          .litigation-addr {
            font-size: 14pt;
            letter-spacing: 0.02em;
            margin-top: 6px;
          }
          .litigation-tel {
            font-size: 14pt;
            margin-top: 12px;
            letter-spacing: 0.04em;
          }
          .litigation-skw {
            padding: 20px 22px 15px 22px;
            box-sizing: border-box;
            font-size: 12.4pt;
            line-height: 1.7;
            letter-spacing: 0.01em;
          }
          .litigation-skw .item {
            margin: 5px 0;
          }
          .litigation-skw .num {
          }
          .litigation-special {
            width: 100%;
            margin-top: 25px;
            table-layout: fixed;
            border-collapse: separate;
            border-spacing: 0;
            font-size: 12pt;
            border: none;
          }
          .litigation-special td,
          .litigation-special th {
            border: 1.3px solid #4b4b4b;
            padding: 0;
          }
          .litigation-special th:first-child,
          .litigation-special td:first-child {
            border-left: 1.3px solid #4b4b4b;
          }
          .litigation-special th:last-child,
          .litigation-special td:last-child {
            border-right: 1.3px solid #4b4b4b;
          }
          .litigation-special tr:first-child th,
          .litigation-special tr:first-child td {
            border-top: 1.3px solid #4b4b4b;
          }
          .litigation-special tr:last-child th,
          .litigation-special tr:last-child td {
            border-bottom: 1.3px solid #4b4b4b;
          }
          .litigation-special th {
            font-weight: 700;
            text-align: center;
            height: 35px;
            letter-spacing: 0.06em;
          }
          .litigation-sp-k {
            width: 100px;
            text-align: center;
            vertical-align: middle;
            font-weight: 600;
          }
          .litigation-sp-v {
            width: auto;
            padding: 7px 10px;
            vertical-align: middle;
          }
          .litigation-sp-yn {
            width: 80px;
            text-align: center;
            vertical-align: middle;
            font-size: 13pt;
          }
          .litigation-note {
            margin-top: 15px;
            font-size: 12.3pt;
            letter-spacing: 0.01em;
          }
          .litigation-bottom {
            height: 100%;
            padding: 20px 25px;
            box-sizing: border-box;
          }
          .litigation-date {
            text-align: center;
            font-size: 22pt;
            font-weight: 700;
            letter-spacing: 0.35em;
            margin-top: 6px;
          }
          .litigation-who {
            margin-top: 30px;
            font-size: 13.5pt;
            line-height: 1.9;
            letter-spacing: 0.02em;
          }
          .litigation-to {
            margin-top: 30px;
            font-size: 15pt;
            letter-spacing: 0.08em;
          }
          .litigation-footer {
            width: 694px;
            margin: 20px auto 0 auto;
            text-align: center;
            color: #111;
          }
          .litigation-footer .line {
            border-top: 2px solid #4b4b4b;
            margin-bottom: 15px;
          }
          .litigation-footer .t1 {
            font-size: 18pt;
            font-weight: 800;
            letter-spacing: 0.06em;
          }
          .litigation-footer .t2 {
            margin-top: 8px;
            font-size: 11.5pt;
            letter-spacing: 0.02em;
          }
          .litigation-footer .t3 {
            margin-top: 6px;
            font-size: 11.5pt;
            letter-spacing: 0.02em;
          }
        `}</style>
        
        <table className="litigation-form">
          <tbody>
          {/* Title */}
          <tr className="litigation-r-title">
            <td className="litigation-c-l" colSpan={2}>
              <div className="litigation-title" style={{ fontFamily: gungsuhFont }}>{t.title}</div>
            </td>
          </tr>

          {/* 사건/원고/피고 */}
          <tr className="litigation-r-info">
            <td className="litigation-c-l" colSpan={2} style={{ padding: 0 }}>
              <table className="litigation-mini">
                <tbody>
                <tr>
                  <td className="k" style={{ fontFamily: gungsuhFont }}>{t.case}</td>
                  <td className="v" style={{ fontFamily: monoFont }}><span>{getValue("case_number") || ""}</span></td>
                </tr>
                <tr>
                  <td className="k" style={{ fontFamily: gungsuhFont }}>{t.plaintiff}</td>
                  <td className="v" style={{ fontFamily: monoFont }}><span>{getValue("plaintiff") || ""}</span></td>
                </tr>
                <tr>
                  <td className="k" style={{ fontFamily: gungsuhFont }}>{t.defendant}</td>
                  <td className="v" style={{ fontFamily: monoFont }}><span>{getValue("defendant") || ""}</span></td>
                </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* 문장 */}
          <tr className="litigation-r-sent">
            <td className="litigation-c-l" colSpan={2}>
              <div className="litigation-sent" style={{ fontFamily: gungsuhFont }}>{t.sentence}</div>
            </td>
          </tr>

          {/* 수임인 */}
          <tr className="litigation-r-suw">
            <td className="litigation-c-l">
              <div className="litigation-biglbl" style={{ fontFamily: gungsuhFont }}>{t.suwonin}</div>
            </td>
            <td className="litigation-c-m" style={{ padding: 0 }}>
              <div className="litigation-suw-wrap">
                <div className="litigation-lawoffice" style={{ fontFamily: gungsuhFont }}>{t.lawOffice}</div>
                <div className="litigation-lawyer" style={{ fontFamily: gungsuhFont }}>{t.lawyer}</div>
                <div className="litigation-dash"></div>
                <div className="litigation-addr" style={{ fontFamily }}>{t.address}</div>
                <div className="litigation-tel" style={{ fontFamily }}>{t.tel} <span style={{ fontFamily: monoFont }}>031-8044-8805~8</span>, {t.fax} <span style={{ fontFamily: monoFont }}>031-491-3817</span></div>
              </div>
            </td>
          </tr>

          {/* 수권사항 */}
          <tr className="litigation-r-skw">
            <td className="litigation-c-l">
              <div className="litigation-biglbl" style={{ fontFamily: gungsuhFont }}>{t.sukwon}</div>
            </td>
            <td className="litigation-c-m" style={{ padding: 0 }}>
              <div className="litigation-skw" style={{ fontFamily }}>
                <div className="item" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>1.</span> {t.power1}</div>
                <div className="item" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>2.</span> {t.power2}</div>
                <div className="item" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>3.</span> {t.power3}</div>
                <div className="item" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>4.</span> {t.power4}</div>
                <div className="item" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>5.</span> {t.power5}</div>

                <table className="litigation-special">
                  <tbody>
                  <tr>
                    <th colSpan={2} style={{ fontFamily }}>{t.specialAuth}</th>
                    <th className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{t.authStatus}</th>
                  </tr>
                  <tr>
                    <td className="litigation-sp-k" style={{ fontFamily: gungsuhFont }}>{t.withdrawalOfSuit}</td>
                    <td className="litigation-sp-v" style={{ fontFamily }}>{t.withdrawalOfSuitDesc}</td>
                    <td className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{getSpecialAuthValue("special_authority.withdrawal_of_suit")}</td>
                  </tr>
                  <tr>
                    <td className="litigation-sp-k" style={{ fontFamily: gungsuhFont }}>{t.withdrawalOfAppeal}</td>
                    <td className="litigation-sp-v" style={{ fontFamily }}>{t.withdrawalOfAppealDesc}</td>
                    <td className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{getSpecialAuthValue("special_authority.withdrawal_of_appeal")}</td>
                  </tr>
                  <tr>
                    <td className="litigation-sp-k" style={{ fontFamily: gungsuhFont }}>{t.waiverOfClaim}</td>
                    <td className="litigation-sp-v" style={{ fontFamily }}>{t.waiverOfClaimDesc}</td>
                    <td className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{getSpecialAuthValue("special_authority.waiver_of_claim")}</td>
                  </tr>
                  <tr>
                    <td className="litigation-sp-k" style={{ fontFamily: gungsuhFont }}>{t.admissionOfClaim}</td>
                    <td className="litigation-sp-v" style={{ fontFamily }}>{t.admissionOfClaimDesc}</td>
                    <td className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{getSpecialAuthValue("special_authority.admission_of_claim")}</td>
                  </tr>
                  <tr>
                    <td className="litigation-sp-k" style={{ fontFamily: gungsuhFont }}>{t.withdrawalFromSuit}</td>
                    <td className="litigation-sp-v" style={{ fontFamily }}>{t.withdrawalFromSuitDesc}</td>
                    <td className="litigation-sp-yn" style={{ fontFamily: monoFont }}>{getSpecialAuthValue("special_authority.withdrawal_from_suit")}</td>
                  </tr>
                  </tbody>
                </table>

                <div className="litigation-note" style={{ fontFamily }}><span className="num" style={{ fontFamily: monoFont }}>1.</span> {t.note}</div>
              </div>
            </td>
          </tr>

          {/* 하단 */}
          <tr className="litigation-r-bottom">
            <td className="litigation-c-l" colSpan={2}>
              <div className="litigation-bottom" style={{ fontFamily: gungsuhFont }}>
                <div className="litigation-date" style={{ fontFamily: monoFont }}>{year || ""}.&nbsp;&nbsp;{month || "&nbsp;&nbsp;"}.&nbsp;&nbsp;{day || "&nbsp;&nbsp;"}.</div>
                <div className="litigation-who" style={{ fontFamily: gungsuhFont }}>
                  {t.principalName} : <span style={{ fontFamily: monoFont }}>{getValue("principal_name") || ""}</span><br/>
                  {t.idNumber} : <span style={{ fontFamily: monoFont }}>{getValue("principal_id_number") || ""}</span>
                </div>
                <div className="litigation-to" style={{ fontFamily: gungsuhFont }}>{getValue("court") || t.court}&nbsp;&nbsp;{t.to}</div>
              </div>
            </td>
          </tr>
          </tbody>
        </table>

        {/* Footer */}
        <div className="litigation-footer" style={{ fontFamily }}>
          <div className="line"></div>
          <div className="t1" style={{ fontFamily }}>{t.footerTitle}</div>
          <div className="t2" style={{ fontFamily }}>{t.footerAddress}</div>
          <div className="t3" style={{ fontFamily }}>{t.footerTel} : <span style={{ fontFamily: monoFont }}>031-8044-8805</span>&nbsp;&nbsp;&nbsp;&nbsp;{t.footerFax} : <span style={{ fontFamily: monoFont }}>031-491-3817</span></div>
        </div>
      </div>
    )
  }
)

// 사망보험금지급동의 OLD-case 미리보기
const InsuranceConsentOldPreview = forwardRef<HTMLDivElement, PreviewComponentProps & { data: InsuranceConsentData }>(
  function InsuranceConsentOldPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
    // Locale에 따른 폰트 설정
    const fontFamily = locale === "ko" 
      ? '"Batang", "바탕", "BatangChe", "Noto Serif KR", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", "Noto Serif SC", serif'
        : '"Times New Roman", "Georgia", serif'
    
    const monoFont = locale === "ko"
      ? '"Times New Roman", "Batang", serif'
      : locale === "zh-CN"
        ? '"FangSong", "STFangsong", serif'
        : '"Times New Roman", serif'
    
    // 번역 텍스트
    const translations = {
      ko: {
        title: "사망보험금 지급 등의 법정상속인 확인서",
        recipient: "수 신",
        sender: "발 신",
        address: "주 소",
        subject: "제  목",
        name: "성 명",
        residenceReg: "거소신고",
        birthdate: "생년월일",
        gender: "성 별",
        male: "남",
        female: "여",
        para: "귀 사로부터 고인",
        para2: "님의 사망보험금을 수령함에 있어 법정 상속인",
        para3: "아래와 같이 사망보험금 수령 사실을 통보하고 동의 의사를 확인하였기에 귀사에 이를 안내하여 드립니다.",
        below: "- 아 래 -",
        section1: "1. 보험계약사항,",
        section1a: "가. 보험상품명 :",
        section1b: "나. 보험계약자 :",
        section1c: "다. 피 보 험 자 :",
        section1d: "라. 계 약 일 자 :",
        section2: "2. 예정 지급보험금.",
        section2Text: "상기 보험계약과 관련하여 피보험자의 법정상속인의 확인 서명을 기재하여 첨부 서류와 함께 제출하오니 사망보험금을 보험증권에 명기되어 있는 사망보험금 수익자인",
        section2Text2: "님에게 지급하여 주시기 바랍니다.",
        section3: "3. [피 보험자의 법적 상속인].",
        tableNo: "",
        tableName: "본 국 성 명",
        tableId: "본국 신분증번호",
        tableRel: "보험자와의 관계",
        father: "부",
        mother: "모",
        section4: "4. 별 첨",
        attach1: "1. 신분증사본 1부",
        attach2: "2. 가족관계 증명서 1부",
        to: "귀하",
        businessReg: "사업자등록번호"
      },
      en: {
        title: "Confirmation of Legal Heirs for Payment of Death Insurance Benefits, etc.",
        recipient: "To",
        sender: "From",
        address: "Address",
        subject: "Subject",
        name: "Name",
        residenceReg: "Residence Report No.",
        birthdate: "Date of Birth",
        gender: "Sex",
        male: "Male",
        female: "Female",
        para: "In connection with the receipt of the death insurance benefits for the late",
        para2: "the legal heirs hereby notify and confirm, as follows, the fact of receipt and the consent to payment, and provide this notice to your company.",
        para3: "",
        below: "Details -",
        section1: "Policy Information",
        section1a: "a. Product Name :",
        section1b: "b. Policyholder :",
        section1c: "c. Insured :",
        section1d: "d. Policy Dates :",
        section2: "Expected Payment",
        section2Text: "The legal heirs' confirmation signatures are provided and submitted together with the attached documents. Please pay the death insurance benefits to the designated beneficiary on the policy certificate:",
        section2Text2: "",
        section3: "[Legal Heirs of the Insured]",
        tableNo: "",
        tableName: "Name (Home Country)",
        tableId: "National ID No.",
        tableRel: "Relationship",
        father: "Father",
        mother: "Mother",
        section4: "Attachments",
        attach1: "(1) Copy of ID 1 set",
        attach2: "(2) Family Relationship Certificate 1 set",
        to: "To:",
        businessReg: "Business Reg. No."
      },
      "zh-CN": {
        title: "身故保险金支付等之法定继承人确认书",
        recipient: "（收信）",
        sender: "（发信）",
        address: "（地址）",
        subject: "（题目）",
        name: "姓 名",
        residenceReg: "居所申报",
        birthdate: "出生年月日",
        gender: "性 别",
        male: "男",
        female: "女",
        para: "就贵司被保险人故",
        para2: "之身故保险金领取事宜，作为法定继承人之",
        para3: "现如下通知并确认身故保险金领取事实及同意意思，特此告知。",
        below: "以 下 -",
        section1: "保险合同事项",
        section1a: "가. 保险商品名 :",
        section1b: "나. 保险合同人 :",
        section1c: "다. 被保险人 :",
        section1d: "라. 合同日期 :",
        section2: "预计给付保险金",
        section2Text: "关于上述保险合同，已在附件文件中记载被保险人法定继承人确认签名并一并提交。请将身故保险金支付给保险凭证所记载之身故保险金受益人",
        section2Text2: "。",
        section3: "[被保险人的法定继承人]",
        tableNo: "",
        tableName: "本国姓名",
        tableId: "本国身份证号码",
        tableRel: "与被保险人关系",
        father: "父",
        mother: "母",
        section4: "附 件",
        attach1: "身份证复印件 1份",
        attach2: "亲属关系证明书 1份",
        to: "敬启",
        businessReg: "营业者登记号"
      }
    }
    
    const t = translations[locale]
    
    // 날짜 파싱
    const consentDate = getValue("consent_date") || getValue("contract_date_1")
    let year = ""
    let month = ""
    let day = ""
    
    if (consentDate) {
      try {
        const date = new Date(consentDate)
        year = String(date.getFullYear())
        month = String(date.getMonth() + 1).padStart(2, "0")
        day = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패
      }
    }
    
    // 생년월일 파싱
    const birthdate = getValue("insured_birthdate")
    let birthYear = ""
    let birthMonth = ""
    let birthDay = ""
    
    if (birthdate) {
      try {
        const date = new Date(birthdate)
        birthYear = String(date.getFullYear())
        birthMonth = String(date.getMonth() + 1).padStart(2, "0")
        birthDay = String(date.getDate()).padStart(2, "0")
      } catch (e) {
        // 날짜 파싱 실패
      }
    }
    
    // 계약일자 파싱
    const contractDate1 = getValue("contract_date_1")
    const contractDate2 = getValue("contract_date_2")
    let contract1Str = ""
    let contract2Str = ""
    
    if (contractDate1) {
      try {
        const date = new Date(contractDate1)
        contract1Str = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`
      } catch (e) {}
    }
    
    if (contractDate2) {
      try {
        const date = new Date(contractDate2)
        contract2Str = `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}.`
      } catch (e) {}
    }
    
    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        data-locale={locale}
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          position: "relative",
          backgroundColor: "#ffffff",
          padding: "50px 70px 40px 70px",
          boxSizing: "border-box",
          fontFamily,
          color: "#111"
        }}
      >
        <style>{`
          .ic-top {
            font-size: 11.5pt;
            line-height: 1.6;
            letter-spacing: 0.01em;
            font-family: ${fontFamily} !important;
          }
          .ic-row {
            display: flex;
            gap: 25px;
            align-items: baseline;
            margin: 2px 0;
          }
          .ic-k {
            width: 68px;
            white-space: nowrap;
            font-family: ${fontFamily} !important;
          }
          .ic-v {
            flex: 1;
            min-width: 0;
            font-family: ${fontFamily} !important;
          }
          .ic-title {
            margin: 12px 0 8px 0;
            font-size: 12.5pt;
            font-weight: 600;
            letter-spacing: 0.02em;
            font-family: ${fontFamily} !important;
          }
          .ic-info {
            margin-top: 3px;
            font-size: 11.5pt;
            line-height: 1.6;
            font-family: ${fontFamily} !important;
          }
          .ic-info .line {
            margin: 2px 0;
          }
          .ic-info .k2 {
            display: inline-block;
            width: 68px;
            white-space: nowrap;
            font-family: ${fontFamily} !important;
          }
          .ic-mono {
            font-family: ${monoFont} !important;
            letter-spacing: 0.03em;
          }
          .ic-para {
            margin-top: 8px;
            font-size: 11.5pt;
            line-height: 1.6;
            letter-spacing: 0.01em;
            text-align: justify;
            font-family: ${fontFamily} !important;
          }
          .ic-below {
            text-align: center;
            margin: 8px 0 6px 0;
            font-size: 11.5pt;
            letter-spacing: 0.35em;
            font-family: ${fontFamily} !important;
          }
          .ic-sec {
            font-size: 11.5pt;
            line-height: 1.6;
            margin-top: 6px;
            font-family: ${fontFamily} !important;
          }
          .ic-sec .h {
            margin-bottom: 1px;
            font-family: ${fontFamily} !important;
          }
          .ic-sub {
            margin-left: 23px;
          }
          .ic-sub .sline {
            margin: 2px 0;
            font-family: ${fontFamily} !important;
          }
          .ic-indent {
            margin-left: 23px;
            text-align: justify;
            line-height: 1.6;
            font-family: ${fontFamily} !important;
          }
          .ic-heirs-wrap {
            margin-top: 5px;
            margin-left: 23px;
          }
          .ic-heirs {
            width: 567px;
            table-layout: fixed;
            border: 1.2px solid #4c4c4c;
            font-size: 11pt;
            border-collapse: collapse;
          }
          .ic-heirs th, .ic-heirs td {
            border: 1.2px solid #4c4c4c;
            padding: 4px 6px;
            vertical-align: middle;
            text-align: center;
            font-family: ${fontFamily} !important;
          }
          .ic-heirs th {
            font-weight: 600;
            font-family: ${fontFamily} !important;
          }
          .ic-heirs .no { width: 38px; }
          .ic-heirs .name { width: 227px; }
          .ic-heirs .id { width: 208px; }
          .ic-heirs .rel { width: 94px; }
          .ic-date {
            text-align: center;
            margin: 10px 0 6px 0;
            font-size: 12pt;
            letter-spacing: 0.25em;
            font-family: ${fontFamily} !important;
          }
          .ic-attach {
            margin-top: 3px;
            font-size: 11.5pt;
            line-height: 1.6;
            font-family: ${fontFamily} !important;
          }
          .ic-attach .indent2 {
            margin-left: 23px;
            margin-top: 1px;
            margin-bottom: 1px;
            font-family: ${fontFamily} !important;
          }
          .ic-to {
            margin-top: 8px;
            font-size: 11.5pt;
            font-family: ${fontFamily} !important;
          }
        `}</style>
        
        <div className="ic-top" style={{ fontFamily }}>
          {/* 상단 수신/발신/주소 */}
          <div className="ic-row" style={{ fontFamily }}>
            <div className="ic-k" style={{ fontFamily }}>{t.recipient} :</div>
            <div className="ic-v" style={{ fontFamily }}>{getValue("recipient_company") || "삼성화재해상보험주식회사"}</div>
          </div>
          <div className="ic-row" style={{ fontFamily }}>
            <div className="ic-k" style={{ fontFamily }}>{t.sender} :</div>
            <div className="ic-v" style={{ fontFamily }}>{getValue("sender_company") || ""} {getValue("sender_company") ? <span style={{ fontFamily }}>(대 표 : {getValue("sender_representative") || ""})</span> : ""} {t.businessReg} : <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span></div>
          </div>
          <div className="ic-row" style={{ fontFamily }}>
            <div className="ic-k" style={{ fontFamily }}>{t.address} :</div>
            <div className="ic-v" style={{ fontFamily }}>{getValue("sender_address") || ""}</div>
          </div>

          <div className="ic-title" style={{ fontFamily }}>{t.subject} : {t.title}</div>

          {/* 피보험자 정보 */}
          <div className="ic-info" style={{ fontFamily }}>
            <div className="line" style={{ fontFamily }}>
              <span className="k2" style={{ fontFamily }}>{t.name} :</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_name") || ""}</span> {getValue("insured_name_kr") ? <span style={{ fontFamily }}>({getValue("insured_name_kr")})</span> : ""}
            </div>
            <div className="line" style={{ fontFamily }}>
              <span className="k2" style={{ fontFamily }}>{t.residenceReg} :</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_registration") || ""}</span>
            </div>
            <div className="line" style={{ fontFamily }}>
              <span className="k2" style={{ fontFamily }}>{t.birthdate} :</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{birthYear ? `${birthYear}. ${birthMonth}. ${birthDay}.` : ""}</span>
            </div>
            <div className="line" style={{ fontFamily }}>
              <span className="k2" style={{ fontFamily }}>{t.gender} :</span> <span style={{ fontFamily }}>{getValue("insured_gender") === "남" || getValue("insured_gender") === "male" || getValue("insured_gender") === "男" ? t.male : t.female}</span>
            </div>
            <div className="line" style={{ fontFamily }}>
              <span className="k2" style={{ fontFamily }}>{t.address} :</span> <span style={{ fontFamily }}>{getValue("insured_address") || ""}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="ic-para" style={{ fontFamily }}>
            {locale === "ko" ? (
              <>
                <span style={{ fontFamily }}>{t.para}</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_name") || ""}</span> {getValue("insured_name_kr") ? <span style={{ fontFamily }}>({getValue("insured_name_kr")})</span> : ""}<span style={{ fontFamily }}>{t.para2}</span> <span style={{ fontFamily }}>{getValue("sender_company") || ""}</span> {getValue("sender_company") ? <span style={{ fontFamily }}>(대표 : {getValue("sender_representative") || ""})</span> : ""} <span style={{ fontFamily }}>{t.businessReg}</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span> <span style={{ fontFamily }}>{t.para3}</span>
              </>
            ) : locale === "zh-CN" ? (
              <>
                <span style={{ fontFamily }}>{t.para}</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_name") || ""}</span> {getValue("insured_name_kr") ? <span style={{ fontFamily }}>（{getValue("insured_name_kr")}）</span> : ""}<span style={{ fontFamily }}>{t.para2}</span> <span style={{ fontFamily }}>{getValue("sender_company") || ""}</span> {getValue("sender_company") && getValue("sender_representative") ? <span style={{ fontFamily }}>（代表：{getValue("sender_representative")}，登记号：{getValue("sender_registration") || ""}）</span> : ""}<span style={{ fontFamily }}>，{t.para3}</span>
              </>
            ) : (
              <>
                <span style={{ fontFamily }}>{t.para}</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_name") || ""}</span> {getValue("insured_name_kr") ? <span style={{ fontFamily }}>({getValue("insured_name_kr")})</span> : ""}<span style={{ fontFamily }}>, {t.para2}</span>
              </>
            )}
          </div>

          <div className="ic-below" style={{ fontFamily }}>{t.below}</div>

          {/* 1. 보험계약사항 */}
          <div className="ic-sec" style={{ fontFamily }}>
            <div className="h" style={{ fontFamily }}>{t.section1}</div>
            <div className="ic-sub" style={{ fontFamily }}>
              <div className="sline" style={{ fontFamily }}><span style={{ fontFamily }}>{t.section1a}</span> <span style={{ fontFamily }}>{getValue("insurance_product") || ""}</span></div>
              <div className="sline" style={{ fontFamily }}><span style={{ fontFamily }}>{t.section1b}</span> <span style={{ fontFamily }}>{getValue("policyholder") || ""}</span> {getValue("sender_representative") ? <span style={{ fontFamily }}>(대 표 : {getValue("sender_representative")})</span> : ""} <span style={{ fontFamily }}>{t.businessReg} :</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span></div>
              <div className="sline" style={{ fontFamily }}><span style={{ fontFamily }}>{t.section1c}</span> <span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("insured_name") || ""}</span> {getValue("insured_name_kr") ? <span style={{ fontFamily }}>({getValue("insured_name_kr")})</span> : ""}<span style={{ fontFamily }}>.</span></div>
              <div className="sline" style={{ fontFamily }}><span style={{ fontFamily }}>{t.section1d}</span> <span style={{ fontFamily }}>{contract1Str ? `①${contract1Str}` : ""} {contract2Str ? `+ ②${contract2Str}` : ""}</span></div>
            </div>
          </div>

          {/* 2. 예정 지급보험금 */}
          <div className="ic-sec" style={{ fontFamily }}>
            <div className="h" style={{ fontFamily }}>{t.section2}</div>
            <div className="ic-indent" style={{ fontFamily }}>
              {locale === "ko" ? (
                <>
                  <span style={{ fontFamily }}>{t.section2Text}</span> <span style={{ fontFamily }}>{getValue("sender_company") || ""}</span> {getValue("sender_representative") ? <span style={{ fontFamily }}>대표 {getValue("sender_representative")}</span> : ""} <span style={{ fontFamily }}>{t.businessReg}:</span><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span><span style={{ fontFamily }}>{t.section2Text2}</span>
                </>
              ) : locale === "zh-CN" ? (
                <>
                  <span style={{ fontFamily }}>{t.section2Text}（株）{getValue("sender_company") || ""} 代表 {getValue("sender_representative") || ""}（登记号：</span><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span><span style={{ fontFamily }}>）{t.section2Text2}</span>
                </>
              ) : (
                <>
                  <span style={{ fontFamily }}>{t.section2Text}</span> <span style={{ fontFamily }}>{getValue("sender_company") || ""}, CEO {getValue("sender_representative") || ""} (Business Reg. No.: </span><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("sender_registration") || ""}</span><span style={{ fontFamily }}>).</span>
                </>
              )}
            </div>
          </div>

          {/* 3. 법적 상속인 */}
          <div className="ic-sec" style={{ fontFamily }}>
            <div className="h" style={{ fontFamily }}>{t.section3}</div>

            <div className="ic-heirs-wrap" style={{ fontFamily }}>
              <table className="ic-heirs" style={{ fontFamily }}>
                <thead>
                  <tr>
                    <th className="no" style={{ fontFamily }}>{t.tableNo}</th>
                    <th className="name" style={{ fontFamily }}>{t.tableName}</th>
                    <th className="id" style={{ fontFamily }}>{t.tableId}</th>
                    <th className="rel" style={{ fontFamily }}>{t.tableRel}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="no" style={{ fontFamily }}>1</td>
                    <td className="name"><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("heir_1_name") || getValue("party_a_name") || ""}</span></td>
                    <td className="id"><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("heir_1_id_number") || getValue("party_a_id_number") || ""}</span></td>
                    <td className="rel" style={{ fontFamily }}>{getValue("heir_1_relation") === "부" || getValue("heir_1_relation") === "father" || getValue("heir_1_relation") === "父" || getValue("party_a_relation") === "부" ? t.father : t.mother}</td>
                  </tr>
                  <tr>
                    <td className="no" style={{ fontFamily }}>2</td>
                    <td className="name"><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("heir_2_name") || ""}</span></td>
                    <td className="id"><span className="ic-mono" style={{ fontFamily: monoFont }}>{getValue("heir_2_id_number") || ""}</span></td>
                    <td className="rel" style={{ fontFamily }}>{getValue("heir_2_relation") === "모" || getValue("heir_2_relation") === "mother" || getValue("heir_2_relation") === "母" ? t.mother : t.father}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 날짜 */}
          <div className="ic-date" style={{ fontFamily }}>{year || ""}.&nbsp;&nbsp;{month || "&nbsp;&nbsp;"}.&nbsp;&nbsp;{day || "&nbsp;&nbsp;"}.</div>

          {/* 4. 별첨 */}
          <div className="ic-sec" style={{ fontFamily }}>
            <div className="h" style={{ fontFamily }}>{t.section4}</div>
            <div className="ic-attach" style={{ fontFamily }}>
              <div className="indent2" style={{ fontFamily }}>{t.attach1}</div>
              <div className="indent2" style={{ fontFamily }}>{t.attach2}</div>
            </div>
          </div>

          {/* 수신처 */}
          <div className="ic-to" style={{ fontFamily }}>{getValue("recipient_company") || "삼성화재해상보험주식회사"}&nbsp;&nbsp;{t.to}</div>
        </div>
      </div>
    )
  }
)
