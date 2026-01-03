"use client"

import { useRef, useMemo, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Points, PointMaterial } from "@react-three/drei"
import * as THREE from "three"

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

  return (
    <Points ref={ref} positions={particles.map((p) => [p.x, p.y, p.z]).flat()} stride={3} frustumCulled={false}>
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

  useEffect(() => {
    // 모바일에서는 파티클 수 감소
    const isMobile = window.innerWidth < 768
    setParticleCount(isMobile ? 800 : 1500)
  }, [])

  return (
    <div className="absolute inset-0 -z-10 particle-container">
      <Canvas
        camera={{ position: [0, 0, 1000], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: false,
        }}
        dpr={[1, 2]}
      >
        <Particles count={particleCount} />
      </Canvas>
    </div>
  )
}

