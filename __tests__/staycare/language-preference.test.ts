import {
  normalizeStayCareLanguage,
  stayCareLanguageLabels,
} from "@/lib/staycare/language"

describe("StayCare language preference", () => {
  it("accepts the four supported languages", () => {
    expect(normalizeStayCareLanguage("ko")).toBe("ko")
    expect(normalizeStayCareLanguage("en")).toBe("en")
    expect(normalizeStayCareLanguage("si")).toBe("si")
    expect(normalizeStayCareLanguage("ta")).toBe("ta")
  })

  it("rejects unsupported or empty values", () => {
    expect(normalizeStayCareLanguage("zh-CN")).toBeNull()
    expect(normalizeStayCareLanguage("")).toBeNull()
    expect(normalizeStayCareLanguage(undefined)).toBeNull()
  })

  it("has a visible label for every supported language", () => {
    expect(stayCareLanguageLabels).toEqual({
      ko: "한국어",
      en: "English",
      si: "සිංහල",
      ta: "தமிழ்",
    })
  })
})
