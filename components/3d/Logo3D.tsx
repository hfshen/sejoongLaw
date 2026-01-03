"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Text, OrbitControls } from "@react-three/drei"
import * as THREE from "three"

export default function Logo3D() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1
    meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.05
  })

  return (
    <group ref={meshRef}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Text
        position={[0, 0, 0]}
        fontSize={2}
        color="#bb271a"
        anchorX="center"
        anchorY="middle"
        font="/fonts/playfair-display.woff"
      >
        세중
      </Text>
      <mesh position={[0, 0, -1]}>
        <planeGeometry args={[5, 1]} />
        <meshStandardMaterial color="#d4af37" opacity={0.3} transparent />
      </mesh>
    </group>
  )
}

