'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation' // Importamos esto para saber la ruta

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname() // Aquí obtenemos la ruta actual (ej: "/" o "/explorar")

  useEffect(() => setMounted(true), [])

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')

  // Definimos si estamos en una página que requiere vista de usuario logueado
  // Si la ruta es "/explorar", mostrará iconos. Si es "/", mostrará botones.
  const isAuthPage = pathname === '/explorar' 

  const iconButtonStyle = {
    width: 38, height: 38, borderRadius: '50%',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

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
          <Image src="/logo1.png" alt="Vint" width={32} height={32} />
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontWeight: 700, fontSize: 20, color: 'var(--text-primary)',
          }}>Vint</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          
          {/* BOTÓN TEMA (Siempre visible) */}
          {mounted && (
            <button onClick={toggleTheme} style={iconButtonStyle}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {isAuthPage ? (
            /* --- LO QUE SE VE EN /EXPLORAR --- */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={iconButtonStyle}><Bell size={18} /></button>
              <button style={iconButtonStyle}><ShoppingCart size={18} /></button>
              <Link href="/perfil" style={{
                ...iconButtonStyle,
                backgroundColor: 'var(--text-primary)',
                color: 'var(--bg-primary)',
                border: 'none'
              }}>
                <User size={18} />
              </Link>
            </div>
          ) : (
            /* --- LO QUE SE VE EN EL INDEX (/) --- */
            <>
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
            </>
          )}
        </div>
      </nav>
    </header>
  )
}