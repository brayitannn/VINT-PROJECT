'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function PublicNavbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const iconButtonStyle: React.CSSProperties = {
    width: 38, height: 38, borderRadius: '50%',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'background-color 0.2s',
  }

  return (
    <header style={{
      // Al hacer scroll: transparente + desenfoque tipo cristal
      backgroundColor: scrolled
        ? 'var(--navbar-glass)'
        : 'var(--bg-card)',
      backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px)',
      WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(12px)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, left: 0, right: 0, zIndex: 50,
      transition: 'background-color 0.4s ease, backdrop-filter 0.4s ease',
    }}>
      <nav style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image
            src="/img/logo1.png"
            alt="Vint"
            width={32}
            height={32}
            className="logo-bounce-nav"
          />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 22, color: 'var(--text-primary)',
          }}>Vint</span>
        </Link>

        {/* ACCIONES DERECHA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={iconButtonStyle} className="hover:bg-[var(--bg-secondary)]">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, borderLeft: '1px solid var(--border)', paddingLeft: 16 }}>
            <Link href="/login" style={{
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
              padding: '10px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', transition: 'transform 0.2s, opacity 0.2s'
            }} className="hover:opacity-90 hover:-translate-y-0.5">
              Ingresar
            </Link>
            <Link href="/register" style={{
              backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)',
              padding: '10px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600,
              textDecoration: 'none', transition: 'transform 0.2s, opacity 0.2s'
            }} className="hover:opacity-90 hover:-translate-y-0.5">
              Registrarse
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}
