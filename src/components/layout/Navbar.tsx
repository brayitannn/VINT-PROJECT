'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, User, ChevronDown, LogOut, Settings, Package, Heart, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useRole } from './RoleContext'
import { MOCK_USER } from '@/lib/supabase/mock-user'
import { useCart } from '@/context/CartContext'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { role, setRole } = useRole()
  const { totalItems, toggleDrawer } = useCart()

  // --- DETECCIÓN DE RUTAS CORREGIDA ---
  const isDashboard = pathname?.startsWith('/dashboard')
  const isInventoryPage = pathname?.startsWith('/products') // Esta es tu ruta del pantallazo
  const isExplorar = pathname === '/explorar'
  
  // Si estamos en dashboard o inventario, activamos la Navbar de usuario logueado
  const isProtectedRoute = isDashboard || isInventoryPage

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const iconButtonStyle: React.CSSProperties = {
    width: 38, height: 38, borderRadius: '50%',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }

  const initials = MOCK_USER.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

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

        {/* SWITCH DE ROL (Aparecerá en /products) */}
        {isProtectedRoute && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 999, padding: '4px',
          }}>
            {(['comprador', 'vendedor'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                style={{
                  padding: '6px 16px', borderRadius: 999, border: 'none',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  backgroundColor: role === r ? 'var(--accent)' : 'transparent',
                  color: role === r ? 'white' : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  textTransform: 'capitalize',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* ACCIONES DERECHA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {mounted && (
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={iconButtonStyle}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {isProtectedRoute ? (
            /* VISTA DE USUARIO AUTENTICADO */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={iconButtonStyle}><Bell size={18} /></button>
              <CartButton onClick={toggleDrawer} totalItems={totalItems} style={iconButtonStyle} />
              
              <div ref={menuRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 12px 6px 6px',
                    borderRadius: 999, border: '1px solid var(--border)',
                    backgroundColor: 'var(--bg-card)', cursor: 'pointer',
                  }}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: 'white',
                  }}>
                    {initials}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                    {MOCK_USER.name.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} style={{
                    color: 'var(--text-muted)',
                    transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                  }} />
                </button>

                {menuOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                    width: 220, backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 16, overflow: 'hidden',
                    boxShadow: '0 8px 32px var(--shadow)',
                    animation: 'fadeIn 0.2s ease-out'
                  }}>
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{MOCK_USER.name}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', textTransform: 'capitalize' }}>Vista: {role}</p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <DropdownItem href="/dashboard" icon={<LayoutDashboard size={15} />} label="Mi Dashboard" onClick={() => setMenuOpen(false)} />
                      {role === 'comprador' ? (
                        <>
                          <DropdownItem href="/explorar" icon={<Heart size={15} />} label="Favoritos" onClick={() => setMenuOpen(false)} />
                          <DropdownItem href="/explorar" icon={<ShoppingCart size={15} />} label="Compras" onClick={() => setMenuOpen(false)} />
                        </>
                      ) : (
                        <DropdownItem href="/products" icon={<Package size={15} />} label="Inventario" onClick={() => setMenuOpen(false)} />
                      )}
                      <DropdownItem href="/perfil" icon={<Settings size={15} />} label="Configuración" onClick={() => setMenuOpen(false)} />
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                        <button style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                          padding: '10px 12px', borderRadius: 10, border: 'none',
                          backgroundColor: 'transparent', cursor: 'pointer',
                          color: '#EF4444', fontSize: 13, fontWeight: 500,
                        }}>
                          <LogOut size={15} /> Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          ) : isExplorar ? (
            /* VISTA EXPLORAR */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={iconButtonStyle}><Bell size={18} /></button>
              <CartButton onClick={toggleDrawer} totalItems={totalItems} style={iconButtonStyle} />
              <Link href="/perfil" style={{ ...iconButtonStyle, backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', border: 'none' }}>
                <User size={18} />
              </Link>
            </div>
          ) : (
            /* VISTA INVITADO */
            <>
              <button style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer' }}>Ingresar</button>
              <Link href="/registro" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '8px 20px', borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none' }}>Registrarse</Link>
            </>
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  )
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }} className="hover:bg-[var(--bg-secondary)]">
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      {label}
    </Link>
  )
}

function CartButton({ onClick, totalItems, style }: { onClick: () => void; totalItems: number; style: React.CSSProperties }) {
  return (
    <button onClick={onClick} style={{ ...style, position: 'relative' }}>
      <ShoppingCart size={18} />
      {totalItems > 0 && (
        <span style={{
          position: 'absolute', top: -4, right: -4,
          backgroundColor: 'var(--accent)', color: 'white',
          fontSize: 10, fontWeight: 700, borderRadius: '50%',
          width: 18, height: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid var(--bg-primary)',
        }}>
          {totalItems}
        </span>
      )}
    </button>
  )
}