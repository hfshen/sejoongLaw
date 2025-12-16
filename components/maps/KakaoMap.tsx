"use client"

import { useEffect, useRef } from "react"

interface KakaoMapProps {
  lat: number
  lng: number
  name: string
  className?: string
}

export default function KakaoMap({ lat, lng, name, className }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapRef.current) return

    const script = document.createElement("script")
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY}&autoload=false`
    script.async = true

    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          if (!mapRef.current) return

          const options = {
            center: new window.kakao.maps.LatLng(lat, lng),
            level: 3,
          }

          const map = new window.kakao.maps.Map(mapRef.current, options)

          // 마커 생성
          const marker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(lat, lng),
          })

          marker.setMap(map)

          // 인포윈도우 생성
          const infowindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;">${name}</div>`,
          })

          infowindow.open(map, marker)
        })
      }
    }

    document.head.appendChild(script)

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script)
      }
    }
  }, [lat, lng, name])

  return <div ref={mapRef} className={className || "w-full h-64 rounded-lg"} />
}

// TypeScript declaration for Kakao Maps
declare global {
  interface Window {
    kakao: {
      maps: {
        load: (callback: () => void) => void
        Map: new (container: HTMLElement, options: any) => any
        LatLng: new (lat: number, lng: number) => any
        Marker: new (options: any) => any
        InfoWindow: new (options: any) => any
      }
    }
  }
}

