'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, ShoppingCart, ChevronDown, LogOut, Settings, Package, Heart, LayoutDashboard } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FavoritesModal } from '../products/FavoritesModal'
import { NotificationsPanel } from './NotificationsPanel'
import { useNotificationsContext } from './NotificationsContext'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useCart } from './CartContext'
import { CartDrawer } from './CartDrawer'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [favoritesOpen, setFavoritesOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
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

  // Ocultar Navbar en páginas de autenticación
  const hiddenRoutes = ['/', '/login', '/register', '/forgot-password'];
  if (hiddenRoutes.includes(pathname || '')) {
    return null;
  }

  const role = user?.user_metadata?.role || 'comprador';
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--bg-primary)] transition-colors duration-300">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo1.png" alt="Vint" width={32} height={32} />
          <span className="font-display text-xl font-bold text-[var(--text-primary)]">Vint</span>
        </Link>

        {/* ACCIONES */}
        <div className="flex items-center gap-4 pr-10">
          {/* TEMA */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          )}

          {!loading && user ? (
            <div className="flex items-center gap-4">
              {/* NOTIFICACIONES */}
              <div ref={notifRef} className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
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
                  className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-primary)] transition-all hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)]"
                >
                  <ShoppingCart size={18} />
                  {totalItems > 0 && (
                    <span className="absolute -right-1 -top-1 flex min-w-[16px] h-4 items-center justify-center rounded-full bg-[var(--accent)] px-1 text-[10px] font-bold text-white shadow-sm">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </button>
              </div>

              {/* MENU USUARIO */}
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-1.5 pr-5 transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--bg-secondary)] hover:shadow-sm active:scale-[0.98]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] text-[11px] font-extrabold text-white uppercase shadow-sm border border-white/20">
                    {initials}
                  </div>
                  <span className="text-[14px] font-bold text-[var(--text-primary)] hidden sm:inline-block tracking-tight">
                    {userName.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} className={`ml-1 text-[var(--text-muted)] transition-transform duration-300 ${menuOpen ? 'rotate-180' : ''}`} />
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-3 w-60 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 animate-in fade-in slide-in-from-top-2">
                    {/* HEADER */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]/50">
                      <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white uppercase shadow-sm">
                        {initials}
                      </div>
                      <div className="flex flex-col items-start truncate leading-tight">
                        <span className="text-[13px] font-bold text-[var(--text-primary)] truncate">
                          {userName}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 font-medium">
                          {user.email}
                        </span>
                        <span className="inline-flex items-center mt-2 bg-[var(--accent)]/10 text-[var(--accent)] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider border border-[var(--accent)]/10">
                          {role === 'vendedor' ? 'Vendedor' : 'Comprador'}
                        </span>
                      </div>
                    </div>

                    {/* ITEMS DEL MENÚ */}
                    <div className="p-2.5 bg-[var(--bg-card)]">
                      <div className="space-y-1.5">
                        <Link 
                          href="/dashboard" 
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all duration-150 group"
                        >
                          <LayoutDashboard size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                          <span>Dashboard</span>
                        </Link>
                        
                        {role === 'vendedor' ? (
                          <Link 
                            href="/products" 
                            onClick={() => setMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all duration-150 group"
                          >
                            <Package size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                            <span>Inventario</span>
                          </Link>
                        ) : (
                          <button 
                            onClick={() => { setFavoritesOpen(true); setMenuOpen(false); }} 
                            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all duration-150 group"
                          >
                            <Heart size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                            <span>Favoritos</span>
                          </button>
                        )}
                        
                        <Link 
                          href="/perfil" 
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--accent)] transition-all duration-200 group"
                        >
                          <Settings size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors" />
                          <span>Configuración</span>
                        </Link>
                      </div>

                      {/* SEPARADOR */}
                      <div className="my-3 h-px bg-[var(--border)] opacity-60 mx-1" />

                      {/* BOTÓN CERRAR SESIÓN */}
                      <button 
                        onClick={handleLogout} 
                        className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-150"
                      >
                        <LogOut size={16} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* VISTA INVITADO */
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors">
                Ingresar
              </Link>
              <Link 
                href="/register" 
                className="rounded-full bg-[var(--text-primary)] px-6 py-2.5 text-sm font-bold text-[var(--bg-primary)] transition-all hover:opacity-90 active:scale-95 shadow-sm"
              >
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </nav>
      <FavoritesModal isOpen={favoritesOpen} onClose={() => setFavoritesOpen(false)} />
      <CartDrawer />
    </header>
  )
}