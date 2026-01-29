// Extract readable text from document data for segmentation
import type { DocumentType } from "./templates"
import { getTemplate } from "./templates"

/**
 * Extract readable text from document data
 * Converts structured data into human-readable paragraphs for segmentation
 */
export function extractReadableText(
  documentType: DocumentType,
  data: Record<string, any>,
  locale: "ko" | "en" | "zh-CN" | "si" | "ta" = "ko"
): string {
  try {
    const template = getTemplate(documentType)
    const paragraphs: string[] = []

    // Group fields by their group property
    const groupedFields: Record<string, Array<{ key: string; label: Record<string, string> }>> = {}
    
    template.fields.forEach((field) => {
      const group = field.group || "general"
      if (!groupedFields[group]) {
        groupedFields[group] = []
      }
      groupedFields[group].push(field)
    })

    // Extract text by groups
    Object.entries(groupedFields).forEach(([groupName, fields]) => {
      const groupTexts: string[] = []
      
      fields.forEach((field) => {
        const value = data[field.key]
        if (value !== undefined && value !== null && value !== "") {
          const label = (field.label as any)[locale] || (field.label as any).ko || field.key
          
          if (typeof value === "boolean") {
            if (value) {
              groupTexts.push(`${label}: 예`)
            }
          } else if (Array.isArray(value)) {
            if (value.length > 0) {
              groupTexts.push(`${label}: ${value.join(", ")}`)
            }
          } else if (typeof value === "object") {
            // Skip nested objects for now, or stringify them
            const objStr = Object.entries(value)
              .filter(([_, v]) => v !== undefined && v !== null && v !== "")
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")
            if (objStr) {
              groupTexts.push(`${label}: ${objStr}`)
            }
          } else {
            groupTexts.push(`${label}: ${String(value)}`)
          }
        }
      })

      if (groupTexts.length > 0) {
        // Add group header if it's not "general"
        if (groupName !== "general") {
          const groupLabel = getGroupLabel(groupName, locale)
          paragraphs.push(groupLabel)
        }
        paragraphs.push(groupTexts.join("\n"))
      }
    })

    // If no structured data found, fallback to simple key-value pairs
    if (paragraphs.length === 0) {
      const simpleTexts = Object.entries(data)
        .filter(([_, value]) => {
          if (value === undefined || value === null || value === "") return false
          if (typeof value === "object" && !Array.isArray(value)) return false
          return true
        })
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}: ${value.join(", ")}`
          }
          return `${key}: ${String(value)}`
        })
      
      if (simpleTexts.length > 0) {
        paragraphs.push(simpleTexts.join("\n"))
      }
    }

    return paragraphs.join("\n\n")
  } catch (error) {
    console.error("Error extracting readable text:", error)
    // Fallback: return JSON string but formatted
    return JSON.stringify(data, null, 2)
  }
}

function getGroupLabel(groupName: string, locale: "ko" | "en" | "zh-CN" | "si" | "ta"): string {
  const labels: Record<string, Record<string, string>> = {
    deceased: {
      ko: "사망자 정보",
      en: "Deceased Information",
      "zh-CN": "死者信息",
      si: "මියගිය පුද්ගලයාගේ තොරතුරු",
      ta: "இறந்தவரின் தகவல்",
    },
    party_a: {
      ko: "유가족 대표 정보 (갑)",
      en: "Family Representative (Party A)",
      "zh-CN": "家属代表信息（甲）",
      si: "පවුලේ නියෝජිත තොරතුරු (පාර්ශ්වය A)",
      ta: "குடும்ப பிரதிநிதி தகவல் (கட்சி A)",
    },
    party_b: {
      ko: "가해자 회사 정보 (을)",
      en: "Company Information (Party B)",
      "zh-CN": "公司信息（乙）",
      si: "සමාගමේ තොරතුරු (පාර්ශ්වය B)",
      ta: "நிறுவன தகவல் (கட்சி B)",
    },
    general: {
      ko: "일반 정보",
      en: "General Information",
      "zh-CN": "一般信息",
      si: "සාමාන්‍ය තොරතුරු",
      ta: "பொதுவான தகவல்",
    },
  }

  return labels[groupName]?.[locale] || labels[groupName]?.en || labels[groupName]?.ko || groupName
}
