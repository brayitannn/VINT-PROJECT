'use client'

import { useEffect, useRef, useState } from 'react'

export function AutoCarousel({ children }: { children: React.ReactNode }) {
  const carouselRef = useRef<HTMLUListElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const el = carouselRef.current
    if (!el) return

    const interval = setInterval(() => {
      if (isPaused) return

      const maxScroll = el.scrollWidth - el.clientWidth
      if (maxScroll <= 5) return // No scroll needed if everything fits

      const childElements = el.children
      if (childElements.length <= 1) return

      // Find the child closest to the current scroll position
      let currentIndex = 0
      let minDiff = Infinity
      for (let i = 0; i < childElements.length; i++) {
        const child = childElements[i] as HTMLElement
        const diff = Math.abs(child.offsetLeft - el.scrollLeft)
        if (diff < minDiff) {
          minDiff = diff
          currentIndex = i
        }
      }

      let nextIndex = currentIndex + 1
      if (nextIndex >= childElements.length) {
        // Reset to start
        el.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        const nextChild = childElements[nextIndex] as HTMLElement
        el.scrollTo({ left: nextChild.offsetLeft, behavior: 'smooth' })
      }
    }, 3500) // Cambia cada 3.5 segundos

    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <ul 
      ref={carouselRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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
        position: 'relative', // Define offset parent for child.offsetLeft
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
