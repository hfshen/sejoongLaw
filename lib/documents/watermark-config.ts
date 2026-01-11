export const WATERMARK_CONFIG = {
  rotationDeg: -30,

  // 미리보기(DocumentPreview) CSS 배경 타일
  preview: {
    sizePx: 175,
    opacity: 0.16,
  },

  // 최종 다운로드 캔버스 오버레이
  canvas: {
    sizePx: 175,
    stepMultiplier: 2.7, // 간격 = size * multiplier
    alpha: 0.24,
    composite: "multiply" as const,
  },

  // html2canvas 누락 방지용 DOM 타일(백업)
  domTiles: {
    columns: 2,
    autoRowPx: 120,
    gapPx: 140,
    paddingPx: 120,
    opacity: 0.16,
    itemCount: 8,
    imgWidthPx: 130,
  },
} as const

