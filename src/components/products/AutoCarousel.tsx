'use client'

import { useEffect, useRef } from 'react'

export function AutoCarousel({ children }: { children: React.ReactNode }) {
  const carouselRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return

    let direction = 1 // 1 for right, -1 for left if bouncing, but let's just cycle
    const interval = setInterval(() => {
      // Calculate next scroll position
      const maxScroll = el.scrollWidth - el.clientWidth
      if (el.scrollLeft >= maxScroll - 5) {
        // Reset to start if end is reached
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        // Scroll one item width ideally (item minWidth is 280 + 24 gap = 304)
        el.scrollBy({ left: 304, behavior: 'smooth' })
      }
    }, 3500) // Cambia cada 3.5 segundos

    return () => clearInterval(interval)
  }, [])

  return (
    <ul 
      ref={carouselRef}
      style={{ 
        display: 'flex', 
        overflowX: 'auto', 
        gap: 24, 
        listStyle: 'none', 
        padding: '16px 4px 32px 4px', 
        margin: '0 -4px',
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
      }} 
      className="home-carousel"
    >
      <style>{`
        .home-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      {children}
    </ul>
  )
}
