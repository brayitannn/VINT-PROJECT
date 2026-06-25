'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function FooterLogo() {
  const [bouncing, setBouncing] = useState(false)

  useEffect(() => {
    // Bounce automatically every 15 seconds
    const interval = setInterval(() => {
      setBouncing(true)
      // The bounce animation takes 0.6s
      const timer = setTimeout(() => {
        setBouncing(false)
      }, 600)
      return () => clearTimeout(timer)
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="logo-footer-wrap">
      <Image
        src="/img/logo1.png"
        alt="Vint"
        width={32}
        height={32}
        className={`footer-logo-img ${bouncing ? 'footer-logo-bounce' : ''}`}
      />
      <span style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', fontFamily: "'Playfair Display', serif" }}>
        Vint
      </span>
    </div>
  )
}
