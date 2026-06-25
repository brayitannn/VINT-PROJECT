'use client'

import { useEffect, useRef, useState, Children } from 'react'

export function AutoCarousel({ children }: { children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)
  const animFrameRef = useRef<number | null>(null)
  const speedPx = 0.6 // píxeles por frame — ajusta para ir más rápido o lento

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    // Esperar a que el layout esté listo
    const start = () => {
      const halfWidth = track.scrollWidth / 2

      const tick = () => {
        if (!isPaused) {
          track.scrollLeft += speedPx

          // Cuando llega a la mitad (= ha scrollado el set original completo)
          // salta silenciosamente al inicio para crear el loop infinito
          if (track.scrollLeft >= halfWidth) {
            track.scrollLeft -= halfWidth
          }
        }
        animFrameRef.current = requestAnimationFrame(tick)
      }

      animFrameRef.current = requestAnimationFrame(tick)
    }

    // Pequeño delay para que el DOM esté pintado
    const timeout = setTimeout(start, 100)

    return () => {
      clearTimeout(timeout)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [isPaused])

  // Duplicamos los children para el loop infinito
  const items = Children.toArray(children)
  const doubled = [...items, ...items]

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Gradiente izquierdo */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to right, var(--bg-primary) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />
      {/* Gradiente derecho */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 2,
        background: 'linear-gradient(to left, var(--bg-primary) 0%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: 24,
          overflowX: 'hidden',      // scroll oculto, lo manejamos por JS
          padding: '16px 4px 32px 4px',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
        className="home-carousel"
      >
        <style>{`
          .home-carousel::-webkit-scrollbar { display: none; }
        `}</style>

        {doubled.map((child, i) => (
          <div
            key={i}
            style={{
              flex: '0 0 300px',
              minWidth: 280,
            }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  )
}
