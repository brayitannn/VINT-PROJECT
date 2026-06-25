'use client'

import { useEffect, useRef } from 'react'

export function ParticlesBg() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const count = 28
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div')
      const size = Math.random() * 3 + 1.5
      const x = Math.random() * 100
      const delay = Math.random() * 8
      const duration = Math.random() * 10 + 10
      const opacity = Math.random() * 0.35 + 0.08

      p.style.cssText = `
        position: absolute;
        left: ${x}%;
        bottom: -10%;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: var(--accent);
        opacity: ${opacity};
        animation: particleRise ${duration}s ease-in ${delay}s infinite;
        pointer-events: none;
      `
      container.appendChild(p)
      particles.push(p)
    }

    return () => {
      particles.forEach((p) => p.remove())
    }
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
