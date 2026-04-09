'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, ChevronDown, LogOut, Settings, Package, Heart, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FavoritesModal } from '../products/FavoritesModal'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from './CartContext'
import { CartDrawer } from './CartDrawer'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const { totalItems, openCart } = useCart()

  let role = user?.user_metadata?.role || 'comprador';
  if (role === "buyer") role = "comprador";
  if (role === "seller") role = "vendedor";
  
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const userEmail = user?.email || '';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const isDashboard = pathname?.startsWith('/dashboard');
  const isInventoryPage = pathname?.startsWith('/products');
  const isExplorar = pathname === '/explorar';
  const isPerfil = pathname === '/perfil';
  const isProtectedRoute = isDashboard || isInventoryPage || isExplorar || isPerfil;

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

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  // --- DETECCIÓN DE RUTAS PARA HOME ---
  if (pathname === '/') {
    return null;
  }

  const iconButtonStyle: React.CSSProperties = {
    width: 38, height: 38, borderRadius: '50%',
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-primary)', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all 0.2s ease',
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

        {/* ACCIONES DERECHA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

          {mounted && (
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              style={iconButtonStyle}
              className="nav-icon-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {(!loading && user) ? (
            /* VISTA DE USUARIO AUTENTICADO */
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button style={iconButtonStyle} className="nav-icon-btn"><Bell size={18} /></button>
              
              {/* Cart icon with badge */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={openCart}
                  style={iconButtonStyle}
                  className="nav-icon-btn"
                  aria-label="Abrir carrito"
                >
                  <ShoppingCart size={18} />
                </button>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: -3, right: -3,
                    minWidth: 16, height: 16, borderRadius: '50%',
                    backgroundColor: 'var(--accent)', color: 'white',
                    fontSize: 9, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                    padding: '0 3px',
                    animation: 'cartBadgePop 0.25s ease',
                  }}>
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </div>
              
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
                    {userName.split(' ')[0]}
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
                      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{userName}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{userEmail}</p>
                    </div>
                    <div style={{ padding: '8px' }}>
                      <DropdownItem href="/dashboard" icon={<LayoutDashboard size={15} />} label="Mi Dashboard" onClick={() => setMenuOpen(false)} />
                      {role === 'comprador' ? (
                        <>
                          <button 
                            onClick={() => { setFavoritesOpen(true); setMenuOpen(false); }}
                            style={{ 
                              width: '100%', 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 10, 
                              padding: '10px 12px', 
                              borderRadius: 10, 
                              border: 'none',
                              backgroundColor: 'transparent',
                              cursor: 'pointer',
                              color: 'var(--text-primary)', 
                              fontSize: 13, 
                              fontWeight: 500,
                              textAlign: 'left',
                              transition: 'background-color 0.2s'
                            }} 
                            className="dropdown-item-hover"
                          >
                            <span style={{ color: 'var(--text-muted)' }}><Heart size={15} /></span>
                            Favoritos
                          </button>
                        </>
                      ) : (
                        <DropdownItem href="/products" icon={<Package size={15} />} label="Inventario" onClick={() => setMenuOpen(false)} />
                      )}
                      <DropdownItem href="/perfil" icon={<Settings size={15} />} label="Configuración" onClick={() => setMenuOpen(false)} />
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                        <button 
                          onClick={handleLogout}
                          style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                            padding: '10px 12px', borderRadius: 10, border: 'none',
                            backgroundColor: 'transparent', cursor: 'pointer',
                            color: '#EF4444', fontSize: 13, fontWeight: 500,
                            transition: 'background-color 0.2s'
                          }}
                          className="hover-bg-red"
                        >
                          <LogOut size={15} /> Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

          ) : (
            /* VISTA INVITADO */
            (!loading && (
              <>
                <Link href="/login" style={{ background: 'transparent', border: 'none', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', marginRight: 12, textDecoration: 'none' }}>Ingresar</Link>
                <Link href="/register" style={{ backgroundColor: 'var(--text-primary)', color: 'var(--bg-primary)', padding: '10px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, textDecoration: 'none' }} className="hover:opacity-90 transition-opacity">Registrarse</Link>
              </>
            ))
          )}
        </div>
      </nav>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes cartBadgePop {
          0% { transform: scale(0.5); opacity: 0; }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        .nav-icon-btn:hover {
          background-color: var(--bg-secondary) !important;
          border-color: var(--accent) !important;
          color: var(--accent) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        .dropdown-item-hover:hover {
          background-color: var(--bg-secondary) !important;
        }
        .hover-bg-red:hover {
          background-color: rgba(239,68,68,0.08) !important;
        }
      `}</style>
      
      <FavoritesModal isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
      <CartDrawer />
    </header>
  )
}

function DropdownItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary)', fontSize: 13, fontWeight: 500, transition: 'background-color 0.2s' }} className="dropdown-item-hover">
      <span style={{ color: 'var(--text-muted)' }}>{icon}</span>
      {label}
    </Link>
  )
}