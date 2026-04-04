'use client'

/*
  Navbar.tsx

  Barra de navegación principal de VINT.
  Es Client Component ('use client') porque necesita:
  - useTheme() para leer y cambiar el tema activo
  - useState para abrir/cerrar el menú móvil
  - useEffect para evitar el hydration mismatch del tema

  Estructura:
  - Logo circular con la "V"
  - Links: Explorar y Top Vendedores
  - Botón sol/luna para cambiar tema
  - Botón Registrarse
  - Menú hamburguesa para pantallas pequeñas
*/

import { useTheme } from 'next-themes'
import { Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)

  /*
    mounted evita el "hydration mismatch".
    El servidor renderiza sin saber el tema del usuario.
    Si mostramos el ícono de luna/sol antes de que el cliente
    hidrate puede haber un parpadeo visual.
    Solución: no renderizar el botón hasta estar en el cliente.
  */

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border)',
      }}
      className="sticky top-0 z-50 transition-all duration-300"
    >

      {/* Contenedor principal */}

      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between"
        role="navigation"
        aria-label="Navegación principal"
      >

        {/* LOGO */}

        <Link href="/" className="flex items-center gap-3 group" aria-label="Ir al inicio de Vint">
          <div
            style={{ backgroundColor: 'var(--accent)' }}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200"
            aria-hidden="true"
          >
            <span className="font-display font-black text-white text-lg leading-none">V</span>
          </div>
          <span
            style={{ color: 'var(--text-primary)' }}
            className="font-display font-bold text-xl tracking-tight"
          >
            Vint
          </span>
        </Link>

        {/* LINKS (solo en escritorio) */}

        <ul className="hidden md:flex items-center gap-8" role="list">
          <li>
            <Link
              href="/explorar"
              style={{ color: 'var(--text-secondary)' }}
              className="font-medium text-sm hover:text-[var(--accent)] transition-colors duration-200"
            >
              Explorar
            </Link>
          </li>
          <li>
            <Link
              href="/top-vendedores"
              style={{ color: 'var(--text-secondary)' }}
              className="font-medium text-sm hover:text-[var(--accent)] transition-colors duration-200"
            >
              Top Vendedores
            </Link>
          </li>
        </ul>

        {/* ACCIONES (solo en escritorio) */}

        <div className="hidden md:flex items-center gap-3">

          {/*
            Botón de cambio de tema.
            Solo se renderiza cuando mounted es true para evitar
            el parpadeo de hydration que mencionamos arriba.
          */}

          {mounted && (
            <button
              onClick={toggleTheme}
              style={{
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:text-[var(--accent)] hover:border-[var(--accent)] transition-all duration-200"
              aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <Link
            href="/registro"
            style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
            className="px-5 py-2 rounded-full text-sm font-semibold hover:bg-[var(--accent-hover)] transition-colors duration-200 shadow-sm"
          >
            Registrarse
          </Link>
        </div>

        {/* BOTÓN HAMBURGUESA (solo en móvil) */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ color: 'var(--text-primary)' }}
          className="md:hidden w-9 h-9 flex items-center justify-center"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* MENÚ MÓVIL — se muestra solo cuando menuOpen es true */}
      
      {menuOpen && (
        <div
          style={{
            backgroundColor: 'var(--bg-primary)',
            borderTop: '1px solid var(--border)',
          }}
          className="md:hidden px-4 py-4 flex flex-col gap-4"
          role="menu"
        >
          <Link
            href="/explorar"
            style={{ color: 'var(--text-primary)' }}
            className="font-medium text-base py-2"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Explorar
          </Link>
          <Link
            href="/top-vendedores"
            style={{ color: 'var(--text-primary)' }}
            className="font-medium text-base py-2"
            onClick={() => setMenuOpen(false)}
            role="menuitem"
          >
            Top Vendedores
          </Link>
          <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
            {mounted && (
              <button
                onClick={toggleTheme}
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            )}
            <Link
              href="/registro"
              style={{ backgroundColor: 'var(--accent)', color: '#FFFFFF' }}
              className="flex-1 text-center px-5 py-2 rounded-full text-sm font-semibold"
              onClick={() => setMenuOpen(false)}
            >
              Registrarse
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}