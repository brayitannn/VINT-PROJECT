'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, ChevronDown, ChevronRight, LogOut, Settings, Package, Heart, LayoutDashboard, User, Menu } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { useNotificationsContext } from '@/context/NotificationsContext'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { CartDrawer } from '@/components/cart/CartDrawer'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const { unreadCount, notifications, markAllRead, dismiss, loading: notifLoading } = useNotificationsContext()
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const { totalItems, openCart } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

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
  }

  const hiddenRoutes = ['/', '/login', '/register', '/forgot-password'];
  if (hiddenRoutes.includes(pathname || '')) {
    return null;
  }

  let role = user?.user_metadata?.role || 'comprador';
  if (role === 'buyer') role = 'comprador';
  if (role === 'seller') role = 'vendedor';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  const navLinks = role === 'vendedor' ? [
    { label: 'Mi Tienda', href: '/dashboard/vendedor/mi-tienda' },
    { label: 'Mis Productos', href: '/products' },
    { label: 'Dashboard', href: '/dashboard' },
  ] : [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Explorar', href: '/explorar' },
    { label: 'Favoritos', href: '/favoritos' },
  ];

  const isLinkActive = (href: string) => pathname === href;

  return (
    <>
      <style>{`
        .fb-dropdown {
          animation: dropdownScale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: top right;
          box-shadow: 0 12px 28px 0 rgba(0, 0, 0, 0.2), 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
          background: var(--bg-card);
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 16px;
        }
        @keyframes dropdownScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .fb-menu-item {
          display: flex;
          align-items: center;
          padding: 8px;
          border-radius: 8px;
          transition: background-color 0.2s ease;
          width: 100%;
          cursor: pointer;
        }
        .fb-menu-item:hover {
          background-color: var(--bg-secondary);
        }
        .fb-icon-circle {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: var(--text-primary);
          margin-right: 12px;
        }
      `}</style>

      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-lg transition-colors duration-300" style={{ boxShadow: '0 2px 8px var(--shadow)' }}>
        <nav style={{ maxWidth: 1280, margin: '0 auto', padding: '0 2rem', height: 64, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {/* LOGO */}
            <Link href={(!loading && user) ? "/dashboard" : "/"} className="flex items-center gap-[10px] group" style={{ textDecoration: 'none' }}>
              <Image src="/img/logo1.png" alt="Vint" width={34} height={34} className="transition-transform group-hover:rotate-12 duration-300" style={{ alignSelf: 'center' }} />
              <span className="font-display text-2xl font-bold text-[var(--accent)]" style={{ alignSelf: 'center', lineHeight: 1 }}>Vint</span>
            </Link>
          </div>

          {/* NAVEGACIÓN CENTRAL (DESKTOP) */}
          <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 500 : 400,
                    borderBottom: active ? '2px solid var(--accent)' : 'none',
                    paddingBottom: active ? 2 : 0,
                    textDecoration: 'none',
                    fontSize: 14,
                    transition: 'all 0.2s',
                  }}
                  className="hover:text-[var(--text-primary)]"
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* ACCIONES DE LA DERECHA */}
          <div className="flex items-center gap-3 justify-end" style={{ flex: 1 }}>
            {!loading && user ? (
              <div className="flex items-center gap-3">
                
                {/* HAMBURGER MENU ON MOBILE */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="show-mobile-only flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Menu size={18} />
                </button>

                {/* CAMBIAR TEMA */}
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                    style={{ background: 'transparent', cursor: 'pointer' }}
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                )}

                {/* NOTIFICACIONES */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                    style={{ background: 'transparent', cursor: 'pointer' }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span 
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: 'var(--accent)',
                          border: '1.5px solid var(--bg-primary)',
                        }}
                      />
                    )}
                  </button>
                  <NotificationsPanel
                    isOpen={notifOpen}
                    onClose={() => setNotifOpen(false)}
                    notifications={notifications}
                    unreadCount={unreadCount}
                    markAllRead={markAllRead}
                    dismiss={dismiss}
                    loading={notifLoading}
                  />
                </div>

                {/* CARRITO */}
                {role !== 'vendedor' && (
                  <div className="relative">
                    <button
                      onClick={openCart}
                      className="relative flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                      style={{ background: 'transparent', cursor: 'pointer' }}
                    >
                      <ShoppingCart size={18} />
                      {totalItems > 0 && (
                        <span 
                          style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            minWidth: 16,
                            height: 16,
                            borderRadius: 8,
                            background: 'var(--accent)',
                            color: 'var(--bg-card)',
                            fontSize: 10,
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 4px',
                            border: '1.5px solid var(--bg-primary)',
                          }}
                        >
                          {totalItems > 99 ? '99+' : totalItems}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* SEPARADOR VERTICAL */}
                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 4px' }} />

                {/* MENÚ DESPLEGABLE DE USUARIO */}
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center transition-all duration-300 active:scale-95"
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '999px',
                      padding: '4px 12px 4px 4px',
                      cursor: 'pointer',
                      gap: 10
                    }}
                  >
                    <div 
                      className="flex items-center justify-center rounded-full uppercase"
                      style={{
                        width: 28,
                        height: 28,
                        background: 'var(--accent)',
                        color: 'var(--bg-card)',
                        fontSize: 11,
                        fontWeight: 700,
                        fontFamily: 'var(--font-serif)'
                      }}
                    >
                      {initials}
                    </div>
                    <span className="hidden sm:inline-block tracking-tight capitalize" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {userName.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} className={`transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="fb-dropdown absolute right-0 top-[110%] w-[340px] z-50">
                      
                      {/* CARTA DE PERFIL SUPERIOR */}
                      <div className="mb-3 flex flex-col" style={{ 
                        padding: '12px', 
                        borderRadius: '12px', 
                        background: 'var(--bg-card)', 
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', 
                        border: '1px solid var(--border)' 
                      }}>
                        <Link 
                          href="/perfil"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center transition-colors hover:opacity-80"
                          style={{ gap: '12px', textDecoration: 'none' }}
                        >
                          <div className="w-10 h-10 rounded-full bg-[var(--accent)] shadow-sm flex-shrink-0 flex items-center justify-center text-[15px] font-bold text-white uppercase">
                            {initials}
                          </div>
                          <span className="text-[17px] font-bold text-[var(--text-primary)] leading-tight truncate capitalize">
                            {userName}
                          </span>
                        </Link>
                      </div>

                      {/* LISTA DE OPCIONES */}
                      <div className="flex flex-col gap-1">
                        


                        <Link 
                          href="/dashboard" 
                          onClick={() => setMenuOpen(false)}
                          className="fb-menu-item group"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                            <LayoutDashboard size={18} fill="currentColor" className="opacity-80" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Panel de Control</span>
                          </div>
                          <ChevronRight size={18} className="text-[var(--text-muted)]" />
                        </Link>
                        
                        {role === 'vendedor' ? (
                          <Link 
                            href="/products" 
                            onClick={() => setMenuOpen(false)}
                            className="fb-menu-item group"
                            style={{ textDecoration: 'none' }}
                          >
                            <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                              <Package size={18} fill="currentColor" className="opacity-80" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Mi Inventario</span>
                            </div>
                            <ChevronRight size={18} className="text-[var(--text-muted)]" />
                          </Link>
                        ) : (
                          <Link 
                            href="/favoritos"
                            onClick={() => setMenuOpen(false)}
                            className="fb-menu-item group"
                            style={{ textDecoration: 'none' }}
                          >
                            <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                              <Heart size={18} fill="currentColor" className="opacity-80" />
                            </div>
                            <div className="flex-1 flex flex-col">
                              <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Favoritos</span>
                            </div>
                            <ChevronRight size={18} className="text-[var(--text-muted)]" />
                          </Link>
                        )}
                        
                        <Link 
                          href="/perfil" 
                          onClick={() => setMenuOpen(false)}
                          className="fb-menu-item group"
                          style={{ textDecoration: 'none' }}
                        >
                          <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                            <Settings size={18} fill="currentColor" className="opacity-80" />
                          </div>
                          <div className="flex-1 flex flex-col">
                            <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Configuración y privacidad</span>
                          </div>
                          <ChevronRight size={18} className="text-[var(--text-muted)]" />
                        </Link>
                        
                        <button 
                          onClick={handleLogout} 
                          className="fb-menu-item group"
                          style={{ background: 'none', border: 'none', width: '100%', textDecoration: 'none' }}
                        >
                          <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                            <LogOut size={18} fill="currentColor" className="opacity-80" />
                          </div>
                          <div className="flex flex-col flex-1 text-left">
                            <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Cerrar sesión</span>
                          </div>
                          <ChevronRight size={18} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* VISTA INVITADO */
              <div className="flex items-center gap-6 pr-2">
                
                {/* HAMBURGER MENU ON MOBILE (GUEST) */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="show-mobile-only flex h-[38px] w-[38px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  style={{
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <Menu size={18} />
                </button>

                <Link href="/login" className="text-[14px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors" style={{ textDecoration: 'none' }}>
                  Ingresar
                </Link>
                <Link 
                  href="/register" 
                  className="rounded-full bg-[var(--text-primary)] px-5 py-2 text-[14px] font-bold text-[var(--bg-primary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
                  style={{ textDecoration: 'none' }}
                >
                  Regístrate
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* NAVEGACIÓN MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="show-mobile-only" style={{
            position: 'absolute',
            top: 64,
            left: 0,
            right: 0,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border)',
            padding: '16px 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            zIndex: 49,
            boxShadow: '0 4px 12px var(--shadow)'
          }}>
            {navLinks.map((link) => {
              const active = isLinkActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: active ? 600 : 500,
                    textDecoration: 'none',
                    fontSize: 15,
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}

        <CartDrawer />
      </header>
    </>
  )
}