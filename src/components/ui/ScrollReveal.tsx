'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface ScrollRevealProps {
  children: ReactNode
  delay?: number      // ms de retraso extra
  distance?: number   // px que sube
  className?: string
  style?: React.CSSProperties
}

export function ScrollReveal({
  children,
  delay = 0,
  distance = 40,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Estado inicial: invisible y desplazado hacia abajo
    el.style.opacity = '0'
    el.style.transform = `translateY(${distance}px)`
    el.style.transition = `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${delay}ms`

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1'
          el.style.transform = 'translateY(0px)'
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [delay, distance])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
