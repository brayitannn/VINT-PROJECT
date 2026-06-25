'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { Star } from 'lucide-react'

export function HeroParallax() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const wrap = wrapRef.current
      const img = imgRef.current
      if (!wrap || !img) return

      const rect = wrap.getBoundingClientRect()
      // Posición relativa al centro del elemento (−1 a 1)
      const cx = ((e.clientX - rect.left) / rect.width - 0.5) * 2
      const cy = ((e.clientY - rect.top) / rect.height - 0.5) * 2

      // Inclinación suave 3D
      const rotateY = cx * 6
      const rotateX = -cy * 4

      // Pequeño desplazamiento de la imagen interna
      const moveX = cx * 10
      const moveY = cy * 6

      wrap.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`
      img.style.transform = `translate(${moveX}px, ${moveY}px) scale(1.07)`
    }

    const handleMouseLeave = () => {
      const wrap = wrapRef.current
      const img = imgRef.current
      if (!wrap || !img) return
      wrap.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
      img.style.transform = 'translate(0px, 0px) scale(1)'
    }

    window.addEventListener('mousemove', handleMouseMove)
    const wrap = wrapRef.current
    wrap?.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      wrap?.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="hero-right hero-img-wrap"
      style={{
        flex: '1 1 0',
        position: 'relative',
        minHeight: 560,
        maxWidth: 540,
        transition: 'transform 0.12s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <div
        style={{
          borderRadius: 28,
          overflow: 'hidden',
          height: 500,
          boxShadow: '0 40px 80px rgba(44,36,30,0.18)',
          position: 'relative',
        }}
      >
        <div
          ref={imgRef}
          style={{
            position: 'absolute',
            inset: '-10%',
            transition: 'transform 0.12s ease-out',
            willChange: 'transform',
          }}
        >
          <Image
            src="/img/hero-bg.jpg"
            alt="Moda Vint"
            fill
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(44,36,30,0.50) 0%, transparent 100%)',
            zIndex: 2,
          }}
        />

        {/* Label de selección premium */}
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '8px 16px',
            borderRadius: 99,
            backgroundColor: 'rgba(244,239,230,0.92)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 3,
          }}
        >
          <Star size={14} fill="var(--accent)" color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 700, color: '#2C241E' }}>
            Selección premium
          </span>
        </div>
      </div>
    </div>
  )
}
