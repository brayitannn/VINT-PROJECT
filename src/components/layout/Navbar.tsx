'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, ChevronDown, ChevronRight, LogOut, Settings, Package, Heart, LayoutDashboard, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NotificationsPanel } from './NotificationsPanel'
import { useNotificationsContext } from './NotificationsContext'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from './CartContext'
import { CartDrawer } from './CartDrawer'
import { useFavorites } from '@/components/layout/FavoritesContext'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)

  const { unreadCount, notifications, markAllRead, dismiss, loading: notifLoading } = useNotificationsContext()
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading } = useAuth()
  const { totalItems, openCart } = useCart()
  const { openFavoritesModal } = useFavorites()

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

  const role = user?.user_metadata?.role || 'comprador';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

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

      <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-lg transition-colors duration-300">
        <nav className="w-full flex h-16 items-center justify-between px-8 md:px-10">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/img/logo1.png" alt="Vint" width={32} height={32} className="transition-transform group-hover:rotate-12 duration-300" />
            <span className="font-display text-2xl font-bold text-[var(--accent)]">Vint</span>
          </Link>

          {/* ACCIONES */}
          <div className="flex items-center gap-3">
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {!loading && user ? (
              <div className="flex items-center gap-3">
                {/* NOTIFICACIONES */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => setNotifOpen(!notifOpen)}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#ef4444] text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--bg-primary)]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
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
                <div className="relative">
                  <button
                    onClick={openCart}
                    className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:scale-105 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                  >
                    <ShoppingCart size={18} />
                    {totalItems > 0 && (
                      <span className="absolute -right-1 -top-1 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--bg-primary)]">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </button>
                </div>

                {/* MENÚ DESPLEGABLE (ESTILO REDES SOCIALES / COMPACTO) */}
                <div ref={menuRef} className="relative">
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="flex items-center gap-2.5 rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-1.5 pr-4 transition-all duration-300 hover:border-[var(--accent)] active:scale-95"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[11px] font-bold text-white uppercase">
                      {initials}
                    </div>
                    <span className="text-[14px] font-bold text-[var(--text-primary)] hidden sm:inline-block tracking-tight capitalize">
                      {userName.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-[var(--text-muted)] transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {menuOpen && (
                    <div className="fb-dropdown absolute right-0 top-[110%] w-[340px] z-50">
                      
                      {/* CARTA DE PERFIL SUPERIOR (ESTILO RED SOCIAL) */}
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
                          style={{ gap: '12px' }}
                        >
                          <div className="w-10 h-10 rounded-full bg-[var(--accent)] shadow-sm flex-shrink-0 flex items-center justify-center text-[15px] font-bold text-white uppercase">
                            {initials}
                          </div>
                          <span className="text-[17px] font-bold text-[var(--text-primary)] leading-tight truncate capitalize">
                            {userName}
                          </span>
                        </Link>
                      </div>

                      {/* LISTA DE OPCIONES TIPO FACEBOOK */}
                      <div className="flex flex-col gap-1">
                        <Link 
                          href="/dashboard" 
                          onClick={() => setMenuOpen(false)}
                          className="fb-menu-item group"
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
                          <button 
                            onClick={() => {
                              setMenuOpen(false)
                              openFavoritesModal()
                            }}
                            className="fb-menu-item group"
                          >
                            <div className="fb-icon-circle group-hover:bg-[var(--bg-primary)]">
                              <Heart size={18} fill="currentColor" className="opacity-80" />
                            </div>
                            <div className="flex-1 flex flex-col items-start">
                              <span className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">Favoritos</span>
                            </div>
                            <ChevronRight size={18} className="text-[var(--text-muted)]" />
                          </button>
                        )}
                        
                        <Link 
                          href="/perfil" 
                          onClick={() => setMenuOpen(false)}
                          className="fb-menu-item group"
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
                <Link href="/login" className="text-[14px] font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                  Ingresar
                </Link>
                <Link 
                  href="/register" 
                  className="rounded-full bg-[var(--text-primary)] px-5 py-2 text-[14px] font-bold text-[var(--bg-primary)] transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  Regístrate
                </Link>
              </div>
            )}
          </div>
        </nav>
        <CartDrawer />
      </header>
    </>
  )
}