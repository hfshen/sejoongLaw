"use client"

import { useEffect } from "react"

function getUrlBaseWithoutQuery() {
  return `${window.location.origin}${window.location.pathname}`
}

export default function JusoPopupPage() {
  useEffect(() => {
    const sp = new URLSearchParams(window.location.search)
    const inputYn = sp.get("inputYn")
    const confmKey = sp.get("confmKey") || process.env.NEXT_PUBLIC_JUSO_CONFM_KEY || ""
    const callback = sp.get("callback") || "jusoCallBack"
    const resultType = sp.get("resultType") || "4"
    const cssUrl = sp.get("cssUrl") || ""

    if (inputYn !== "Y") {
      // 첫 진입: 도로명주소 팝업 API로 POST 전송
      const returnUrl = `${getUrlBaseWithoutQuery()}?inputYn=Y&callback=${encodeURIComponent(callback)}&cssUrl=${encodeURIComponent(cssUrl)}`

      const form = document.createElement("form")
      form.method = "post"
      form.action = "https://business.juso.go.kr/addrlink/addrLinkUrl.do"

      const addHidden = (name: string, value: string) => {
        const input = document.createElement("input")
        input.type = "hidden"
        input.name = name
        input.value = value
        form.appendChild(input)
      }

      addHidden("confmKey", confmKey)
      addHidden("returnUrl", returnUrl)
      addHidden("resultType", resultType)
      // 문서에 명시된 선택옵션: 상세주소 제공(Y/N)
      addHidden("useDetailAddr", "Y")
      // 커스텀 CSS (지원되지 않더라도 무해)
      if (cssUrl) addHidden("cssUrl", cssUrl)

      document.body.appendChild(form)
      form.submit()
      return
    }

    // 콜백: 주소 선택 후 returnUrl로 돌아온 상태
    const payload = {
      roadAddrPart1: sp.get("roadAddrPart1") || "",
      roadAddrPart2: sp.get("roadAddrPart2") || "",
      addrDetail: sp.get("addrDetail") || "",
      zipNo: sp.get("zipNo") || "",
    }

    try {
      const fn = (window.opener as any)?.[callback]
      if (typeof fn === "function") fn(payload)
    } finally {
      window.close()
    }
  }, [])

  return (
    <div className="p-4 text-sm text-text-secondary">
      주소 검색 팝업을 불러오는 중입니다…
    </div>
  )
}

