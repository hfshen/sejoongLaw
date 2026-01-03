"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { motion } from "framer-motion"
import * as THREE from "three"
import { cn } from "@/lib/utils"

interface Card3DProps {
  children: React.ReactNode
  className?: string
  intensity?: number
}

function Card3DContent({ intensity = 15 }: { intensity?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (!meshRef.current) return
    const { mouse, viewport } = state
    const x = (mouse.x * viewport.width) / intensity
    const y = (mouse.y * viewport.height) / intensity
    meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, hovered ? y : 0, 0.1)
    meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, hovered ? x : 0, 0.1)
  })

  return (
    <mesh
      ref={meshRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial color="#ffffff" metalness={0.1} roughness={0.2} />
    </mesh>
  )
}

export default function Card3D({ children, className, intensity = 15 }: Card3DProps) {
  return (
    <motion.div
      className={cn("relative perspective-1000 transform-3d", className)}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="relative w-full h-full" style={{ transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  )
}

// CSS 기반 3D 카드 효과 (Three.js 없이 사용 가능한 경량 버전)
export function Card3DLight({ children, className }: { children: React.ReactNode; className?: string }) {
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const rotateXValue = ((y - centerY) / centerY) * 10
    const rotateYValue = ((centerX - x) / centerX) * 10
    setRotateX(rotateXValue)
    setRotateY(rotateYValue)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      className={cn("relative perspective-1000 transform-3d transition-transform duration-300", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
    >
      {children}
    </motion.div>
  )
}

