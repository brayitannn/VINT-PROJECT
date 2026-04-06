'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  return (
    <header style={{
      backgroundColor: 'var(--bg-primary)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 50,
      transition: 'background-color 0.3s ease',
    }}>
      <nav style={{
        maxWidth: 1280, margin: '0 auto',
        padding: '0 2rem', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

      {/* LOGO */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Image 
            src="/logo1.png" 
            alt="Vint" 
            width={36} 
            height={36}
          />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 20,
            color: 'var(--text-primary)',
          }}>Vint</span>
        </Link>

        {/* ACCIONES */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {mounted && (
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: '50%',
              border: '1px solid var(--border)', background: 'transparent',
              color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
          <button style={{
            background: 'transparent', border: 'none',
            fontSize: 14, fontWeight: 500,
            color: 'var(--text-primary)', cursor: 'pointer',
          }}>Ingresar</button>
          <Link href="/registro" style={{
            backgroundColor: 'var(--accent)', color: 'white',
            padding: '8px 20px', borderRadius: 999,
            fontSize: 14, fontWeight: 600, textDecoration: 'none',
          }}>Registrarse</Link>
        </div>

      </nav>
    </header>
  )
}