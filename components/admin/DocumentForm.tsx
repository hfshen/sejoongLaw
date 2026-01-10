"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { Save, ArrowLeft, Loader2, Globe, Image as ImageIcon } from "lucide-react"
import Button from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import {
  getTemplate,
  getDocumentTypeLabel,
  type DocumentType,
  type FieldDefinition,
} from "@/lib/documents/templates"
import { format } from "date-fns"
import DocumentPreview from "./DocumentPreview"
import html2canvas from "html2canvas"
import { toast } from "@/components/ui/Toast"

interface DocumentFormData {
  name?: string
  date?: string
  [key: string]: any
}

interface DocumentFormProps {
  documentId?: string
  documentType: DocumentType
  initialData?: any
  locale: "ko" | "en" | "zh-CN"
  onLocaleChange: (locale: "ko" | "en" | "zh-CN") => void
}

export default function DocumentForm({
  documentId,
  documentType,
  initialData,
  locale,
  onLocaleChange,
}: DocumentFormProps) {
  const router = useRouter()
  const template = getTemplate(documentType)
  const [saving, setSaving] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [previewScale, setPreviewScale] = useState(1)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: initialData?.name || "",
      date: initialData?.date || new Date().toISOString().split("T")[0],
      ...(initialData?.data || {}),
    },
  })

  // 미리보기 스케일 조정 - 더 이상 필요 없지만 호환성을 위해 유지 (항상 1)
  useEffect(() => {
    setPreviewScale(1)
  }, [])

  // 자동 저장 (debounce) - watch()를 subscription으로 사용하여 무한 루프 방지
  useEffect(() => {
    if (!documentId) return

    // watch()를 subscription으로 사용하여 값 변경 시에만 실행
    const subscription = watch((value, { name, type }) => {
      // 값이 실제로 변경되었을 때만 타이머 설정
      if (type === 'change' && name) {
        // 기존 타이머 취소
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }

        // 새로운 타이머 설정
        autoSaveTimerRef.current = setTimeout(async () => {
          try {
            // name과 date를 제외한 나머지 데이터만 저장
            const { name: _, date: __, ...restData } = value
            await fetch(`/api/documents/${documentId}/save`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ data: restData }),
            })
          } catch (error) {
            // 자동 저장 실패는 조용히 처리 (사용자에게 알리지 않음)
          }
        }, 2000) // 2초 후 자동 저장
      }
    })

    // cleanup 함수
    return () => {
      subscription.unsubscribe()
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
        autoSaveTimerRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]) // watch는 안정적인 함수이므로 의존성 배열에서 제외

  const onSubmit = async (formData: DocumentFormData & Record<string, any>) => {
    setSaving(true)
    try {
      // name과 date는 별도 필드로 처리
      const name = formData.name || initialData?.name || "무제"
      const date = formData.date || initialData?.date || new Date().toISOString().split("T")[0]
      
      // name과 date를 제외한 나머지 데이터
      const { name: _, date: __, ...restData } = formData
      
      const payload = {
        document_type: documentType,
        name,
        date,
        data: restData,
        locale,
      }

      if (documentId) {
        // 수정
        await fetch(`/api/documents/${documentId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
      } else {
        // 생성
        const response = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        const result = await response.json()
        if (result.document) {
          router.push(`/admin/documents/${result.document.id}`)
          return
        }
      }

      toast.success("저장되었습니다.")
    } catch (error) {
      toast.error("저장에 실패했습니다.")
    } finally {
      setSaving(false)
    }
  }

  const handleDownloadJPEG = async () => {
    // 문서 요소만 직접 찾기 (preview-container 제외)
    const documentElement = document.querySelector('[data-preview-id="document-preview"]') as HTMLElement
    if (!documentElement) {
      toast.error("미리보기를 찾을 수 없습니다.")
      return
    }

    try {
      // 1. 폰트 로딩 대기
      await document.fonts.ready
      await new Promise(resolve => setTimeout(resolve, 500))

      // 0. 푸터 로고 이미지를 절대 경로로 변환하고 미리 로드
      const footerLogoImg = documentElement.querySelector('img[src*="SJ_logo"]') as HTMLImageElement
      let footerLogoAbsoluteUrl: string | null = null
      if (footerLogoImg) {
        const originalSrc = footerLogoImg.src || footerLogoImg.getAttribute('src') || '/SJ_logo.svg'
        // 절대 경로로 변환
        footerLogoAbsoluteUrl = originalSrc.startsWith('http') 
          ? originalSrc 
          : originalSrc.startsWith('/') 
            ? `${window.location.origin}${originalSrc}`
            : `${window.location.origin}/${originalSrc}`
        
        // 이미지가 완전히 로드되었는지 확인하고 필요시 재로드
        if (!footerLogoImg.complete || footerLogoImg.naturalWidth === 0) {
          await new Promise((resolve) => {
            const timeout = setTimeout(() => {
              resolve(null)
            }, 5000)
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
          // 이미 로드되었어도 절대 경로로 설정
          if (footerLogoAbsoluteUrl) {
            footerLogoImg.src = footerLogoAbsoluteUrl
          }
        }
      }

      // 2. 이미지 로딩 대기 (특히 푸터 로고)
      const images = documentElement.querySelectorAll("img")
      const imagePromises = Array.from(images).map((img) => {
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
      await Promise.all(imagePromises)
      
      // 추가 대기 시간 (이미지 렌더링 안정화)
      await new Promise(resolve => setTimeout(resolve, 1000))

      // 3. 렌더링 안정화 대기
      await new Promise(resolve => setTimeout(resolve, 500))

      // 4. html2canvas로 문서 요소만 정확히 캡처 (A4 크기만)
      const canvas = await html2canvas(documentElement, {
        scale: 3, // A4 프린트 품질
        useCORS: true,
        allowTaint: false, // allowTaint를 false로 변경하여 CORS 문제 방지
        backgroundColor: null, // 배경색을 null로 설정하여 투명하게 캡처
        logging: true, // 디버깅을 위해 로깅 활성화
        scrollX: 0,
        scrollY: 0,
        width: 794,
        height: 1123,
        x: 0,
        y: 0,
        imageTimeout: 15000, // 이미지 로딩 타임아웃 증가
        onclone: (clonedDoc, element) => {
          const clonedElement = element as HTMLElement
          // footerLogoAbsoluteUrl을 클로저로 접근
          const logoAbsoluteUrl = footerLogoAbsoluteUrl
          
          // 문서 요소만 정확히 A4 크기로 고정 (배경 투명)
          clonedElement.style.backgroundColor = "transparent"
          clonedElement.style.width = "794px"
          clonedElement.style.height = "1123px"
          clonedElement.style.maxWidth = "794px"
          clonedElement.style.maxHeight = "1123px"
          clonedElement.style.minWidth = "794px"
          clonedElement.style.minHeight = "1123px"
          clonedElement.style.overflow = "hidden"
          clonedElement.style.position = "absolute"
          clonedElement.style.top = "0"
          clonedElement.style.left = "0"
          clonedElement.style.display = "flex"
          clonedElement.style.flexDirection = "column"
          clonedElement.style.boxSizing = "border-box"
          clonedElement.style.margin = "0"
          clonedElement.style.padding = "25px 35px"
          
          // 흰색 배경 레이어 추가 (워터마크 아래)
          const whiteBgLayer = clonedDoc.createElement('div')
          whiteBgLayer.style.position = "absolute"
          whiteBgLayer.style.inset = "0"
          whiteBgLayer.style.backgroundColor = "#ffffff"
          whiteBgLayer.style.zIndex = "0"
          whiteBgLayer.style.pointerEvents = "none"
          clonedElement.insertBefore(whiteBgLayer, clonedElement.firstChild)
          
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
          
          // 흰색 배경 레이어 보존 (워터마크 아래) - 첫 번째 자식 요소가 흰색 배경 레이어
          const firstChild = clonedElement.firstElementChild as HTMLElement
          if (firstChild) {
            const computed = window.getComputedStyle(firstChild)
            const bgImage = computed.backgroundImage
            // 워터마크가 아닌 경우 흰색 배경 레이어로 설정
            if (!bgImage || !bgImage.includes('SJ_logo')) {
              firstChild.style.backgroundColor = "#ffffff"
              firstChild.style.zIndex = "0"
              firstChild.style.position = "absolute"
              firstChild.style.inset = "0"
              firstChild.style.pointerEvents = "none"
            }
          }
          
          // 워터마크 보존 및 비율 유지 (가로 400px, 세로는 자동, 30도 회전)
          const watermarkElements = clonedDoc.querySelectorAll('[style*="backgroundImage"], [style*="background-image"]')
          watermarkElements.forEach((wm) => {
            const htmlWm = wm as HTMLElement
            const computed = window.getComputedStyle(htmlWm)
            const bgImage = computed.backgroundImage || htmlWm.style.backgroundImage
            if (bgImage && bgImage.includes('SJ_logo')) {
              // 워터마크 스타일 명시적으로 설정
              htmlWm.style.backgroundImage = computed.backgroundImage || "url('/SJ_logo.svg')"
              htmlWm.style.backgroundSize = "400px auto"
              htmlWm.style.backgroundRepeat = "repeat"
              htmlWm.style.backgroundPosition = "0 0"
              htmlWm.style.opacity = "0.06"
              htmlWm.style.backgroundColor = "transparent"
              htmlWm.style.zIndex = "10"
              htmlWm.style.position = "absolute"
              htmlWm.style.transform = "rotate(-30deg)"
              htmlWm.style.transformOrigin = "center center"
              htmlWm.style.width = "400%"
              htmlWm.style.height = "400%"
              htmlWm.style.left = "-150%"
              htmlWm.style.top = "-150%"
              htmlWm.style.pointerEvents = "none"
            }
          })
          
          // 로고 이미지 보존 및 비율 유지
          const logoImages = clonedDoc.querySelectorAll('img[src*="SJ_logo"]')
          logoImages.forEach((img) => {
            const htmlImg = img as HTMLImageElement
            // 푸터 로고 이미지인지 확인 (부모의 zIndex가 20 이상 또는 푸터 컨테이너)
            const parent = htmlImg.parentElement
            const parentComputed = parent ? window.getComputedStyle(parent) : null
            const parentZIndex = parentComputed ? parseInt(parentComputed.zIndex) || 0 : 0
            const isFooterLogo = parentComputed && (
              parentZIndex >= 20 ||
              parent?.style.zIndex === "20" ||
              parent?.style.zIndex === "21" ||
              parent?.style.zIndex === "22" ||
              parent?.textContent?.includes("법무법인 세중") ||
              parent?.textContent?.includes("Sejoong Law Firm") ||
              parent?.textContent?.includes("sejoonglaw@gmail.com")
            )
            
            // 푸터 로고인 경우 절대 경로 URL 사용
            if (isFooterLogo && logoAbsoluteUrl) {
              htmlImg.src = logoAbsoluteUrl
            } else {
              // 원본 문서에서 같은 이미지 찾아서 src 복사 (이미 로드된 이미지 사용)
              const originalSrc = htmlImg.getAttribute('src') || htmlImg.src
              if (originalSrc) {
                const originalImg = document.querySelector(`img[src="${originalSrc}"], img[src*="SJ_logo"]`) as HTMLImageElement
                if (originalImg && originalImg.src) {
                  // 원본 이미지가 완전히 로드되었으면 그 src 사용
                  if (originalImg.complete && originalImg.naturalWidth > 0) {
                    htmlImg.src = originalImg.src
                  } else {
                    // 절대 경로로 변환
                    const absoluteSrc = originalSrc.startsWith('http') 
                      ? originalSrc 
                      : originalSrc.startsWith('/') 
                        ? `${window.location.origin}${originalSrc}`
                        : `${window.location.origin}/${originalSrc}`
                    htmlImg.src = absoluteSrc
                  }
                } else {
                  // 절대 경로로 변환
                  const absoluteSrc = originalSrc.startsWith('http') 
                    ? originalSrc 
                    : originalSrc.startsWith('/') 
                      ? `${window.location.origin}${originalSrc}`
                      : `${window.location.origin}/${originalSrc}`
                  htmlImg.src = absoluteSrc
                }
              }
            }
            
            // 이미지 스타일 항상 적용
            htmlImg.style.height = "32px"
            htmlImg.style.width = "auto"
            htmlImg.style.objectFit = "contain"
            htmlImg.style.maxWidth = "100%"
            htmlImg.style.display = "block"
            htmlImg.style.visibility = "visible"
            htmlImg.style.opacity = "1"
            htmlImg.style.position = "relative"
            htmlImg.style.zIndex = "22"
            htmlImg.style.backgroundColor = "transparent"
            htmlImg.style.background = "transparent"
            htmlImg.style.margin = "0"
            htmlImg.style.padding = "0"
            htmlImg.style.border = "none"
            htmlImg.style.outline = "none"
            
            // 이미지가 로드되지 않았어도 스타일은 적용 (html2canvas가 처리)
            // onclone 내에서는 비동기 이미지 로딩이 제대로 작동하지 않으므로
            // 이미지 로딩은 html2canvas가 자동으로 처리하도록 함
            
            // 푸터 로고인 경우 부모 컨테이너와 모든 조상 요소도 투명 배경 유지
            if (isFooterLogo && parent) {
              parent.style.backgroundColor = "transparent"
              parent.style.background = "transparent"
              parent.style.position = "relative"
              parent.style.zIndex = "20"
              
              // 부모의 부모도 확인
              const grandParent = parent.parentElement
              if (grandParent) {
                grandParent.style.backgroundColor = "transparent"
                grandParent.style.background = "transparent"
              }
              
              // 모든 조상 요소도 투명 배경 유지
              let ancestor = parent.parentElement
              while (ancestor && ancestor !== clonedElement) {
                ancestor.style.backgroundColor = "transparent"
                ancestor.style.background = "transparent"
                ancestor = ancestor.parentElement
              }
            }
          })
          
          // 모든 회색/투명 배경을 흰색으로 강제 설정 (워터마크 및 푸터 로고 제외)
          const allElements = clonedDoc.querySelectorAll('*')
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement
            if (!htmlEl || htmlEl === clonedElement) return
            
            // 푸터 로고 컨테이너는 제외 (zIndex가 11인 요소 또는 로고 이미지를 포함한 요소)
            const computed = window.getComputedStyle(htmlEl)
            const zIndex = computed.zIndex || htmlEl.style.zIndex
            const hasLogo = htmlEl.querySelector('img[src*="SJ_logo"]')
            
            const zIndexNum = parseInt(zIndex) || 0
            if (zIndex === "20" || zIndex === "21" || zIndex === "22" || zIndexNum >= 20 || hasLogo) {
              // 푸터 로고 컨테이너와 모든 자식 요소는 투명 배경 유지
              htmlEl.style.backgroundColor = "transparent"
              const children = htmlEl.querySelectorAll('*')
              children.forEach((child) => {
                const htmlChild = child as HTMLElement
                if (htmlChild.tagName === 'IMG') {
                  // 이미지 요소는 특히 보이도록 설정
                  htmlChild.style.backgroundColor = "transparent"
                  htmlChild.style.opacity = "1"
                  htmlChild.style.visibility = "visible"
                  htmlChild.style.display = "block"
                  htmlChild.style.zIndex = "22"
                  htmlChild.style.position = "relative"
                } else {
                  htmlChild.style.backgroundColor = "transparent"
                }
              })
              return
            }
            
            const bgImage = computed.backgroundImage || htmlEl.style.backgroundImage
            // 워터마크가 아닌 경우에만 배경을 흰색으로
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

      // 5. 캔버스를 정확한 A4 크기로 자르고 흰색 배경 적용
      const finalCanvas = document.createElement('canvas')
      finalCanvas.width = 794 * 3
      finalCanvas.height = 1123 * 3
      const finalCtx = finalCanvas.getContext('2d')
      
      if (finalCtx) {
        // 먼저 흰색 배경으로 전체를 채우기
        finalCtx.fillStyle = "#ffffff"
        finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height)
        
        // 원본 캔버스를 정확한 A4 크기로 그리기
        const targetWidth = 794 * 3
        const targetHeight = 1123 * 3
        finalCtx.drawImage(
          canvas, 
          0, 0, 
          Math.min(canvas.width, targetWidth), 
          Math.min(canvas.height, targetHeight),
          0, 0,
          targetWidth,
          targetHeight
        )
        
        // JPEG로 변환 및 다운로드 (최고 품질)
        const dataUrl = finalCanvas.toDataURL("image/jpeg", 1.0)
        const link = document.createElement("a")
        link.download = `${initialData?.name || "document"}_${locale}_${new Date().toISOString().split("T")[0]}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // fallback: 원본 캔버스 사용
        const dataUrl = canvas.toDataURL("image/jpeg", 1.0)
        const link = document.createElement("a")
        link.download = `${initialData?.name || "document"}_${locale}_${new Date().toISOString().split("T")[0]}.jpg`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (error) {
      toast.error("이미지 다운로드에 실패했습니다.")
    }
  }

  const renderField = (field: FieldDefinition) => {
    const fieldKey = field.key
    const label = field.label[locale]
    const isRequired = field.required

    switch (field.type) {
      case "text":
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register(fieldKey, { required: isRequired })}
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "textarea":
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <textarea
              {...register(fieldKey, { required: isRequired })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "date":
        return (
          <div key={fieldKey} className="space-y-2">
            <label className="block text-sm font-medium text-secondary">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            <input
              {...register(fieldKey, { required: isRequired })}
              type="date"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {errors[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "select":
        const isRelationField = fieldKey.includes("relation") && !fieldKey.includes("other")
        const isGenderField = fieldKey.includes("gender")
        const isSpecialAuthorityField = fieldKey.includes("special_authority")
        const selectedValue = watch(fieldKey) || ""
        const showOtherInput = isRelationField && selectedValue === "기타"
        
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center gap-2">
              <label className="block text-sm font-medium text-secondary flex-1">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </label>
              {isSpecialAuthorityField ? (
                // 기타 특별수권사항 토글 버튼 (O/X)
                <div className="flex gap-1">
                  {field.options?.map((option) => {
                    const isSelected = selectedValue === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setValue(fieldKey, option.value, { shouldDirty: true, shouldValidate: true, shouldTouch: true })
                        }}
                        className={`px-3 py-1 rounded border-2 transition-all text-sm font-medium ${
                          isSelected
                            ? "border-primary bg-primary text-white shadow-sm"
                            : "border-gray-300 bg-white text-secondary hover:border-primary hover:bg-gray-50"
                        }`}
                      >
                        {option.label[locale]}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
            {isGenderField ? (
              // 성별 토글 버튼
              <div className="flex gap-2">
                {field.options?.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setValue(fieldKey, option.value)}
                    className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedValue === option.value
                        ? "border-primary bg-primary text-white"
                        : "border-gray-300 bg-white text-secondary hover:border-primary"
                    }`}
                  >
                    {option.label[locale]}
                  </button>
                ))}
              </div>
            ) : !isSpecialAuthorityField ? (
              // 일반 Select (기타 특별수권사항이 아닌 경우)
              <select
                {...register(fieldKey, { required: isRequired })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                onChange={(e) => {
                  setValue(fieldKey, e.target.value)
                  if (!isRelationField || e.target.value !== "기타") {
                    setValue(`${fieldKey}_other`, "")
                  }
                }}
              >
                <option value="">선택하세요</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label[locale]}
                  </option>
                ))}
              </select>
            ) : null}
            {showOtherInput && (
              <input
                {...register(`${fieldKey}_other`)}
                type="text"
                placeholder={locale === "ko" ? "관계를 입력하세요" : locale === "en" ? "Enter relation" : "请输入关系"}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mt-2"
              />
            )}
            {errors[fieldKey] && (
              <p className="text-sm text-red-500">필수 항목입니다.</p>
            )}
          </div>
        )

      case "checkbox":
        const handleCheckAll = () => {
          field.options?.forEach((option) => {
            const optionKey = `${fieldKey}.${option.value}`
            setValue(optionKey, true)
          })
        }
        
        return (
          <div key={fieldKey} className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-secondary">
                {label} {isRequired && <span className="text-red-500">*</span>}
              </label>
              <button
                type="button"
                onClick={handleCheckAll}
                className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
              >
                ALL
              </button>
            </div>
            <div className="space-y-2 border border-gray-200 rounded-lg p-4">
              {field.options?.map((option) => {
                const optionKey = `${fieldKey}.${option.value}`
                const isChecked = watch(optionKey) === true || watch(optionKey) === "true" || watch(optionKey) === "on"
                return (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        setValue(optionKey, e.target.checked)
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-secondary">{option.label[locale]}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // 그룹별로 필드 정리
  const groupedFields = template.fields.reduce((acc, field) => {
    const group = field.group || "general"
    if (!acc[group]) {
      acc[group] = []
    }
    acc[group].push(field)
    return acc
  }, {} as Record<string, FieldDefinition[]>)

  const groupLabels: Record<string, Record<"ko" | "en" | "zh-CN", string>> = {
    deceased: { ko: "고인 정보", en: "Deceased Information", "zh-CN": "死者信息" },
    party_a: { ko: "갑 (유가족 대표)", en: "Party A (Family Representative)", "zh-CN": "甲方（家属代表）" },
    party_b: { ko: "을 (사업장 대표)", en: "Party B (Company Representative)", "zh-CN": "乙方（公司代表）" },
    principal: { ko: "위임인", en: "Principal", "zh-CN": "委托人" },
    attorney: { ko: "수임인", en: "Attorney", "zh-CN": "受托人" },
    sub_attorney: { ko: "복 대리인", en: "Sub-Attorney", "zh-CN": "复代理人" },
    tasks: { ko: "위임업무", en: "Authorized Tasks", "zh-CN": "委托业务" },
    case: { ko: "사건 정보", en: "Case Information", "zh-CN": "案件信息" },
    appointer: { ko: "선임인", en: "Appointer", "zh-CN": "任命人" },
    authorized: { ko: "수권사항", en: "Authorized Actions", "zh-CN": "授权事项" },
    special: { ko: "기타 특별수권사항", en: "Special Authority", "zh-CN": "其他特别授权事项" },
    recipient: { ko: "수신 정보", en: "Recipient Information", "zh-CN": "收件信息" },
    insured: { ko: "피보험자 정보", en: "Insured Information", "zh-CN": "被保险人信息" },
    insurance: { ko: "보험계약 정보", en: "Insurance Contract", "zh-CN": "保险合同信息" },
    beneficiary: { ko: "수익자 정보", en: "Beneficiary Information", "zh-CN": "受益人信息" },
    heirs: { ko: "법정상속인 정보", en: "Legal Heirs", "zh-CN": "法定继承人信息" },
    general: { ko: "기본 정보", en: "General Information", "zh-CN": "基本信息" },
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            뒤로
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-secondary">
              {getDocumentTypeLabel(documentType, locale)}
            </h1>
            <p className="text-sm text-text-secondary">
              {documentId ? "서류 편집" : "새 서류 작성"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* 언어 선택 */}
          <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
            <button
              type="button"
              onClick={() => onLocaleChange("ko")}
              className={`px-3 py-1 rounded text-sm ${
                locale === "ko"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              한국어
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("en")}
              className={`px-3 py-1 rounded text-sm ${
                locale === "en"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLocaleChange("zh-CN")}
              className={`px-3 py-1 rounded text-sm ${
                locale === "zh-CN"
                  ? "bg-primary text-white"
                  : "text-secondary hover:bg-gray-100"
              }`}
            >
              中文
            </button>
          </div>

          {documentId && (
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadJPEG}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              이미지 다운로드
            </Button>
          )}
          <Button type="button" onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 메인 레이아웃: 입력 폼과 미리보기 나란히 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 폼 */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* 기본 정보 */}
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      이름 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name", { required: true })}
                      type="text"
                      defaultValue={initialData?.name}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      일자 <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("date", { required: true })}
                      type="date"
                      defaultValue={initialData?.date || new Date().toISOString().split("T")[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 그룹별 필드 */}
            {Object.entries(groupedFields).map(([group, fields]) => {
              // special 그룹에 ALL - 해제 버튼 추가
              const isSpecialGroup = group === "special"
              const handleSelectAllO = () => {
                if (isSpecialGroup) {
                  fields.forEach((field) => {
                    if (field.type === "select") {
                      setValue(field.key, "O")
                    }
                  })
                }
              }
              const handleSelectAllX = () => {
                if (isSpecialGroup) {
                  fields.forEach((field) => {
                    if (field.type === "select") {
                      setValue(field.key, "X")
                    }
                  })
                }
              }
              
              return (
                <Card key={group}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>
                        {groupLabels[group]?.[locale] || group}
                      </CardTitle>
                      {isSpecialGroup && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={handleSelectAllO}
                            className="px-3 py-1 text-xs bg-primary text-white rounded hover:bg-primary/90 transition-colors"
                          >
                            ALL (O)
                          </button>
                          <button
                            type="button"
                            onClick={handleSelectAllX}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            해제
                          </button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {fields.map((field) => renderField(field))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </form>
        </div>

        {/* PDF 미리보기 */}
        <div className="sticky top-4 h-fit">
          <Card>
            <CardHeader>
              <CardTitle>PDF 미리보기</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div 
                id="preview-container"
                className="bg-white" 
                style={{ 
                  overflow: "hidden", 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "flex-start",
                  width: "794px",
                  height: "1123px",
                  padding: "0",
                  margin: "0 auto"
                }}
              >
                <div style={{ transform: "scale(1)", transformOrigin: "top left", margin: "0", padding: "0" }}>
                  <DocumentPreview
                    ref={previewRef}
                    documentType={documentType}
                    data={watch()}
                    locale={locale}
                    data-preview-id="document-preview"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

