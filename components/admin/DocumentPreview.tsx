"use client"

import { forwardRef } from "react"
import { type DocumentType } from "@/lib/documents/templates"
import { format } from "date-fns"

interface DocumentPreviewProps {
  documentType: DocumentType
  data: any
  locale: "ko" | "en" | "zh-CN"
}

const DocumentPreview = forwardRef<HTMLDivElement, DocumentPreviewProps>(
  function DocumentPreview({ documentType, data, locale }, ref) {
  const getValue = (key: string) => {
    // 먼저 평면 키로 접근 시도 (예: "special_authority.withdrawal_of_suit"가 직접 키인 경우)
    if (data?.[key] !== undefined && data?.[key] !== null) {
      return data[key]
    }
    
    // 중첩된 키 처리 (예: "special_authority.withdrawal_of_suit"를 data.special_authority.withdrawal_of_suit로 접근)
    if (key.includes(".")) {
      const keys = key.split(".")
      let value = data
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined || value === null) return ""
      }
      return value || ""
    }
    return data?.[key] || ""
  }

  const getCheckboxValue = (key: string) => {
    // 중첩된 키 처리 (예: "authorized_tasks.civil_criminal")
    if (key.includes(".")) {
      const keys = key.split(".")
      let value = data
      for (const k of keys) {
        value = value?.[k]
        if (value === undefined || value === null) {
          // 배열인 경우도 확인 (예: authorized_tasks가 배열인 경우)
          if (Array.isArray(value)) {
            return value.includes(keys[keys.length - 1])
          }
          return false
        }
      }
      return value === true || value === "true" || value === "on"
    }
    
    // 평면 키 접근
    const value = data?.[key] || data?.authorized_tasks?.[key] || data?.authorized_actions?.[key] || data?.special_authority?.[key]
    
    // 배열인 경우 (예: authorized_tasks가 배열로 저장된 경우)
    if (Array.isArray(value)) {
      return value.length > 0
    }
    
    return value === true || value === "true" || value === "on"
  }

  const formatDate = (dateStr: string, dateType: "full" | "short" = "full") => {
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
      return dateStr
    }
  }

  // 언어별 폰트 클래스
  const fontClass = locale === "ko" ? "font-korean" : locale === "zh-CN" ? "font-chinese" : "font-sans"

    switch (documentType) {
      case "agreement":
        return <AgreementPreview ref={ref} data={data} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      case "power_of_attorney":
        return <PowerOfAttorneyPreview ref={ref} data={data} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} />
      case "attorney_appointment":
        return <AttorneyAppointmentPreview ref={ref} data={data} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      case "litigation_power":
        return <LitigationPowerPreview ref={ref} data={data} locale={locale} fontClass={fontClass} getValue={getValue} getCheckboxValue={getCheckboxValue} formatDate={formatDate} />
      case "insurance_consent":
        return <InsuranceConsentPreview ref={ref} data={data} locale={locale} fontClass={fontClass} getValue={getValue} formatDate={formatDate} />
      default:
        return <div ref={ref} className="p-8 text-center text-gray-500">미리보기를 사용할 수 없습니다.</div>
    }
  }
)

export default DocumentPreview

// 합의서 미리보기
const AgreementPreview = forwardRef<HTMLDivElement, any>(
  function AgreementPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
  const title = locale === "ko" ? "합의서" : locale === "en" ? "Agreement" : "协议"
  const deceasedName = getValue("deceased_name") || "_________________________"
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
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "25px 35px",
          fontSize: "12px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
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
      {/* 제목 */}
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "16px", fontSize: "22px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 서문 */}
      <p style={{ marginBottom: "20px", fontSize: "11px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{intro}</p>

      {/* 갑 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? '"갑" 유가족 대표' : locale === "en" ? '"Party A" Family Representative' : '"甲方" 家属代表'}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
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
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "국적" : locale === "en" ? "Nationality" : "国籍"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_nationality")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("party_a_birthdate"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_a_contact")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "관계" : locale === "en" ? "Relation" : "关系"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>
                {getValue("party_a_relation") === "기타" ? getValue("party_a_relation_other") : getValue("party_a_relation")}
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={2}>{locale === "ko" ? "본국 신분증 번호" : locale === "en" ? "ID Number" : "本国身份证号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={2}>{getValue("party_a_id_number")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={2}>{locale === "ko" ? "본국 주소" : locale === "en" ? "Home Address" : "本国地址"}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={6}>{getValue("party_a_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 을 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? '"을" 회사측 대표' : locale === "en" ? '"Party B" Company Representative' : '"乙方" 公司代表'}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "상호" : locale === "en" ? "Company Name" : "公司名称"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_company_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "대표자 성명" : locale === "en" ? "Representative Name" : "代表姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_representative")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_registration")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("party_b_contact")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("party_b_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 고인 정보 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "고인(망인)" : locale === "en" ? "Deceased" : "死者"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "외국인등록번호" : locale === "en" ? "Foreigner Registration Number" : "外国人登记号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_foreigner_id")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("deceased_birthdate"))}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주소지" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("deceased_address")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사건발생위치" : locale === "en" ? "Incident Location" : "事件发生地点"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("incident_location")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "사건발생시간" : locale === "en" ? "Incident Time" : "事件发生时间"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("incident_time")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 합의 내용 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "합의 내용" : locale === "en" ? "Agreement Terms" : "协议内容"}</h2>
        <div className="space-y-2 leading-relaxed" style={{ fontSize: "10px" }}>
          <p>1. {locale === "ko" ? "갑과 을은 본 사건(망인의 사망 관련 건)에 관하여 상호 원만히 합의하였고, 본 합의서 체결로써 본 사건과 관련된 분쟁이 종결되었음을 확인한다." : locale === "en" ? "Party A and Party B have amicably agreed regarding this case (related to the death of the deceased), and confirm that all disputes related to this case are resolved by the execution of this agreement." : "甲方和乙方就本案（与死者死亡相关）已友好达成协议，并确认通过签署本协议，与本案相关的所有争议已解决。"}</p>
          <p>2. {locale === "ko" ? "갑은 본 사건과 관련하여 향후 을 및 을의 대표자, 사업장에 대하여 민사·형사·행정(산재 등 포함) 기타 일체의 사항에 관하여 어떠한 이의도 제기하지 아니하며, 추가로 어떠한 청구나 권리 주장도 하지 아니한다." : locale === "en" ? "Party A shall not raise any objections or make any additional claims or assertions of rights against Party B, its representative, or the workplace regarding civil, criminal, administrative (including industrial accidents) or any other matters related to this case." : "甲方就本案相关事宜，今后不对乙方及其代表、工作场所提出任何民事、刑事、行政（包括工伤等）或其他任何异议，也不提出任何追加请求或权利主张。"}</p>
          <p>3. {locale === "ko" ? "갑은 본 사건과 관련하여 을의 대표자에 대한 처벌을 원하지 아니한다. 갑은 위의사를 표시한 처벌불원서를 본 합의서와 함께 제출한다." : locale === "en" ? "Party A does not wish for the punishment of Party B's representative in relation to this case. Party A shall submit a non-prosecution request expressing this intention together with this agreement." : "甲方不希望就本案对乙方代表进行处罚。甲方应提交表示此意的免予起诉书，与本协议一起提交。"}</p>
          <p>4. {locale === "ko" ? "갑과 을은 본 합의가 각 당사자의 자유로운 의사에 따라 작성·체결되었으며, 강박 또는 기망 등에 의한 것이 아님을 상호 확인한다." : locale === "en" ? "Party A and Party B mutually confirm that this agreement has been prepared and executed according to each party's free will and is not the result of coercion or fraud." : "甲方和乙方相互确认，本协议是根据各方自由意志编写和签署的，并非因胁迫或欺诈所致。"}</p>
        </div>
      </div>

      {/* 서명란 */}
      <div style={{ marginTop: "24px" }}>
        <p style={{ marginBottom: "12px", fontSize: "10px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본 합의서는 2부 작성하여 갑과 을이 각각 서명(또는 기명) 날인 후 각 1부씩 보관한다." : locale === "en" ? "This agreement is prepared in duplicate, with Party A and Party B each signing (or initialing) and sealing, and each party keeping one copy." : "本协议一式两份，甲方和乙方各自签名（或署名）盖章后，各保存一份。"}</p>
        <div style={{ marginTop: "16px" }}>
          <p style={{ marginBottom: "8px", fontSize: "11px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("signature_date") || getValue("agreement_date") || getValue("date"))}</p>
          <p style={{ marginBottom: "8px", fontSize: "11px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "갑(유가족 대표) 성명:" : locale === "en" ? "Party A (Family Representative) Name:" : "甲方（家属代表）姓名："}</p>
          <p style={{ marginBottom: "8px", fontSize: "11px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "을(사업장 대표) 성명:" : locale === "en" ? "Party B (Company Representative) Name:" : "乙方（公司代表）姓名："}</p>
        </div>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.08,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%"
        }}
      />
      
      {/* 푸터 로고 및 정보 */}
      <div style={{ position: "relative", zIndex: 20, marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "transparent" }}>
        <div className="flex items-center justify-center mb-2" style={{ backgroundColor: "transparent", position: "relative", zIndex: 21 }}>
          <img 
            src="/SJ_logo.svg" 
            alt="법무법인 세중" 
            style={{ 
              height: "32px", 
              width: "auto", 
              objectFit: "contain",
              maxWidth: "100%",
              backgroundColor: "transparent",
              display: "block",
              visibility: "visible",
              opacity: "1",
              zIndex: 22,
              position: "relative"
            }} 
          />
        </div>
        <div className="text-center" style={{ fontSize: "8px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          {locale === "ko"
            ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
            : locale === "en"
            ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
            : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"}
        </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.06,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "400%",
          height: "400%",
          left: "-150%",
          top: "-150%"
        }}
      />
      </div>
    )
  }
)

// 위임장 미리보기
const PowerOfAttorneyPreview = forwardRef<HTMLDivElement, any>(
  function PowerOfAttorneyPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate }, ref) {
    const title = locale === "ko" ? "위임장" : locale === "en" ? "Power of Attorney" : "委托书"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "25px 35px",
          fontSize: "12px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
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
      <h1 style={{ textAlign: "center", fontWeight: "bold", marginBottom: "16px", fontSize: "22px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 위임인 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "1. 위임인" : locale === "en" ? "1. Principal" : "1. 委托人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_name")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{formatDate(getValue("principal_birthdate"))}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "여권번호" : locale === "en" ? "Passport Number" : "护照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_passport")}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국신분증번호" : locale === "en" ? "ID Number" : "本国身份证号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_id_number")}</td>
            </tr>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국주소" : locale === "en" ? "Home Address" : "本国地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{getValue("principal_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 수임인 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "2. 수임인" : locale === "en" ? "2. Attorney" : "2. 受托人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>710409-1******</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사업장명" : locale === "en" ? "Office Name" : "事务所名称"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>214-09-16365</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "대표 변호사" : locale === "en" ? "Managing Attorney" : "代表律师"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>031-8044-8805</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 복 대리인 */}
      <div style={{ marginBottom: "16px" }}>
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "3. 수임인 복 대리인" : locale === "en" ? "3. Sub-Attorney" : "3. 复代理人"}</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
            <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "32%", minWidth: "32%", maxWidth: "32%" }} />
            </colgroup>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "주성규" : locale === "en" ? "Joo Seong-gyu" : "朱성규"}</td>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주민등록번호" : locale === "en" ? "Registration Number" : "登记号"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>620613-1******</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "직위" : locale === "en" ? "Position" : "职位"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "국장" : locale === "en" ? "Director" : "局长"}</td>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "연락처" : locale === "en" ? "Contact" : "联系方式"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>010-7152-7094</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
                <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }} colSpan={3}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</td>
              </tr>
            </tbody>
          </table>
        </div>

      {/* 위임업무 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "위임업무" : locale === "en" ? "Authorized Tasks" : "委托业务"}</h2>
        <div className="grid grid-cols-2 gap-2" style={{ fontSize: "10px" }}>
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

      {/* 서명란 */}
      <div className="mt-6">
        <p className="mb-3" style={{ fontSize: "11px" }}>{locale === "ko" ? "위 위임인은 수임인 및 복 대리인에게 위와 같이 위임 업무를 위임 합니다." : locale === "en" ? "The above principal hereby delegates the above tasks to the attorney and sub-attorney." : "上述委托人特此将上述委托业务委托给受托人及复代理人。"}</p>
        <div className="mt-4 space-y-2">
          <p style={{ fontSize: "11px" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("power_date"))}</p>
          <p style={{ fontSize: "11px" }}>{locale === "ko" ? "위임인(외국인 부/모):" : locale === "en" ? "Principal (Foreign Parent):" : "委托人（外国人父/母）："}</p>
          <p style={{ fontSize: "11px" }}>{locale === "ko" ? "수임인 변호사 이택기 (인)" : locale === "en" ? "Attorney Lee Taek-gi (Seal)" : "受托人 律师 李택기（印）"}</p>
          <p style={{ fontSize: "11px" }}>{locale === "ko" ? "수임인 복 대리인 주성규(인)" : locale === "en" ? "Sub-Attorney Joo Seong-gyu (Seal)" : "复代理人 周성규（印）"}</p>
        </div>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.08,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%"
        }}
      />
      
      {/* 푸터 로고 및 정보 */}
      <div style={{ position: "relative", zIndex: 20, marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "transparent" }}>
        <div className="flex items-center justify-center mb-2" style={{ backgroundColor: "transparent", position: "relative", zIndex: 21 }}>
          <img 
            src="/SJ_logo.svg" 
            alt="법무법인 세중" 
            style={{ 
              height: "32px", 
              width: "auto", 
              objectFit: "contain",
              maxWidth: "100%",
              backgroundColor: "transparent",
              display: "block",
              visibility: "visible",
              opacity: "1",
              zIndex: 22,
              position: "relative"
            }} 
          />
        </div>
        <div className="text-center" style={{ fontSize: "8px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          {locale === "ko"
            ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
            : locale === "en"
            ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
            : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"}
        </div>
      </div>
      </div>
    )
  }
)

// 변호인선임서 미리보기
const AttorneyAppointmentPreview = forwardRef<HTMLDivElement, any>(
  function AttorneyAppointmentPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
    const title = locale === "ko" ? "변호인 선임서" : locale === "en" ? "Appointment of Counsel" : "律师任命书"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "25px 35px",
          fontSize: "12px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
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
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "22px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 사건 정보 */}
      <div className="mb-4">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
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
      <p className="mb-4 leading-relaxed" style={{ fontSize: "11px" }}>
        {locale === "ko"
          ? "위 사건에 관하여 아래와 같이 변호인을 선임하였음으로 이이 변호인 선임서를 제출합니다."
          : locale === "en"
          ? "Regarding the above case, we hereby appoint counsel as follows and submit this appointment of counsel form."
          : "就上述案件，特此任命如下律师，并提交此律师任命书。"}
      </p>

      {/* 선임인 정보 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "선임인 가족대표자" : locale === "en" ? "Appointer's Family Representative" : "任命人家属代表"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
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
          <div className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center" style={{ fontSize: "10px", width: "18%" }}>{locale === "ko" ? "변호인" : locale === "en" ? "Counsel" : "律师"}</div>
          <div className="border border-gray-400 px-3 py-2" style={{ fontSize: "10px", width: "82%" }}>
            <p style={{ fontWeight: "600", marginBottom: "4px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "법률사무소 세중" : locale === "en" ? "Sejoong Law Office" : "世中律师事务所"}</p>
            <p style={{ fontWeight: "600", marginBottom: "4px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "변호사 이택기" : locale === "en" ? "Attorney Lee Taek-gi" : "律师 李택기"}</p>
            <p style={{ marginBottom: "4px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "안산시 단원구 원곡로 45, 세중빌딩 2층" : locale === "en" ? "2F Sejoong Building, 45 Wonkok-ro, Danwon-gu, Ansan-si" : "安山市檀园区元谷路45号世中大厦2层"}</p>
            <p>{locale === "ko" ? "전화" : locale === "en" ? "Phone" : "电话"}: 031-8044-8805 {locale === "ko" ? "팩스" : locale === "en" ? "Fax" : "传真"}: 031-491-8817</p>
          </div>
        </div>
      </div>

      {/* 일자 및 수신처 */}
      <div className="mt-6">
        <p className="mb-3" style={{ fontSize: "11px" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("appointment_date"))}</p>
        <p className="text-center mt-4" style={{ fontSize: "11px" }}>{getValue("court") || "의정부지방법원"} {locale === "ko" ? "귀중" : locale === "en" ? "" : "收"}</p>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.08,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%"
        }}
      />
      
      {/* 푸터 로고 및 정보 */}
      <div style={{ position: "relative", zIndex: 20, marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "transparent" }}>
        <div className="flex items-center justify-center mb-2" style={{ backgroundColor: "transparent", position: "relative", zIndex: 21 }}>
          <img 
            src="/SJ_logo.svg" 
            alt="법무법인 세중" 
            style={{ 
              height: "32px", 
              width: "auto", 
              objectFit: "contain",
              maxWidth: "100%",
              backgroundColor: "transparent",
              display: "block",
              visibility: "visible",
              opacity: "1",
              zIndex: 22,
              position: "relative"
            }} 
          />
        </div>
        <div className="text-center" style={{ fontSize: "8px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          {locale === "ko"
            ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
            : locale === "en"
            ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
            : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"}
        </div>
      </div>
      </div>
    )
  }
)

// 소송위임장 미리보기
const LitigationPowerPreview = forwardRef<HTMLDivElement, any>(
  function LitigationPowerPreview({ data, locale, fontClass, getValue, getCheckboxValue, formatDate }, ref) {
    const title = locale === "ko" ? "소송위임장" : locale === "en" ? "Litigation Power of Attorney" : "诉讼委托书"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "25px 35px",
          fontSize: "12px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
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
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "22px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 사건 정보 */}
      <div className="mb-4">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
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
      <p className="mb-4 leading-relaxed" style={{ fontSize: "11px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
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
        <h2 style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "기타 특별수권사항" : locale === "en" ? "Special Authority" : "其他特别授权事项"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "12px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "80%", minWidth: "80%", maxWidth: "80%" }} />
            <col style={{ width: "20%", minWidth: "20%", maxWidth: "20%" }} />
          </colgroup>
          <thead>
            <tr>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수권사항" : locale === "en" ? "Granted Powers" : "授权事项"}</td>
              <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", backgroundColor: "#f3f4f6", fontWeight: "600", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "수권여부" : locale === "en" ? "Grant Status" : "授权与否"}</td>
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
                  <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
                    {item.label[locale as keyof typeof item.label]}
                  </td>
                  <td style={{ border: "1px solid #9ca3af", padding: "8px 12px", textAlign: "center", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif", fontSize: "14px", fontWeight: "bold" }}>
                    {value === "O" || value === "o" ? "○" : "×"}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <p style={{ marginTop: "8px", fontSize: "10px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          * {locale === "ko" ? "기타특별수권사항(권한을 부여하면 O표시, 보류하면 X표시)" : locale === "en" ? "Other special granted powers (mark O if granted, X if reserved)" : "其他特别授权事项（授权则标记○，保留则标记×）"}
        </p>
      </div>

      {/* 일자 및 서명 */}
      <div style={{ marginTop: "24px" }}>
        <p style={{ marginBottom: "12px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("power_date"))}</p>
        <div style={{ marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "baseline", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
            <span style={{ lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "위임인 가족대표 성명:" : locale === "en" ? "Principal's Family Representative Name:" : "委托人家属代表姓名："}</span>
            <span style={{ marginLeft: "4px", borderBottom: getValue("principal_name") ? "1px solid #000" : "none", minWidth: getValue("principal_name") ? "100px" : "0", paddingBottom: getValue("principal_name") ? "2px" : "0", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("principal_name") || ""}</span>
            <span style={{ marginLeft: "2px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "(인)" : locale === "en" ? "(Seal)" : "（印）"}</span>
          </div>
        </div>
        <p style={{ marginBottom: "8px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{locale === "ko" ? "본국신분증번호:" : locale === "en" ? "National ID Number:" : "本国身份证号："} {getValue("principal_id_number")}</p>
        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "12px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{getValue("court") || "의정부지방법원"} {locale === "ko" ? "귀중" : locale === "en" ? "" : "收"}</p>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.08,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%"
        }}
      />
      
      {/* 푸터 로고 및 정보 */}
      <div style={{ position: "relative", zIndex: 20, marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "transparent" }}>
        <div className="flex items-center justify-center mb-2" style={{ backgroundColor: "transparent", position: "relative", zIndex: 21 }}>
          <img 
            src="/SJ_logo.svg" 
            alt="법무법인 세중" 
            style={{ 
              height: "32px", 
              width: "auto", 
              objectFit: "contain",
              maxWidth: "100%",
              backgroundColor: "transparent",
              display: "block",
              visibility: "visible",
              opacity: "1",
              zIndex: 22,
              position: "relative"
            }} 
          />
        </div>
        <div className="text-center" style={{ fontSize: "8px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          {locale === "ko"
            ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
            : locale === "en"
            ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
            : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"}
        </div>
      </div>
      </div>
    )
  }
)

// 사망보험금지급동의 미리보기
const InsuranceConsentPreview = forwardRef<HTMLDivElement, any>(
  function InsuranceConsentPreview({ data, locale, fontClass, getValue, formatDate }, ref) {
    const title = locale === "ko"
      ? "사망보험금 지급 동의 법정상속인 확인서"
      : locale === "en"
      ? "Death Insurance Payment Consent Legal Heir Confirmation"
      : "死亡保险金支付同意法定继承人确认书"

    return (
      <div 
        ref={ref} 
        className={`border border-gray-300 ${fontClass}`} 
        data-preview-id="document-preview"
        style={{ 
          width: "794px", 
          minHeight: "1123px", 
          maxHeight: "1123px",
          height: "1123px",
          padding: "25px 35px",
          fontSize: "12px",
          lineHeight: "1.5",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          backgroundColor: "transparent",
          fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif"
        }}
      >
      {/* 흰색 배경 레이어 (워터마크 아래) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundColor: "#ffffff",
          zIndex: 0
        }}
      />
      
      {/* 문서 콘텐츠 */}
      <div style={{ position: "relative", zIndex: 1, flex: "1", display: "flex", flexDirection: "column" }}>
      <h1 className="text-center font-bold mb-4" style={{ fontSize: "20px", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>{title}</h1>

      {/* 수신/발신 정보 */}
      <div className="mb-4">
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "수신" : locale === "en" ? "Recipient" : "收件"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("recipient_company") || "삼성화재해상보험주식회사"}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "발신" : locale === "en" ? "Sender" : "发件"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("sender_company")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "사업자등록번호" : locale === "en" ? "Business Registration Number" : "营业执照号"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("sender_registration")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("sender_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 고인 정보 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "고인 (피보험자)" : locale === "en" ? "Deceased (Insured Person)" : "死者（被保险人）"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "18%", minWidth: "18%", maxWidth: "18%" }} />
            <col style={{ width: "82%", minWidth: "82%", maxWidth: "82%" }} />
          </colgroup>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성명" : locale === "en" ? "Name" : "姓名"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("insured_name")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "거소신고" : locale === "en" ? "Residence Registration" : "居所申报"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("insured_registration")}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "생년월일" : locale === "en" ? "Date of Birth" : "出生日期"}</td>
              <td className="border border-gray-400 px-3 py-2">{formatDate(getValue("insured_birthdate"))}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "성별" : locale === "en" ? "Gender" : "性别"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("insured_gender") || ""}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "주소" : locale === "en" ? "Address" : "地址"}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("insured_address")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 보험계약 정보 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "보험계약사항" : locale === "en" ? "Insurance Contract Details" : "保险合同事项"}</h2>
        <div className="space-y-2" style={{ fontSize: "10px" }}>
          <p><strong>{locale === "ko" ? "가. 보험상품명:" : locale === "en" ? "a. Insurance Product Name:" : "a. 保险产品名称："}</strong> {getValue("insurance_product")}</p>
          <p><strong>{locale === "ko" ? "나. 보험계약자:" : locale === "en" ? "b. Policyholder:" : "b. 投保人："}</strong> {getValue("policyholder")}</p>
          <p><strong>{locale === "ko" ? "다. 피보험자:" : locale === "en" ? "c. Insured Person:" : "c. 被保险人："}</strong> {getValue("insured_name")}</p>
          <p><strong>{locale === "ko" ? "라. 계약 일자:" : locale === "en" ? "d. Contract Date:" : "d. 合同日期："}</strong> {getValue("contract_date_1")} {getValue("contract_date_2") && `+ ${getValue("contract_date_2")}`}</p>
        </div>
      </div>

      {/* 법정상속인 */}
      <div className="mb-4">
        <h2 className="font-bold mb-3" style={{ fontSize: "14px" }}>{locale === "ko" ? "법정상속인" : locale === "en" ? "Legal Heirs" : "法定继承人"}</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #9ca3af", marginBottom: "12px", fontSize: "10px", tableLayout: "fixed", borderSpacing: "0" }}>
          <colgroup>
            <col style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }} />
            <col style={{ width: "34%", minWidth: "34%", maxWidth: "34%" }} />
            <col style={{ width: "33%", minWidth: "33%", maxWidth: "33%" }} />
          </colgroup>
          <thead>
            <tr>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "본국성명" : locale === "en" ? "Name in Home Country" : "本国姓名"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "본국 신분증번호" : locale === "en" ? "Home Country ID Number" : "本国身份证号"}</td>
              <td className="border border-gray-400 px-3 py-2 bg-gray-100 font-semibold text-center">{locale === "ko" ? "보험자와의 관계" : locale === "en" ? "Relationship to Insured" : "与投保人关系"}</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-400 px-3 py-2">{getValue("heir_1_name")}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("heir_1_id")}</td>
              <td className="border border-gray-400 px-3 py-2 text-center">{locale === "ko" ? "부" : locale === "en" ? "Father" : "父"}</td>
            </tr>
            <tr>
              <td className="border border-gray-400 px-3 py-2">{getValue("heir_2_name")}</td>
              <td className="border border-gray-400 px-3 py-2">{getValue("heir_2_id")}</td>
              <td className="border border-gray-400 px-3 py-2 text-center">{locale === "ko" ? "모" : locale === "en" ? "Mother" : "母"}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 일자 및 수신처 */}
      <div style={{ marginTop: "auto", paddingTop: "16px" }}>
        <p className="mb-3" style={{ fontSize: "11px" }}>{locale === "ko" ? "일자" : locale === "en" ? "Date" : "日期"}: {formatDate(getValue("consent_date"))}</p>
        <p className="text-center mt-4" style={{ fontSize: "11px" }}>{getValue("recipient_company") || "삼성화재해상보험주식회사"} {locale === "ko" ? "귀하" : locale === "en" ? "" : "收"}</p>
      </div>
      </div>
      
      {/* 워터마크 배경 (맨 위) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "url('/SJ_logo.svg')",
          backgroundRepeat: "repeat",
          backgroundSize: "400px auto",
          backgroundPosition: "0 0",
          opacity: 0.08,
          zIndex: 10,
          backgroundColor: "transparent",
          transform: "rotate(-30deg)",
          transformOrigin: "center center",
          width: "150%",
          height: "150%",
          left: "-25%",
          top: "-25%"
        }}
      />
      
      {/* 푸터 로고 및 정보 */}
      <div style={{ position: "relative", zIndex: 20, marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #e5e7eb", backgroundColor: "transparent" }}>
        <div className="flex items-center justify-center mb-2" style={{ backgroundColor: "transparent", position: "relative", zIndex: 21 }}>
          <img 
            src="/SJ_logo.svg" 
            alt="법무법인 세중" 
            style={{ 
              height: "32px", 
              width: "auto", 
              objectFit: "contain",
              maxWidth: "100%",
              backgroundColor: "transparent",
              display: "block",
              visibility: "visible",
              opacity: "1",
              zIndex: 22,
              position: "relative"
            }} 
          />
        </div>
        <div className="text-center" style={{ fontSize: "8px", color: "#666", lineHeight: "1.5", fontFamily: locale === "ko" ? '"Noto Sans KR", sans-serif' : locale === "zh-CN" ? '"FangSong", "STFangsong", serif' : "system-ui, sans-serif" }}>
          {locale === "ko"
            ? "법무법인 세중 | 경기도 안산시 단원구 원곡로 45 세중빌딩 2층 | 전화: 031-8044-8805 | 이메일: sejoonglaw@gmail.com"
            : locale === "en"
            ? "Sejoong Law Firm | 2F Sejoong Building, 45 Wongok-ro, Danwon-gu, Ansan-si, Gyeonggi-do | Phone: 031-8044-8805 | Email: sejoonglaw@gmail.com"
            : "世中律师事务所 | 京畿道安山市檀园区元谷路45号世中大厦2层 | 电话: 031-8044-8805 | 邮箱: sejoonglaw@gmail.com"}
        </div>
      </div>
      </div>
    )
  }
)

