import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const keyword = (searchParams.get("keyword") || "").trim()

  if (keyword.length < 2) {
    return NextResponse.json({ results: [] })
  }

  const confmKey =
    process.env.NEXT_PUBLIC_JUSO_CONFM_KEY ||
    process.env.JUSO_CONFM_KEY ||
    ""

  if (!confmKey) {
    return NextResponse.json(
      { error: "Missing JUSO confmKey" },
      { status: 500 }
    )
  }

  const apiUrl = new URL("https://business.juso.go.kr/addrlink/addrLinkApi.do")
  apiUrl.searchParams.set("confmKey", confmKey)
  apiUrl.searchParams.set("currentPage", "1")
  apiUrl.searchParams.set("countPerPage", "10")
  apiUrl.searchParams.set("keyword", keyword)
  apiUrl.searchParams.set("resultType", "json")

  try {
    const res = await fetch(apiUrl.toString(), { method: "GET" })
    const text = await res.text()
    // resultType=json 이라도 비정상 응답을 대비
    const json = JSON.parse(text)
    const common = json?.results?.common || null
    const results = json?.results?.juso || []

    // 에러코드가 있으면 프론트에서 정확히 표시할 수 있게 전달
    const errorCode = common?.errorCode
    if (errorCode && errorCode !== "0") {
      return NextResponse.json({
        results: [],
        common,
        error: { code: errorCode, message: common?.errorMessage || "주소 검색 오류" },
      })
    }

    return NextResponse.json({ results, common })
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to fetch juso results" },
      { status: 502 }
    )
  }
}

