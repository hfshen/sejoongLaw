import html2canvas from "html2canvas"
import type { DocumentType } from "./templates"
import { WATERMARK_CONFIG } from "@/lib/documents/watermark-config"

let cachedLogoPngDataUrl: string | null = null

async function getLogoPngDataUrl(): Promise<string | null> {
  if (cachedLogoPngDataUrl) return cachedLogoPngDataUrl
  try {
    const res = await fetch("/SJ_logo.svg", { cache: "force-cache" })
    const svgText = await res.text()
    const svgBlob = new Blob([svgText], { type: "image/svg+xml" })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.crossOrigin = "anonymous"

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = () => reject(new Error("Failed to load SVG"))
      img.src = url
    })

    // 워터마크/푸터용으로 충분한 해상도(대략 4배)로 래스터라이즈
    const targetW = 1200
    const ratio = img.naturalHeight / img.naturalWidth || 1
    const targetH = Math.round(targetW * ratio)
    const canvas = document.createElement("canvas")
    canvas.width = targetW
    canvas.height = targetH
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      URL.revokeObjectURL(url)
      return null
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, 0, 0, targetW, targetH)

    const png = canvas.toDataURL("image/png")
    cachedLogoPngDataUrl = png
    URL.revokeObjectURL(url)
    return png
  } catch {
    return null
  }
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  const img = new Image()
  img.crossOrigin = "anonymous"
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error("Failed to load image"))
    img.src = src
  })
  return img
}

function rasterizeHtmlImageToPngDataUrl(
  img: HTMLImageElement,
  targetW: number = 1200
): string | null {
  try {
    const nw = img.naturalWidth
    const nh = img.naturalHeight
    if (!nw || !nh) return null

    const ratio = nh / nw
    const w = targetW
    const h = Math.max(1, Math.round(targetW * ratio))
    const canvas = document.createElement("canvas")
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext("2d")
    if (!ctx) return null
    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return canvas.toDataURL("image/png")
  } catch {
    return null
  }
}

function drawWatermarkPattern(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  outputScale: number
) {
  const canvasW = ctx.canvas.width
  const canvasH = ctx.canvas.height

  const wmW = WATERMARK_CONFIG.canvas.sizePx * outputScale
  const ratio = img.naturalHeight / img.naturalWidth || 1
  const wmH = wmW * ratio

  const stepX = wmW * WATERMARK_CONFIG.canvas.stepMultiplier
  const stepY = wmH * WATERMARK_CONFIG.canvas.stepMultiplier

  ctx.save()
  ctx.globalAlpha = WATERMARK_CONFIG.canvas.alpha
  // 배경 위에 자연스럽게 올라오도록(너무 튀지 않게) 합성
  ctx.globalCompositeOperation = WATERMARK_CONFIG.canvas.composite
  ctx.translate(canvasW / 2, canvasH / 2)
  ctx.rotate((WATERMARK_CONFIG.rotationDeg * Math.PI) / 180)
  ctx.translate(-canvasW / 2, -canvasH / 2)

  for (let y = -canvasH; y < canvasH * 2; y += stepY) {
    for (let x = -canvasW; x < canvasW * 2; x += stepX) {
      ctx.drawImage(img, x, y, wmW, wmH)
    }
  }

  ctx.restore()
}

function setupWatermarkTiles(
  previewElement: HTMLElement,
  logoSrc: string
) {
  // DocumentPreview의 워터마크 div는 inline style에 /SJ_logo.svg가 들어있음
  const wmCandidates = Array.from(
    previewElement.querySelectorAll<HTMLElement>('[style*="SJ_logo.svg"], [style*="SJ_logo"]')
  )

  wmCandidates.forEach((wm) => {
    // 이미 타일이 있으면 중복 생성 방지
    if (wm.querySelector('[data-wm-tile="1"]')) return

    const style = (wm.getAttribute("style") || "").toLowerCase()
    const isWatermarkLike = style.includes("background-image") && style.includes("sj_logo")
    if (!isWatermarkLike) return

    // background-image 렌더링 누락 방지: 워터마크는 타일 이미지로 강제
    wm.style.backgroundImage = "none"

    const tileWrap = document.createElement("div")
    tileWrap.setAttribute("data-wm-tile", "1")
    tileWrap.style.position = "absolute"
    tileWrap.style.inset = "0"
    tileWrap.style.display = "grid"
    tileWrap.style.gridTemplateColumns = `repeat(${WATERMARK_CONFIG.domTiles.columns}, 1fr)`
    tileWrap.style.gridAutoRows = `${WATERMARK_CONFIG.domTiles.autoRowPx}px`
    tileWrap.style.gap = `${WATERMARK_CONFIG.domTiles.gapPx}px ${WATERMARK_CONFIG.domTiles.gapPx}px`
    tileWrap.style.padding = `${WATERMARK_CONFIG.domTiles.paddingPx}px`
    tileWrap.style.opacity = String(WATERMARK_CONFIG.domTiles.opacity)
    tileWrap.style.pointerEvents = "none"

    for (let i = 0; i < WATERMARK_CONFIG.domTiles.itemCount; i++) {
      const img = document.createElement("img")
      img.src = logoSrc
      img.alt = "watermark"
      img.style.width = `${WATERMARK_CONFIG.domTiles.imgWidthPx}px`
      img.style.height = "auto"
      img.style.objectFit = "contain"
      img.style.justifySelf = "center"
      img.style.alignSelf = "center"
      img.style.filter = "none"
      img.style.background = "transparent"
      img.style.pointerEvents = "none"
      tileWrap.appendChild(img)
    }

    // 기존 워터마크 스타일(회전/크기/오프셋)은 유지되어야 하므로 내부에만 타일을 넣는다.
    wm.appendChild(tileWrap)
  })
}

/**
 * 문서 이미지를 생성하는 공통 함수
 * ZIP 다운로드와 개별 다운로드 모두에서 사용
 */
export async function generateDocumentImage(
  docData: any,
  docType: DocumentType,
  locale: "ko" | "en" | "zh-CN"
): Promise<Blob | null> {
  try {
    const shouldWatermark = !String(docType).endsWith("_old")
    const CAPTURE_SCALE = 4
    // 출력 파일의 픽셀 크기(표시 “확대” 체감 완화 + 충분한 선명도 유지)
    // - 1: 794x1123 (가벼움)
    // - 2: 1588x2246 (권장, 인쇄/가독성 밸런스)
    const OUTPUT_SCALE = 2
    // 임시 컨테이너 생성
    const tempContainer = document.createElement("div")
    tempContainer.style.position = "absolute"
    tempContainer.style.left = "-9999px"
    tempContainer.style.top = "0"
    // 실제 캡처는 내부 DocumentPreview 엘리먼트만 대상으로 하므로,
    // 컨테이너에 A4 크기/패딩/overflow를 강제하지 않는다. (푸터 잘림 방지)
    tempContainer.style.width = "0"
    tempContainer.style.height = "0"
    tempContainer.style.overflow = "visible"
    document.body.appendChild(tempContainer)

    // React를 사용하여 DocumentPreview 렌더링
    const { createRoot } = await import("react-dom/client")
    const React = await import("react")
    const DocumentPreview = (await import("@/components/admin/DocumentPreview")).default

    const root = createRoot(tempContainer)
    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(DocumentPreview, {
          documentType: docType,
          data: docData,
          locale: locale,
        })
      )
      // 렌더링 완료 대기
      setTimeout(resolve, 1000)
    })

    // 실제 A4 문서 엘리먼트 찾기
    const previewElement = tempContainer.querySelector(
      '[data-preview-id="document-preview"]'
    ) as HTMLElement | null

    if (!previewElement) {
      root.unmount()
      document.body.removeChild(tempContainer)
      return null
    }

    // 폰트 로딩 대기
    await document.fonts.ready
    await new Promise((resolve) => setTimeout(resolve, 500))

    // (중요) SVG 로고는 html2canvas/캔버스에서 누락되는 경우가 있어 PNG로 변환해서 사용
    let logoPng = await getLogoPngDataUrl()
    const absLogo = `${window.location.origin}/SJ_logo.svg`

    // getLogoPngDataUrl가 실패하더라도, 실제 DOM에 로드된 로고(img)가 있으면 그걸로 PNG를 만든다.
    if (!logoPng) {
      const anyLogoImg = previewElement.querySelector('img[src*="SJ_logo"]') as HTMLImageElement | null
      if (anyLogoImg && anyLogoImg.complete && anyLogoImg.naturalWidth > 0) {
        logoPng = rasterizeHtmlImageToPngDataUrl(anyLogoImg)
      }
    }

    const wmLogoSrc = logoPng || absLogo

    // 법원 제출용(OLD-case)은 워터마크 OFF
    if (shouldWatermark) {
      // 워터마크는 캡처 전에 <img> 타일로 강제(이미지 로딩 대기 가능)
      setupWatermarkTiles(previewElement, wmLogoSrc)
    }

    // 이미지 로딩 대기
    const images = previewElement.querySelectorAll("img")
    const footerLogoImg = previewElement.querySelector(
      'img[src*="SJ_logo"]'
    ) as HTMLImageElement
    let footerLogoAbsoluteUrl: string | null = null
    
    if (footerLogoImg) {
      const originalSrc = footerLogoImg.src || footerLogoImg.getAttribute('src') || '/SJ_logo.svg'
      footerLogoAbsoluteUrl = originalSrc.startsWith('http') 
        ? originalSrc 
        : originalSrc.startsWith('/') 
          ? `${window.location.origin}${originalSrc}`
          : `${window.location.origin}/${originalSrc}`
      
      if (!footerLogoImg.complete || footerLogoImg.naturalWidth === 0) {
        await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(null), 5000)
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            clearTimeout(timeout)
            if (footerLogoAbsoluteUrl) {
              footerLogoImg.src = footerLogoAbsoluteUrl
            }
            resolve(null)
          }
          img.onerror = () => {
            clearTimeout(timeout)
            resolve(null)
          }
          if (footerLogoAbsoluteUrl) {
            img.src = footerLogoAbsoluteUrl
          }
        })
      } else {
        if (footerLogoAbsoluteUrl) {
          footerLogoImg.src = footerLogoAbsoluteUrl
        }
      }
    }
    
    await Promise.all(
      Array.from(images).map((img) => {
        if (img.complete && img.naturalWidth > 0) return Promise.resolve()
        return new Promise((resolve) => {
          const timeout = setTimeout(() => {
            resolve(null)
          }, 5000)
          img.onload = () => {
            clearTimeout(timeout)
            resolve(null)
          }
          img.onerror = () => {
            clearTimeout(timeout)
            resolve(null)
          }
          // 이미지가 이미 로드되었는지 다시 확인
          if (img.complete && img.naturalWidth > 0) {
            clearTimeout(timeout)
            resolve(null)
          }
        })
      })
    )
    
    // 추가 대기 시간 (이미지 렌더링 안정화)
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 렌더링 안정화 대기
    await new Promise(resolve => setTimeout(resolve, 500))

    // html2canvas로 캡처
    const canvas = await html2canvas(previewElement, {
      // 표 선/텍스트 선명도 개선
      scale: CAPTURE_SCALE,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
      scrollX: 0,
      scrollY: 0,
      width: 794,
      height: 1123,
      x: 0,
      y: 0,
      imageTimeout: 15000,
      onclone: (clonedDoc, element) => {
        const cloneWin = clonedDoc.defaultView || window
        const clonedElement = element as HTMLElement
        const logoAbsoluteUrl = footerLogoAbsoluteUrl
        const absLogo = `${window.location.origin}/SJ_logo.svg`
        
        // 문서 요소만 정확히 A4 크기로 고정
        clonedElement.style.backgroundColor = "#ffffff"
        clonedElement.style.width = "794px"
        clonedElement.style.height = "1123px"
        clonedElement.style.maxWidth = "794px"
        clonedElement.style.maxHeight = "1123px"
        clonedElement.style.minWidth = "794px"
        clonedElement.style.minHeight = "1123px"
        clonedElement.style.overflow = "hidden"
        clonedElement.style.position = "relative"
        clonedElement.style.display = "flex"
        clonedElement.style.flexDirection = "column"
        clonedElement.style.boxSizing = "border-box"
        clonedElement.style.margin = "0"
        // padding은 DocumentPreview의 inline style을 그대로 유지 (중복 적용 금지)
        
        // body와 모든 부모 요소를 흰색 배경으로 설정
        clonedDoc.body.style.backgroundColor = "#ffffff"
        clonedDoc.body.style.margin = "0"
        clonedDoc.body.style.padding = "0"
        clonedDoc.documentElement.style.backgroundColor = "#ffffff"
        
        let parent = clonedElement.parentElement
        while (parent && parent !== clonedDoc.body) {
          parent.style.backgroundColor = "#ffffff"
          parent.style.margin = "0"
          parent.style.padding = "0"
          parent.style.width = "794px"
          parent.style.height = "1123px"
          parent.style.overflow = "hidden"
          parent.style.position = "relative"
          parent = parent.parentElement
        }
        
        // 워터마크는 캡처 전에 <img> 타일로 강제했으므로 onclone에서는 중복 삽입/변경 금지
        const alreadyTiled = !!clonedElement.querySelector('[data-wm-tile="1"]')

        // 워터마크 보존 및 업데이트
        const watermarkElements = clonedDoc.querySelectorAll('[style*="backgroundImage"], [style*="background-image"]')
        if (!alreadyTiled) watermarkElements.forEach((wm) => {
          const htmlWm = wm as HTMLElement
          const computed = cloneWin.getComputedStyle(htmlWm)
          const computedBg = computed.backgroundImage
          const bgImage =
            (computedBg && computedBg !== "none" ? computedBg : "") ||
            htmlWm.style.backgroundImage ||
            ""
          if (bgImage && bgImage.includes('SJ_logo')) {
            // SVG 누락 방지: 가능하면 PNG data URL로 강제
            const wmUrl = logoPng || absLogo
            htmlWm.style.backgroundImage = `url("${wmUrl}")`
            htmlWm.style.backgroundRepeat = "repeat"
            htmlWm.style.backgroundSize = "350px auto"
            htmlWm.style.backgroundPosition = "0 0"
            htmlWm.style.opacity = "0.08"
            htmlWm.style.zIndex = "10"
            htmlWm.style.position = "absolute"
            htmlWm.style.pointerEvents = "none"
            htmlWm.style.transform = "rotate(-30deg)"
            htmlWm.style.transformOrigin = "center center"
            htmlWm.style.width = "250%"
            htmlWm.style.height = "250%"
            htmlWm.style.left = "-75%"
            htmlWm.style.top = "-75%"
          }
        })

        // 워터마크가 감지되지 않았으면(=환경/클론 이슈), 캡처용 워터마크 레이어를 강제로 추가
        const hasAnyWatermark =
          Array.from(watermarkElements).some((wm) => {
            const el = wm as HTMLElement
            return (
              (el.style.backgroundImage || "").includes("SJ_logo") ||
              (cloneWin.getComputedStyle(el).backgroundImage || "").includes("SJ_logo")
            )
          }) ||
          Array.from(clonedDoc.querySelectorAll('[style*="SJ_logo"]')).length > 0

        if (!alreadyTiled && !hasAnyWatermark) {
          const injectedWm = clonedDoc.createElement("div")
          injectedWm.style.position = "absolute"
          injectedWm.style.inset = "0"
          injectedWm.style.pointerEvents = "none"
          injectedWm.style.zIndex = "10"
          injectedWm.style.backgroundImage = `url("${logoPng || absLogo}")`
          injectedWm.style.backgroundRepeat = "repeat"
          injectedWm.style.backgroundSize = "350px auto"
          injectedWm.style.backgroundPosition = "0 0"
          injectedWm.style.opacity = "0.08"
          injectedWm.style.transform = "rotate(-30deg)"
          injectedWm.style.transformOrigin = "center center"
          injectedWm.style.width = "250%"
          injectedWm.style.height = "250%"
          injectedWm.style.left = "-75%"
          injectedWm.style.top = "-75%"
          clonedElement.appendChild(injectedWm)
        }
        
        // 로고 이미지 보존 및 비율 유지
        const logoImages = clonedDoc.querySelectorAll('img[src*="SJ_logo"]')
        logoImages.forEach((img) => {
          const htmlImg = img as HTMLImageElement
          const parent = htmlImg.parentElement
          const parentComputed = parent ? cloneWin.getComputedStyle(parent) : null
          const parentZIndex = parentComputed ? parseInt(parentComputed.zIndex) || 0 : 0
          const isFooterLogo = parentComputed && (
            parentZIndex >= 20 ||
            parent?.style.zIndex === "20" ||
            parent?.style.zIndex === "21" ||
            parent?.style.zIndex === "22" ||
            parent?.style.zIndex === "24" ||
            parent?.style.zIndex === "25" ||
            parent?.style.zIndex === "26" ||
            parent?.textContent?.includes("법무법인 세중") ||
            parent?.textContent?.includes("Sejoong Law Firm") ||
            parent?.textContent?.includes("sejoonglaw@gmail.com")
          )
          
          // SVG 누락 방지: 가능하면 PNG data URL로 강제
          const finalLogoSrc = logoPng || logoAbsoluteUrl || absLogo
          if (isFooterLogo) {
            htmlImg.src = finalLogoSrc
          } else {
            const originalSrc = htmlImg.getAttribute('src') || htmlImg.src
            if (originalSrc) {
              const absoluteSrc = originalSrc.startsWith('http') 
                ? originalSrc 
                : originalSrc.startsWith('/') 
                  ? `${window.location.origin}${originalSrc}`
                  : `${window.location.origin}/${originalSrc}`
              htmlImg.src = (absoluteSrc.includes("SJ_logo") ? finalLogoSrc : absoluteSrc)
            }
          }
          
          // 이미지 스타일 항상 적용
          htmlImg.style.height = "40px"
          htmlImg.style.width = "auto"
          htmlImg.style.objectFit = "contain"
          htmlImg.style.maxWidth = "100%"
          htmlImg.style.display = "block"
          htmlImg.style.visibility = "visible"
          htmlImg.style.opacity = "1"
          htmlImg.style.zIndex = "22"
          htmlImg.style.position = "relative"
          htmlImg.style.filter = "none"
          htmlImg.style.pointerEvents = "none"
          htmlImg.style.backgroundColor = "transparent"
          
          // 푸터 로고인 경우 부모 컨테이너도 투명 배경 유지
          if (isFooterLogo && parent) {
            parent.style.backgroundColor = "transparent"
            parent.style.background = "transparent"
            parent.style.position = "relative"
            parent.style.zIndex = "25"
            
            // 부모의 부모도 확인
            const grandParent = parent.parentElement
            if (grandParent) {
              grandParent.style.backgroundColor = "transparent"
              grandParent.style.background = "transparent"
              grandParent.style.zIndex = "24"
            }
            
            // 모든 조상 요소도 투명 배경 유지
            let ancestor = parent.parentElement
            while (ancestor && ancestor !== clonedElement) {
              ancestor.style.backgroundColor = "transparent"
              ancestor.style.background = "transparent"
              ancestor = ancestor.parentElement
            }
            
            // 푸터 로고 이미지의 zIndex를 더 높게 설정
            htmlImg.style.zIndex = "26"
          }
        })

        // 푸터가 내용에 밀려 잘리는 경우가 있으므로, 캡처 시점에는 푸터 컨테이너를 하단 고정
        const footerCandidates = Array.from(clonedElement.querySelectorAll("*")).filter((el) => {
          const htmlEl = el as HTMLElement
          const text = htmlEl.textContent || ""
          return (
            text.includes("법무법인 세중") ||
            text.includes("Sejoong Law Firm") ||
            text.includes("sejoonglaw@gmail.com") ||
            text.includes("031-8044-8805")
          )
        }) as HTMLElement[]

        // 가장 바깥에 가까운 후보 하나만 고정 (중복 방지)
        const footerContainer = footerCandidates.length
          ? footerCandidates.reduce((acc, cur) => (acc.contains(cur) ? acc : cur))
          : null

        if (footerContainer) {
          footerContainer.style.position = "absolute"
          footerContainer.style.left = "35px"
          footerContainer.style.right = "35px"
          footerContainer.style.bottom = "25px"
          footerContainer.style.zIndex = "25"
          // 상용 문서 느낌 + 가독성 위해 푸터 영역은 흰 배경으로 고정
          footerContainer.style.backgroundColor = "#ffffff"
          footerContainer.style.background = "#ffffff"

          // 본문이 푸터에 겹치지 않도록 하단 여백 확보
          const currentPaddingBottom = parseInt(clonedElement.style.paddingBottom || "0") || 0
          if (currentPaddingBottom < 180) {
            clonedElement.style.paddingBottom = "180px"
          }
        }
        
        // 모든 회색/투명 배경을 흰색으로 강제 설정 (워터마크 및 푸터 로고 제외)
        const allElements = clonedDoc.querySelectorAll('*')
        allElements.forEach((el) => {
          const htmlEl = el as HTMLElement
          if (!htmlEl || htmlEl === clonedElement) return
          // 워터마크 타일 영역은 손대지 않는다 (누락/덮임 방지)
          if (htmlEl.closest && htmlEl.closest('[data-wm-tile="1"]')) return
          
          const computed = cloneWin.getComputedStyle(htmlEl)
          const zIndex = computed.zIndex || htmlEl.style.zIndex
          const hasLogo = htmlEl.querySelector('img[src*="SJ_logo"]')
          
          const zIndexNum = parseInt(zIndex) || 0
          const isFooterContainer = htmlEl.textContent?.includes("법무법인 세중") || 
                                   htmlEl.textContent?.includes("Sejoong Law Firm") || 
                                   htmlEl.textContent?.includes("sejoonglaw@gmail.com") ||
                                   htmlEl.textContent?.includes("031-8044-8805")
          
          if (zIndex === "20" || zIndex === "21" || zIndex === "22" || zIndex === "24" || zIndex === "25" || zIndex === "26" || zIndexNum >= 20 || hasLogo || isFooterContainer) {
            htmlEl.style.backgroundColor = "transparent"
            htmlEl.style.background = "transparent"
            if (hasLogo || isFooterContainer) {
              htmlEl.style.zIndex = "25"
            }
            const children = htmlEl.querySelectorAll('*')
            children.forEach((child) => {
              const htmlChild = child as HTMLElement
              if (htmlChild.tagName === 'IMG') {
                htmlChild.style.backgroundColor = "transparent"
                htmlChild.style.background = "transparent"
                htmlChild.style.opacity = "1"
                htmlChild.style.visibility = "visible"
                htmlChild.style.display = "block"
                htmlChild.style.zIndex = "26"
                htmlChild.style.position = "relative"
                htmlChild.style.filter = "none"
              } else {
                htmlChild.style.backgroundColor = "transparent"
                htmlChild.style.background = "transparent"
              }
            })
            return
          }
          
          const computedBg = computed.backgroundImage
          const bgImage =
            (computedBg && computedBg !== "none" ? computedBg : "") ||
            htmlEl.style.backgroundImage ||
            ""
          if (!bgImage || !bgImage.includes('SJ_logo')) {
            const bgColor = computed.backgroundColor
            if (bgColor && (
              bgColor === "rgba(0, 0, 0, 0)" || 
              bgColor === "transparent" || 
              bgColor.includes("f9fafb") || 
              bgColor.includes("gray") || 
              bgColor.includes("rgb(249") ||
              bgColor.includes("rgb(240")
            )) {
              htmlEl.style.backgroundColor = "#ffffff"
            }
          }
        })
      },
    })

    // Canvas를 정확한 A4 크기로 자르고 흰색 배경 적용
    const finalCanvas = document.createElement('canvas')
    finalCanvas.width = 794 * OUTPUT_SCALE
    finalCanvas.height = 1123 * OUTPUT_SCALE
    const finalCtx = finalCanvas.getContext('2d')
    
    if (finalCtx) {
      // 먼저 흰색 배경으로 전체를 채우기
      finalCtx.fillStyle = "#ffffff"
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)

      // 다운샘플링 품질 개선
      finalCtx.imageSmoothingEnabled = true
      if ("imageSmoothingQuality" in finalCtx) {
        ;(finalCtx as any).imageSmoothingQuality = "high"
      }
      
      // 원본 캔버스 전체를 OUTPUT_SCALE로 축소하여 그리기 (크롭 금지)
      const targetWidth = 794 * OUTPUT_SCALE
      const targetHeight = 1123 * OUTPUT_SCALE
      finalCtx.drawImage(
        canvas, 
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        targetWidth,
        targetHeight
      )

      // (핵심) 워터마크는 html2canvas가 배경/transform을 누락하는 경우가 있어,
      // 최종 캔버스에 "오버레이"로 직접 그려서 100% 보장한다.
      // 법원 제출용(OLD-case)은 워터마크 OFF
      if (shouldWatermark) {
        // 주의: 먼저 본문을 그린 뒤 워터마크를 얹어야(흰 배경에 덮이지 않음) 실제로 보인다.
        try {
          const wmSrc = logoPng || `${window.location.origin}/SJ_logo.svg`
          const wmImg = await loadImage(wmSrc)
          drawWatermarkPattern(finalCtx, wmImg, OUTPUT_SCALE)
        } catch {
          // 워터마크 로드 실패 시에는 스킵(문서 생성 자체는 진행)
        }
      }
      
      // Canvas를 Blob으로 변환
      return new Promise((resolve) => {
        finalCanvas.toBlob(
          (blob) => {
            root.unmount()
            document.body.removeChild(tempContainer)
            resolve(blob)
          },
          "image/jpeg",
          1.0
        )
      })
    } else {
      // fallback: 원본 캔버스 사용
      return new Promise((resolve) => {
        canvas.toBlob(
          (blob) => {
            root.unmount()
            document.body.removeChild(tempContainer)
            resolve(blob)
          },
          "image/jpeg",
          1.0
        )
      })
    }
  } catch (error) {
    console.error("Error generating document image:", error)
    return null
  }
}

