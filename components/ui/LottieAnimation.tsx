"use client"

import { useRef, useEffect, useState } from "react"
import Lottie, { LottieRefCurrentProps } from "lottie-react"
import type { AnimationItem } from "lottie-web"

interface LottieAnimationProps {
  animationData: any
  className?: string
  loop?: boolean
  autoplay?: boolean
  speed?: number
  style?: React.CSSProperties
  onComplete?: () => void
  onLoopComplete?: () => void
  lazy?: boolean // Intersection Observer로 지연 로딩
}

export default function LottieAnimation({
  animationData,
  className = "",
  loop = true,
  autoplay = true,
  speed = 1,
  style,
  onComplete,
  onLoopComplete,
  lazy = false,
}: LottieAnimationProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(!lazy)

  useEffect(() => {
    if (!lazy || isVisible) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { rootMargin: "50px" }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [lazy, isVisible])

  useEffect(() => {
    const animation = lottieRef.current
    if (animation) {
      animation.setSpeed(speed)
    }
  }, [speed])

  useEffect(() => {
    const animation = lottieRef.current
    if (animation && onComplete) {
      const anim = animation.animationItem as AnimationItem
      if (anim) {
        anim.addEventListener("complete", onComplete)
        return () => {
          anim.removeEventListener("complete", onComplete)
        }
      }
    }
  }, [onComplete])

  useEffect(() => {
    const animation = lottieRef.current
    if (animation && onLoopComplete) {
      const anim = animation.animationItem as AnimationItem
      if (anim) {
        anim.addEventListener("loopComplete", onLoopComplete)
        return () => {
          anim.removeEventListener("loopComplete", onLoopComplete)
        }
      }
    }
  }, [onLoopComplete])

  if (!isVisible) {
    return (
      <div ref={containerRef} className={className} style={style}>
        <div className="w-full h-full bg-gradient-to-br from-primary/5 to-accent/5 animate-pulse" />
      </div>
    )
  }

  return (
    <div ref={containerRef} className={className} style={style}>
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full"
      />
    </div>
  )
}
