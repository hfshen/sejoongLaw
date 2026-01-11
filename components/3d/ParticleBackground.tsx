"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

// WebGL 지원 여부 확인
function isWebGLSupported(): boolean {
  if (typeof window === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl") || canvas.getContext("webgl2")
    return !!gl
  } catch (e) {
    return false
  }
}

function Particles({ count = 2000 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      const time = Math.random() * 100
      const factor = 20 + Math.random() * 100
      const speed = 0.01 + Math.random() / 200
      const x = Math.random() * 2000 - 1000
      const y = Math.random() * 2000 - 1000
      const z = Math.random() * 2000 - 1000
      temp.push({ time, factor, speed, x, y, z })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    const { clock } = state
    particles.forEach((particle, i) => {
      let { factor, speed, x, y, z } = particle
      const t = (clock.getElapsedTime() * speed + particle.time) * factor
      const positions = ref.current!.geometry.attributes.position.array as Float32Array
      positions[i * 3] = x + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10
      positions[i * 3 + 1] = y + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10
      positions[i * 3 + 2] = z + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
    })
    ref.current.geometry.attributes.position.needsUpdate = true
  })

  const positions = useMemo(() => {
    return new Float32Array(particles.flatMap((p) => [p.x, p.y, p.z]))
  }, [particles])

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#bb271a"
        size={1.5}
        sizeAttenuation={true}
        depthWrite={false}
        opacity={0.3}
      />
    </Points>
  )
}

export default function ParticleBackground() {
  const [particleCount, setParticleCount] = useState(1500)
  const [mounted, setMounted] = useState(false)
  const [webglSupported, setWebglSupported] = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 클라이언트에서만 마운트 확인
    setMounted(true)
    setWebglSupported(isWebGLSupported())
  }, [])

  useEffect(() => {
    if (!mounted) return
    // 모바일에서는 파티클 수 감소
    const isMobile = window.innerWidth < 768
    setParticleCount(isMobile ? 800 : 1500)
  }, [mounted])

  // 페이지 전환 시 WebGL 컨텍스트 정리
  useEffect(() => {
    const canvasElement = canvasRef.current
    return () => {
      // 컴포넌트 언마운트 시 정리
      if (canvasElement) {
        const canvas = canvasElement.querySelector("canvas")
        if (canvas) {
          try {
            const gl = canvas.getContext("webgl") || canvas.getContext("webgl2")
            if (gl) {
              const loseContext = (gl as any).getExtension("WEBGL_lose_context")
              if (loseContext) {
                loseContext.loseContext()
              }
            }
          } catch (e) {
            // 에러 무시
          }
        }
      }
    }
  }, [])

  // WebGL을 지원하지 않거나 아직 마운트되지 않은 경우 렌더링하지 않음
  if (!mounted || !webglSupported) {
    return (
      <div className="absolute inset-0 -z-10 particle-container bg-gradient-to-br from-primary/5 via-background/80 to-accent/5" />
    )
  }

  return (
    <div ref={canvasRef} className="absolute inset-0 -z-10 particle-container">
      <Canvas
        camera={{ position: [0, 0, 1000], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 2]}
        onCreated={({ gl }) => {
          try {
            // WebGL 컨텍스트 손실 이벤트 처리
            const canvas = gl.domElement
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault()
              console.warn("WebGL context lost")
            })
            canvas.addEventListener("webglcontextrestored", () => {
              console.info("WebGL context restored")
            })
          } catch (e) {
            console.error("Error setting up WebGL event listeners:", e)
          }
        }}
        onError={(error) => {
          console.error("Canvas error:", error)
          setWebglSupported(false)
        }}
      >
        <Particles count={particleCount} />
      </Canvas>
    </div>
  )
}

